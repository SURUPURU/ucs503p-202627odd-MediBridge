const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const MedicalRecord = require('../models/MedicalRecord');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');

exports.getRecords = asyncHandler(async (req, res) => {
  const { category, tag, page = 1, limit = 10 } = req.query;
  const query = { userId: req.user._id };

  if (category) query.category = category;
  if (tag) query.tags = { $in: [tag] };

  const skip = (Number(page) - 1) * Number(limit);
  const records = await MedicalRecord.find(query).sort({ recordDate: -1 }).skip(skip).limit(Number(limit));
  const total = await MedicalRecord.countDocuments(query);

  res.status(200).json({
    success: true,
    data: records,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
  });
});

exports.getRecordById = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, userId: req.user._id });
  if (!record) {
    throw new ApiError(404, 'Record not found');
  }
  res.status(200).json({ success: true, data: record });
});

exports.createRecord = asyncHandler(async (req, res) => {
  let fileUrl = null;
  let fileType = null;
  let fileSize = null;

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'medibridge/records' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    fileUrl = result.secure_url;
    fileType = req.file.mimetype;
    fileSize = req.file.size;
  }

  const record = await MedicalRecord.create({
    ...req.body,
    userId: req.user._id,
    uploadedBy: { type: 'self' },
    fileUrl,
    fileType,
    fileSize
  });

  res.status(201).json({ success: true, data: record });
});

exports.updateRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  res.status(200).json({ success: true, data: record });
});

exports.deleteRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!record) {
    throw new ApiError(404, 'Record not found');
  }
  res.status(200).json({ success: true, message: 'Record deleted successfully' });
});

exports.fetchFromHospital = asyncHandler(async (req, res) => {
  const { hospitalCode, patientId } = req.body;
  const baseUrl = req.protocol + '://' + req.get('host');
  
  try {
    const response = await axios.get(`${baseUrl}/api/v1/mock/hospital/${hospitalCode}/records/${patientId}`);
    const mockRecords = response.data.data;
    
    const recordsToInsert = mockRecords.map(r => ({
      ...r,
      userId: req.user._id,
      uploadedBy: { type: 'hospital_fetch', hospitalName: 'Mock Hospital' }
    }));

    const inserted = await MedicalRecord.insertMany(recordsToInsert);
    res.status(201).json({ success: true, data: inserted });
  } catch (err) {
    throw new ApiError(500, 'Failed to fetch records from hospital');
  }
});
