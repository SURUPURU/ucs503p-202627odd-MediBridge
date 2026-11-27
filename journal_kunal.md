# MediBridge — 12-Week Project Journal (Kunal Motwani)

**Project:** MediBridge — Healthcare Workflow and Clinical Assistance Platform  
**Student:** Kunal Motwani  
**Programme:** Computer Science and Engineering  
**Institution:** Thapar Institute of Engineering and Technology  
**Project duration:** 12 weeks  
**Faculty guide:** ______________________________  
**Roll number:** ______________________________  
**Academic session:** ______________________________  

> **Journal note:** This journal is organized into twelve weekly development phases based on the modules and repository structure present in the project. This version is prepared for Kunal Motwani using the shared MediBridge repository and the same twelve-week project timeline. Before submission, personalize the work carried out in each week to reflect Kunal's actual individual contributions, and enter the actual calendar dates, attendance, and guide remarks. The weekly sequence is a project-log structure, not a claim that every task was completed on a particular date.

---

## Week 1 — Project Selection and Requirement Analysis

**Dates:** ____________________ to ____________________

### Objectives
- Identify the problem area and define the purpose of MediBridge.
- Understand the needs of patients, doctors, and healthcare workflows.
- Establish the initial feature scope and project boundaries.

### Work carried out
- Selected MediBridge as a healthcare workflow prototype.
- Identified key user roles, including patients and doctors.
- Outlined the main workflows: authentication, patient profiles, medical records, consent-aware access, prescriptions, hospital discovery, appointments, emergency information, and financial assistance.
- Identified clinical AI assistance and the separate EvidenceScribe workflow as project components.
- Considered privacy, safe handling of health information, and the need for clinician review of AI-generated content.

### Outcome
A functional scope and initial module list were established to guide architecture and implementation.

### Evidence / references
- Initial requirements and feature notes.
- Repository overview in `README.md`.

**Next week's plan:** Finalize the technology stack, repository structure, and service boundaries.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 2 — System Architecture and Technology Selection

**Dates:** ____________________ to ____________________

### Objectives
- Design the high-level system architecture.
- Select suitable technologies for the frontend, backend, database, and AI service.
- Organize the repository for modular development.

### Work carried out
- Structured the application into a React/Vite client, Node.js/Express API, and a separate Python/FastAPI EvidenceScribe service.
- Used MongoDB with Mongoose for application data modelling.
- Identified React Router, Zustand, Axios, and Tailwind CSS for frontend routing, state, API communication, and styling.
- Planned external integrations for AI inference and Cloudinary-based file storage.
- Established environment-based configuration and local service startup conventions.
- Documented the main service boundaries and data flow.

### Outcome
The project architecture and technology stack were established, with distinct responsibilities for the three application services.

### Evidence / references
- `client/package.json`
- `server/package.json`
- `services/scribe/requirements.txt`
- `docs/ARCHITECTURE.md`

**Next week's plan:** Implement the frontend structure, routing, and authentication screens.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 3 — Frontend Foundation and User Interface

**Dates:** ____________________ to ____________________

### Objectives
- Build the React application foundation.
- Organize pages, shared components, and navigation.
- Create role-aware user experiences.

### Work carried out
- Developed the frontend using React 19 and Vite.
- Organized application pages into feature areas such as authentication, dashboards, doctor workflows, records, hospitals, appointments, access management, emergency information, financial support, and fundraisers.
- Set up client-side routing and protected/role-aware route wrappers.
- Used Zustand for shared client state and Axios for API requests.
- Applied Tailwind CSS for interface styling and responsive layouts.
- Connected the frontend structure to the backend API configuration through environment variables.

### Outcome
The frontend foundation and major feature areas were organized for integration with backend services.

### Evidence / references
- `client/src/pages/`
- `client/src/routes/`
- `client/src/services/api.js`
- `client/src/store/`

**Next week's plan:** Implement backend setup, API routing, and database models.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 4 — Backend API and Database Design

**Dates:** ____________________ to ____________________

### Objectives
- Establish the Express backend.
- Define API organization and persistence models.
- Connect application workflows to MongoDB.

### Work carried out
- Set up the Node.js and Express 5 backend.
- Organized request handling into routes, controllers, middleware, validators, services, and configuration modules.
- Used Mongoose to define data models for users, doctors, hospitals, medical records, prescriptions, appointments, and other project workflows.
- Added route groups for authentication, profiles, hospitals, records, document access, prescriptions, doctors, consent/access, financial support, fundraisers, emergency information, mock hospital integration, and appointments.
- Configured MongoDB connection handling, including an in-memory database option for local/demo use.
- Added a backend health endpoint for basic service availability checks.

### Outcome
The backend API structure and persistence layer were established to support the platform's feature modules.

### Evidence / references
- `server/src/app.js`
- `server/src/routes/`
- `server/src/controllers/`
- `server/src/models/`
- `server/src/config/db.js`

**Next week's plan:** Develop authentication, authorization, and patient record workflows.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 5 — Authentication, Profiles, and Patient Records

