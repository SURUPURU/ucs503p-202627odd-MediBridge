import api from './api';

export const doctorService = {
  searchPatient: (healthId) => api.get('/doctors/patients/search', { params: { healthId } }),
  requestAccess: (data) => api.post('/doctors/patients/access', data),
  getPatientRecords: (healthId) => api.get(`/doctors/patients/${healthId}/records`),
  addRecord: (healthId, formData) => api.post(`/doctors/patients/${healthId}/records`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPatientPrescriptions: (healthId) => api.get(`/doctors/patients/${healthId}/prescriptions`),
  writePrescription: (healthId, data) => api.post(`/doctors/patients/${healthId}/prescriptions`, data),
  getMyPatients: () => api.get('/doctors/patients'),
  getMySessions: () => api.get('/doctors/sessions'),
};
