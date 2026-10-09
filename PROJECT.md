# Project: MediBridge Frontend MVP (12 Missing Pages & shadcn/ui)

## Architecture
- **Framework & Build**: Vite 8.2 + React 19 + React Router v7.
- **Styling & UI System**: Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui design tokens with CSS variables in `src/index.css`, `@/` path alias in `vite.config.js` and `jsconfig.json`, `components.json` in `code/client/`, reusable UI primitives in `src/components/ui/`.
- **State Management**: Zustand `useAuthStore` with localStorage persistence.
- **HTTP Client**: Axios instance in `src/services/api.js` pointing to `/api/v1` with automatic Bearer token injection and refresh token handling. Feature services in `src/services/` (`recordService`, `prescriptionService`, `accessService`, `financialService`, `fundraiserService`, `doctorService`).
- **Routing & Auth**: `code/client/src/App.jsx` with `ProtectedRoute` for authenticated users, `RoleRoute` for role-based access (`patient`, `doctor`), and public routes for emergency & public fundraisers.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | shadcn/ui Configuration & Dependencies | `components.json`, `@/` alias in `vite.config.js`, `jsconfig.json`, install clsx/tailwind-merge/radix packages, CSS variables in `index.css` | M1 | ORIGINAL_REQUEST §R2 |
| 2 | shadcn/ui Primitives Library | Reusable UI components in `src/components/ui/` (`Button`, `Card`, `Dialog`, `Input`, `Label`, `Select`, `Table`, `Tabs`, `Badge`, `Textarea`, `Progress`, `Alert`, `Separator`, `Avatar`, `DropdownMenu`) | M1 | ORIGINAL_REQUEST §R2 |
| 3 | Record Detail Page (`/records/:id`) | Full medical record view, vitals card, diagnosis tags, clinical notes, embedded file/PDF viewer, delete action | M2 | ARCHITECTURE.md §4.2 |
| 4 | Prescriptions List Page (`/prescriptions`) | Patient prescription dashboard, active vs past tabs, medication preview chips, "Mark Course Completed" action | M2 | ARCHITECTURE.md §4.3 |
| 5 | Prescription Detail Page (`/prescriptions/:id`) | Complete digital prescription view, physician credentials, detailed medication schedule table, vitals, lab tests, advice | M2 | ARCHITECTURE.md §4.3 |
| 6 | Access Log & Consent Page (`/access-log`) | Active doctor sessions with 1-click revoke, chronological audit log, doctor & timestamp details | M2 | ARCHITECTURE.md §4.4 |
| 7 | Loan Eligibility Result Page (`/financial/result`) | Dual-scoring visualization (ML confidence + rule score), loan terms summary, "Bridge the Gap" crowdfunding CTA | M3 | ARCHITECTURE.md §5.2 |
| 8 | Loan Application History Page (`/financial/history`) | History of submitted medical loans, status badges, details modal, CTA to apply for new loan | M3 | ARCHITECTURE.md §5.3 |
| 9 | Create Fundraiser Page (`/fundraiser/create`) | Crowdfunding campaign creation form, prefilled funding gap from loan result, narrative story, document upload | M3 | ARCHITECTURE.md §6.1 |
| 10 | My Fundraisers Dashboard (`/fundraiser/my`) | Patient's campaigns, progress bar (raised vs goal), verification badges, share links (WhatsApp/Twitter/Copy), donor list | M3 | ARCHITECTURE.md §6.2 |
| 11 | Public Fundraiser & Donation Page (`/fundraiser/:slug`) | Public campaign landing page, verified badges, interactive donation box with amount presets, recent donors wall | M3 | ARCHITECTURE.md §6.3 |
| 12 | Doctor Add Record Page (`/doctor/patient/:healthId/add-record`) | Doctor clinical record submission under active session, valid category enums, vitals input, diagnosis tags, file upload | M4 | ARCHITECTURE.md §11.3 |
| 13 | Doctor Write Prescription Page (`/doctor/patient/:healthId/prescribe`) | Digital prescription builder, multi-drug schedule (type, timing, dosage, freq, duration), lab tests, advice, follow-up date | M4 | ARCHITECTURE.md §11.4 |
| 14 | Doctor My Patients Page (`/doctor/my-patients`) | Consulted patient directory, search/filter, quick actions to Add Record, Prescribe, or Request PIN Access | M4 | ARCHITECTURE.md §11.2 |
| 15 | Router Integration & Placeholder Elimination | Replace all 12 `<Placeholder />` routes in `App.jsx` with actual page components, remove Placeholder definition | M5 | ORIGINAL_REQUEST §R1 |
| 16 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite covering all 12 pages, route access, UI component usage, API integration | E2E-Track | Dual Track Architecture |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design System & shadcn/ui Setup | `components.json`, aliases, packages, `src/index.css` variables, `src/components/ui/` primitives | none | **DONE** |
| M2 | Patient Clinical Pages | `RecordDetail.jsx`, `Prescriptions.jsx`, `PrescriptionDetail.jsx`, `AccessLog.jsx` | M1 | **IN_PROGRESS** |
| M3 | Financial & Crowdfunding Pages | `EligibilityResult.jsx`, `LoanHistory.jsx`, `CreateCampaign.jsx`, `MyCampaigns.jsx`, `CampaignPage.jsx` | M1 | **IN_PROGRESS** |
| M4 | Doctor Portal Clinical Workflows | `AddRecord.jsx`, `WritePrescription.jsx`, `MyPatients.jsx` | M1 | **IN_PROGRESS** |
| M5 | Router Integration & Final Polish | `App.jsx` integration, eliminate all `<Placeholder />` components, build verification | M2, M3, M4 | PLANNED |
| E2E | E2E Testing Track | Requirement-driven opaque-box testing harness and test cases (Tiers 1-4, 119 tests) | none | **DONE** |

