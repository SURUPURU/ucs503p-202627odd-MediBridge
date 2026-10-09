# MediBridge E2E Testing Infrastructure Spec (`TEST_INFRA.md`)

## 1. Test Architecture Overview

The MediBridge E2E Testing Infrastructure provides a comprehensive, requirement-driven, opaque-box testing framework for the 12 core frontend pages of the MediBridge healthcare MVP. It is designed around progressive testability, strict contract verification, and multi-tier end-to-end simulation.

```
                    ┌──────────────────────────────────────────────┐
                    │          MediBridge E2E Test Runner          │
                    │        (code/client/tests/runner.js)         │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌───────────────────┬─────────────┴───────┬───────────────────┐
         ▼                   ▼                     ▼                   ▼
   ┌───────────┐       ┌───────────┐         ┌───────────┐       ┌───────────┐
   │  Tier 1   │       │  Tier 2   │         │  Tier 3   │       │  Tier 4   │
   │  Feature  │       │ Boundary  │         │  Cross-   │       │Real-World │
   │ Coverage  │       │ & Corner  │         │  Feature  │       │ Scenarios │
   │(12 pages) │       │   Cases   │         │  Flows    │       │           │
   └─────┬─────┘       └─────┬─────┘         └─────┬─────┘       └─────┬─────┘
         │                   │                     │                   │
         └───────────────────┴──────────┬──────────┴───────────────────┘
                                        ▼
                    ┌──────────────────────────────────────┐
                    │      Harness & Isolation Layer       │
                    │   - Mock API (Standardized Responses)│
                    │   - Auth & Role Session State        │
                    │   - Virtual Router & History         │
                    │   - Component Contract Inspector     │
                    └──────────────────────────────────────┘
```

### 1.1 Core Principles
1. **Opaque-Box Requirement-Driven**: Tests are derived strictly from documented specifications in `PROJECT.md`, `code/ARCHITECTURE.md`, and `ORIGINAL_REQUEST.md`. They test external contracts and user observables rather than internal implementation details.
2. **Progressive Testability**: The harness dynamically tests both delivered page implementations on disk and interface contracts. It isolates milestone deliverables and safely validates readiness across M1 through M5.
3. **Zero-Dependency Native Execution**: The test runner runs directly on Node.js 18+ using standard ECMAScript modules and native `node:assert/strict`, requiring no heavy external browser binaries or flaky headless drivers.
4. **Deterministic & Isolated**: Each test case sets up its own state, isolates localStorage/auth tokens, seeds deterministic fixtures, and cleans up after execution.
5. **Multi-Role Simulation**: Rigorously simulates both `patient` and `doctor` personas, as well as unauthenticated public guests.

---

## 2. Test Taxonomy (The 4 Tiers)

### Tier 1: Feature Coverage (At least 5 test cases per feature for all 12 pages)
Every single page of the 12 target pages is validated against at least 5 requirement criteria:
- **Route Accessibility & Role Authorization**: Validates whether the route is public, protected, or role-restricted (`patient` vs `doctor`).
- **Layout & Expected UI Elements**: Verifies primary headings, shadcn/ui components (cards, tables, badges, buttons, inputs, dialogs), and layout wrapping.
- **API Service Contract**: Verifies the exact HTTP verb, URL endpoint, query parameters, request payload headers, and unwrapping of standardized responses `{ success: true, data: ... }`.
- **State Presentation**: Asserts accurate data mapping for clinical vitals, medicine schedules, loan terms, donor walls, and audit logs.
- **User Actions & Navigation**: Simulates user clicks (submitting forms, toggling completion, revoking consent, navigating to child routes).

