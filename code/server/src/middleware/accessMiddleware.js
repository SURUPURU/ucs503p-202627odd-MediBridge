const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const AccessSession = require('../models/AccessSession');
const AccessLog = require('../models/AccessLog');
const User = require('../models/User');

exports.verifyDoctorAccess = asyncHandler(async (req, res, next) => {
  const doctorId = req.user._id;
  const healthId = req.params.healthId;

  const patient = await User.findOne({ healthId, role: 'patient' });
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const session = await AccessSession.findOne({
    patientId: patient._id,
    doctorId: doctorId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    throw new ApiError(403, 'Access denied or session expired');
  }

  let action = 'viewed_records';
  if (req.method === 'POST') {
    if (req.originalUrl.includes('prescription')) {
      action = 'added_prescription';
    } else {
      action = 'added_record';
    }
  } else if (req.method === 'GET' && req.originalUrl.includes('prescription')) {
    action = 'viewed_prescriptions';
  }

  await AccessLog.create({
    patientId: patient._id,
    doctorId: doctorId,
    action: action,
    ipAddress: req.ip
  });

  req.patient = patient;
  req.accessSession = session;
  next();
});
