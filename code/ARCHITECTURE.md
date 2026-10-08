# MediBridge — Complete MVP Architecture Document
## Healthcare Access & Financial Assistance Platform (MERN Stack)

> **Purpose**: This is a single, complete, implementation-ready architecture spec. Hand this entire document to Claude/Gemini and it can build the full MediBridge MVP from scratch. Follow top-to-bottom.

---

## 1. Product Summary

**MediBridge** is a centralized healthcare platform that combines medical records management, hospital discovery, financial assistance, and emergency health access into one patient-focused system.

### Core Features (MVP)
1. **Health ID System** — Every patient gets a unique ID (like ABHA): `MB-2026-XXXXXX`
2. **Patient Dashboard** — Unified view of records, prescriptions, access logs
3. **Doctor Portal** — Doctors search patients by Health ID, add records & prescriptions directly
4. **PIN-Based Consent** — Patient gives 4-digit PIN to doctor for temporary access (24hrs)
5. **Access Audit Log** — Patient sees exactly who accessed their data and when
6. **Medical Records** — Patient self-upload + doctor direct upload + mock hospital fetch
7. **Digital Prescriptions** — Structured prescription system (not PDF scans)
8. **Hospital & Doctor Search** — Filter by city, specialization, type, rating
9. **Loan Eligibility** — Dual scoring: ML model (microservice) + rule-based engine
10. **Crowdfunding/Donors** — Bridge the gap when loan covers less than needed
11. **Emergency Profile via NFC** — Tap NFC card → instant emergency info, no login needed

### Phase 2 (Post-MVP)
- Notification system (email/push)
- Admin panel for hospital/partner management
- Recommendation engine
- Real ABDM/bank integrations
- Payment gateway for donations (Razorpay)

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18+ (Vite) | SPA with responsive UI |
| **UI Library** | Tailwind CSS + shadcn/ui (or Material UI) | Rapid, consistent styling |
| **State Mgmt** | Zustand (or React Context for MVP) | Lightweight global state |
| **Routing** | React Router v6 | Client-side routing |
| **Backend** | Node.js + Express.js | REST API server |
| **Database** | MongoDB Atlas (free tier) | Document store |
| **ODM** | Mongoose | Schema validation & queries |
| **Auth** | JWT (access + refresh tokens) + bcrypt | Stateless auth |
| **File Storage** | Cloudinary (free tier) | Medical document uploads |
| **Validation** | Joi (backend) | Input validation |
| **ML Model** | Python + Flask (separate laptop) | Loan prediction microservice |
| **NFC** | Web NFC API (Chrome Android) | Health card read/write |
| **Testing** | Jest + Supertest (API) | Automated tests |
| **Deployment** | Vercel (frontend) + Render (backend) + MongoDB Atlas | Free-tier cloud hosting |

---

## 3. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SAME WIFI NETWORK                            │
│                                                                      │
│  LAPTOP 1 (Main)                        LAPTOP 2 (ML Model)         │
│  ┌─────────────────────────────┐       ┌─────────────────────────┐  │
│  │  React Frontend (Vite)      │       │  Streamlit (demo UI)    │  │
│  │  Port: 5173                 │       │  Port: 8501             │  │
│  │  ┌───────────────────────┐  │       │                         │  │
│  │  │ Patient Pages         │  │       │  Flask API (wrapper)    │  │
│  │  │ Doctor Pages          │  │       │  Port: 5001             │  │
│  │  │ Emergency Page        │  │       │  loan_model.pkl         │  │
│  │  │ Fundraiser Page       │  │       │                         │  │
│  │  └───────┬───────────────┘  │       └────────────▲────────────┘  │
│  │          │ axios             │                    │ HTTP          │
│  │  ┌───────▼───────────────┐  │                    │               │
│  │  │ Express.js Backend    │──┼────────────────────┘               │
│  │  │ Port: 5000            │  │     POST /predict                  │
│  │  │                       │  │                                     │
│  │  │ Routes:               │  │                                     │
│  │  │  /api/v1/auth         │  │       ┌─────────────────────────┐  │
│  │  │  /api/v1/profile      │──┼──────▶│  MongoDB Atlas (Cloud)  │  │
│  │  │  /api/v1/hospitals    │  │       │  Database: medibridge   │  │
│  │  │  /api/v1/records      │  │       └─────────────────────────┘  │
│  │  │  /api/v1/prescriptions│  │                                     │
│  │  │  /api/v1/doctor       │  │       ┌─────────────────────────┐  │
│  │  │  /api/v1/financial    │──┼──────▶│  Cloudinary (Cloud)     │  │
│  │  │  /api/v1/fundraiser   │  │       │  Files: PDFs, Images    │  │
│  │  │  /api/v1/emergency    │  │       └─────────────────────────┘  │
│  │  └───────────────────────┘  │                                     │
│  └─────────────────────────────┘                                     │
│                                                                      │
│  NFC Tags/Cards ◄──── Patient taps to write/read Health ID          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Project Folder Structure