**Dates:** ____________________ to ____________________

### Objectives
- Implement core identity and patient data workflows.
- Connect frontend screens to backend endpoints.
- Organize medical record storage and retrieval.

### Work carried out
- Worked on patient and doctor authentication and role-aware access to application areas.
- Developed patient profile and health information workflows.
- Implemented medical record listing, detail, upload, and related access-management areas.
- Connected frontend service modules with backend API routes.
- Integrated file-storage configuration through the Cloudinary service module.
- Reviewed how user, profile, and medical-record data are represented by the Mongoose models.

### Outcome
Core user and patient-record workflows were incorporated into the application.

### Evidence / references
- `server/src/models/User.js` and related model files (refer to actual filenames in the repository).
- `server/src/routes/`
- `client/src/pages/auth/`
- `client/src/pages/records/`
- `server/src/config/cloudinary.js`

**Next week's plan:** Complete consent-aware access and doctor-facing workflows.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 6 — Consent, Document Access, and Doctor Workflows

**Dates:** ____________________ to ____________________

### Objectives
- Build controlled access workflows for health records.
- Support doctor-facing patient review and prescription tasks.
- Record access-related activity.

### Work carried out
- Worked with the access-session, access-log, consent-grant, and document-access-permission components.
- Integrated the relevant route, controller, middleware, and model layers for access workflows.
- Developed doctor-facing areas for patient search and record review.
- Incorporated prescription-related workflows.
- Connected role-aware frontend pages with the corresponding API services.
- Reviewed the importance of limiting access to health information and keeping access-related activity traceable.

### Outcome
Consent/access and doctor workflow modules were integrated into the MediBridge prototype.

### Evidence / references
- `server/src/models/AccessSession.js` and related access model files (refer to actual filenames).
- `server/src/routes/` and `server/src/controllers/`
- `client/src/pages/doctor/`
- `client/src/pages/access/`

**Next week's plan:** Integrate clinical AI assistance and summarization features.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 7 — Clinical AI Integrations

**Dates:** ____________________ to ____________________

### Objectives
- Add AI-assisted functionality to relevant healthcare workflows.
- Configure external inference integrations.
- Keep AI output reviewable and appropriately bounded.

### Work carried out
- Integrated a clinical-history summarization service using a Groq-compatible provider configuration.
- Added a Hugging Face-based diagnostic-support integration.
- Organized AI functionality within backend service modules rather than embedding provider calls throughout the interface.
- Considered configuration, provider availability, error handling, and the need to review generated output.
- Kept the AI functionality positioned as assistance for a prototype workflow rather than an autonomous diagnosis mechanism.

### Outcome
Clinical AI service modules were incorporated into the backend and made available for integration with relevant application workflows.

### Evidence / references
- `server/src/services/aiSummarizerService.js`
- `server/src/services/hfDiagnosticService.js`
- Related frontend doctor workflow pages and API service modules.

**Next week's plan:** Develop and integrate the separate EvidenceScribe service.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 8 — EvidenceScribe Service Development

**Dates:** ____________________ to ____________________

### Objectives
- Develop the separate clinical documentation service.
- Define structured inputs and outputs.
- Support evidence-linked note generation and review.

### Work carried out
- Worked on the Python-based EvidenceScribe service using FastAPI and Pydantic.
- Used `services/scribe/app.py` as the root service entry point.
- Organized service configuration and dependencies separately from the Node.js backend.
- Incorporated the evidence-linked documentation workflow and its review-oriented approach.
- Reviewed the service's self-test, smoke-test, and evaluation commands.
- Distinguished bundled demonstration fixtures from live model evaluation results.

### Outcome
EvidenceScribe was established as a separate service within the MediBridge repository, with its own runtime and verification commands.

### Evidence / references
- `services/scribe/app.py`
- `services/scribe/requirements.txt`
- `services/scribe/.env.example`
- `services/scribe/README.md`

**Next week's plan:** Integrate supporting healthcare workflows such as hospitals, appointments, emergency information, and financial assistance.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 9 — Supporting Healthcare and Financial Workflows

**Dates:** ____________________ to ____________________

### Objectives
- Expand the platform beyond core patient records.
- Connect additional workflows to the existing API and frontend.
- Review consistency across feature modules.

### Work carried out
- Worked on hospital discovery and hospital detail workflows.
- Incorporated appointment booking and doctor appointment views.
- Developed emergency profile and emergency information workflows.
- Integrated the financial loan application workflow and its eligibility logic.
- Incorporated fundraiser campaign and donation workflows.
- Reviewed the corresponding frontend pages, API routes, controllers, and database models.

### Outcome
Additional workflows were incorporated, broadening the prototype into a more complete healthcare support platform.

### Evidence / references
- `server/src/routes/`
- `server/src/models/Appointment.js` and related model files.
- `server/src/services/loanPredictionService.js`
- `server/src/utils/loanEligibility.js`
- `client/src/pages/hospitals/`
- `client/src/pages/dashboard/`
- `client/src/pages/emergency/`
- `client/src/pages/financial/`
- `client/src/pages/fundraiser/`

