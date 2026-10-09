// code/client/tests/suites/tier2_boundary_corner.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';

describe('Tier 2: Boundary & Corner Cases', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  // --- Category A: Empty States ---
  it('2.1 should handle empty medical records list without exceptions', async () => {
    mockAuth.setPatientSession();
    mockApi.records = []; // Clear records

    const res = await mockApi.get('/records');
    expect(res.data.success).toBe(true);
    expect(res.data.data).toEqual([]);
    expect(res.data.data.length).toBe(0);
  });

  it('2.2 should handle empty active prescriptions list without exceptions', async () => {
    mockAuth.setPatientSession();
    mockApi.prescriptions = [];

    const res = await mockApi.get('/prescriptions/active');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(0);
  });

  it('2.3 should handle empty active doctor sessions list gracefully', async () => {
    mockAuth.setPatientSession();
    mockApi.accessSessions = [];

    const res = await mockApi.get('/access/sessions');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(0);
  });

  it('2.4 should handle empty loan applications history', async () => {
    mockAuth.setPatientSession();
    mockApi.loanApplications = [];

    const res = await mockApi.get('/financial/loans');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(0);
  });

  it('2.5 should handle empty patient campaigns list', async () => {
    mockAuth.setPatientSession();
    mockApi.fundraisers = [];

    const res = await mockApi.get('/fundraisers/campaigns/mine');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(0);
  });

  it('2.6 should handle campaign with zero donors', async () => {
    mockApi.donations = [];

    const res = await mockApi.get('/fundraisers/campaigns/camp-001/donors');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(0);
  });

  it('2.7 should handle doctor with zero consulted patients', async () => {
    mockAuth.setDoctorSession();
    mockApi.doctorPatients = [];

    const res = await mockApi.get('/doctors/patients');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(0);
  });

  // --- Category B: Missing Parameters & Non-existent Entities ---
  it('2.8 should return 404 when querying non-existent record ID', async () => {
    mockAuth.setPatientSession();
    await expect(async () => {
      await mockApi.get('/records/non-existent-rec-999');
    }).toReject(/not found/i);
  });

  it('2.9 should return 404 when querying non-existent prescription ID', async () => {
    mockAuth.setPatientSession();
    await expect(async () => {
      await mockApi.get('/prescriptions/rx-missing-999');
    }).toReject(/not found/i);
  });

  it('2.10 should return 404 when public donor opens invalid campaign slug', async () => {
    await expect(async () => {
      await mockApi.get('/fundraisers/campaigns/unknown-campaign-slug');
    }).toReject(/not found/i);
  });

  it('2.11 should reject invalid 4-digit doctor access PIN with 401', async () => {
    mockAuth.setDoctorSession();
    await expect(async () => {
      await mockApi.post('/doctors/patients/access', { healthId: 'MB-2026-104928', pin: '0000' });
    }).toReject(/Invalid/i);
  });

  // --- Category C: Boundary Values & Extreme Inputs ---
  it('2.12 should handle large loan requests (e.g. ₹10,000,000) and preserve numerical precision', async () => {
    mockAuth.setPatientSession();
    const largeLoan = {
      treatmentType: 'Bone Marrow Transplant',
      amountRequested: 10000000,
      monthlyIncome: 250000,
      loanAmountTerm: 36,
      creditHistory: '1',
    };

    const res = await mockApi.post('/financial/eligibility', largeLoan);
    expect(res.data.success).toBe(true);
    expect(res.data.data.amountRequested).toBe(10000000);
    expect(res.data.data.approvedAmount).toBeGreaterThan(0);
    expect(res.data.data.fundingGap).toBeGreaterThanOrEqual(0);
  });

  it('2.13 should handle very long narrative story (10,000+ characters) in fundraiser creation', async () => {
    mockAuth.setPatientSession();
    const longStory = 'A'.repeat(10000);
    const campaignData = {
      title: 'Long Story Campaign',
      story: longStory,
      totalRequired: 200000,
      loanApproved: 50000,
    };

    const res = await mockApi.post('/fundraisers/campaigns', campaignData);
    expect(res.data.success).toBe(true);
    expect(res.data.data.story.length).toBe(10000);
  });

  it('2.14 should support multiple medicines in a single prescription', async () => {
    mockAuth.setDoctorSession();
    const manyMeds = Array.from({ length: 10 }, (_, i) => ({
      name: `Medication-${i + 1}`,
      type: 'tablet',
      dosage: '100mg',
      frequency: '1-0-1',
      timing: 'after_meal',
      duration: '10 days',
      quantity: 20,
    }));

    const res = await mockApi.post('/doctors/patients/MB-2026-104928/prescriptions', { medicines: manyMeds });
    expect(res.data.success).toBe(true);
    expect(res.data.data.medicines.length).toBe(10);
  });

  it('2.15 should accept extreme clinical vitals without truncation', async () => {
    mockAuth.setDoctorSession();
    const extremeRecord = {
      title: 'ICU Critical Care Admission',
      category: 'diagnosis',
      clinicalNotes: 'Severe hypertensive crisis with tachycardia.',
      vitals: {
        bloodPressure: '240/140',
        heartRate: 210,
        temperature: '104.5 F',
        oxygenLevel: 72,
      }
    };

    const res = await mockApi.post('/doctors/patients/MB-2026-104928/records', extremeRecord);
    expect(res.data.success).toBe(true);
  });

  // --- Category D: Backend Error Responses & Failures ---
  it('2.16 should handle simulated 500 internal server error cleanly via checkFailure', async () => {
    mockAuth.setPatientSession();
    mockApi.setFailure('/financial/loans', 500, 'Database query failed');

    await expect(async () => {
      await mockApi.get('/financial/loans');
    }).toReject(/Database query failed/i);
  });

  it('2.17 should handle simulated 403 forbidden error when session is expired', async () => {
    mockAuth.setDoctorSession();
    mockApi.setFailure('/doctors/patients/MB-2026-104928/records', 403, 'Session expired. Request new PIN.');

    await expect(async () => {
      await mockApi.post('/doctors/patients/MB-2026-104928/records', { title: 'Test' });
    }).toReject(/Session expired/i);
  });

  // --- Category E: Unauthorized Role Redirections ---
  it('2.18 should redirect unauthenticated users to /login for all protected routes', () => {
    const protectedRoutes = [
      '/records/rec-001',
      '/prescriptions',
      '/prescriptions/rx-001',
      '/access-log',
      '/financial/result',
      '/financial/history',
      '/fundraiser/create',
      '/fundraiser/my',
      '/doctor/dashboard',
      '/doctor/patient/MB-2026-104928/add-record',
      '/doctor/patient/MB-2026-104928/prescribe',
      '/doctor/my-patients',
    ];

    for (const route of protectedRoutes) {
      const res = router.navigate(route);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe('/login');
    }
  });

  it('2.19 should redirect patient role attempting doctor routes to patient /dashboard', () => {
    mockAuth.setPatientSession();
    const doctorRoutes = [
      '/doctor/dashboard',
      '/doctor/find-patient',
      '/doctor/patient/MB-2026-104928/add-record',
      '/doctor/patient/MB-2026-104928/prescribe',
      '/doctor/my-patients',
    ];

    for (const route of doctorRoutes) {
      const res = router.navigate(route);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe('/dashboard');
    }
  });

  it('2.20 should redirect doctor role attempting patient-only routes to /doctor/dashboard', () => {
    mockAuth.setDoctorSession();
    const patientOnlyRoutes = [
      '/dashboard',
      '/hospitals/hosp-1/book',
      '/appointments',
    ];

    for (const route of patientOnlyRoutes) {
      const res = router.navigate(route);
      expect(res.status).toBe(302);
      expect(res.redirect).toBe('/doctor/dashboard');
    }
  });

  it('2.21 should permit public access for both authenticated and unauthenticated users on public routes', () => {
    // Unauthenticated
    expect(router.navigate('/fundraiser/heart-surgery-ravi').status).toBe(200);

    // Patient
    mockAuth.setPatientSession();
    expect(router.navigate('/fundraiser/heart-surgery-ravi').status).toBe(200);

    // Doctor
    mockAuth.setDoctorSession();
    expect(router.navigate('/fundraiser/heart-surgery-ravi').status).toBe(200);
  });
});
