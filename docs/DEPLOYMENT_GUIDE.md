# MediBridge Deployment Guide

The current repository configures Vercel for the React/Vite client and Render for the Express API and FastAPI EvidenceScribe service.

## 1. Before deployment

- Push the intended code to GitHub `main`.
- Confirm the client builds: `cd client && npm run build`.
- Confirm the API starts and `GET /api/v1/health` responds.
- Confirm the scribe starts: `python app.py serve`.
- Prepare production secrets and a persistent MongoDB connection string.
- Use synthetic data for public demonstrations.

## 2. Render: API and scribe

The root `render.yaml` defines two services:

| Service | Runtime | Root directory | Build | Start |
|---|---|---|---|---|
| `medibridge-api` | Node | `server` | `npm install` | `node server.js` |
| `medibridge-scribe` | Python | `services/scribe` | `pip install -r requirements.txt` | `python app.py serve` |

1. Create a Render Blueprint and connect `SURUPURU/ucs503p-202627odd-MediBridge`.
2. Select `main` and let Render read the root `render.yaml`.
3. Review the two service root directories and build/start commands.
4. Configure secrets and environment values in the Render dashboard.
5. Deploy and record both public service URLs.

### API environment

The Blueprint declares `PORT`, `NODE_ENV`, generated JWT secrets, `MONGO_URI`, `CLIENT_URL`, Groq settings, Hugging Face settings, and Cloudinary credentials.

Set `MONGO_URI` to a persistent MongoDB connection for data persistence. Set `CLIENT_URL` to the exact deployed frontend origin. Configure provider credentials only when those integrations are enabled. Do not use example JWT secrets in production.

### Scribe environment

The Blueprint declares `HOST=0.0.0.0`, `GROQ_API_KEY`, `ASR_PROVIDER=openai_compatible`, and `PYTHONIOENCODING=utf-8`. Review `services/scribe/.env.example` and `services/scribe/app.py` for additional settings. Demo fixtures must not be presented as live inference.

## 3. Vercel: frontend

The root `vercel.json` specifies Vite, the build command, output directory, and SPA rewrite.

1. Import `SURUPURU/ucs503p-202627odd-MediBridge` into Vercel.
2. Keep the project root at the repository root so the root `vercel.json` is used.
3. Confirm build command `cd client && npm install && npm run build`.
4. Confirm output directory `client/dist`.
5. Add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Public base URL of the Render API |
| `VITE_SCRIBE_URL` | Public base URL of the Render scribe service |

The API helper appends `/api/v1` to `VITE_API_URL` if needed. Values prefixed with `VITE_` are browser-visible; never put secrets there.

## 4. CORS and connectivity

Set the API's `CLIENT_URL` to the exact Vercel origin and restart/redeploy the API. Verify browser requests and credential behavior. The current Express app enables credentialed CORS with a permissive origin callback; review and restrict this policy to trusted origins before production use.

## 5. Verify the deployment

- Open the Vercel URL and confirm the application loads.
- Open `https://YOUR_API_HOST/api/v1/health` and confirm the health response.
- Open the scribe service URL and confirm it responds.
- Test login and key workflows using synthetic accounts/data.
- Test record access, appointments, prescriptions, emergency profile, and financial/fundraiser workflows.
- Test AI functions only when provider credentials are configured.
- Review Vercel and Render logs for startup, environment, CORS, and API errors.

## 6. Production limitations

- Local `mongodb-memory-server` data is temporary.
- Demo credentials and seeded records are for demonstration only; disable or replace them on a public deployment.
- Current CORS settings need tightening.
- Add monitoring, backups, rate-limit review, secret rotation, access-control testing, and a security assessment before handling sensitive data.
- A successful deployment does not establish ABDM certification, DPDP compliance, or clinical safety.
