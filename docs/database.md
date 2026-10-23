# NavSetu Database Layer Documentation

**Smart India Hackathon 2026 | 24-Hour Build**  
**Technology:** Supabase PostgreSQL with `pgcrypto`, PL/pgSQL Triggers, and Canonical SHA-256 Hashing.

---

## 1. Table Relationships & ER Architecture

The database comprises exactly 9 normalized tables enforcing strict referential integrity and role segregation:

```
[departments] ──1:N──< [problems] ──1:N──< [applications] ──1:1── [pilots] ──1:1── [contracts] ──1:N──< [adoptions]
      │                                           │                     │                 │                   │
      │                                           │                     └──1:N──< [milestones]                │
      │                                           │                                                           │
      └──1:N (conditional)──┐                     └──1:N (conditional)──┐                                     └── N:1 ── [departments]
                            ▼                                           ▼
                       [users] (role: 'department')                [users] (role: 'startup')
```

### Table Definitions & Constraints

| Table | Primary Key | Foreign Keys & Target | Unique Constraints | Check / Trigger Constraints |
|---|---|---|---|---|
| **`departments`** | `id` (UUID) | None | `name` | Validated non-empty fields |
| **`startups`** | `id` (UUID) | None | `dpiit_id` | `verified` boolean defaults to `false` |
| **`users`** | `id` (UUID) | `org_id` conditionally validated | `email` | `role IN ('department', 'startup')`. Trigger `trg_users_validate_org` enforces that department users point to `departments.id` and startup users point to `startups.id`. |
| **`problems`** | `id` (UUID) | `department_id` → `departments(id)` | None | `status IN ('open', 'in_pilot', 'converted')`, `budget_cap > 0`, `deadline TIMESTAMPTZ` |
| **`applications`** | `id` (UUID) | `problem_id` → `problems(id)`<br>`startup_id` → `startups(id)` | `(problem_id, startup_id)` | `status IN ('submitted', 'selected', 'rejected')`. Trigger `trg_applications_validate` enforces startup DPIIT `verified = true`. |
| **`pilots`** | `id` (UUID) | `application_id` → `applications(id)` | `application_id` (1:1) | `status IN ('active', 'converted', 'failed')`, `budget > 0`, `end_date >= start_date` |
| **`milestones`** | `id` (UUID) | `pilot_id` → `pilots(id)` | None | `status IN ('pending', 'submitted', 'met', 'missed')`, `evidence_url` required for `submitted`, `met`, or `missed`. |
| **`contracts`** | `id` (UUID) | `pilot_id` → `pilots(id)` | `pilot_id` (1:1) | `contract_value > 0`, `record_hash TEXT` (SHA-256 hex digest) |
| **`adoptions`** | `id` (UUID) | `contract_id` → `contracts(id)`<br>`department_id` → `departments(id)` | `(contract_id, department_id)` | Prevents duplicate department adoption of the same contract |

---

## 2. State Machine Rules

All lifecycle transitions are guarded at the database level using PostgreSQL triggers (`BEFORE UPDATE` and `BEFORE DELETE`):

### 2.1 Problem State Machine (`trg_problems_state_machine`)
- `open` ➔ `in_pilot`
- `in_pilot` ➔ `converted`
- `in_pilot` ➔ `open`: Permitted **only if no active pilot exists** for this problem; otherwise, rejected.
- `converted`: **Terminal and immutable**. Outgoing transitions, edits, and deletions are strictly rejected.

### 2.2 Application State Machine (`trg_applications_validate` & `trg_applications_on_selected`)
- `submitted` ➔ `selected` | `rejected`
- `selected` and `rejected`: **Terminal**. No outgoing transitions.
- **Selection Automation:** Marking one application as `selected` automatically:
  1. Rejects all other `submitted` applications for that problem.
  2. Transitions the problem status from `open` to `in_pilot`.
  3. Creates exactly one active `pilot` row with budget and dates derived from the problem (if not already existing).
  4. Seeds default milestone rows for pilot tracking.
- **DPIIT Pre-Condition:** Startups with `verified = false` are blocked from creating applications or being marked `selected`.

### 2.3 Pilot State Machine (`trg_pilots_state_machine`)
- `active` ➔ `converted` | `failed`
- `converted` and `failed`: **Terminal**. No outgoing transitions.
- **Immutability:** Once `converted`, a pilot cannot be updated or deleted.

