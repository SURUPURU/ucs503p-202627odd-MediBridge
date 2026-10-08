const asyncHandler = require('../utils/asyncHandler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.createAppointment = asyncHandler(async (req, res) => {
  const { hospitalId, preferredDate, specialist, preferredTime, additionalNotes } = req.body;
  
  const user = await User.findById(req.user._id);

  const appointment = await Appointment.create({
    userId: req.user._id,
    hospitalId,
    preferredDate,
    specialist,
    preferredTime,
    patientName: `${user.firstName} ${user.lastName}`,
    patientPhone: user.phone,
    status: 'Pending' // Initial status
  });

  res.status(201).json({ success: true, data: appointment });
});

exports.getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ userId: req.user._id })
    .populate('hospitalId', 'name address')
    .sort('-createdAt');
    
  res.status(200).json({ success: true, data: appointments });
});

// DOCTOR endpoints
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  // Fetch appointments for the hospital the doctor belongs to
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Not authorized as doctor' });
  }

  const hospitalId = req.user.doctorProfile?.hospitalId;
  
  if (!hospitalId) {
    return res.status(200).json({ success: true, data: [] });
  }

  const appointments = await Appointment.find({ hospitalId })
    .populate('userId', 'firstName lastName healthId phone email')
    .sort('preferredDate');

  res.status(200).json({ success: true, data: appointments });
});

exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Not authorized as doctor' });
  }

  const { id } = req.params;
  const { status } = req.body; // 'Booked' or 'Rejected' or 'Completed'

  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  appointment.status = status;
  await appointment.save();

  res.status(200).json({ success: true, data: appointment });
});
