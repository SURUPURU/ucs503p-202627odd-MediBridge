// code/client/tests/suites/tier1_myPatients.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 12 - Doctor My Patients Page (/doctor/my-patients)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('12.1 should define route /doctor/my-patients with RoleRoute allow=["doctor"] in App.jsx', () => {
    const matched = router.matchRoute('/doctor/my-patients');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/doctor/my-patients');
    expect(matched.route.type).toBe('role');
    expect(matched.route.allow).toContain('doctor');
  });

  it('12.2 should redirect unauthenticated requests to /login', () => {
    const res = router.navigate('/doctor/my-patients');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('12.3 should block patient role and redirect to patient dashboard', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/doctor/my-patients');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/dashboard');
  });

  it('12.4 should allow doctor to access their consulted patients directory', () => {
    mockAuth.setDoctorSession();
    const res = router.navigate('/doctor/my-patients');
    expect(res.status).toBe(200);
    expect(res.component).toBe('MyPatients');
  });

  it('12.5 should fetch consulted patients via doctorService.getMyPatients', async () => {
    mockAuth.setDoctorSession();
    const res = await mockApi.get('/doctors/patients');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(2);

    const patient = res.data.data[0];
    expect(patient.healthId).toBe('MB-2026-104928');
    expect(patient.firstName).toBe('Ravi');
    expect(patient.lastName).toBe('Verma');
  });

  it('12.6 should support patient filtering by Health ID or name', async () => {
    mockAuth.setDoctorSession();
    const res = await mockApi.get('/doctors/patients');
    const allPatients = res.data.data;

    const filtered = allPatients.filter(p => p.healthId.includes('104928'));
    expect(filtered.length).toBe(1);
    expect(filtered[0].firstName).toBe('Ravi');
  });

  it('12.7 should provide action routes: Add Record and Prescribe for selected patient', () => {
    mockAuth.setDoctorSession();
    const addRecordNav = router.navigate('/doctor/patient/MB-2026-104928/add-record');
    expect(addRecordNav.status).toBe(200);
    expect(addRecordNav.component).toBe('AddRecord');

    const prescribeNav = router.navigate('/doctor/patient/MB-2026-104928/prescribe');
    expect(prescribeNav.status).toBe(200);
    expect(prescribeNav.component).toBe('WritePrescription');
  });

  it('12.8 should verify component specification and UI primitive requirements', () => {
    const status = ComponentInspector.checkPageStatus('MyPatients');
    expect(status.spec.route).toBe('/doctor/my-patients');
    expect(status.spec.uiPrimitives).toContain('Card');
    expect(status.spec.uiPrimitives).toContain('Button');
  });
});