### 2.4 Milestone State Machine (`trg_milestones_state_machine`)
- `pending` ➔ `submitted` ➔ `met` | `missed`
- `met` and `missed`: **Terminal**. No outgoing transitions.
- **Evidence Requirement:** When status becomes `submitted`, `met`, or `missed`, `evidence_url` must be non-null and non-empty.
- **Immutability:** If the parent pilot is `converted`, milestone edits and deletions are strictly rejected.

---

## 3. Pilot-to-Contract Conversion Checks

Conversion eligibility is evaluated by the database function `can_convert_pilot(pilot_id UUID, p_contract_value NUMERIC)`:

```sql
SELECT can_convert_pilot('b0000000-0000-0000-0000-000000000002');
```

**Returned JSON Structure:**
```json
{
  "eligible": false,
  "reasons": [
    "1 milestone(s) are pending or submitted; all milestones must be reviewed (met or missed)",
    "Milestone success rate is 60.0% (3 of 5 met); at least 70% of milestones must be met"
  ]
}
```

### Conversion Rule Set:
1. **Pilot Status:** Must be currently `active`.
2. **Review Completeness:** Every milestone must be reviewed (`met` or `missed`). None may be `pending` or `submitted`. The pilot must have at least one milestone.
3. **Success Rate:** At least **70%** of milestones must be marked `met` (`met_count / total >= 0.70`).
4. **Budget Cap:** Proposed contract value (or pilot budget) must not exceed the problem's `budget_cap`.
5. **Timeline Validity:** Pilot `end_date` must not have passed without an approved extension (`end_date >= CURRENT_DATE`).

### Conversion Function (`convert_pilot`)
When eligible, calling `convert_pilot(pilot_id, contract_value, rule_reference)` executes an atomic transaction:
1. Validates eligibility via `can_convert_pilot`.
2. Inserts a row into `contracts`.
3. Sets pilot status to `converted`.
4. Sets problem status to `converted`.
5. Computes the canonical record hash via `hash_contract_record(contract_id)`.
6. Saves the SHA-256 digest in `contracts.record_hash`.
7. Locks all associated rows as permanently immutable.

---

## 4. Tamper-Evident Canonical Hashing

To prove in a live demo that the procurement decision is auditable and tamper-evident:

### 4.1 Canonicalization Process
PostgreSQL function `build_contract_canonical_text(contract_id UUID)` and TypeScript service `canonicalize(record)` adhere to strict deterministic rules:
- **Alphabetical Key Order:** Object keys are sorted alphabetically at every hierarchy level.
- **Zero Whitespace:** No spaces following colons or commas.
- **Deterministic Array Order:** Milestones are always sorted by `id ASC`.
- **Consistent Serialization:**
  - Dates: Formatted as `YYYY-MM-DD`.
  - Timestamps: Formatted as ISO 8601 UTC strings (`YYYY-MM-DD"T"HH24:MI:SS"Z"`).
  - Numbers: Formatted consistently without locale formatting.
  - Nulls: Explicit `null` representation.

### 4.2 Canonical JSON Structure
```json
{
  "contract_id": "c0000000-0000-0000-0000-000000000001",
  "contract_value": 650000,
  "converted_at": "2026-10-01T10:00:00Z",
  "department": {
    "id": "d0000000-0000-0000-0000-000000000001",
    "name": "Ministry of Health & Family Welfare"
  },
  "milestones": [
    {
      "due_date": "2026-07-20",
      "evidence_url": "https://evidence.navsetu.gov.in/pilot-a/m1-fhir-integration.pdf",
      "id": "m0000000-0000-0000-0000-0000000000a1",
      "status": "met",
      "target": "Establish automated bidirectional sync with district hospital EMR system",
      "title": "Milestone 1: EMR Integration & HL7 FHIR Pipeline"
    }
  ],
  "pilot": {
    "budget": 650000,
    "end_date": "2026-09-30",
    "id": "b0000000-0000-0000-0000-000000000001",
    "start_date": "2026-07-01",
    "status": "converted"
  },
  "problem": {
    "id": "p0000000-0000-0000-0000-00000000000a",
    "title": "AI-Based Triage & Diagnostic Assistant for Rural Health Sub-Centres"
  },
  "rule_reference": "GFR Rule 194 / GeM Direct Pilot Purchase",
  "startup": {
    "id": "s0000000-0000-0000-0000-000000000001",
    "name": "ArogyaSense Health Solutions Pvt Ltd"
  }
}
```

