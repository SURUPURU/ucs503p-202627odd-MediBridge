const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const EmergencyProfile = require('../models/EmergencyProfile');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -accessPin');
  res.status(200).json({ success: true, data: user });
});

const ALLOWED_PROFILE_FIELDS = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address'];

exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ALLOWED_PROFILE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password -accessPin');
  res.status(200).json({ success: true, data: updatedUser });
});

exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file');
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'medibridge/avatars' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(req.file.buffer);
  });

  const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true }).select('-password -accessPin');
  res.status(200).json({ success: true, data: user });
});

exports.getEmergencyProfile = asyncHandler(async (req, res) => {
  const profile = await EmergencyProfile.findOne({ userId: req.user._id });
  res.status(200).json({ success: true, data: profile });
});

exports.updateEmergencyProfile = asyncHandler(async (req, res) => {
  const profile = await EmergencyProfile.findOneAndUpdate(
    { userId: req.user._id },
    { ...req.body, userId: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );
  res.status(200).json({ success: true, data: profile });
});

exports.changeAccessPin = asyncHandler(async (req, res) => {
  const { oldPin, newPin } = req.body;
  const user = await User.findById(req.user._id).select('+accessPin');
  
  const isMatch = await bcrypt.compare(oldPin, user.accessPin);
  if (!isMatch) {
    throw new ApiError(400, 'Invalid old PIN');
  }

  const salt = await bcrypt.genSalt(10);
  user.accessPin = await bcrypt.hash(newPin, salt);
  await user.save();

  res.status(200).json({ success: true, message: 'Access PIN updated successfully' });
});

exports.getHealthIdData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('healthId qrCodeUrl');
  res.status(200).json({ success: true, data: user });
});
