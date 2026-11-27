# MediBridge

MediBridge is a full-stack healthcare workflow prototype combining patient records, consent-aware sharing, doctor workflows, appointments, prescriptions, emergency information, financial support, and clinical AI assistance.

> **Project status:** academic/demo prototype. This repository does not establish ABDM certification, legal compliance, or clinical validation. AI output requires clinician review and must not replace professional judgement.

## Current technology

| Layer | Implementation | Location |
|---|---|---|
| Frontend | React 19, Vite, React Router, Zustand, Axios, Tailwind CSS | `client/` |
| API | Node.js, Express 5, Mongoose | `server/` |
| Database | MongoDB; local/demo in-memory option | `server/src/config/db.js` |
| Clinical scribe | Python, FastAPI, Pydantic | `services/scribe/` |
| AI integrations | Groq-compatible summarization and Hugging Face diagnostic-support modules | `server/src/services/` |
| File storage | Cloudinary integration | `server/src/config/cloudinary.js` |
| Deployment | Vercel and Render configuration | `vercel.json`, `render.yaml` |

## Main features represented in the codebase

- Patient and doctor authentication with role-aware application routes.
- Patient profiles, health records, record upload, and document-access controls.
- Consent/access sessions and access logging.
- Doctor workflows for finding patients, reviewing records, and issuing prescriptions.
- Hospital discovery and appointment booking.
- Emergency profile and public emergency information workflow.
- Financial loan application workflow.
- Fundraising campaigns and donations.
- Clinical history summarization and diagnostic-support integrations.
- EvidenceScribe, a separate FastAPI documentation workflow with evidence-linked note review.

The source code is authoritative for exact behavior. See [Architecture](docs/ARCHITECTURE.md).

## Repository structure

```text
.
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/           # auth, dashboards, doctor, records, hospitals,
│       │                    # appointments, emergency, financial, fundraisers
│       ├── routes/
│       ├── services/
│       └── store/
├── server/                 # Express API
│   ├── seed/                # demo data initialization
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   └── tests/
├── services/scribe/        # FastAPI EvidenceScribe service
│   ├── app.py
│   ├── data/
│   └── requirements.txt
├── docs/                   # architecture, deployment, demo and pitch docs
├── scripts/                # local verification script
├── start_all.bat
├── start_all.ps1
├── start_all.sh
├── render.yaml
└── vercel.json
```

## Prerequisites

- Node.js and npm compatible with the versions in `client/package.json`.
- Python 3.10+ for EvidenceScribe.
- Git.
- Optional provider credentials for AI inference and Cloudinary uploads.

## Local setup

Clone the repository:

```bash
git clone https://github.com/SURUPURU/ucs503p-202627odd-MediBridge.git
cd ucs503p-202627odd-MediBridge
```

Create local environment files from the examples:

```bash
# Windows PowerShell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
Copy-Item services/scribe/.env.example services/scribe/.env

# macOS / Linux
cp server/.env.example server/.env
cp client/.env.example client/.env
cp services/scribe/.env.example services/scribe/.env
```

Never commit real API keys, database credentials, JWT secrets, or production environment files. Use fresh random JWT secrets outside a local demo.

Install and run each service in a separate terminal:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

```bash
cd services/scribe
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py serve
```

### Local addresses

| Service | Address |
|---|---|
| Frontend | http://localhost:5173 |
| Backend health | http://localhost:5000/api/v1/health |
| EvidenceScribe | http://localhost:8000 |

The root launchers `start_all.bat`, `start_all.ps1`, and `start_all.sh` start these three services after dependencies and environment files are configured.

The backend uses an in-memory MongoDB instance when `MONGO_URI` is empty or points to localhost. That database is temporary; use a persistent MongoDB deployment when data must survive restarts.

## Tests and verification

Backend tests:

```bash
cd server
npm test
```

Frontend build and lint:

```bash
cd client
npm run build
npm run lint
```

EvidenceScribe checks:

```bash
cd services/scribe
python app.py selftest
python app.py smoke
python app.py eval
```

Platform check (requires the local services to be running):

```bash
python scripts/verify_platform.py
```

The verification script checks selected service and workflow paths; it is not a security audit or clinical validation. The bundled EvidenceScribe evaluation report explicitly labels demo fixture results as fixtures, not live model measurements.

## Deployment

- Root `vercel.json` configures the frontend build from `client/`.
- Root `render.yaml` defines the Node API and Python scribe services.
- Configure `VITE_API_URL` and `VITE_SCRIBE_URL` in Vercel.
- Configure `CLIENT_URL`, persistent `MONGO_URI`, and provider secrets in Render.

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

## Documentation

- [Architecture and repository map](docs/ARCHITECTURE.md)
- [Demo walkthrough](docs/DEMO_WALKTHROUGH.md)
- [Deployment guide](docs/DEPLOYMENT_GUIDE.md)
- [Hackathon pitch](docs/HACKATHON_PITCH.md)
- [EvidenceScribe guide](services/scribe/README.md)

## Security and responsible use

- Treat bundled accounts and records as synthetic demonstration data.
- Do not use real patient information or identifiable consultation audio in a public demo.
- Use HTTPS, persistent storage, backups, monitoring, secret rotation, and a security review before any real-world deployment.
- AI-generated content is assistive only. A qualified clinician remains responsible for reviewing and approving clinical notes and decisions.

## License

MIT. See [LICENSE](LICENSE).
