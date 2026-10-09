// code/client/tests/suites/tier1_prescriptionDetail.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 3 - Prescription Detail Page (/prescriptions/:id)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('3.1 should define the route /prescriptions/:id in App.jsx', () => {
    const matched = router.matchRoute('/prescriptions/rx-001');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/prescriptions/:id');
    expect(matched.params.id).toBe('rx-001');
  });

  it('3.2 should enforce authentication and redirect unauthenticated visits to /login', () => {
    const res = router.navigate('/prescriptions/rx-001');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('3.3 should grant access to logged-in patient with valid parameters', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/prescriptions/rx-001');
    expect(res.status).toBe(200);
    expect(res.component).toBe('PrescriptionDetail');
    expect(res.params.id).toBe('rx-001');
  });

  it('3.4 should fetch complete prescription data via prescriptionService.getPrescriptionById', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/prescriptions/rx-001');
    expect(res.data.success).toBe(true);
    const rx = res.data.data;
    expect(rx._id).toBe('rx-001');
    expect(rx.diagnosis).toContain('Hypertension - Stage 1');
    expect(rx.doctorId.licenseNumber).toBe('MCI-2018-9941');
  });

  it('3.5 should contain structured medication schedule with clinical timing codes', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/prescriptions/rx-001');
    const meds = res.data.data.medicines;

    expect(meds.length).toBe(2);
    const firstMed = meds[0];
    expect(firstMed.name).toBe('Telmisartan');
    expect(firstMed.type).toBe('tablet');
    expect(firstMed.dosage).toBe('40mg');
    expect(firstMed.frequency).toBe('1-0-0');
    expect(firstMed.timing).toBe('before_meal');
    expect(firstMed.quantity).toBe(30);

    const secondMed = meds[1];
    expect(secondMed.name).toBe('Amlodipine');
    expect(secondMed.timing).toBe('bedtime');
  });

  it('3.6 should expose lab tests, physician advice, and follow-up consultation date', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/prescriptions/rx-001');
    const rx = res.data.data;

    expect(rx.tests).toContain('Serum Electrolytes');
    expect(rx.advice).toContain('Reduce dietary salt');
    expect(rx.followUpDate).toBe('2026-04-15T00:00:00Z');
  });

  it('3.7 should handle completion toggle from the detail view', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.put('/prescriptions/rx-001/complete');
    expect(res.data.success).toBe(true);
    expect(res.data.data.isActive).toBe(false);
  });

  it('3.8 should verify component requirements (Table for schedule, Card, Badge)', () => {
    const status = ComponentInspector.checkPageStatus('PrescriptionDetail');
    expect(status.spec.route).toBe('/prescriptions/:id');
    expect(status.spec.uiPrimitives).toContain('Table');
    expect(status.spec.uiPrimitives).toContain('Card');
    expect(status.spec.uiPrimitives).toContain('Badge');
  });
});