| Page # | Page Name | Route | Role | Min. Test Cases |
|:---:|:---|:---|:---:|:---:|
| 1 | Record Detail | `/records/:id` | Patient / Doctor | 6 |
| 2 | Prescriptions List | `/prescriptions` | Patient | 6 |
| 3 | Prescription Detail | `/prescriptions/:id` | Patient | 6 |
| 4 | Access Log & Consent | `/access-log` | Patient | 6 |
| 5 | Loan Eligibility Result | `/financial/result` | Patient | 6 |
| 6 | Loan Application History | `/financial/history` | Patient | 6 |
| 7 | Create Fundraiser | `/fundraiser/create` | Patient | 6 |
| 8 | My Fundraisers Dashboard | `/fundraiser/my` | Patient | 6 |
| 9 | Public Campaign & Donation | `/fundraiser/:slug` | Public (All) | 6 |
| 10 | Doctor Add Record | `/doctor/patient/:healthId/add-record` | Doctor | 6 |
| 11 | Doctor Write Prescription | `/doctor/patient/:healthId/prescribe` | Doctor | 6 |
| 12 | Doctor My Patients | `/doctor/my-patients` | Doctor | 6 |
| **Total** | **All 12 Pages** | — | — | **72 Tests** |

### Tier 2: Boundary & Corner Cases
Validates system resilience under non-ideal, extreme, or edge-case conditions:
1. **Empty States**: Zero records, zero prescriptions, zero active doctor sessions, zero loans, zero campaigns, zero donors, empty patient directory.
2. **Missing / Malformed Route Parameters**: Accessing `/records/` without ID, `/prescriptions/` without ID, `/fundraiser/` without slug, `/doctor/patient//add-record` without Health ID.
3. **Boundary Values & Large Inputs**:
   - Loan amount = ₹0, ₹1, ₹10,000,000.
   - Prescriptions with 0 medicines vs 50 medicines.
   - Long narrative text (10,000+ characters) in fundraiser story.
   - Extreme vitals (BP 240/140 mmHg, HR 220 bpm, SpO2 70%).
4. **Backend Error Responses & Status Codes**:
   - HTTP 401 Unauthorized (expired token -> triggers refresh / redirect to login).
   - HTTP 403 Forbidden (doctor accessing patient without active PIN session).
   - HTTP 404 Not Found (non-existent record, campaign slug, or patient).
   - HTTP 422 / 400 Validation Error (invalid category enum, negative loan amount).
   - HTTP 500 Internal Server Error & network dropouts (graceful error toast/banner).
5. **Unauthorized Role Redirection**:
   - Patient navigating to `/doctor/dashboard` or `/doctor/patient/:id/prescribe` -> Redirected to `/dashboard`.
   - Doctor navigating to `/financial/apply` or `/financial/result` -> Redirected to `/doctor/dashboard`.
   - Unauthenticated visitor navigating to any protected route -> Redirected to `/login`.

### Tier 3: Cross-Feature Combinations
Validates seamless data transfer, navigation continuity, and state coherence across connected modules:
1. **Patient Clinical Navigation Flow**:
   `/records/:id` (view clinical encounter & vitals) ➔ `/prescriptions` (review active treatments) ➔ `/prescriptions/:id` (inspect medication schedule & mark completed) ➔ `/access-log` (audit clinical access and revoke doctor session).
2. **Financial Assistance to Crowdfunding Bridge Flow**:
   `/financial/apply` (submit loan application) ➔ `/financial/result` (evaluate ML & rule scoring; handle partial approval with funding gap) ➔ Click "Bridge the Gap" ➔ `/fundraiser/create` (auto-populate `totalRequired`, `loanApproved`, `fundingGap`, `treatmentType`) ➔ Submit campaign ➔ `/fundraiser/my` (verify 0% initial progress) ➔ Public `/fundraiser/:slug` (receive public donation) ➔ Verify live progress update.
3. **Doctor Clinical Workflow**:
   `/doctor/my-patients` (search directory for patient `MB-2026-104928`) ➔ Verify active PIN session ➔ `/doctor/patient/:healthId/add-record` (document vitals, diagnosis, clinical notes) ➔ `/doctor/patient/:healthId/prescribe` (issue structured multi-drug prescription) ➔ Verify audit trail reflects `added_record` and `added_prescription`.

### Tier 4: Real-World Application Scenarios
End-to-end simulations of actual real-world clinical and patient experiences:
1. **Public Emergency & Crowdfunding Community Donation**:
   Bystander accesses public campaign `/fundraiser/emergency-pediatric-surgery`, views hospital credentials and verified badge, selects ₹2,500 preset, marks anonymous donation, leaves note of encouragement, verifies instantaneous total raise calculation and donor wall display without requiring login.
