// code/client/tests/suites/tier1_recordDetail.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 1 - Record Detail Page (/records/:id)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('1.1 should define the route /records/:id with protected authorization in App.jsx', () => {
    const matched = router.matchRoute('/records/rec-001');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/records/:id');
    expect(matched.params.id).toBe('rec-001');
    expect(matched.route.type).toBe('protected');
  });

  it('1.2 should block unauthenticated access and redirect to /login', () => {
    const res = router.navigate('/records/rec-001');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
    expect(res.component).toBeNull();
  });

  it('1.3 should allow authenticated patient to access the Record Detail page', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/records/rec-001');
    expect(res.status).toBe(200);
    expect(res.component).toBe('RecordDetail');
    expect(res.params.id).toBe('rec-001');
  });

  it('1.4 should fetch complete medical record by id via recordService contract', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/records/rec-001');
    expect(res.data.success).toBe(true);
    const rec = res.data.data;
    expect(rec._id).toBe('rec-001');
    expect(rec.title).toBe('Annual Cardiology Assessment');
    expect(rec.category).toBe('diagnosis');
    expect(rec.doctorName).toBe('Dr. Priya Sharma');
    expect(rec.hospitalName).toBe('Apollo City Hospital');
  });

  it('1.5 should present structured vitals, diagnosis tags, and clinical notes', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/records/rec-001');
    const rec = res.data.data;

    // Vitals check
    expect(rec.vitals).toBeDefined();
    expect(rec.vitals.bloodPressure).toBe('138/88');
    expect(rec.vitals.heartRate).toBe(84);
    expect(rec.vitals.oxygenLevel).toBe(98);

    // Diagnosis & Notes
    expect(rec.diagnosis).toContain('Hypertension - Stage 1');
    expect(rec.clinicalNotes).toContain('Mild systolic murmur');
  });

  it('1.6 should execute deleteRecord action and remove record from database', async () => {
    mockAuth.setPatientSession();
    const delRes = await mockApi.delete('/records/rec-001');
    expect(delRes.data.success).toBe(true);

    // Calling again should return 404
    await expect(async () => {
      await mockApi.get('/records/rec-001');
    }).toReject(/not found/i);
  });

  it('1.7 should inspect component specification and file contracts', () => {
    const status = ComponentInspector.checkPageStatus('RecordDetail');
    expect(status.spec.route).toBe('/records/:id');
    expect(status.spec.primaryService).toBe('recordService');
    expect(status.spec.uiPrimitives).toContain('Card');
    expect(status.spec.uiPrimitives).toContain('Button');
  });
});
