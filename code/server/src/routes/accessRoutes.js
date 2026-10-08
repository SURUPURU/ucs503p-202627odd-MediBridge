const express = require('express');
const { getAccessLog, getActiveSessions, revokeSession } = require('../controllers/accessController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('patient'));

router.get('/log', getAccessLog);
router.get('/sessions', getActiveSessions);
router.put('/sessions/:id/revoke', revokeSession);

module.exports = router;