```
medibridge/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Images, icons, fonts
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Card, Modal, Loader, Badge, ProgressBar
│   │   │   ├── layout/             # Navbar, Sidebar, Footer, PageWrapper
│   │   │   └── shared/             # SearchBar, FileUpload, EmptyState, HealthIdCard, NFCWriter
│   │   ├── pages/
│   │   │   ├── auth/               # Login.jsx, Register.jsx, DoctorRegister.jsx
│   │   │   ├── dashboard/          # PatientDashboard.jsx, DoctorDashboard.jsx
│   │   │   ├── hospitals/          # HospitalSearch.jsx, HospitalDetail.jsx
│   │   │   ├── records/            # MedicalRecords.jsx, UploadRecord.jsx
│   │   │   ├── prescriptions/      # Prescriptions.jsx, PrescriptionDetail.jsx
│   │   │   ├── profile/            # PatientProfile.jsx, EmergencyProfile.jsx, HealthIdCard.jsx, WriteNFC.jsx
│   │   │   ├── doctor/             # ScanPatient.jsx, AddRecord.jsx, WritePrescription.jsx, MyPatients.jsx
│   │   │   ├── financial/          # LoanApplication.jsx, EligibilityResult.jsx, LoanHistory.jsx
│   │   │   ├── fundraiser/         # CreateCampaign.jsx, CampaignPage.jsx, DonatePage.jsx
│   │   │   ├── access/             # AccessLog.jsx, ActiveSessions.jsx
│   │   │   └── emergency/          # EmergencyPublic.jsx (public page — no auth)
│   │   ├── hooks/                   # useAuth, useNFC, useHospitals, useRecords, useDebounce
│   │   ├── services/                # API call functions (axios instances)
│   │   │   ├── api.js               # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── hospitalService.js
│   │   │   ├── recordService.js
│   │   │   ├── prescriptionService.js
│   │   │   ├── doctorService.js
│   │   │   ├── financialService.js
│   │   │   ├── fundraiserService.js
│   │   │   └── profileService.js
│   │   ├── store/                   # Zustand stores (authStore, uiStore)
│   │   ├── utils/                   # Formatters, validators, constants
│   │   ├── routes/                  # Route config, ProtectedRoute, RoleRoute
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection
│   │   │   ├── cloudinary.js        # Cloudinary config
│   │   │   └── env.js               # Environment variable loader
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Hospital.js
│   │   │   ├── Doctor.js
│   │   │   ├── MedicalRecord.js
│   │   │   ├── Prescription.js
│   │   │   ├── EmergencyProfile.js
│   │   │   ├── LoanApplication.js
│   │   │   ├── FundraiserCampaign.js
│   │   │   ├── Donation.js
│   │   │   ├── AccessSession.js
│   │   │   └── AccessLog.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── profileRoutes.js
│   │   │   ├── hospitalRoutes.js
│   │   │   ├── recordRoutes.js
│   │   │   ├── prescriptionRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   ├── financialRoutes.js
│   │   │   ├── fundraiserRoutes.js
│   │   │   ├── accessRoutes.js
│   │   │   ├── emergencyRoutes.js    # Public route — no auth
│   │   │   └── mockHospitalRoutes.js # Simulated hospital API
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── profileController.js
│   │   │   ├── hospitalController.js
│   │   │   ├── recordController.js
│   │   │   ├── prescriptionController.js
│   │   │   ├── doctorController.js
│   │   │   ├── financialController.js
│   │   │   ├── fundraiserController.js
│   │   │   └── accessController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification
│   │   │   ├── roleMiddleware.js     # Role-based access (patient/doctor/admin)
│   │   │   ├── accessMiddleware.js   # Verify doctor has active session for patient
│   │   │   ├── errorHandler.js       # Global error handler
│   │   │   ├── validate.js           # Request validation middleware
│   │   │   └── upload.js             # Multer config for file uploads
│   │   ├── services/
│   │   │   └── loanPredictionService.js  # Calls ML model on Laptop 2
│   │   ├── utils/
│   │   │   ├── generateToken.js      # JWT helper
│   │   │   ├── asyncHandler.js       # try-catch wrapper
│   │   │   ├── ApiError.js           # Custom error class
│   │   │   └── loanEligibility.js    # Rule-based scoring engine
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── recordValidator.js
│   │   │   └── prescriptionValidator.js
│   │   └── app.js                    # Express app setup (middleware, routes)
│   ├── server.js                     # Entry point (listen)
│   ├── .env
│   ├── seed/
│   │   └── seedHospitals.js          # Seed hospital & doctor data
│   └── package.json
│
├── model-api/                        # ON LAPTOP 2 (ML Model)
│   ├── api_server.py                 # Flask API wrapper
│   ├── loan_model.pkl                # Pre-trained model
│   ├── streamlit_app.py              # Existing Streamlit UI
│   └── requirements.txt              # flask, scikit-learn, numpy, pandas
│
├── .gitignore
├── README.md
└── package.json                      # Root package.json
```

---

## 5. MongoDB Schema Design (All 11 Collections)

### 5.1 User (Patient + Doctor + Admin)

