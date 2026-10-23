# NavSetu

**24-Hour Build Plan (v3: Next.js + Supabase, with a tamper-evident justification PDF)**
Features, screens, stack, workflow, structure, deployment

---

## Table of Contents

1. [Goal](#1-goal)
2. [Feasibility](#2-feasibility)
3. [Unique Feature: Verifiable Justification PDF](#3-unique-feature-verifiable-justification-pdf)
4. [Features and Requirements](#4-features-and-requirements)
5. [Screens and Sections](#5-screens-and-sections)
6. [Tech Stack](#6-tech-stack)
7. [Architecture](#7-architecture)
8. [Database](#8-database)
9. [State Rules](#9-state-rules-core-logic)
10. [Conversion Check](#10-conversion-check-key-feature)
11. [API Routes](#11-api-routes)
12. [Project Structure](#12-project-structure)
13. [End-to-End Workflow](#13-end-to-end-workflow)
14. [Setup (First 30 Minutes)](#14-setup-first-30-minutes)
15. [PDF Contents](#15-pdf-contents)
16. [Seed Data](#16-seed-data)
17. [Deployment](#17-deployment)
18. [Team Split](#18-team-split)
19. [Timeline](#19-timeline-24-hours)
20. [Demo Script](#20-demo-script-3-minutes)
21. [Risks and Failure Points](#21-risks-and-failure-points)
22. [Open Questions](#22-open-questions)

---

## 1. Goal

Build one working path that a judge can watch in 3 minutes:

> **Department posts a problem → startup applies → department picks it → pilot runs with milestones → one click converts it into a contract with a justification PDF → anyone can verify that PDF by scanning its QR code → another department adopts it.**

Pipeline: **Identify → Pilot → Procure → Scale.**

## 2. Feasibility

- Core demo (Identify → Pilot → Procure → Scale): doable in 24 hours with a team of 3-4.
- Verify feature: adds about 2-3 hours. Build it only after the PDF works (see timeline).
- Solo: about 60-70% of the core, without the verify feature.
- Full roadmap (AI, e-signature, real DPIIT API, emails): not possible in 24 hours.

---

## 3. Unique Feature: Verifiable Justification PDF

**The problem it solves.** Procurement decisions get audited. A plain PDF can be edited, and nobody can tell whether the numbers on it match what actually happened in the pilot.

**What it does.**

1. On conversion, the server builds a canonical JSON of the pilot record: contract ID, department, startup, problem, pilot dates, budget, contract value, rule reference, and every milestone with its target, result and evidence link.
2. It computes a **SHA-256 hash** of that JSON and stores it in `contracts.record_hash`.
3. The PDF prints the hash and a **QR code** that points to `https://<app>/verify/<contractId>`.
4. The **public** verify page (no login) rebuilds the JSON from the live database, hashes it again and compares:
   - **Match:** green "Verified. Record unchanged since conversion", plus the pilot summary.
   - **Mismatch:** red "Record changed since conversion".

**Why it works in a demo.** After showing the green result, edit one milestone row in Supabase (for example, flip `missed` to `met`) and refresh the verify page. It turns red. Judges see the audit idea working in under 30 seconds.

**Rules to make it real:**

- After conversion, milestones, pilot and contract are read-only in the API (the state machine already has no transitions out of `converted`).
- Canonical JSON means sorted keys and fixed field order, so the same data always gives the same hash.
- Use Node's built-in `crypto`. Use the `qrcode` package for the QR image and embed it in the PDF with `pdf-lib`.

**Honest limit (say it if asked).** The hash is stored in the same database, so someone with database access could change both. The production version would anchor the hash outside the database (a signed timestamp, an append-only log or a public ledger). Today it proves the idea and catches accidental or casual edits.

**Optional cheap add-on (30 min):** a "Procurement clock" card on the Contract screen comparing days from problem posted to contract (for example, 9 days) against the 18-24 month traditional figure. Do this only if time remains.

---

## 4. Features and Requirements

### 4.1 Must work for real (the demo depends on these)

| # | Feature | Notes |
|---|---------|-------|
| F1 | Role login (department / startup) | Seeded users, no signup |
| F2 | Role-based access on every API route | Startup must not reach department routes |
| F3 | Post a problem | Title, description, sector, budget cap, deadline |
| F4 | Browse open problems | Eligibility badge per startup |
| F5 | Apply to a problem | Short pitch. Blocked if startup is not verified |
| F6 | Select an applicant | Creates the pilot and milestones, rejects the rest |
| F7 | State machine | Open → Applied → Piloting → Converted, one allowed-transitions map |
| F8 | Pilot rules enforced in code | Budget cap and end date |
| F9 | Milestone submit (startup) | Evidence link only, no file storage |
| F10 | Milestone review (department) | Met or Missed against the target |
| F11 | Conversion check | Convert only if the rules pass, with a visible reason on failure |
| F12 | Contract record with `record_hash` | Created on successful conversion |
| F13 | Justification PDF with hash and QR | Built from real pilot data |
| F14 | **Public verify page** | Recomputes the hash and shows Verified or Changed |
| F15 | Adoption | One real "Adopt" button that writes a database row |

### 4.2 Fake it (and say so)

- **DPIIT verification:** a `verified` flag in the database. Say "mocked, real API is next."
- **Emails and notifications:** skip. Use on-screen toasts only.
- **Signup:** seeded users only. This auth is not production-secure. Say so if asked.

### 4.3 Add only if the full demo path already works

| Feature | Time | Notes |
|---------|------|-------|
| Search and filter on Browse Problems | 30-45 min | `?q=` and `?sector=` |
| "Verify" button for startups | ~1 hour | Fake DPIIT lookup with a loading state |
| Procurement clock card | 30 min | Days to contract vs 18-24 months |
| Dashboards with count cards | 1 hour | Role-specific summaries |
| Gemini problem-description builder | 1-2 hours | Server-side call only |

### 4.4 Cut

Gemini AI (for the base build), e-signature, anomaly detection, full-text search, platform admin role, automated tests, Docker, file uploads, real-time updates.

### 4.5 Non-functional requirements

- Mobile-friendly layout (judges may open the live URL, or scan the QR, on a phone).
- One consistent colour palette and one layout shell.
- Every failed action shows a clear message (toast or inline).
- Seed script resets all data in one command.
- Live URL works over HTTPS from hour 2.

---

## 5. Screens and Sections

**14 screens** (9 required, 1 required for the unique feature, 4 optional). Build the first 10, then add the rest only if time allows.

| # | Screen | Role | Purpose | Priority |
|---|--------|------|---------|----------|
| 1 | Login | All | Pick a role, 2 hardcoded users per role | Must |
| 2 | Post Problem | Department | Title, description, budget cap, deadline | Must |
| 3 | Applications | Department | List applicants, "Start Pilot" button | Must |
| 4 | Pilot Tracker | Department | Milestones, status, review, "Convert to Contract" | Must |
| 5 | Browse Problems | Startup | Open problems with eligibility badge | Must |
| 6 | Apply | Startup | Short pitch form | Must |
| 7 | Submit Milestone | Startup | Add evidence link | Must |
| 8 | Contract Detail | All | Pilot results, PDF download, hash shown | Must |
| 9 | Adoption Page | All | Proven solutions with "Adopt" button | Must |
| 10 | **Verify Contract** (`/verify/[id]`) | **Public** | Recomputes hash, shows Verified or Changed | Must |
| 11 | Department Dashboard | Department | My problems, active pilots, conversion count | Should |
| 12 | Startup Dashboard | Startup | My applications, active pilots | Should |
| 13 | Startup Profile | Startup | DPIIT ID, sector, "Verify" button | Could |
| 14 | Landing / Home | Public | One-line pitch, "Enter demo" button | Could |

**Shared sections (components used on many screens):**

- **Navbar:** role-aware links and logout.
- **StatusBadge:** colours for open, in_pilot, converted, met, missed.
- **MilestoneRow:** target, status, evidence link, action button.
- **ConversionResult panel:** shows pass or fail reasons for the conversion check.
- **VerifyBadge:** green or red result, reused on Contract Detail and the verify page.
- **Toast and EmptyState:** feedback and blank lists.
- **Forbidden / NotFound pages:** for wrong role or bad URL.

---

## 6. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| App | Next.js (App Router) + TypeScript | One project for pages and API. One deploy. |
| Styling | Tailwind CSS | Comes with the Next.js setup, no custom CSS files. |
| Database | Supabase Postgres | Free, hosted, nothing to install, dashboard for live edits in the demo. |
| DB access | `supabase-js` directly (server side, service key) | Skip Prisma. It costs migration time. |
| Auth | Simple JWT cookie (`jose`), seeded users | Real signup is 3+ hours and shows nothing in a demo. |
| PDF | `pdf-lib`, generated on demand | Pure JS, no file storage needed. |
| QR code | `qrcode` | Generates a PNG that `pdf-lib` embeds. |
| Hashing | Node `crypto` (SHA-256) | Built in, no package. |
| Hosting | **Vercel** (primary) | Push to GitHub, it deploys. |
| Alt hosting | Render or Railway as a Node web service | See [section 17](#17-deployment). |
| Optional AI | Gemini API | Only if the core works. |

Notes:

- The Supabase **service key** is used only in API routes and `scripts/seed.ts`. Never expose it to the browser and never prefix it with `NEXT_PUBLIC_`.
- This auth is not production-secure. Say so openly if a judge asks.

---

## 7. Architecture

```
Browser (Next.js pages)
        |
        v
Next.js API routes  (/app/api/...)
        |
        +--> middleware: read JWT cookie, check role
        |
        +--> services/
        |      workflowEngine.ts     (state rules)
        |      eligibilityService.ts (DPIIT mock)
        |      conversionService.ts  (can this pilot convert?)
        |      recordHashService.ts  (canonical JSON + SHA-256)
        |      pdfService.ts         (builds PDF with hash + QR)
        |
        v
Supabase Postgres

Public path (no login):
/verify/[id] page -> GET /api/verify/[id] -> recordHashService -> compare with contracts.record_hash
```

**Rules:**

- Pages never touch the database.
- API routes never hold business logic.
- All logic sits in `services/`. This makes the work easy to split across people.
- `/verify/*` and `/api/verify/*` are the only public routes. They return read-only summary data.

---

## 8. Database

| Table | Fields |
|-------|--------|
| users | id, email, role (department / startup), org_id |
| departments | id, name, sector |
| startups | id, name, dpiit_id, sector, verified |
| problems | id, department_id, title, description, sector, budget_cap, deadline, status, created_at |
| applications | id, problem_id, startup_id, pitch, status |
| pilots | id, application_id, start_date, end_date, budget, status |
| milestones | id, pilot_id, title, due_date, target, evidence_url, status |
| contracts | id, pilot_id, contract_value, converted_at, rule_reference, **record_hash** |
| adoptions | id, contract_id, department_id, adopted_at |

Notes:

- `milestones.target` holds the success measure (for example, "reduce processing time by 30%"). Without it, the justification has nothing to prove.
- `contracts.rule_reference` holds the GFR/GeM rule name printed on the PDF. Fill it only after you verify the rule.
- `contracts.record_hash` (new) holds the SHA-256 hex string created at conversion.
- Add unique keys on `(problem_id, startup_id)` for applications and `(contract_id, department_id)` for adoptions.
- Run the table SQL in the Supabase SQL editor and keep it in `scripts/schema.sql` so everyone can recreate it.

---

## 9. State Rules (core logic)

```
Problem:      open -> in_pilot -> converted
Application:  submitted -> selected | rejected
Pilot:        active -> converted | failed
Milestone:    pending -> submitted -> met | missed
```

Put these in one allowed-transitions map. Every API route calls it. If a transition is not allowed, return an error.

```ts
const allowed = {
  problem:   { open: ['in_pilot'], in_pilot: ['converted', 'open'] },
  application: { submitted: ['selected', 'rejected'] },
  pilot:     { active: ['converted', 'failed'] },
  milestone: { pending: ['submitted'], submitted: ['met', 'missed'] },
};
```

`converted` has no outgoing transitions. That is what makes the record read-only after conversion and keeps the hash meaningful.

---

## 10. Conversion Check (key feature)

A pilot can convert only if all of these are true:

1. Pilot status is `active`.
2. Every milestone is reviewed (`met` or `missed`). None are `pending` or `submitted`.
3. At least **70%** of milestones are `met`.
4. Contract value is within the problem's `budget_cap`.
5. Pilot end date has not been exceeded without an extension.

If any check fails, return a clear list of reasons and show it on screen. A visible rejection proves the logic is real.

On success, in one sequence: create the contract, set pilot and problem to `converted`, build the canonical record, compute the hash and save it to `contracts.record_hash`.

### Hash service sketch

```ts
// lib/services/recordHashService.ts
import { createHash } from 'crypto';

export function canonicalize(v: any): string {
  if (Array.isArray(v)) return '[' + v.map(canonicalize).join(',') + ']';
  if (v && typeof v === 'object')
    return '{' + Object.keys(v).sort()
      .map(k => JSON.stringify(k) + ':' + canonicalize(v[k])).join(',') + '}';
  return JSON.stringify(v);
}

export const hashRecord = (record: object) =>
  createHash('sha256').update(canonicalize(record)).digest('hex');

// buildRecord(contractId) loads contract, pilot, problem, department, startup
// and milestones (sorted by id) and returns ONE plain object.
// Use the same function at conversion time and on the verify page.
```

---

## 11. API Routes

| Route | Who | Does |
|-------|-----|------|
| POST /api/auth/login | All | Sets JWT cookie |
| GET /api/problems | All | Lists open problems (add `?q=` filter later) |
| POST /api/problems | Dept | Creates a problem |
| POST /api/applications | Startup | Applies. Blocked if `verified = false` |
| GET /api/problems/[id]/applications | Dept | Lists applicants |
| POST /api/applications/[id]/select | Dept | Creates pilot and milestones, rejects the others |
| POST /api/milestones/[id]/submit | Startup | Adds an evidence link |
| POST /api/milestones/[id]/review | Dept | Marks met or missed |
| POST /api/pilots/[id]/convert | Dept | Runs the check, creates the contract and `record_hash` |
| GET /api/contracts/[id]/pdf | All | Builds and returns the PDF with hash and QR |
| **GET /api/verify/[id]** | **Public** | Recomputes the hash, returns `{ verified, storedHash, computedHash, summary }` |
| GET /api/adoptions | All | Lists proven contracts |
| POST /api/adoptions | Dept | Adopts a contract |

Every route except login and verify checks the role first. A startup must not be able to call a department route, and a department must only touch its own problems.

---

## 12. Project Structure

```
navsetu/
|-- app/
|   |-- page.tsx                           (landing, optional)
|   |-- login/page.tsx
|   |-- department/
|   |   |-- dashboard/page.tsx             (optional)
|   |   |-- post-problem/page.tsx
|   |   |-- problems/[id]/page.tsx         (applications)
|   |   '-- pilots/[id]/page.tsx           (tracker + convert)
|   |-- startup/
|   |   |-- dashboard/page.tsx             (optional)
|   |   |-- browse/page.tsx
|   |   |-- apply/[id]/page.tsx
|   |   '-- pilots/[id]/page.tsx           (submit milestones)
|   |-- contracts/[id]/page.tsx
|   |-- adoptions/page.tsx
|   |-- verify/[id]/page.tsx               (PUBLIC)
|   '-- api/...                            (routes from section 11)
|-- lib/
|   |-- supabase.ts                        (server client, service key)
|   |-- auth.ts                            (sign/verify JWT, role guard)
|   '-- services/
|       |-- workflowEngine.ts
|       |-- eligibilityService.ts
|       |-- conversionService.ts
|       |-- recordHashService.ts
|       '-- pdfService.ts
|-- components/                            (Navbar, StatusBadge, MilestoneRow, ConversionResult, VerifyBadge)
|-- middleware.ts                          (role check; skips /verify and /login)
|-- scripts/
|   |-- schema.sql
|   '-- seed.ts
|-- docs/api-contract.md                   (JSON shape per endpoint)
|-- .env.local
'-- README.md
```

---

## 13. End-to-End Workflow

### 13.1 Product workflow (what the demo shows)

```
[Department]   Post Problem  ------------------>  problem.status = open
[Startup]      Browse (badge) -> Apply  -------->  application.status = submitted
                                                   (blocked if not verified)
[Department]   Applications -> Start Pilot  ---->  application = selected, others = rejected
                                                   pilot = active, problem = in_pilot
                                                   milestones created (pending)
[Startup]      Submit evidence link per milestone  milestone = submitted
[Department]   Review each milestone  ----------->  milestone = met | missed
[Department]   Convert to Contract
                  -> ConversionService.check()
                     fail: reasons shown on screen
                     pass: contract created, pilot and problem = converted,
                           record_hash saved
[Anyone]       Contract Detail -> Download PDF (hash + QR)
[Anyone]       Scan QR -> /verify/[id] -> green Verified
[Presenter]    Edit one milestone in Supabase -> refresh -> red "Record changed"
[Department B] Adoption page -> Adopt  --------->  adoption row written
```

### 13.2 Development workflow (idea to deployment)

1. **Agree the contract (hour 0-1).** Write `docs/api-contract.md` with request and response JSON for each endpoint so frontend and backend can work in parallel.
2. **Scaffold the app** (see [section 14](#14-setup-first-30-minutes)) and push to GitHub. Give everyone access.
3. **Database first.** Create the Supabase project, run `scripts/schema.sql`, then write `scripts/seed.ts`. Everyone uses the same data.
4. **Deploy a blank app by hour 2** and add environment variables on Vercel right away.
5. **Build vertically, in the order of the demo path:** login → post → browse → apply → select → milestones → convert → PDF → verify → adopt.
6. **Branching:** `main` is always deployable and every push deploys. Work on short branches (`feat/pilot-tracker`) and merge at least every 2 hours. Vercel preview URLs make review easy.
7. **Test the full path on the live URL** at hours 10, 14 and 18, not only locally. Test the PDF route on Vercel early.
8. **Hours 20-23:** bug fixes, UI cleanup, three full demo rehearsals on the live URL with fresh seed data, including the tamper-and-refresh step.
9. **Hour 23-24:** freeze. No new code. Run the seed script once more before judging.

---

## 14. Setup (First 30 Minutes)

```bash
npx create-next-app@latest navsetu --typescript --tailwind --app
cd navsetu
npm i @supabase/supabase-js jose pdf-lib qrcode
npm i -D @types/qrcode tsx
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...        # server only, never NEXT_PUBLIC_
JWT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000   # used for the QR link
GEMINI_API_KEY=...              # optional
```

Seed script: `npx tsx scripts/seed.ts`.

**Checklist:**

- [ ] Supabase project created and `schema.sql` run
- [ ] Seed script runs on every laptop
- [ ] Login sets the cookie and role routing works
- [ ] Repo on GitHub, connected to Vercel, blank app live
- [ ] Environment variables added on Vercel (including `NEXT_PUBLIC_APP_URL` set to the live URL)

---

## 15. PDF Contents

Built from real database data by `pdfService.ts` (`pdf-lib`):

- Department, startup and problem title
- Pilot dates, budget and contract value
- Milestone table: target, result (met / missed), evidence link
- Success rate (for example, 4 of 5 = 80%)
- Rule reference (the real GFR/GeM provision you verify)
- Generated date and contract ID
- **Record hash** (SHA-256, shortened on the page with the full value below it)
- **QR code** linking to `/verify/<contractId>`, with the caption "Scan to verify this record"

---

## 16. Seed Data

`scripts/seed.ts` inserts everything in one run and resets old data first:

- 3 departments, 5 startups (4 verified, 1 not, to show the block)
- 4 open problems
- **Pilot A (finished):** all milestones met, already converted **with a valid `record_hash`**. This fills the adoption page and gives you a ready verify page.
- **Pilot B (live):** 5 milestones, 3 reviewed. Finish 2 live, then click Convert.
- 2 login users per role

The seed script must compute Pilot A's hash with the same `hashRecord` and `buildRecord` functions the app uses. Otherwise the verify page will show red on the first load.

---

## 17. Deployment

### Primary: Vercel + Supabase

1. Push the repo to GitHub and import it in Vercel. Every push to `main` deploys.
2. Add the environment variables in Vercel project settings during hour 2, not hour 22:
   `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, optionally `GEMINI_API_KEY`.
3. Set `NEXT_PUBLIC_APP_URL` to the final production URL so the QR code points to the live verify page. Redeploy after changing it.
4. Run the seed script against the Supabase project before every demo.

### Alternative: Render or Railway (Node web service)

- Build command `npm run build`, start command `npm start`, same environment variables. No Dockerfile is needed.
- Keep **Supabase** as the database. Do not use Render's free Postgres, because it expires, and Render has no managed MySQL.
- Render's free web service sleeps after 15 minutes idle and takes about a minute to wake, so open the URL a few minutes before judging.
- Railway's free plan is a 30-day trial with a small credit, so check the current limits on the day.

### Pre-demo deployment checklist

- [ ] Login works on the live URL
- [ ] Calling a department route as a startup returns 403
- [ ] PDF downloads from the live URL, with hash and QR
- [ ] QR scan from a phone opens `/verify/[id]` and shows green
- [ ] Editing a milestone in Supabase turns the verify page red (then re-seed to reset)
- [ ] Seed script run, Pilot A and Pilot B present
- [ ] Tested once on mobile data

---

## 18. Team Split

| Person | Owns |
|--------|------|
| 1 | Backend, state machine, conversion logic, `recordHashService` |
| 2 | Department screens |
| 3 | Startup screens, login and the verify page |
| 4 | PDF with hash and QR, seed data, deployment, then pitch and demo script |

- With 3 people: merge Person 3 and 4.
- With 1-2 people: cut startup screens to Browse and Apply only, fake milestone submission with a button, and keep the verify feature only if the PDF is done.

---

## 19. Timeline (24 Hours)

| Hours | Goal | Check |
|-------|------|-------|
| 0-2 | Setup, DB tables, login, deploy a blank app | Live URL works |
| 2-6 | Problems: post, browse, apply, eligibility block | Startup can apply |
| 6-10 | Select applicant, create pilot and milestones | Pilot appears on both sides |
| 10-14 | Milestone submit and review | Statuses change correctly |
| 14-18 | Conversion check, contract, PDF | PDF downloads with real data |
| 18-21 | **Record hash, QR on the PDF, public verify page**, adoption page, seed script | Verify turns red after a Supabase edit |
| 21-23 | Bug fixing, UI cleanup, pitch rehearsal x3 | No crashes in 3 full runs |
| 23-24 | Freeze. No new code. | - |

**Hard rules:**

- If the PDF is not working by hour 18, drop everything else and fix it.
- Start the verify feature only after the PDF and adoption path work. If the clock hits hour 21 and verify is not working, cut it and rehearse.

---

## 20. Demo Script (3 Minutes)

1. **Show the problem (30s):** procurement takes 18-24 months today, and the paperwork behind a decision is hard to audit.
2. **Department posts a problem (20s).**
3. **Startup applies, department picks it (25s).**
4. **Milestones get submitted (25s).**
5. **Click Convert, the PDF appears (40s).** Show one failed conversion first so the judges see the check is real.
6. **Scan the QR, show green Verified (20s).** Then flip one milestone in Supabase, refresh, show red (15s). This is your differentiator.
7. **Another department adopts it (15s).**
8. **Close (10s):** built on rules that already exist, no new policy needed.

---

## 21. Risks and Failure Points

- **Legal claim is unproven.** "No new policy required" needs the exact GFR/GeM rule that lets a pilot convert into a direct contract. Find it, cite it on the PDF and the pitch slide. This is your biggest credibility risk.
- **Hash mismatch on first load.** If `buildRecord` differs between conversion, seed and verify, the page shows red when it should be green. Use one shared function and test it with Pilot A before anything else.
- **Unstable hash input.** Dates, numbers and key order must serialize the same way every time. Use `canonicalize` and store dates as ISO strings.
- **Overclaiming.** Do not call it "blockchain" or "tamper-proof". Call it "tamper-evident". The hash lives in the same database, and the real version would anchor it externally.
- **QR points to localhost.** Set `NEXT_PUBLIC_APP_URL` to the live URL on Vercel before generating any demo PDF.
- **Role checks forgotten on some routes.** Test by logging in as a startup and calling department routes.
- **Service key leaked to the browser.** Keep it out of any `NEXT_PUBLIC_` variable and out of client components.
- **Environment variables missing on Vercel.** Add them early.
- **Demo data gets messy after testing.** The seed script resets everything. Run it before every demo, and after the tamper step.
- **PDF library issues on Vercel.** Test the PDF route on the live deployment early, not only locally.
- **UI time sink.** One layout, one colour. Do not style before the logic works.
- **Setup eating the schedule.** Teams often spend 15 hours on login and database and have nothing left for conversion. Protect hours 14-18.
- **Weak spots a judge will probe:**
  - Who verifies startups? *Mocked, real DPIIT API is next.*
  - How does the PDF prove success? *Milestone results against targets, hashed and publicly verifiable.*
  - Can someone fake the hash? *Anyone with database access could; the next step is anchoring the hash outside the database.*
  - What does "Scale" really do? *One real adoption record.*

---

## 22. Open Questions

- How many people are on the team, and what are their skills?
- Can you cite the real rule for pilot-to-contract conversion?
- Do you have any code yet, or only this plan?
- Vercel or Render/Railway for hosting? (Vercel is the default here.)
