import api from './api';

export const accessService = {
  getAccessLog: () => api.get('/access/log'),
  getActiveSessions: () => api.get('/access/sessions'),
  revokeSession: (id) => api.put(`/access/sessions/${id}/revoke`),
};