```js
// server/src/models/User.js
const userSchema = new mongoose.Schema({
  firstName:     { type: String, required: true, trim: true },
  lastName:      { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 8 },  // bcrypt hashed
  phone:         { type: String },
  dateOfBirth:   { type: Date },
  gender:        { type: String, enum: ['male', 'female', 'other'] },
  address: {
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
  },
  avatar:        { type: String },         // Cloudinary URL

  // Role system
  role:          { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },

  // Health ID (patients only) — auto-generated, unique
  healthId:      { type: String, unique: true, sparse: true },
  // Format: "MB-2026-XXXXXX" (e.g., "MB-2026-849372")

  // Access PIN (patients only) — 4-digit, bcrypt hashed
  accessPin:     { type: String },

  // Doctor profile (doctors only)
  doctorProfile: {
    doctorId:       String,                // "DOC-APL-0042" — visible to patients
    hospitalId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    specialization: String,
    qualification:  String,
    licenseNumber:  String,                // Medical Council registration
    experience:     Number,                // years
    isVerified:     { type: Boolean, default: false },
  },

  refreshToken:  { type: String },
}, { timestamps: true });

// --- Pre-save Hooks ---

// Hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Hash access PIN
userSchema.pre('save', async function(next) {
  if (this.isModified('accessPin')) {
    this.accessPin = await bcrypt.hash(this.accessPin, 10);
  }
  next();
});

// Auto-generate Health ID for patients
userSchema.pre('save', function(next) {
  if (this.role === 'patient' && !this.healthId) {
    this.healthId = 'MB-' + new Date().getFullYear() + '-' + Math.random().toString().slice(2, 8);
  }
  next();
});

// --- Methods ---
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.verifyPin = async function(enteredPin) {
  return bcrypt.compare(enteredPin, this.accessPin);
};
```

### 5.2 Emergency Profile

```js
// server/src/models/EmergencyProfile.js
const emergencyProfileSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup:       { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  allergies:        [{ type: String }],
  chronicConditions:[{ type: String }],
  currentMedications:[{
    name:      String,
    dosage:    String,
    frequency: String,
  }],
  emergencyContacts: [{
    name:         String,
    relationship: String,
    phone:        String,
  }],
  insuranceProvider: { type: String },
  insurancePolicyNo: { type: String },
  organDonor:       { type: Boolean, default: false },
  notes:            { type: String },
}, { timestamps: true });
```

### 5.3 Hospital

```js
// server/src/models/Hospital.js
const hospitalSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  type:          { type: String, enum: ['government', 'private', 'ngo', 'clinic'] },
  specializations: [{ type: String }],
  address: {
    street:  String,
    city:    { type: String, required: true, index: true },
    state:   { type: String, required: true },
    pincode: String,
    coordinates: { lat: Number, lng: Number },
  },
  phone:         String,
  email:         String,
  website:       String,
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  totalBeds:     Number,
  emergencyAvailable: { type: Boolean, default: false },
  insuranceAccepted: [{ type: String }],
  imageUrl:      String,
  isVerified:    { type: Boolean, default: false },
}, { timestamps: true });

hospitalSchema.index({ name: 'text', 'address.city': 'text', specializations: 'text' });
```

### 5.4 Doctor (Standalone — for hospital-listed doctors)

```js
// server/src/models/Doctor.js
const doctorSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  specialization: { type: String, required: true },
  qualification:  String,
  experience:     Number,
  hospitalId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  consultationFee: Number,
  availability: {
    days:  [{ type: String }],
    hours: String,
  },
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  imageUrl:       String,
}, { timestamps: true });
```

### 5.5 Medical Record

```js
// server/src/models/MedicalRecord.js
const medicalRecordSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Who uploaded this record
  uploadedBy: {
    type:         { type: String, enum: ['self', 'doctor', 'hospital_fetch'], required: true },
    doctorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorName:   String,
    hospitalId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    hospitalName: String,
  },

  title:         { type: String, required: true },
  category:      { type: String, enum: [
    'lab_report', 'prescription', 'discharge_summary',
    'imaging', 'diagnosis', 'surgery_note', 'follow_up', 'invoice', 'other'
  ], required: true },
  description:   String,

  // Doctor-added fields
  clinicalNotes: String,
  diagnosis:     [{ type: String }],
  vitals: {
    bloodPressure: String,
    heartRate:     Number,
    temperature:   Number,
    weight:        Number,
    oxygenLevel:   Number,
  },

  // File (optional — doctor might just add notes)
  fileUrl:       String,      // Cloudinary URL
  fileType:      String,      // "pdf", "jpg", "png"
  fileSize:      Number,      // bytes

  hospitalName:  String,
  doctorName:    String,
  recordDate:    { type: Date, default: Date.now },
  tags:          [{ type: String }],
  isPrivate:     { type: Boolean, default: true },
}, { timestamps: true });
```

### 5.6 Prescription

```js
// server/src/models/Prescription.js
const prescriptionSchema = new mongoose.Schema({
  patientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },

  diagnosis:   [{ type: String }],
  symptoms:    [{ type: String }],

  medicines: [{
    name:        { type: String, required: true },
    type:        { type: String, enum: ['tablet','capsule','syrup','injection','cream','drops','inhaler','other'] },
    dosage:      String,
    frequency:   String,        // "1-0-1" (morning-afternoon-night)
    duration:    String,        // "5 days"
    timing:      { type: String, enum: ['before_meal','after_meal','empty_stomach','bedtime','as_needed'] },
    instructions: String,
    quantity:    Number,
  }],

  tests:       [{ type: String }],
  advice:      String,
  followUpDate: Date,

  vitals: {
    bloodPressure: String,
    heartRate:     Number,
    temperature:   Number,
    weight:        Number,
    oxygenLevel:   Number,
  },

  isActive:    { type: Boolean, default: true },
}, { timestamps: true });
```