## Interface Contracts

### UI Design System ↔ Pages
- UI components live in `@/components/ui/` (e.g. `Button`, `Card`, `Dialog`, `Input`, `Label`, `Select`, `Table`, `Tabs`, `Badge`, `Textarea`, `Progress`, `Alert`, `Separator`).
- `Badge` supports both legacy variants (`variant="success" | "danger" | "warning" | "info" | "default"`) and shadcn standard variants (`default`, `secondary`, `destructive`, `outline`).
- Path alias `@/` resolves to `./src/` in Vite and JS runtime.

### Client Services ↔ Express Backend
- Standard API response structure: `{ success: true, data: ..., message?: string }` or `{ success: false, message: string }`.
- Authentication: `Authorization: Bearer <accessToken>` automatically injected via `src/services/api.js`.
- Base URL: `${VITE_API_URL}/api/v1`.

### Cross-Page Navigation Contracts
- From `/records` → click record card → navigates to `/records/:id`.
- From `/prescriptions` → click prescription card → navigates to `/prescriptions/:id`.
- From `/financial/apply` → on evaluation → navigates to `/financial/result` with state `{ evaluation, loanData }`.
- From `/financial/result` → on partial/rejected → click "Bridge the Gap" → navigates to `/fundraiser/create` with state `{ totalRequired, loanApproved, fundingGap, treatmentType }`.
- From `/fundraiser/create` → on creation → navigates to `/fundraiser/my` or `/fundraiser/:slug`.
- From `/doctor/my-patients` → click "Add Record" → `/doctor/patient/:healthId/add-record`; click "Prescribe" → `/doctor/patient/:healthId/prescribe`.

## Code Layout
```
code/client/
├── components.json                       # shadcn/ui configuration
├── vite.config.js                        # Vite config with @/ path alias
├── jsconfig.json                         # Path alias support for editor/tooling
├── src/
│   ├── index.css                         # Tailwind CSS v4 & shadcn CSS variables
│   ├── lib/
│   │   └── utils.js                      # cn() helper using clsx + tailwind-merge
│   ├── components/
│   │   └── ui/                           # shadcn/ui component primitives
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── select.jsx
│   │       ├── table.jsx
│   │       ├── tabs.jsx
│   │       ├── Badge.jsx                 # Hybrid backwards-compatible badge
│   │       ├── textarea.jsx
│   │       ├── progress.jsx
│   │       ├── alert.jsx
│   │       └── separator.jsx
│   ├── pages/
│   │   ├── records/
│   │   │   ├── Records.jsx               # (Existing)
│   │   │   ├── UploadRecord.jsx          # (Existing)
│   │   │   └── RecordDetail.jsx          # [M2]
│   │   ├── prescriptions/
│   │   │   ├── Prescriptions.jsx         # [M2]
│   │   │   └── PrescriptionDetail.jsx    # [M2]
│   │   ├── access/
│   │   │   └── AccessLog.jsx             # [M2 - upgraded]
│   │   ├── financial/
│   │   │   ├── ApplyLoan.jsx             # (Existing)
│   │   │   ├── EligibilityResult.jsx     # [M3]
│   │   │   └── LoanHistory.jsx           # [M3]
│   │   ├── fundraiser/
│   │   │   ├── CreateCampaign.jsx        # [M3]
│   │   │   ├── MyCampaigns.jsx           # [M3]
│   │   │   └── CampaignPage.jsx          # [M3 - public]
│   │   └── doctor/
│   │       ├── DoctorDashboard.jsx       # (Existing)
│   │       ├── FindPatient.jsx           # (Existing)
│   │       ├── AddRecord.jsx             # [M4 - upgraded]
│   │       ├── WritePrescription.jsx     # [M4 - upgraded]
│   │       └── MyPatients.jsx            # [M4 - upgraded]
│   └── App.jsx                           # [M5 - all 12 routes wired, 0 placeholders]
```
