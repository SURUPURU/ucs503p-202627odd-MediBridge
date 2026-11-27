# EvidenceScribe — MediBridge Scribe Service

EvidenceScribe is the Python FastAPI service launched from `services/scribe/app.py`. It is a clinical-documentation assistant designed around traceability and clinician review. It runs separately from the Node.js/Express API in `server/`.

> It is not a diagnostic tool. A clinician must review and sign any generated note. Use synthetic or role-played audio for demonstrations and testing.

## Capabilities

The service is designed to:
- Accept a consultation audio recording or browser-recorded audio.
- Transcribe speech using the configured ASR provider, or use a clearly labelled demo transcript in demo mode.
- Extract structured clinical assertions such as polarity, experiencer, temporality, medication action, dose, and supporting quote.
- Compose a SOAP-style note with references to source assertions/audio spans.
- Run verification and omission checks before presenting a reviewable note.
- Require clinician review before sign-off and patient-facing output.

The service includes a demo/evaluation harness. The bundled `data/eval_report.md` identifies demo fixtures as hand-authored examples, not live model measurements. Do not report fixture pass counts as measured model accuracy.

## Requirements and setup

- Python 3.10+
- Packages in `requirements.txt`
- Optional FFmpeg for supported audio conversion workflows
- Optional provider credentials for live ASR and LLM-backed stages

```bash
cd services/scribe
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and configure providers if required. Never commit API keys.

Start the service:

```bash
python app.py serve
```

Open http://127.0.0.1:8000.

## CLI checks

```bash
python app.py selftest   # offline checks
python app.py smoke      # FastAPI TestClient flow
python app.py eval       # evaluation harness
```

The application also documents `make-demo-audio` for regenerating synthetic demo audio when optional audio dependencies are installed.

## Configuration

See [`.env.example`](.env.example). Common settings include:
- `HOST`, `PORT`: bind address and port (the root launcher expects port 8000).
- `ASR_PROVIDER`, `ASR_BASE_URL`, `ASR_MODEL`, `ASR_API_KEY`: speech-recognition provider settings.
- `LLM_PROVIDER`, `VERIFIER_PROVIDER`, and related model/API settings: note generation and verification.
- `DEMO_REPLAY`: demo replay behavior.

The exact supported options and defaults are defined by the `Config` model and environment-loading code in `app.py`.

## Data and safety

- Synthetic demo fixtures and consultation assets are under `data/`.
- Demo-mode output is labelled as fixture output, not live model output.
- Do not use real patient audio or identifiable health data in a public demo.
- A clinician is responsible for checking the transcript, evidence, note, and patient-facing summary before approval.

## Related files

- `app.py`: FastAPI application, pipeline, embedded UI, CLI, and evaluation harness.
- `requirements.txt`: Python dependencies.
- `data/eval_report.md`: bundled evaluation report and its limitations.
- `backend/`: additional EvidenceScribe implementation/documentation subtree. The root `start_all` launchers do not start its nested `backend/app.py`.