### 5.7 Access Session (Doctor ↔ Patient temporary access)

```js
// server/src/models/AccessSession.js
const accessSessionSchema = new mongoose.Schema({
  patientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:     { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
  expiresAt:  { type: Date, required: true },
  permissions: {
    viewRecords:       { type: Boolean, default: true },
    viewPrescriptions: { type: Boolean, default: true },
    viewEmergency:     { type: Boolean, default: true },
    addRecords:        { type: Boolean, default: true },
    addPrescription:   { type: Boolean, default: true },
  },
}, { timestamps: true });

// Auto-expire via MongoDB TTL index
accessSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 5.8 Access Log (Audit trail)

```js
// server/src/models/AccessLog.js
const accessLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:    { type: String, enum: [
    'access_granted', 'viewed_records', 'viewed_prescriptions',
    'added_record', 'added_prescription', 'access_revoked', 'access_expired'
  ]},
  details:   String,
  ipAddress: String,
}, { timestamps: true });
```

### 5.9 Loan Application

```js
// server/src/models/LoanApplication.js
const loanApplicationSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  treatmentType:    { type: String, required: true },
  estimatedCost:    { type: Number, required: true },
  amountRequested:  { type: Number, required: true },
  
  // Applicant financial info
  monthlyIncome:      Number,
  coapplicantIncome:  Number,
  existingEMIs:       Number,
  employmentType:     { type: String, enum: ['salaried', 'self_employed', 'unemployed'] },
  creditHistory:      Boolean,

  // Scoring results
  mlScore:          Number,      // From ML model (confidence %)
  ruleScore:        Number,      // From rule-based engine (out of 100)
  approvedAmount:   Number,
  interestRate:     Number,
  tenure:           Number,      // months
  emi:              Number,

  status:           { type: String, enum: [
    'draft', 'submitted', 'under_review', 'approved', 'partial', 'rejected', 'disbursed'
  ], default: 'draft' },
  
  supportingDocs:   [{ type: String }],
  purpose:          String,
  notes:            String,
}, { timestamps: true });
```

### 5.10 Fundraiser Campaign

```js
// server/src/models/FundraiserCampaign.js
const fundraiserSchema = new mongoose.Schema({
  patientId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication' },

  title:           { type: String, required: true },
  story:           { type: String, required: true },
  coverImage:      String,

  totalRequired:   { type: Number, required: true },
  loanApproved:    { type: Number, default: 0 },
  fundingGap:      { type: Number, required: true },
  amountRaised:    { type: Number, default: 0 },

  treatmentType:   String,
  hospitalName:    String,
  doctorName:      String,

  isVerified:      { type: Boolean, default: false },
  medicalProof:    [{ type: String }],

  status:          { type: String, enum: [
    'draft', 'pending_verification', 'active', 'funded', 'closed', 'expired'
  ], default: 'draft' },

  deadline:        Date,
  shareSlug:       { type: String, unique: true },
}, { timestamps: true });
```

### 5.11 Donation

```js
// server/src/models/Donation.js
const donationSchema = new mongoose.Schema({
  campaignId:   { type: mongoose.Schema.Types.ObjectId, ref: 'FundraiserCampaign', required: true },
  donorName:    { type: String, default: 'Anonymous' },
  donorEmail:   String,
  donorPhone:   String,
  isAnonymous:  { type: Boolean, default: false },
  amount:       { type: Number, required: true },
  paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'] },
  transactionId: String,       // Mock for MVP
  status:       { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  message:      String,
}, { timestamps: true });
```

---

## 6. Complete REST API Design

### Base URL: `/api/v1`

### 6.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register patient (returns healthId + sets accessPin) | ❌ |
| POST | `/auth/register/doctor` | Register doctor (with license number) | ❌ |
| POST | `/auth/login` | Login (returns accessToken + refreshToken) | ❌ |
| POST | `/auth/refresh` | Refresh access token | ❌ |
| POST | `/auth/logout` | Invalidate refresh token | ✅ |
| POST | `/auth/forgot-password` | Send reset email | ❌ |
| POST | `/auth/reset-password/:token` | Reset password | ❌ |

### 6.2 Patient Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile/me` | Get current user profile | ✅ |
| PUT | `/profile/me` | Update profile | ✅ |
| PUT | `/profile/me/avatar` | Upload profile picture | ✅ |
| GET | `/profile/emergency` | Get emergency profile | ✅ |
| PUT | `/profile/emergency` | Create/update emergency profile | ✅ |
| PUT | `/profile/access-pin` | Change access PIN | ✅ |
| GET | `/profile/health-id` | Get health ID card data + QR | ✅ |

### 6.3 Emergency (Public — No Auth)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/emergency/:healthId` | Public emergency profile (for NFC scan) | ❌ |

### 6.4 Doctor Portal

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/doctor/request-access` | Submit healthId + PIN → get 24hr access | ✅ Doctor |
| GET | `/doctor/search-patient?healthId=` | Find patient by Health ID | ✅ Doctor |
| GET | `/doctor/patient/:healthId/records` | View patient's records | ✅ Doctor + Active Session |
| POST | `/doctor/patient/:healthId/records` | Add record to patient | ✅ Doctor + Active Session |
| GET | `/doctor/patient/:healthId/prescriptions` | View patient's past prescriptions | ✅ Doctor + Active Session |
| POST | `/doctor/patient/:healthId/prescription` | Write new prescription | ✅ Doctor + Active Session |
| GET | `/doctor/my-patients` | List treated patients | ✅ Doctor |
| GET | `/doctor/my-sessions` | Active access sessions | ✅ Doctor |
| GET | `/doctor/dashboard` | Doctor dashboard stats | ✅ Doctor |

### 6.5 Hospital & Doctor Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/hospitals` | List hospitals (paginated + filtered) | ✅ |
| GET | `/hospitals/:id` | Hospital details + doctors | ✅ |
| GET | `/hospitals/search?q=&city=&specialization=&type=` | Full-text search | ✅ |
| GET | `/doctors` | List doctors (paginated + filtered) | ✅ |
| GET | `/doctors/:id` | Doctor details | ✅ |

**Query params for `/hospitals`:** `?page=1&limit=10&city=Mumbai&type=government&specialization=Cardiology&emergencyAvailable=true&sortBy=rating&minRating=3`

### 6.6 Medical Records

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/records` | Patient's records (paginated + filtered) | ✅ Patient |
| GET | `/records/:id` | Single record detail | ✅ Patient |
| POST | `/records` | Upload new record (multipart/form-data) | ✅ Patient |
| PUT | `/records/:id` | Update record metadata | ✅ Patient |
| DELETE | `/records/:id` | Delete record | ✅ Patient |
| POST | `/records/fetch-from-hospital` | Fetch from mock hospital API | ✅ Patient |

### 6.7 Prescriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/prescriptions` | Patient's all prescriptions | ✅ Patient |
| GET | `/prescriptions/active` | Currently active prescriptions | ✅ Patient |
| GET | `/prescriptions/:id` | Single prescription detail | ✅ Patient/Doctor |
| PUT | `/prescriptions/:id/complete` | Mark course as completed | ✅ Patient |

### 6.8 Access Control & Audit

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/access-log` | Full audit trail (who accessed data) | ✅ Patient |
| GET | `/access-sessions` | Currently active doctor sessions | ✅ Patient |
| PUT | `/access-sessions/:id/revoke` | Revoke doctor's access | ✅ Patient |

### 6.9 Financial — Loan

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/financial/check-eligibility` | Run dual scoring (ML + rules) | ✅ Patient |
| POST | `/financial/loan` | Submit loan application | ✅ Patient |
| GET | `/financial/loan` | Patient's applications | ✅ Patient |
| GET | `/financial/loan/:id` | Application details | ✅ Patient |
| PUT | `/financial/loan/:id` | Update application | ✅ Patient |

### 6.10 Fundraiser / Donor

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/fundraiser` | Create campaign | ✅ Patient |
| GET | `/fundraiser/my` | Patient's campaigns | ✅ Patient |
| GET | `/fundraiser/:slug` | Public campaign page | ❌ Public |
| PUT | `/fundraiser/:id` | Edit campaign | ✅ Patient |
| POST | `/fundraiser/:id/donate` | Make donation | ❌ Public |
| GET | `/fundraiser/:id/donors` | List donors | ❌ Public |

### 6.11 Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/patient` | Patient dashboard summary | ✅ Patient |
| GET | `/dashboard/doctor` | Doctor dashboard summary | ✅ Doctor |

### 6.12 Mock Hospital API (Simulated External System)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/mock/hospital/:code/records/:patientId` | Simulated hospital returning records | Internal |

---

## 7. API Response Format (Standardized — Use Everywhere)

```js
// Success
{
  "success": true,
  "message": "Records fetched successfully",
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

---

## 8. Key Implementation Patterns

### 8.1 JWT Auth Flow

```js
// utils/generateToken.js
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
```

### 8.2 Auth Middleware

```js
// middleware/authMiddleware.js
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1] : null;

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password -accessPin -refreshToken');
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};
```

### 8.3 Role Middleware

```js
// middleware/roleMiddleware.js
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' not authorized` });
  }
  next();
};