### 4.3 SHA-256 Digest
Function `hash_contract_record(contract_id UUID)` produces a 64-character lowercase hex digest:
```
encode(sha256(canonical_text::bytea), 'hex')
```
The public verification endpoint `/verify/[contractId]` rebuilds this exact canonical representation from live database rows, recomputes the SHA-256 hash, and compares it to `contracts.record_hash`:
- **Match:** 🟢 Verified. Record unchanged since conversion.
- **Mismatch:** 🔴 Record changed since conversion.

---

## 5. Seed Data Breakdown

The deterministic seed script (`scripts/seed.ts`) generates consistent mock data designed for the 3-minute hackathon demo:

### 5.1 Departments (3)
1. `Ministry of Health & Family Welfare` (Sector: Healthcare)
2. `Ministry of Road Transport & Highways` (Sector: Logistics & Transport)
3. `Department of Drinking Water & Sanitation` (Sector: Clean Water & Sanitation)

### 5.2 Startups (5)
1. `ArogyaSense Health Solutions Pvt Ltd` (`verified: true`)
2. `GatiMarg AI Systems LLP` (`verified: true`)
3. `JalRakshak IoT Technologies` (`verified: true`)
4. `KavachCyber Defense Labs` (`verified: true`)
5. `QuickFix Innovations Pvt Ltd` (`verified: false`) — **Mocked unverified startup**: Used to demonstrate that unverified startups are blocked from applying.

### 5.3 Demo Login Users (2 per role)
- **Department Users:**
  - `health.officer@nic.in` (Ministry of Health & Family Welfare)
  - `transport.director@nic.in` (Ministry of Road Transport & Highways)
- **Startup Users:**
  - `founder@arogyasense.com` (ArogyaSense Health Solutions)
  - `ceo@gatimarg.ai` (GatiMarg AI Systems)

### 5.4 Open Problems (4)
1. *Real-time Tele-ICU Triage for Rural Primary Health Centres* (Health, ₹8,00,000)
2. *AI-Powered Automated Pothole and Road Distress Detection System* (Transport, ₹12,00,000)
3. *IoT Continuous Chlorine & Contaminant Monitoring in Rural Water Tanks* (Water, ₹9,50,000)
4. *Predictive Inventory Forecasting for Essential Medicines in District Warehouses* (Health, ₹6,00,000)

### 5.5 Pilot A (Finished & Converted)
- **Purpose:** Pre-fills the Adoption page and provides an immediately verifiable contract with green QR code verification.
- **Status:** `converted`.
- **Milestones:** 4 milestones, 100% met with real evidence URLs.
- **Contract:** Hashes match deterministically. Verified during seeding.
- **Adoption:** Adopted by `Department of Drinking Water & Sanitation`.

### 5.6 Pilot B (Live / In-Progress Demo Pilot)
- **Purpose:** Used live on-screen during the hackathon pitch:
- **Status:** `active` (`in_pilot` problem).
- **Milestones:**
  - M1: `met` (reviewed)
  - M2: `met` (reviewed)
  - M3: `missed` (reviewed — shows realistic departmental feedback)
  - M4: `submitted` (ready for department user to mark `met` in the demo)
  - M5: `pending` (ready for startup user to paste evidence URL in the demo)
- **Pitch Action:** Presenter submits M5 evidence live, reviews M4 and M5, clicks "Convert to Contract", and shows the instant generation of the tamper-evident justification record.

---

## 6. Known Limitation & Production Architecture

> [!IMPORTANT]
> **Tamper-Evident vs. Tamper-Proof:**
> In this hackathon architecture, `contracts.record_hash` is stored within the same PostgreSQL database instance. 
> A database administrator with direct credentials could theoretically alter both the underlying pilot rows and the stored hash.
> 
> **Production Roadmap:**
> In production, the generated hash should be anchored to an external verifiable ledger or timestamping authority (e.g., an append-only RFC 3161 Time-Stamp Authority, public transparency log, or government blockchain network). For the hackathon demo, storing the SHA-256 hash in Postgres proves the tamper-evidence concept and instantly flags casual or unauthorized database edits.

---

## 7. Execution & Reseeding

### Running Schema DDL
Execute `scripts/schema.sql` directly inside the **Supabase SQL Editor**.

### Running the Seed Script
Configure `.env.local` or `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
```
Run the seed command:
```bash
npm run seed
# or
npx tsx scripts/seed.ts
```
The script resets all existing demo data, recreates all entities with fixed UUIDs, calculates Pilot A's canonical hash, and verifies integrity before exiting.
