# NavSetu API Specification & Contract

This document defines the formal request and response JSON structures for every endpoint in the NavSetu platform.

---

## 1. Authentication

### `POST /api/auth/login`
- **Role:** All (Department or Startup)
- **Description:** Authenticates a user or demo profile and sets an HTTP-only JWT session cookie (`navsetu_token`).

#### Request Body
```json
{
  "email": "officer@jalshakti.gov.in",
  "role": "department" // or "startup", "startup_unverified"
}
```

#### Response (200 OK)
```json
{
  "ok": true,
  "user": {
    "id": "user-dept-1",
    "email": "officer@jalshakti.gov.in",
    "name": "Dr. S. K. Verma",
    "role": "department",
    "org_id": "dept-1",
    "org_name": "Dept. of Drinking Water & Sanitation (Jal Jeevan Mission)"
  }
}
```

---

## 2. Problem Challenges

### `GET /api/problems`
- **Role:** All
- **Query Params:** `?deptId=dept-1` (optional)
- **Description:** Lists all active and past challenges.

#### Response (200 OK)
```json
{
  "ok": true,
  "problems": [
    {
      "id": "prob-101",
      "department_id": "dept-1",
      "department_name": "Dept. of Drinking Water & Sanitation",
      "title": "AI-Powered Acoustic Pipeline Leakage & Non-Revenue Water Detection",
      "description": "Urgent requirement to detect micro-leakages in pressurized distribution pipelines without physical excavation...",
      "sector": "Water & Sanitation",
      "budget_cap": 1500000,
      "deadline": "2026-11-25",
      "status": "in_pilot",
      "created_at": "2026-10-15T10:00:00Z",
      "application_count": 3,
      "active_pilot_id": "pilot-b-live"
    }
  ]
}
```

### `POST /api/problems`
- **Role:** Department
- **Description:** Posts an operational public problem challenge.

#### Request Body
```json
{
  "department_id": "dept-1",
  "department_name": "Dept. of Drinking Water & Sanitation",
  "title": "Autonomous Micro-Sonar Silt & Structural Health Drone for Canal Siphons",
  "description": "Submersible tetherless acoustic drone for silt volumetric profiling.",
  "sector": "Water & Sanitation",
  "budget_cap": 1800000,
  "deadline": "2026-12-15"
}
```

#### Response (201 Created)
```json
{
  "ok": true,
  "problem": {
    "id": "prob-xyz",
    "title": "Autonomous Micro-Sonar Silt...",
    "status": "open",
    "created_at": "2026-10-23T18:00:00.000Z"
  }
}
```

---

## 3. Applications

### `GET /api/problems/[id]/applications`
- **Role:** Department
- **Description:** Lists all startup applicants for a given problem challenge.

#### Response (200 OK)
```json
{
  "ok": true,
  "problem": { "id": "prob-101", "title": "..." },
  "applications": [
    {
      "id": "app-201",
      "problem_id": "prob-101",
      "startup_id": "startup-1",
      "startup": {
        "id": "startup-1",
        "name": "AquaSense Analytics Pvt Ltd",
        "dpiit_id": "DIPP-89211",
        "verified": true
      },
      "pitch": "AquaSense provides patented non-invasive hydrophone acoustic sensors...",
      "proposed_budget": 1420000,
      "pilot_timeline_weeks": 8,
      "status": "selected"
    }
  ]
}
```

### `POST /api/applications`
- **Role:** Startup (Blocked if `verified = false`)
- **Description:** Submits a pilot proposal.

#### Request Body
```json
{
  "problem_id": "prob-103",
  "startup_id": "startup-1",
  "pitch": "Deploying edge CV telemetry units with sub-second municipal signal override.",
  "proposed_budget": 2100000,
  "pilot_timeline_weeks": 10
}
```

#### Response (201 Created)
```json
{
  "ok": true,
  "application": {
    "id": "app-301",
    "problem_id": "prob-103",
    "startup_id": "startup-1",
    "status": "submitted"
  }
}
```

### `POST /api/applications/[id]/select`
- **Role:** Department
- **Description:** Selects an applicant to begin a paid pilot, generating structured milestones and rejecting remaining applications.

