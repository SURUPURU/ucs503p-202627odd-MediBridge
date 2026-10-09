// code/client/tests/suites/tier1_prescriptions.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 2 - Prescriptions List Page (/prescriptions)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('2.1 should define the route /prescriptions with protected authorization in App.jsx', () => {
    const matched = router.matchRoute('/prescriptions');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/prescriptions');
    expect(matched.route.type).toBe('protected');
  });

  it('2.2 should block unauthenticated access and redirect to /login', () => {
    const res = router.navigate('/prescriptions');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('2.3 should allow authenticated patient to access the Prescriptions dashboard', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/prescriptions');
    expect(res.status).toBe(200);
    expect(res.component).toBe('Prescriptions');
  });

  it('2.4 should fetch active prescriptions and past prescriptions via prescriptionService', async () => {
    mockAuth.setPatientSession();
    const activeRes = await mockApi.get('/prescriptions/active');
    expect(activeRes.data.success).toBe(true);
    expect(activeRes.data.data.length).toBeGreaterThan(0);
    expect(activeRes.data.data.every(p => p.isActive === true)).toBe(true);

    const allRes = await mockApi.get('/prescriptions');
    expect(allRes.data.success).toBe(true);
    expect(allRes.data.data.length).toBeGreaterThanOrEqual(activeRes.data.data.length);
  });

  it('2.5 should correctly expose medication chips, doctor name, and hospital branding', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/prescriptions/active');
    const rx = res.data.data[0];

    expect(rx.doctorName).toBe('Dr. Priya Sharma');
    expect(rx.hospitalName).toBe('Apollo City Hospital');
    expect(rx.medicines).toBeDefined();
    expect(rx.medicines.length).toBe(2);
    expect(rx.medicines[0].name).toBe('Telmisartan');
    expect(rx.medicines[0].dosage).toBe('40mg');
  });

  it('2.6 should support "Mark Course Completed" action updating active status', async () => {
    mockAuth.setPatientSession();
    const completeRes = await mockApi.put('/prescriptions/rx-001/complete');
    expect(completeRes.data.success).toBe(true);
    expect(completeRes.data.data.isActive).toBe(false);

    // Active prescriptions query should no longer include rx-001
    const activeRes = await mockApi.get('/prescriptions/active');
    expect(activeRes.data.data.find(p => p._id === 'rx-001')).toBeUndefined();
  });

  it('2.7 should navigate to detail page /prescriptions/:id upon card interaction', () => {
    mockAuth.setPatientSession();
    const navRes = router.navigate('/prescriptions/rx-001');
    expect(navRes.status).toBe(200);
    expect(navRes.component).toBe('PrescriptionDetail');
    expect(navRes.params.id).toBe('rx-001');
  });

  it('2.8 should verify component specification and UI primitive requirements', () => {
    const status = ComponentInspector.checkPageStatus('Prescriptions');
    expect(status.spec.route).toBe('/prescriptions');
    expect(status.spec.primaryService).toBe('prescriptionService');
    expect(status.spec.uiPrimitives).toContain('Tabs');
    expect(status.spec.uiPrimitives).toContain('Card');
  });
});
