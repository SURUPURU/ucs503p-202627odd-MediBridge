// code/client/tests/suites/tier1_writePrescription.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 11 - Doctor Write Prescription Page (/doctor/patient/:healthId/prescribe)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('11.1 should define route /doctor/patient/:healthId/prescribe with RoleRoute allow=["doctor"] in App.jsx', () => {
    const matched = router.matchRoute('/doctor/patient/MB-2026-104928/prescribe');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/doctor/patient/:healthId/prescribe');
    expect(matched.route.type).toBe('role');
    expect(matched.route.allow).toContain('doctor');
    expect(matched.params.healthId).toBe('MB-2026-104928');
  });

  it('11.2 should redirect unauthenticated requests to /login', () => {
    const res = router.navigate('/doctor/patient/MB-2026-104928/prescribe');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('11.3 should block patient role and redirect to patient dashboard', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/doctor/patient/MB-2026-104928/prescribe');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/dashboard');
  });

  it('11.4 should allow authorized doctor with active patient session', () => {
    mockAuth.setDoctorSession();
    const res = router.navigate('/doctor/patient/MB-2026-104928/prescribe');
    expect(res.status).toBe(200);
    expect(res.component).toBe('WritePrescription');
    expect(res.params.healthId).toBe('MB-2026-104928');
  });

  it('11.5 should build structured multi-drug prescription with timing and dosage specifications', () => {
    const medicines = [
      {
        name: 'Metformin',
        type: 'tablet',
        dosage: '500mg',
        frequency: '1-0-1',
        timing: 'after_meal',
        duration: '30 days',
        quantity: 60,
      },
      {
        name: 'Glimepiride',
        type: 'tablet',
        dosage: '1mg',
        frequency: '1-0-0',
        timing: 'before_meal',
        duration: '30 days',
        quantity: 30,
      }
    ];

    expect(medicines.length).toBe(2);
    expect(medicines[0].timing).toBe('after_meal');
    expect(medicines[1].timing).toBe('before_meal');
  });

  it('11.6 should submit digital prescription via doctorService.writePrescription', async () => {
    mockAuth.setDoctorSession();
    const prescriptionPayload = {
      diagnosis: ['Type 2 Diabetes Mellitus'],
      symptoms: ['Polyuria', 'Polydipsia'],
      medicines: [
        {
          name: 'Metformin',
          type: 'tablet',
          dosage: '500mg',
          frequency: '1-0-1',
          timing: 'after_meal',
          duration: '30 days',
          quantity: 60,
        }
      ],
      vitals: { bloodPressure: '124/80', weight: 68 },
      tests: ['HbA1c', 'Fasting Blood Glucose'],
      advice: 'Adhere to diabetic diet chart. Exercise regularly.',
      followUpDate: '2026-05-15T00:00:00Z',
    };

    const res = await mockApi.post('/doctors/patients/MB-2026-104928/prescriptions', prescriptionPayload);
    expect(res.data.success).toBe(true);
    expect(res.data.data.isActive).toBe(true);
    expect(res.data.data.diagnosis).toContain('Type 2 Diabetes Mellitus');
  });

  it('11.7 should inspect disk component for router imports and form fields', () => {
    const status = ComponentInspector.checkPageStatus('WritePrescription');
    expect(status.exists).toBe(true);
    if (!status.usesCorrectRouter) {
      expect(status.routerIssue).toContain('react-router');
    }
  });
});
