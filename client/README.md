# MediBridge Web Client

The MediBridge frontend is a React 19 single-page application built with Vite. It provides patient- and doctor-facing workflows and communicates with the Express API through the shared Axios client.

## Stack

- React 19 and React DOM
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS
- Lucide React and React Hot Toast

## Setup

From the repository root:

```bash
cd client
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000
VITE_SCRIBE_URL=http://localhost:8000
```

The API client appends `/api/v1` to `VITE_API_URL` unless it already ends with that path. If no API URL is supplied, it uses the relative `/api/v1` path.

## Commands

```bash
npm run dev       # Vite development server
npm run build     # production build
npm run preview   # preview production build
npm run lint      # Oxlint
npm test          # client test runner (if its test files are present)
```

The development server normally runs at http://localhost:5173.

## Source map

- `src/pages/`: authentication, dashboards, doctor tools, records, hospitals, appointments, emergency profile, financial workflows, and fundraisers.
- `src/components/`: shared UI, layout, hospital cards, health ID and AI-related components.
- `src/services/`: API calls grouped by backend resource.
- `src/routes/`: protected and role-aware route wrappers.
- `src/store/`: client-side authentication state.

## Deployment

The root `vercel.json` builds the client and serves `client/dist`. Set `VITE_API_URL` and `VITE_SCRIBE_URL` in Vercel. See [the deployment guide](../docs/DEPLOYMENT_GUIDE.md).

Never put secrets in variables prefixed with `VITE_`; Vite exposes these values to browser code.
