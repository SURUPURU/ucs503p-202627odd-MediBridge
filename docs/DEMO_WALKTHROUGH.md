# MediBridge Demo Walkthrough

This is a suggested evaluation path through workflows represented in the current repository. UI labels and demo data may change; use the running application and current seed code as the source of truth.

## 1. Start the services

Install dependencies and configure environment files as described in the root [README](../README.md). Start three terminals:

```bash
cd server && npm run dev
```

```bash
cd client && npm run dev
```

```bash
cd services/scribe && python app.py serve
```

Alternatively, use `start_all.bat`, `start_all.ps1`, or `start_all.sh` after setup.

- Client: http://localhost:5173
- API health: http://localhost:5000/api/v1/health
- Scribe: http://localhost:8000

## 2. Suggested application walkthrough

1. Sign in using a demo account created by `server/seed/autoSeed.js`; confirm current credentials in that file.
2. Explore the doctor dashboard and patient search.
3. Review patient records and the record-access / consent workflow.
4. Inspect record details and the prescription workflow.
5. Explore hospital search and appointment booking.
6. Open the patient profile and emergency profile workflow.
7. Explore the loan application and fundraiser/donation features.
8. Open the clinical scribe workflow and use only synthetic or role-played audio.

## 3. Clinical AI

The backend contains separate modules for clinical history summarization and diagnostic support:

- `server/src/services/aiSummarizerService.js`
- `server/src/services/hfDiagnosticService.js`

Availability and output depend on provider credentials, model availability, and network access. These are assistive features, not a diagnosis or prescription. A clinician must independently verify all clinical information.

## 4. EvidenceScribe demonstration

The root scribe service at `services/scribe/app.py` includes a demo mode and offline checks. Demo fixture output is labelled and must not be represented as live model output.

Suggested sequence:
1. Start the scribe service.
2. Load the bundled synthetic demo consultation in its UI.
3. Inspect the transcript and extracted assertions.
4. Review the generated note and its evidence references.
5. Inspect verification and omission flags.
6. Run:

```bash
cd services/scribe
python app.py selftest
python app.py smoke
python app.py eval
```

The bundled `data/eval_report.md` says its demo pipeline rows are fixture-based and that baseline/live runs remain required. State this limitation clearly during evaluation.

## 5. Verification commands

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm run build
npm run lint

# Full platform check (from repository root, with services running)
python scripts/verify_platform.py
```

## 6. Demo safety

Use synthetic accounts, synthetic medical records, and role-played consultation audio only. Do not use real patient data. MediBridge is a project prototype, not a certified medical device or a replacement for clinical judgement.
