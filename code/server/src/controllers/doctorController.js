const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const AccessSession = require('../models/AccessSession');
const AccessLog = require('../models/AccessLog');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

exports.searchPatient = asyncHandler(async (req, res) => {
  const { healthId } = req.query;
  if (!healthId) throw new ApiError(400, 'Health ID is required');

  const patient = await User.findOne({ healthId, role: 'patient' }).select('firstName lastName gender dateOfBirth bloodGroup');
  if (!patient) throw new ApiError(404, 'Patient not found');

  res.status(200).json({ success: true, data: patient });
});

exports.requestAccess = asyncHandler(async (req, res) => {
  const { healthId, accessPin } = req.body;
  
  const patient = await User.findOne({ healthId, role: 'patient' }).select('+accessPin');
  if (!patient) throw new ApiError(404, 'Patient not found');

  const isMatch = await bcrypt.compare(accessPin, patient.accessPin);
  if (!isMatch) throw new ApiError(401, 'Invalid Access PIN');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

  const session = await AccessSession.create({
    patientId: patient._id,
    doctorId: req.user._id,
    expiresAt
  });

  await AccessLog.create({
    patientId: patient._id,
    doctorId: req.user._id,
    action: 'access_granted',
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: session });
});

exports.getPatientRecords = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({ userId: req.patient._id }).sort({ recordDate: -1 });
  res.status(200).json({ success: true, data: records });
});

exports.addRecordToPatient = asyncHandler(async (req, res) => {
  let fileUrl = null, fileType = null, fileSize = null;

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'medibridge/records' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      uploadStream.end(req.file.buffer);
    });
    fileUrl = result.secure_url;
    fileType = req.file.mimetype;
    fileSize = req.file.size;
  }

  const record = await MedicalRecord.create({
    ...req.body,
    userId: req.patient._id,
    uploadedBy: {
      type: 'doctor',
      doctorId: req.user._id,
      doctorName: `${req.user.firstName} ${req.user.lastName}`
    },
    fileUrl, fileType, fileSize
  });

  res.status(201).json({ success: true, data: record });
});

exports.getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.patient._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: prescriptions });
});

exports.writePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.create({
    ...req.body,
    patientId: req.patient._id,
    doctorId: req.user._id
  });

  res.status(201).json({ success: true, data: prescription });
});

exports.getMyPatients = asyncHandler(async (req, res) => {
  const logs = await AccessLog.find({ doctorId: req.user._id }).distinct('patientId');
  const patients = await User.find({ _id: { $in: logs } }).select('firstName lastName healthId gender avatar');
  res.status(200).json({ success: true, data: patients });
});

exports.getMySessions = asyncHandler(async (req, res) => {
  const sessions = await AccessSession.find({ doctorId: req.user._id, status: 'active' }).populate('patientId', 'firstName lastName healthId avatar');
  res.status(200).json({ success: true, data: sessions });
});

exports.getDoctorDashboard = asyncHandler(async (req, res) => {
  const activeSessions = await AccessSession.countDocuments({ doctorId: req.user._id, status: 'active' });
  const prescriptionsWritten = await Prescription.countDocuments({ doctorId: req.user._id });
  const uniquePatients = (await AccessLog.find({ doctorId: req.user._id }).distinct('patientId')).length;

  res.status(200).json({ success: true, data: { activeSessions, prescriptionsWritten, uniquePatients } });
});
