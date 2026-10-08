const express = require('express');
const { getRecords, getRecordById, createRecord, updateRecord, deleteRecord, fetchFromHospital } = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('patient'));

router.get('/', getRecords);
router.post('/', upload.single('file'), createRecord);
router.post('/fetch-from-hospital', fetchFromHospital);
router.get('/:id', getRecordById);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
