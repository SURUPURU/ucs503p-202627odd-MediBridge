const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const AccessLog = require('../models/AccessLog');
const AccessSession = require('../models/AccessSession');

exports.getAccessLog = asyncHandler(async (req, res) => {
  const logs = await AccessLog.find({ patientId: req.user._id })
    .populate('doctorId', 'firstName lastName email role')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: logs });
});

exports.getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await AccessSession.find({ patientId: req.user._id, status: 'active', expiresAt: { $gt: new Date() } })
    .populate('doctorId', 'firstName lastName email role')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: sessions });
});

exports.revokeSession = asyncHandler(async (req, res) => {
  const session = await AccessSession.findOneAndUpdate(
    { _id: req.params.id, patientId: req.user._id },
    { status: 'revoked' },
    { new: true }
  );

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  await AccessLog.create({
    patientId: req.user._id,
    doctorId: session.doctorId,
    action: 'access_revoked',
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, data: session });
});
