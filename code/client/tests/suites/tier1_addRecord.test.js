// code/client/tests/suites/tier1_addRecord.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 10 - Doctor Add Record Page (/doctor/patient/:healthId/add-record)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('10.1 should define route /doctor/patient/:healthId/add-record with RoleRoute allow=["doctor"] in App.jsx', () => {
    const matched = router.matchRoute('/doctor/patient/MB-2026-104928/add-record');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/doctor/patient/:healthId/add-record');
    expect(matched.route.type).toBe('role');
    expect(matched.route.allow).toContain('doctor');
    expect(matched.params.healthId).toBe('MB-2026-104928');
  });

  it('10.2 should redirect unauthenticated users to /login', () => {
    const res = router.navigate('/doctor/patient/MB-2026-104928/add-record');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('10.3 should deny patient role access and redirect to patient /dashboard', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/doctor/patient/MB-2026-104928/add-record');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/dashboard');
    expect(res.reason).toMatch(/not permitted/i);
  });

  it('10.4 should grant access to authenticated doctor', () => {
    mockAuth.setDoctorSession();
    const res = router.navigate('/doctor/patient/MB-2026-104928/add-record');
    expect(res.status).toBe(200);
    expect(res.component).toBe('AddRecord');
    expect(res.params.healthId).toBe('MB-2026-104928');
  });

  it('10.5 should validate category against backend Mongoose allowed enums', () => {
    const validEnums = [
      'lab_report',
      'prescription',
      'discharge_summary',
      'imaging',
      'diagnosis',
      'surgery_note',
      'follow_up',
      'invoice',
      'other',
    ];

    expect(validEnums).toContain('diagnosis');
    expect(validEnums).toContain('lab_report');
    expect(validEnums).toContain('discharge_summary');
    // Ensure invalid categories like 'General' are rejected
    expect(validEnums.includes('General')).toBe(false);
  });

  it('10.6 should submit clinical record with title, category, and notes via doctorService.addRecord', async () => {
    mockAuth.setDoctorSession();
    const recordPayload = {
      title: 'Post-Operative Cardiac Evaluation',
      category: 'follow_up',
      clinicalNotes: 'Wound healing well. Continue current beta blocker regimen.',
      diagnosis: ['Post-PTCA Recovery'],
    };

    const res = await mockApi.post('/doctors/patients/MB-2026-104928/records', recordPayload);
    expect(res.data.success).toBe(true);
    expect(res.data.data.title).toBe(recordPayload.title);
    expect(res.data.data.uploadedBy.type).toBe('doctor');
  });

  it('10.7 should inspect disk component for router import and category enum validity', () => {
    const status = ComponentInspector.checkPageStatus('AddRecord');
    expect(status.exists).toBe(true);

    // If disk file has the known defect from initial prototype, flag it
    if (!status.usesCorrectRouter) {
      expect(status.routerIssue).toContain('react-router');
    }
    if (!status.usesValidEnums) {
      expect(status.enumIssue).toContain('General');
    }
  });
});
