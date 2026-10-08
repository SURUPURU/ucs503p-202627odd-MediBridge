const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:    { type: String, enum: ['access_granted','viewed_records','viewed_prescriptions','added_record','added_prescription','access_revoked','access_expired'] },
  details:   String,
  ipAddress: String,
}, { timestamps: true });

module.exports = mongoose.model('AccessLog', accessLogSchema);