**Next week's plan:** Run available checks, test integrated workflows, and address issues found.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 10 — Integration, Testing, and Debugging

**Dates:** ____________________ to ____________________

### Objectives
- Verify that the application services can run and communicate.
- Execute available automated checks.
- Identify and address integration issues.

### Work carried out
- Reviewed the local startup process for the frontend, backend, and EvidenceScribe service.
- Used the backend test command and frontend build/lint commands as applicable.
- Reviewed EvidenceScribe self-test, smoke-test, and evaluation commands.
- Used the platform verification script to check selected service and workflow paths when the services were available.
- Checked environment-variable configuration and service URLs.
- Reviewed errors and integration points across the client, API, database, and scribe service.

### Outcome
A repeatable verification approach was documented for the project. Actual pass/fail results should be entered from the test run performed for the submission.

### Evidence / references
- `server/tests/`
- `scripts/verify_platform.py`
- `server/package.json`
- `client/package.json`
- `services/scribe/app.py`

**Testing record:**  
Backend test result: ____________________  
Frontend build/lint result: ____________________  
Scribe self-test/smoke result: ____________________  
Platform verification result: ____________________

**Next week's plan:** Prepare deployment configuration and complete technical documentation.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 11 — Deployment Preparation and Technical Documentation

**Dates:** ____________________ to ____________________

### Objectives
- Prepare deployment configuration for the application services.
- Document setup, environment variables, and system architecture.
- Make the repository easier to install and demonstrate.

### Work carried out
- Reviewed the Vercel configuration for the frontend and Render configuration for backend services.
- Documented the environment variables required by the client, API, and EvidenceScribe service.
- Reviewed the local setup instructions and root startup scripts for Windows, PowerShell, and shell environments.
- Documented the architecture, deployment process, and demonstration workflow.
- Reviewed the distinction between temporary in-memory local data and persistent MongoDB deployment.
- Added or refined repository documentation to describe the actual source structure and available commands.

### Outcome
Deployment preparation and project documentation were organized to support local setup, demonstration, and future maintenance.

### Evidence / references
- `vercel.json`
- `render.yaml`
- `start_all.bat`, `start_all.ps1`, `start_all.sh`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/DEMO_WALKTHROUGH.md`
- Root and service README files.

**Next week's plan:** Conduct final review, prepare the demonstration, and organize project handover.

**Student signature:** ____________________  
**Guide remarks:** __________________________________________________

---

## Week 12 — Final Review, Demonstration, and Project Handover

**Dates:** ____________________ to ____________________

### Objectives
- Review the completed project structure and major workflows.
- Prepare a concise demonstration of the platform.
- Record limitations and possible future improvements.

### Work carried out
- Reviewed the React frontend, Express API, MongoDB models, and EvidenceScribe service as one project.
- Prepared the demonstration sequence covering authentication, patient records, consent/access, doctor workflows, appointments, emergency information, financial support, and clinical documentation features where configured.
- Reviewed setup instructions and verification commands for repeatability.
- Identified limitations that must be communicated during evaluation: the project is an academic/demo prototype; provider-dependent AI behavior requires valid configuration; demonstration fixtures are not live evaluation results; and the implementation does not establish regulatory certification, legal compliance, or clinical validation.
- Organized repository documentation and project evidence for handover.
- Listed possible future work, including stronger automated integration coverage, security review, persistent deployment hardening, and reproducible evaluation of AI components.

### Outcome
The MediBridge project was reviewed and organized for academic demonstration and handover. Final test outcomes and demonstrated features should be recorded based on the actual evaluation run.

### Evidence / references
- Repository source on the `main` branch.
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DEMO_WALKTHROUGH.md`
- `docs/DEPLOYMENT_GUIDE.md`
- Test logs and demonstration screenshots collected by the project team.

### Final project reflection
The project provided practical experience in full-stack application development, REST API design, database modelling, role-aware workflows, external service integration, AI-assisted functionality, and deployment preparation. It also highlighted the importance of privacy, careful verification, and clear communication of the limitations of healthcare-related software.

**Student signature:** ____________________  
**Faculty guide signature:** ____________________  
**Final remarks:** __________________________________________________

---

## Weekly Review Summary

| Week | Focus area | Completion / remarks |
|---|---|---|
| 1 | Requirements and project scope | ____________________ |
| 2 | Architecture and technology selection | ____________________ |
| 3 | Frontend foundation | ____________________ |
| 4 | Backend and database | ____________________ |
| 5 | Authentication, profiles, and records | ____________________ |
| 6 | Consent, access, and doctor workflows | ____________________ |
| 7 | Clinical AI integrations | ____________________ |
| 8 | EvidenceScribe | ____________________ |
| 9 | Supporting workflows | ____________________ |
| 10 | Integration and testing | ____________________ |
| 11 | Deployment and documentation | ____________________ |
| 12 | Final review and handover | ____________________ |

