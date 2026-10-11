# MediBridge — Universal Healthcare Interoperability Platform

MediBridge is a full-stack digital health platform developed for the **UCS503 Software Engineering** course. It provides a unified patient healthcare identity, time-bounded doctor consent, digital medical records, AI-powered medical micro-loans, and verified crowdfunding.

---

## Architecture Overview

```text
MediBridge/code/
├── client/          # Vite + React 18 single-page app (Tailwind CSS, React Router, Lucide icons)
├── server/          # Node.js + Express REST API (Mongoose, JWT, in-memory MongoDB fallback)
└── model-api/       # Python + Flask ML microservice (Scikit-Learn loan prediction)
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10+ (for the optional ML microservice)

---

## Quick Start (Local Development)

### 1. Backend Server Setup

```bash
cd code/server

# Install dependencies
npm install

# Start development server (runs on port 5000)
npm run dev
```

> **Note on MongoDB**: If `MONGO_URI` is not provided or points to localhost, the server automatically starts an in-memory MongoDB instance via `mongodb-memory-server`. No local MongoDB installation is required.

### 2. Seed Demo Healthcare Data

Once the backend server is running, seed the demo hospitals, doctors, and patient records with a single command:

```bash
# Using curl:
curl -X POST http://localhost:5000/api/v1/mock/hospital/seed-demo

# Or in PowerShell:
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/mock/hospital/seed-demo"
```

### 3. Frontend Client Setup

Open a new terminal window:

```bash
cd code/client

# Install dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

### 4. (Optional) Python ML Prediction Service

Open a third terminal window if testing ML loan prediction:

```bash
cd code/model-api

# Install Python requirements
pip install -r requirements.txt

# Start Flask server (runs on port 5001)
python api_server.py
```

---

## Demo Accounts & Test Credentials

After calling `seed-demo`, the following accounts are ready to use:

| Role | Email | Password | Access PIN | Health ID |
|---|---|---|---|---|
| **Patient** | `patient@medibridge.com` | `Password123!` | `1234` | `MB-2026-100001` |
| **Doctor** | `doctor@medibridge.com` | `Password123!` | — | — |
| **Patient 2** | `priya.sharma@example.com` | `Password123!` | `1234` | `MB-2026-100002` |
| **Patient 3** | `amit.patel@example.com` | `Password123!` | `1234` | `MB-2026-100003` |

---

## Key Workflows & Features

1. **Patient Flow**:
   - Register or sign in at `/login`.
   - Access **Patient Dashboard** (`/dashboard`), view appointments, records, and prescriptions.
   - View your digital **Health ID** and generate QR / write NFC at `/profile/health-id`.
   - Configure **Emergency Profile** (allergies, blood group, emergency contacts) at `/profile/emergency`.
   - Browse hospitals and book appointments at `/hospitals`.
   - View doctor access history and revoke active sessions at `/access-log`.

2. **Doctor Flow**:
   - Sign in as doctor at `/login`.
   - Search patient by Health ID (e.g. `MB-2026-100001`) at `/doctor/find-patient`.
   - Verify patient's 4-digit PIN (`1234`) to start an authorized consultation session.
   - View medical history, upload new records, or issue electronic prescriptions (`/doctor/patient/:id/prescribe`).

3. **Emergency Access (Public)**:
   - Visit `/emergency/MB-2026-100001` directly (no login required) — simulated NFC smart card tap target for paramedics and first responders.

4. **Financial Aid & Crowdfunding**:
   - Apply for an emergency medical loan at `/financial/apply`.
   - View rule-based and ML eligibility scores at `/financial/result`.
   - Create and track community medical fundraisers at `/fundraiser/create` and `/fundraiser/my`.

---

## Sprints Completion Matrix

- **Sprint 1 (Auth & Setup)**: Complete JWT auth, roles (patient/doctor), password hashing, rate limiting, and route protection.
- **Sprint 2 (Profile & Health ID)**: Complete profile CRUD, QR code generation, NFC writer integration, and emergency public view.
- **Sprint 3 (Doctor Portal & Consent)**: Complete PIN-based access sessions, doctor dashboard, patient search, and patient access log audit.
- **Sprint 4 (Hospitals & Records)**: Complete super specialty hospital search, appointments, record uploads, and downloadable reports.
- **Sprint 5 (Prescriptions)**: Complete electronic prescription issuance by doctors and patient tracking.
- **Sprint 6 (Loan & Fundraiser)**: Complete loan eligibility engine, ML prediction service hook, crowdfunding campaigns, and donations.
- **Sprint 7 (Polish & Deploy)**: Complete public landing page (`/`), React `ErrorBoundary`, toast alerts, Vercel SPA routing config, and Render deployment spec.

---

## Production Build & Verification

```bash
# Verify client build
cd code/client
npm run build
```
