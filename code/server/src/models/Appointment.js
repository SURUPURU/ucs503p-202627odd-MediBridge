const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  preferredDate: { type: Date, required: true },
  specialist: { type: String, required: true },
  preferredTime: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], required: true },
  status: { type: String, enum: ['Pending', 'Booked', 'Completed', 'Rejected'], default: 'Pending' },
  patientName: { type: String }, // To reuse existing info
  patientPhone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
