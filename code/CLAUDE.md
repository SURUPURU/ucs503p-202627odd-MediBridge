# MediBridge — Claude Code Instructions

## Read First
Read `ARCHITECTURE.md` for the complete system design. Follow it exactly.

## Current Project Status

### ✅ Sprint 1 — COMPLETED (Auth + Setup)
- Server: Express + MongoDB + JWT auth + bcrypt + error handling
- Models: User (with healthId, accessPin, role, doctorProfile)
- Routes: register (patient + doctor), login, logout, refresh
- Middleware: authMiddleware, roleMiddleware, validate, errorHandler
- Utils: ApiError, asyncHandler, generateToken
- Validators: authValidator (Joi)
- Client: Vite + React + Tailwind + Zustand + React Router
- Pages: Login, Register, DoctorRegister, PatientDashboard, DoctorDashboard
- Services: api.js (axios + interceptor + token refresh), authService.js
- Store: authStore (Zustand + localStorage persistence)
- Routes: ProtectedRoute, RoleRoute

### ❌ Sprint 2 — TODO: Patient Profile + Emergency + Health ID
- EmergencyProfile model + CRUD routes
- Profile routes (GET/PUT /profile/me, /profile/emergency, /profile/access-pin)
- Health ID card page with QR code (use qrcode.react — already installed)
- NFC write component
- Patient dashboard with stat cards + quick actions
- Sidebar/Navbar layout component (use across all pages)

### ❌ Sprint 3 — TODO: Doctor Portal + Consent System
- AccessSession model (24hr temporary access via PIN)
- AccessLog model (audit trail)
- Doctor routes: search patient, request-access (PIN verify), view/add records
- accessMiddleware.js (verify active session before patient data access)
- Emergency public page at /emergency/:healthId (NO auth — NFC target)
- Frontend: Doctor find patient (NFC scan + manual input), PIN entry modal
- Frontend: Access log page for patients, active sessions + revoke button

### ❌ Sprint 4 — TODO: Hospital Search + Medical Records
- Hospital + Doctor models with text indexes
- Hospital CRUD routes with pagination + filtering + search
- Medical Record model + routes (patient self-upload + doctor upload)
- Cloudinary config (server/src/config/cloudinary.js)
- Multer upload middleware (server/src/middleware/upload.js)
- Mock hospital API for simulated record fetch
- Seed script (server/seed/seedHospitals.js) with 20-30 hospitals + doctors
- Frontend: Hospital search page, hospital detail, records list, upload form

### ❌ Sprint 5 — TODO: Prescriptions
- Prescription model (structured: medicines array with dosage/frequency/timing)
- Prescription routes (doctor writes, patient views, mark complete)
- Frontend: Write prescription form (doctor), prescription list + detail (patient)

### ❌ Sprint 6 — TODO: Loan + Fundraiser
- LoanApplication model + routes
- Rule-based eligibility engine (server/src/utils/loanEligibility.js)
- ML model service (server/src/services/loanPredictionService.js) — calls Flask API
- FundraiserCampaign + Donation models + routes
- Frontend: Loan application form, eligibility result, campaign page, donate flow

### ❌ Sprint 7 — TODO: Polish + Deploy
- Responsive design, loading states, error boundaries, toasts
- Landing page (public)
- Deploy: Vercel (frontend) + Render (backend) + MongoDB Atlas

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS v4 + Zustand + React Router v7
- Backend: Node.js + Express 5 + Mongoose 9 + JWT + bcryptjs
- Database: MongoDB Atlas
- File Storage: Cloudinary
- ML Model: Flask API on separate machine (call via HTTP)
- Validation: Joi
- Package manager: npm

## Code Style Rules
- CommonJS in server (require/module.exports), ESM in client (import/export)
- Use asyncHandler wrapper on ALL controller functions
- Every route handler must validate input with Joi
- Every API response must follow the standardized format: { success, message, data, pagination? }
- Use ApiError class for all error throwing
- Never store plain text passwords or PINs — always bcrypt hash
- All patient data queries must be scoped to req.user._id
- Doctor routes must go through verifyDoctorAccess middleware (check active AccessSession)
- Use Tailwind CSS for all styling (no custom CSS files for new components)

## Environment Variables Already Set
- Server .env: PORT, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL
- Client .env: VITE_API_URL
- Still needed: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, MODEL_API_URL

## Important Patterns Already Established
- Password field has `select: false` in User model — use `.select('+password')` when needed
- accessPin field has `select: false` — use `.select('+accessPin')` for PIN verification
- healthId auto-generates with collision check in pre-save hook
- Auth tokens: accessToken (15min), refreshToken (7d)
- Rate limiting on auth routes (20 req / 15 min)
- DNS servers set to 8.8.8.8 and 1.1.1.1 in db.js for MongoDB Atlas connectivity

## Current Sprint
Sprint 2: Patient Profile + Emergency Profile + Health ID Card + NFC + Dashboard Layout