2. **High-Acuity Acute Clinical Consultation Encounter**:
   Doctor attends patient with acute hypertensive crisis, records vital signs (`165/105 mmHg`, `102°F`), inputs multiple ICD diagnoses, generates multi-drug digital schedule with morning/evening food-relation instructions, schedules follow-up in 7 days, and validates all Mongoose schema enum constraints.
3. **ML Microservice Failure & Graceful Degradation**:
   Simulates ML model endpoint offline/unreachable; verifies fallback to rule-based scoring engine (0-100 threshold), ensures financial decision is derived without crashing, and verifies that the crowdfunding bridge option remains fully functional.

---

## 3. Test Runner Architecture

### 3.1 Directory Structure
```
code/client/tests/
├── harness/
│   ├── index.js                  # Assertion helpers, describe/it runner, lifecycle hooks
│   ├── mockApi.js                # High-fidelity mock API adapter for all 10 feature services
│   ├── mockAuth.js               # Zustand useAuthStore simulator & role session provider
│   ├── mockRouter.js             # Route simulator matching App.jsx Route definitions
│   └── componentInspector.js     # Static & runtime inspector for component contracts & JSX
├── suites/
│   ├── tier1_recordDetail.test.js
│   ├── tier1_prescriptions.test.js
│   ├── tier1_prescriptionDetail.test.js
│   ├── tier1_accessLog.test.js
│   ├── tier1_eligibilityResult.test.js
│   ├── tier1_loanHistory.test.js
│   ├── tier1_createCampaign.test.js
│   ├── tier1_myCampaigns.test.js
│   ├── tier1_campaignPage.test.js
│   ├── tier1_addRecord.test.js
│   ├── tier1_writePrescription.test.js
│   ├── tier1_myPatients.test.js
│   ├── tier2_boundary_corner.test.js
│   ├── tier3_cross_feature.test.js
│   └── tier4_real_world.test.js
└── runner.js                     # Root executable runner script
```

### 3.2 Invocation Commands
```bash
# Run entire E2E test suite
node code/client/tests/runner.js

# Run specific tier suite
node code/client/tests/suites/tier1_recordDetail.test.js
node code/client/tests/suites/tier2_boundary_corner.test.js
node code/client/tests/suites/tier3_cross_feature.test.js
node code/client/tests/suites/tier4_real_world.test.js

# Or via npm script (when configured in code/client/package.json)
npm test
```

### 3.3 Pass/Fail Thresholds & Metrics
- **Required Minimum Tests**: >= 85 test cases across all 4 tiers.
- **Pass Threshold**: 100% of defined acceptance criteria must pass.
- **Fail Criteria**:
  - Any unhandled exception or assertion failure.
  - Any contract mismatch with backend endpoints defined in `ARCHITECTURE.md`.
  - Any route protection leak (e.g. unauthenticated access to protected patient/doctor routes).
  - Any missing required UI primitive in delivered page files.
- **Exit Code**:
  - `0`: All test suites passed successfully.
  - `1`: One or more test assertions failed.

---

## 4. Expected Output Derivation Mapping

All test assertions and expected values are strictly derived from authoritative project documentation:
- **`PROJECT.md` § Feature Inventory & Interface Contracts**:
  - UI component import paths (`@/components/ui/` or `src/components/ui/`).
  - Standard API response structure `{ success: true, data: ..., message?: string }`.
  - Navigation contracts for `/financial/apply` -> `/financial/result` -> `/fundraiser/create`.
- **`code/ARCHITECTURE.md`**:
  - §4.2 Medical Record schema, vitals fields, category enum values.
  - §4.3 Prescription schema, medicines array schema, follow-up date.
  - §4.4 AccessSession & AccessLog schemas, PIN verification, 24h expiration.
  - §5.2 Loan eligibility dual-scoring (ML confidence + rule score 0-100).
  - §6.1-6.3 FundraiserCampaign, Donation, fundingGap calculation, slug generation.
  - §11.2-11.4 Doctor portal clinical workflows and authorization headers.
- **`ORIGINAL_REQUEST.md`**:
  - Acceptance Criteria: Complete 12 missing pages, zero `<Placeholder />` components in `App.jsx`, shadcn/ui components used, `api` instance integration.