// Usage:
router.post('/doctor/patient/:healthId/records', protect, authorize('doctor'), verifyDoctorAccess, addRecord);
router.get('/records', protect, authorize('patient'), getMyRecords);
```

### 8.4 Doctor Access Middleware (Checks Active PIN Session)

```js
// middleware/accessMiddleware.js
const verifyDoctorAccess = async (req, res, next) => {
  const { healthId } = req.params;
  const patient = await User.findOne({ healthId });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const session = await AccessSession.findOne({
    patientId: patient._id,
    doctorId: req.user._id,
    status: 'active',
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return res.status(403).json({ success: false, message: 'No active access. Request patient PIN first.' });
  }

  // Log access
  await AccessLog.create({
    patientId: patient._id,
    doctorId: req.user._id,
    action: req.method === 'POST' ? 'added_record' : 'viewed_records',
  });

  req.patient = patient;
  next();
};
```

### 8.5 Doctor Requests Access (PIN Verification)

```js
// controllers/accessController.js
const requestAccess = async (req, res) => {
  const { healthId, accessPin } = req.body;

  const patient = await User.findOne({ healthId });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const pinValid = await patient.verifyPin(accessPin);
  if (!pinValid) throw new ApiError(401, 'Invalid access PIN');

  const session = await AccessSession.create({
    patientId: patient._id,
    doctorId: req.user._id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),  // 24 hours
  });

  await AccessLog.create({
    patientId: patient._id,
    doctorId: req.user._id,
    action: 'access_granted',
    details: 'Access granted for 24 hours via PIN',
  });

  res.json({ success: true, message: 'Access granted for 24 hours', data: { sessionId: session._id, expiresAt: session.expiresAt } });
};
```

### 8.6 Axios Interceptor (Frontend)

```js
// services/api.js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        refreshToken: localStorage.getItem('refreshToken'),
      });
      localStorage.setItem('accessToken', data.data.accessToken);
      error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 8.7 File Upload (Multer → Cloudinary)

