const mongoose = require('mongoose');

const accessSessionSchema = new mongoose.Schema({
  patientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:     { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
  expiresAt:  { type: Date, required: true },
  permissions: {
    viewRecords: { type: Boolean, default: true },
    viewPrescriptions: { type: Boolean, default: true },
    viewEmergency: { type: Boolean, default: true },
    addRecords: { type: Boolean, default: true },
    addPrescription: { type: Boolean, default: true },
  },
}, { timestamps: true });

accessSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AccessSession', accessSessionSchema);
