// code/client/tests/harness/mockAuth.js
/**
 * Mock Auth Store simulator for MediBridge E2E Tests
 * Mirroring zustand useAuthStore in code/client/src/store/authStore.js
 */

export class MockAuthManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this.storage = new Map();
  }

  setPatientSession(overrides = {}) {
    const patientUser = {
      _id: 'pat-123',
      firstName: 'Ravi',
      lastName: 'Verma',
      email: 'ravi.verma@example.com',
      role: 'patient',
      healthId: 'MB-2026-104928',
      ...overrides,
    };
    this.user = patientUser;
    this.accessToken = 'mock-patient-jwt-token-xyz';
    this.refreshToken = 'mock-patient-refresh-token-xyz';
    this.isAuthenticated = true;
    this.storage.set('user', JSON.stringify(patientUser));
    this.storage.set('accessToken', this.accessToken);
    this.storage.set('refreshToken', this.refreshToken);
    return patientUser;
  }

  setDoctorSession(overrides = {}) {
    const doctorUser = {
      _id: 'doc-456',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@apollo.com',
      role: 'doctor',
      specialization: 'Cardiology',
      licenseNumber: 'MCI-2018-9941',
      ...overrides,
    };
    this.user = doctorUser;
    this.accessToken = 'mock-doctor-jwt-token-xyz';
    this.refreshToken = 'mock-doctor-refresh-token-xyz';
    this.isAuthenticated = true;
    this.storage.set('user', JSON.stringify(doctorUser));
    this.storage.set('accessToken', this.accessToken);
    this.storage.set('refreshToken', this.refreshToken);
    return doctorUser;
  }

  clearSession() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this.storage.clear();
  }

  getStoreState() {
    return {
      user: this.user,
      accessToken: this.accessToken,
      isAuthenticated: this.isAuthenticated,
    };
  }
}

export const mockAuth = new MockAuthManager();