```js
// middleware/upload.js
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: PDF, JPG, PNG'), false);
  },
});
```

### 8.8 Error Handling

```js
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
  }
}

// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

---

## 9. Loan Eligibility — Dual Scoring System

### 9.1 Rule-Based Engine (Local — Always Available)

```js
// utils/loanEligibility.js
const checkEligibility = ({ monthlyIncome, amountRequested, existingEMIs, age, employmentType, creditHistory }) => {
  let score = 0;
  const reasons = [];

  const maxByIncome = monthlyIncome * 24;
  if (amountRequested <= maxByIncome) score += 30;
  else reasons.push(`Income supports max ₹${maxByIncome.toLocaleString()}`);

  const dtiRatio = existingEMIs / monthlyIncome;
  if (dtiRatio < 0.3) score += 25;
  else if (dtiRatio < 0.5) score += 15;
  else reasons.push('Existing debt too high');

  if (age >= 21 && age <= 58) score += 15;
  else reasons.push('Age outside eligible range (21-58)');

  if (employmentType === 'salaried') score += 20;
  else if (employmentType === 'self_employed') score += 10;
  else reasons.push('Stable income source required');

  if (creditHistory) score += 10;
  else reasons.push('No credit history');

  const maxApproved = Math.min(amountRequested, maxByIncome);
  const calculateEMI = (p, r, n) => { const mr = r/12/100; return Math.round(p*mr*Math.pow(1+mr,n)/(Math.pow(1+mr,n)-1)); };

  if (score >= 70) {
    return { status: 'approved', score, approvedAmount: maxApproved, interestRate: score >= 85 ? 9.5 : 12.0, emi: calculateEMI(maxApproved, score >= 85 ? 9.5 : 12.0, 12), fundingGap: amountRequested - maxApproved, reasons };
  } else if (score >= 40) {
    const partial = Math.round(maxApproved * 0.6);
    return { status: 'partial', score, approvedAmount: partial, interestRate: 14.0, emi: calculateEMI(partial, 14.0, 12), fundingGap: amountRequested - partial, reasons };
  } else {
    return { status: 'rejected', score, approvedAmount: 0, fundingGap: amountRequested, reasons, suggestion: 'Consider fundraiser campaign' };
  }
};
```

### 9.2 ML Model Microservice (Laptop 2 — Flask API)

```python
# model-api/api_server.py  (ON LAPTOP 2)
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

