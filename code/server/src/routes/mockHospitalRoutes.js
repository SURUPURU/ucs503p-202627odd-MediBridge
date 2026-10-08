const express = require('express');
const router = express.Router();

// Mock hospital API returning fake records
router.get('/:code/records/:patientId', (req, res) => {
  const mockRecords = [
    {
      title: 'Complete Blood Count',
      category: 'lab_report',
      description: 'Routine blood checkup',
      clinicalNotes: 'All parameters normal except slightly elevated hemoglobin.',
      hospitalName: 'Mock Hospital',
      doctorName: 'Dr. Smith'
    },
    {
      title: 'Chest X-Ray',
      category: 'imaging',
      description: 'Annual checkup X-Ray',
      clinicalNotes: 'No abnormalities detected. Clear lungs.',
      hospitalName: 'Mock Hospital',
      doctorName: 'Dr. Jones'
    }
  ];

  res.status(200).json({
    success: true,
    data: mockRecords
  });
});

module.exports = router;
