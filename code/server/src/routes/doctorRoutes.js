const express = require('express');
const { searchPatient, requestAccess, getPatientRecords, addRecordToPatient, getPatientPrescriptions, writePrescription, getMyPatients, getMySessions, getDoctorDashboard } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { verifyDoctorAccess } = require('../middleware/accessMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('doctor'));

router.get('/patients/search', searchPatient);
router.post('/patients/access', requestAccess);
router.get('/patients', getMyPatients);
router.get('/sessions', getMySessions);
router.get('/dashboard', getDoctorDashboard);

router.get('/patients/:healthId/records', verifyDoctorAccess, getPatientRecords);
router.post('/patients/:healthId/records', verifyDoctorAccess, upload.single('file'), addRecordToPatient);
router.get('/patients/:healthId/prescriptions', verifyDoctorAccess, getPatientPrescriptions);
router.post('/patients/:healthId/prescriptions', verifyDoctorAccess, writePrescription);

module.exports = router;