with open('loan_model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # Adjust features to match YOUR Kaggle model's expected columns
    features = np.array([[
        data['gender'],
        data['married'],
        data['dependents'],
        data['education'],
        data['selfEmployed'],
        data['applicantIncome'],
        data['coapplicantIncome'],
        data['loanAmount'],
        data['loanAmountTerm'],
        data['creditHistory'],
        data['propertyArea'],
    ]])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0]

    return jsonify({
        'approved': bool(prediction),
        'confidence': round(float(max(probability)) * 100, 1),
        'probability': {
            'approve': round(float(probability[1]) * 100, 1),
            'reject': round(float(probability[0]) * 100, 1),
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

### 9.3 Calling ML Model from MediBridge Backend

```js
// services/loanPredictionService.js
const axios = require('axios');
const MODEL_API_URL = process.env.MODEL_API_URL || 'http://192.168.1.105:5001';

const predictLoanApproval = async (data) => {
  try {
    const response = await axios.post(`${MODEL_API_URL}/predict`, {
      gender: data.gender === 'male' ? 1 : 0,
      married: data.married ? 1 : 0,
      dependents: data.dependents || 0,
      education: data.education === 'graduate' ? 1 : 0,
      selfEmployed: data.employmentType === 'self_employed' ? 1 : 0,
      applicantIncome: data.monthlyIncome,
      coapplicantIncome: data.coapplicantIncome || 0,
      loanAmount: data.amountRequested / 1000,
      loanAmountTerm: data.tenure || 360,
      creditHistory: data.creditHistory ? 1 : 0,
      propertyArea: data.propertyArea || 1,
    });
    return response.data;
  } catch (error) {
    console.error('ML Model unavailable:', error.message);
    return { approved: null, error: 'Model unavailable', fallback: true };
  }
};
```

---

## 10. NFC Integration

### 10.1 Write Health ID to NFC Card (Patient Dashboard)

```jsx
// pages/profile/WriteNFC.jsx
const WriteNFC = ({ healthId }) => {
  const [status, setStatus] = useState('idle');

  const writeToNFC = async () => {
    if (!('NDEFReader' in window)) {
      alert('NFC not supported. Use Chrome on Android.');
      return;
    }
    try {
      setStatus('waiting');
      const writer = new NDEFReader();
      await writer.write({
        records: [{ recordType: 'url', data: `${window.location.origin}/emergency/${healthId}` }]
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div>
      <h3>Write Health ID to NFC Card</h3>
      <p>Hold NFC card behind phone</p>
      <button onClick={writeToNFC}>
        {status === 'waiting' ? '📡 Tap NFC card now...' : status === 'success' ? '✅ Done!' : '📱 Write to NFC'}
      </button>
    </div>
  );
};
```

### 10.2 Scan NFC to Find Patient (Doctor Portal)

```jsx
// pages/doctor/ScanPatient.jsx
const ScanPatient = () => {
  const [healthId, setHealthId] = useState('');

  const scanNFC = async () => {
    if (!('NDEFReader' in window)) { alert('NFC not supported'); return; }
    const reader = new NDEFReader();
    await reader.scan();
    reader.addEventListener('reading', ({ message }) => {
      for (const record of message.records) {
        if (record.recordType === 'url') {
          const url = new TextDecoder().decode(record.data);
          const id = url.split('/emergency/')[1];
          if (id) setHealthId(id);
        }
      }
    });
  };

  return (
    <div>
      <button onClick={scanNFC}>📱 Scan NFC Card</button>
      <span> OR </span>
      <input placeholder="Enter Health ID" value={healthId} onChange={e => setHealthId(e.target.value)} />
    </div>
  );
};
```

### 10.3 Emergency Page (Public — Opened by NFC Scan)

```
URL: /emergency/MB-2026-849372
No login. No auth. Instant access.
Shows: Name, Blood Group, Allergies, Conditions, Medications, Emergency Contacts, Organ Donor status.
Does NOT show: Full records, prescriptions, personal address, financial info.
```

---

## 11. Frontend Route Map

```
PUBLIC ROUTES (no auth)
/                              → Landing Page
/login                         → Login (patient/doctor toggle)
/register                      → Patient Registration
/register/doctor               → Doctor Registration
/emergency/:healthId           → Emergency Profile (NFC scan target)
/fundraiser/:slug              → Public Campaign Page + Donate

PATIENT ROUTES (auth + role: patient)
/dashboard                     → Patient Dashboard
/profile                       → Edit Profile
/profile/emergency             → Emergency Profile Form
/profile/health-id             → Health ID Card + QR + NFC Write
/records                       → Medical Records (all hospitals)
/records/upload                → Upload New Record
/records/:id                   → Record Detail
/prescriptions                 → All Prescriptions
/prescriptions/active          → Active Prescriptions
/prescriptions/:id             → Prescription Detail
/access-log                    → Who Accessed My Data (audit)
/access-sessions               → Active Doctor Sessions + Revoke
/financial/apply               → Loan Application Form
/financial/eligibility         → Eligibility Result (ML + Rules)
/financial/history             → Application History
/fundraiser/create             → Create Campaign
/fundraiser/my                 → My Campaigns

DOCTOR ROUTES (auth + role: doctor)
/doctor/dashboard              → Doctor Dashboard
/doctor/find-patient           → Search by Health ID / Scan NFC
/doctor/patient/:healthId      → Patient Info + Past Records
/doctor/patient/:healthId/add-record      → Add Record Form
/doctor/patient/:healthId/prescribe       → Write Prescription Form
/doctor/my-patients            → Treated Patients List
```

---

## 12. Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/medibridge
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
MODEL_API_URL=http://192.168.x.x:5001
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Model API (Laptop 2) — No .env needed, hardcoded is fine for hackathon

---

## 13. Seed Data

Create `server/seed/seedHospitals.js` to populate:
- **20-30 hospitals** across Indian cities (Mumbai, Pune, Delhi, Bangalore, Chennai)
  - Mix of government, private, NGO, clinic
  - Multiple specializations per hospital
  - Random ratings, bed counts, emergency availability
- **3-5 doctors per hospital** with varying specializations, fees, availability
- Run with: `node server/seed/seedHospitals.js`

---

## 14. Setup Commands

```bash
# --- Backend ---
cd server
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken cors multer cloudinary cookie-parser helmet express-rate-limit axios
npm install -D nodemon

# Add to package.json scripts:
# "dev": "nodemon server.js"
# "start": "node server.js"
# "seed": "node seed/seedHospitals.js"

# --- Frontend ---
cd client
npm create vite@latest . -- --template react
npm install axios react-router-dom zustand react-hot-toast lucide-react qrcode.react
npm install -D tailwindcss @tailwindcss/vite

# --- Model API (Laptop 2) ---
cd model-api
pip install flask flask-cors scikit-learn numpy pandas
python api_server.py

# --- Run Dev ---
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
# Terminal 3 (Laptop 2): python api_server.py
```

---

## 15. Implementation Order (7 Sprints)

### Sprint 1: Project Setup + Auth (Days 1-2)
- Initialize server (Express) + client (Vite React)
- MongoDB connection, env config, error handler, async handler
- User model with healthId, accessPin, role, password hashing
- Auth routes: register (patient + doctor), login, logout, refresh
- Auth middleware + role middleware
- Frontend: Login, Register pages, auth store, axios interceptor, ProtectedRoute
- **Test**: Register → Login → Protected route → Token refresh

### Sprint 2: Patient Profile + Emergency + Health ID (Days 3-4)
- Profile routes (GET/PUT /profile/me)
- Emergency Profile model + routes
- Health ID display + QR code generation (qrcode.react)
- NFC write functionality
- Frontend: Dashboard, Profile edit, Emergency form, Health ID card
- **Test**: Full profile CRUD, QR generation, NFC write

### Sprint 3: Doctor Portal + Consent System (Days 5-6)
- Access Session + Access Log models
- Doctor routes: search patient, request access (PIN verify), view records
- Access middleware (verify active session)
- Frontend: Doctor dashboard, scan patient (NFC + manual), PIN entry
- Access log page for patients, revoke button
- Emergency public page (no auth — NFC target)
- **Test**: PIN grant → view records → patient sees audit log → revoke

### Sprint 4: Hospital Search + Medical Records (Days 7-8)
- Hospital + Doctor models with text indexes
- Hospital CRUD routes with pagination + filtering
- Seed script for hospitals and doctors
- Medical Record model + routes (patient upload + doctor upload)
- Cloudinary upload integration (Multer → Cloudinary)
- Mock hospital API for simulated fetch
- Frontend: Hospital search, hospital detail, records list, upload form
- **Test**: Search + filter hospitals, upload/view/delete records

### Sprint 5: Prescriptions (Days 9-10)
- Prescription model + routes
- Doctor writes prescription for patient (via active session)
- Patient views all prescriptions, active filter
- Frontend: Write prescription form (doctor), prescription list + detail (patient)
- **Test**: Doctor writes prescription → patient sees it → mark complete

### Sprint 6: Loan + Fundraiser (Days 11-12)
- Loan Application model + eligibility engine (rule-based)
- ML model integration (call Flask API on Laptop 2)
- Fundraiser Campaign + Donation models + routes
- Frontend: Loan form, eligibility result (dual scores), campaign page, donate flow
- **Test**: Apply → check eligibility → partial approval → create campaign → donate

### Sprint 7: Polish + Deploy (Days 13-14)
- Responsive design pass (mobile-friendly)
- Loading states, error boundaries, toast notifications
- Landing page (public)
- README with setup instructions
- Deploy: Frontend → Vercel, Backend → Render, DB → MongoDB Atlas
- Demo rehearsal with NFC cards
- **Test**: End-to-end all flows on deployed version

---

## 16. Demo Day Setup

```
Same WiFi Network
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Laptop 1                          Laptop 2              │
│  ┌──────────────────┐            ┌──────────────────┐   │
│  │ React    :5173   │            │ Streamlit :8501  │   │
│  │ Express  :5000   │───HTTP────▶│ Flask API :5001  │   │
│  │ MongoDB Atlas    │            │ loan_model.pkl   │   │
│  └──────────────────┘            └──────────────────┘   │
│                                                          │
│  Android Phone                   NFC Cards/Tags          │
│  ┌──────────────────┐            ┌───────────────┐      │
│  │ Chrome browser   │            │ NTAG215       │      │
│  │ (NFC read/write) │◄──NFC TAP─│ Health ID URL │      │
│  └──────────────────┘            └───────────────┘      │
│                                                          │
│  .env:                                                   │
│  MODEL_API_URL = http://<laptop2-ip>:5001               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**NFC Cards**: Buy NTAG215 stickers/cards from Amazon (₹150-300 for 5-10 pcs).

**Find Laptop 2 IP**: Run `ipconfig` on that laptop → use IPv4 address.

---

## 17. Data Flow — Complete Patient Journey

```
1. REGISTER → healthId + accessPin generated → stored in users collection
2. FILL PROFILE → emergency info saved to emergencyprofiles
3. WRITE NFC → healthId URL written to NFC card/tag
4. VISIT HOSPITAL → Patient shows NFC card / tells Health ID + PIN
5. DOCTOR SCANS NFC → healthId auto-fills → enters PIN → 24hr access granted
6. DOCTOR VIEWS HISTORY → sees records from ALL past hospitals
7. DOCTOR ADDS RECORD → saved to patient's medicalrecords (uploadedBy: doctor)
8. DOCTOR WRITES PRESCRIPTION → saved to prescriptions (structured, not PDF)
9. PATIENT GOES HOME → opens dashboard → sees new record + prescription
10. PATIENT CHECKS ACCESS LOG → "Dr. Sharma accessed at 3:45 PM" ✅
11. SESSION EXPIRES → doctor can no longer access after 24 hours
12. PATIENT NEEDS SURGERY → applies for loan → dual scoring (ML + rules)
13. PARTIAL APPROVAL → funding gap identified → creates fundraiser campaign
14. DONORS CONTRIBUTE → progress bar fills → patient can afford treatment
15. EMERGENCY → someone taps NFC card → sees blood group, allergies, contacts instantly
```

---

## 18. What to Tell Claude/Gemini

Copy this entire document, then use this prompt:

> **"Build the MediBridge MVP following this architecture document exactly. Start with Sprint 1 (project setup + authentication system with patient and doctor roles, Health ID generation, and access PIN). Create all files with production-quality code. Use the exact folder structure, models, routes, middleware, and patterns described. After completing each sprint, pause and show me what you've built before moving to the next sprint."**

This gives the AI a complete, unambiguous spec — schemas, APIs, middleware, patterns, frontend routes, and build order. Zero guesswork needed.