#### Request Body
```json
{
  "startDate": "2026-11-01",
  "endDate": "2026-12-25",
  "pilotBudget": 1420000,
  "milestones": [
    {
      "title": "Sensor Grid Calibration & Baseline Acoustic Mapping",
      "target": "Deploy and calibrate 25 acoustic telemetry nodes; baseline ambient noise.",
      "dueDate": "2026-11-10"
    }
  ]
}
```

#### Response (200 OK)
```json
{
  "ok": true,
  "pilot": { "id": "pilot-123", "status": "active" },
  "problem": { "id": "prob-101", "status": "in_pilot" }
}
```

---

## 4. Milestones

### `POST /api/milestones/[id]/submit`
- **Role:** Startup
- **Description:** Submits auditable proof (URL) for milestone completion.

#### Request Body
```json
{
  "evidence_url": "https://loom.com/share/aquasense-leakage-localization-proof-audit",
  "notes": "Field logs demonstrate pinpoint accuracy within 3.8 meters."
}
```

#### Response (200 OK)
```json
{
  "ok": true,
  "milestone": {
    "id": "m-4",
    "evidence_url": "https://loom.com/share/...",
    "status": "submitted"
  }
}
```

### `POST /api/milestones/[id]/review`
- **Role:** Department
- **Description:** Evaluates milestone outcome against target benchmark (`met` or `missed`).

#### Request Body
```json
{
  "status": "met" // or "missed"
}
```

#### Response (200 OK)
```json
{
  "ok": true,
  "milestone": { "id": "m-4", "status": "met" },
  "conversionCheck": {
    "ok": true,
    "successRate": 80,
    "reasons": []
  }
}
```

---

## 5. Conversion & Justification PDF

### `POST /api/pilots/[id]/convert`
- **Role:** Department
- **Description:** Evaluates 5 conversion rules. On success, transitions pilot to `converted`, locks records, generates canonical JSON and computes SHA-256 hash.

#### Request Body
```json
{
  "contract_value": 1420000,
  "rule_reference": "Rule 149(viii) of GFR 2017 / GeM Startup Direct Mandate"
}
```

#### Response (200 OK)
```json
{
  "ok": true,
  "pilot": {
    "id": "pilot-b-live",
    "status": "converted",
    "contract_id": "CNT-2026-AQ98-4412"
  },
  "contractId": "CNT-2026-AQ98-4412",
  "recordHash": "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
}
```

### `GET /api/contracts/[id]/pdf`
- **Role:** Public / All
- **Description:** Generates real-time official justification PDF with embedded QR code and SHA-256 hash.
- **Headers:** `Content-Type: application/pdf`

---

## 6. Public Verification (Zero Login Required)

### `GET /api/verify/[id]`
- **Role:** Public (Audit Portal)
- **Description:** Loads live record, recomputes canonical SHA-256 hash, and compares against the recorded hash.

#### Response (200 OK)
```json
{
  "ok": true,
  "verified": true,
  "storedHash": "7f9a2b8e3d4c1a5f6e8b0d2c4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d",
  "computedHash": "7f9a2b8e3d4c1a5f6e8b0d2c4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d",
  "summary": {
    "contractId": "CNT-2026-JAL-0881",
    "department": "Dept. of Drinking Water & Sanitation",
    "startup": "AquaSense Analytics Pvt Ltd",
    "problem": "Satellite Radar-Assisted Artificial Aquifer Recharge Site Identification",
    "milestoneCount": 3,
    "metCount": 3,
    "successRate": 100,
    "contractValue": 1150000
  }
}
```

---

## 7. Scaling & Inter-Departmental Adoptions

### `GET /api/adoptions`
- **Role:** All
- **Description:** Retrieves all scaled contracts and adoption records.

### `POST /api/adoptions`
- **Role:** Department
- **Description:** Fast-tracks procurement adoption of an existing proven pilot contract.

#### Request Body
```json
{
  "contract_id": "CNT-2026-JAL-0881",
  "department_id": "dept-3",
  "department_name": "Ministry of Health & Family Welfare",
  "notes": "Procuring aquifer water quality modeling module for hospital borewells."
}
```

#### Response (201 Created)
```json
{
  "ok": true,
  "adoption": {
    "id": "adopt-999",
    "contract_id": "CNT-2026-JAL-0881",
    "department_id": "dept-3",
    "adopted_at": "2026-10-23T18:05:00.000Z"
  }
}
```
