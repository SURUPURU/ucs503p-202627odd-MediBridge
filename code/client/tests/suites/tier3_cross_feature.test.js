// code/client/tests/suites/tier3_cross_feature.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';

describe('Tier 3: Cross-Feature Combinations', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('3.1 Cross Flow 1: Patient Clinical History, Prescription Review, and Consent Revocation', async () => {
    // Step 1: Patient logs in
    mockAuth.setPatientSession();
    expect(mockAuth.isAuthenticated).toBe(true);

    // Step 2: Navigate to Record Detail
    const recNav = router.navigate('/records/rec-001');
    expect(recNav.status).toBe(200);
    expect(recNav.component).toBe('RecordDetail');
    const recRes = await mockApi.get('/records/rec-001');
    expect(recRes.data.data.title).toBe('Annual Cardiology Assessment');
    expect(recRes.data.data.vitals.bloodPressure).toBe('138/88');

    // Step 3: Transition to Prescriptions list
    const rxNav = router.navigate('/prescriptions');
    expect(rxNav.status).toBe(200);
    expect(rxNav.component).toBe('Prescriptions');
    const rxListRes = await mockApi.get('/prescriptions/active');
    expect(rxListRes.data.data.length).toBeGreaterThan(0);
    const activeRxId = rxListRes.data.data[0]._id;

    // Step 4: Drill into Prescription Detail
    const rxDetailNav = router.navigate(`/prescriptions/${activeRxId}`);
    expect(rxDetailNav.status).toBe(200);
    expect(rxDetailNav.component).toBe('PrescriptionDetail');
    const rxDetailRes = await mockApi.get(`/prescriptions/${activeRxId}`);
    expect(rxDetailRes.data.data.medicines.length).toBe(2);

    // Step 5: Mark course completed
    const completeRes = await mockApi.put(`/prescriptions/${activeRxId}/complete`);
    expect(completeRes.data.success).toBe(true);
    expect(completeRes.data.data.isActive).toBe(false);

    // Step 6: Navigate to Access Log and revoke doctor consent session
    const accessNav = router.navigate('/access-log');
    expect(accessNav.status).toBe(200);
    expect(accessNav.component).toBe('AccessLog');

    const sessionsRes = await mockApi.get('/access/sessions');
    expect(sessionsRes.data.data.length).toBe(1);
    const sessionId = sessionsRes.data.data[0]._id;

    // Revoke session
    const revokeRes = await mockApi.put(`/access/sessions/${sessionId}/revoke`);
    expect(revokeRes.data.success).toBe(true);

    // Verify session revoked
    const afterSessions = await mockApi.get('/access/sessions');
    expect(afterSessions.data.data.length).toBe(0);
  });

  it('3.2 Cross Flow 2: Medical Loan Partial Approval ➔ Bridge to Fundraiser ➔ Public Donation Wall', async () => {
    // Step 1: Patient evaluates loan eligibility for heart surgery
    mockAuth.setPatientSession();
    const loanEvaluationPayload = {
      treatmentType: 'Coronary Angioplasty',
      amountRequested: 500000,
      monthlyIncome: 35000,
      loanAmountTerm: 24,
      creditHistory: '1',
    };

    const evalRes = await mockApi.post('/financial/eligibility', loanEvaluationPayload);
    expect(evalRes.data.success).toBe(true);
    const evalData = evalRes.data.data;

    // Partial approval: requested 500k, approved 300k, funding gap 200k
    expect(evalData.finalDecision).toBe('partial');
    expect(evalData.amountRequested).toBe(500000);
    expect(evalData.approvedAmount).toBe(300000);
    expect(evalData.fundingGap).toBe(200000);

    // Step 2: Patient views Loan Result page
    const resultNav = router.navigate('/financial/result', { state: { evaluation: evalData } });
    expect(resultNav.status).toBe(200);
    expect(resultNav.component).toBe('EligibilityResult');

    // Step 3: Patient clicks "Bridge the Gap with a Fundraiser"
    const bridgeState = {
      totalRequired: evalData.amountRequested,
      loanApproved: evalData.approvedAmount,
      fundingGap: evalData.fundingGap,
      treatmentType: loanEvaluationPayload.treatmentType,
    };

    const createCampNav = router.navigate('/fundraiser/create', { state: bridgeState });
    expect(createCampNav.status).toBe(200);
    expect(createCampNav.component).toBe('CreateCampaign');
    expect(createCampNav.state.fundingGap).toBe(200000);

    // Step 4: Patient creates fundraiser campaign
    const campaignSubmission = {
      title: 'Help Ravi Complete Heart Angioplasty',
      story: 'Ravi received a medical loan covering 60% of the cost, but requires community support for the remaining gap...',
      treatmentType: createCampNav.state.treatmentType,
      totalRequired: createCampNav.state.totalRequired,
      loanApproved: createCampNav.state.loanApproved,
      fundingGap: createCampNav.state.fundingGap,
      hospitalName: 'Apollo City Hospital',
      doctorName: 'Dr. Priya Sharma',
    };

    const campRes = await mockApi.post('/fundraisers/campaigns', campaignSubmission);
    expect(campRes.data.success).toBe(true);
    const createdCampaign = campRes.data.data;
    expect(createdCampaign.fundingGap).toBe(200000);
    expect(createdCampaign.amountRaised).toBe(0);
    const shareSlug = createdCampaign.shareSlug;

    // Step 5: Patient views their dashboard
    const myCampNav = router.navigate('/fundraiser/my');
    expect(myCampNav.status).toBe(200);
    expect(myCampNav.component).toBe('MyCampaigns');

    // Step 6: Public donor accesses campaign link without logging in
    mockAuth.clearSession();
    expect(mockAuth.isAuthenticated).toBe(false);

    const publicCampNav = router.navigate(`/fundraiser/${shareSlug}`);
    expect(publicCampNav.status).toBe(200);
    expect(publicCampNav.component).toBe('CampaignPage');

    // Step 7: Public donor donates ₹50,000
    const donation = {
      amount: 50000,
      donorName: 'Caring Community Member',
      isAnonymous: false,
      message: 'Stand strong! We are with you.',
      paymentMethod: 'upi',
    };

    const donateRes = await mockApi.post(`/fundraisers/campaigns/${createdCampaign._id}/donations`, donation);
    expect(donateRes.data.success).toBe(true);
    expect(donateRes.data.data.amount).toBe(50000);

    // Step 8: Public page reflects 25% funding progress (50k / 200k)
    const updatedCampRes = await mockApi.get(`/fundraisers/campaigns/${shareSlug}`);
    expect(updatedCampRes.data.data.amountRaised).toBe(50000);
    const progressPercent = Math.round((updatedCampRes.data.data.amountRaised / updatedCampRes.data.data.fundingGap) * 100);
    expect(progressPercent).toBe(25);
  });

  it('3.3 Cross Flow 3: Doctor Patient Search ➔ Add Clinical Record ➔ Write Digital Prescription', async () => {
    // Step 1: Doctor logs in
    mockAuth.setDoctorSession();
    expect(mockAuth.user.role).toBe('doctor');

    // Step 2: Doctor navigates to My Patients
    const patientsNav = router.navigate('/doctor/my-patients');
    expect(patientsNav.status).toBe(200);
    expect(patientsNav.component).toBe('MyPatients');

    const patientsRes = await mockApi.get('/doctors/patients');
    const selectedPatient = patientsRes.data.data[0];
    expect(selectedPatient.healthId).toBe('MB-2026-104928');

    // Step 3: Verify active PIN access session for patient
    expect(selectedPatient.hasActiveSession).toBe(true);

    // Step 4: Doctor navigates to Add Record for patient
    const addRecordNav = router.navigate(`/doctor/patient/${selectedPatient.healthId}/add-record`);
    expect(addRecordNav.status).toBe(200);
    expect(addRecordNav.component).toBe('AddRecord');
    expect(addRecordNav.params.healthId).toBe('MB-2026-104928');

    // Submit clinical record
    const clinicalRecordData = {
      title: 'Consultation & BP Evaluation',
      category: 'diagnosis',
      clinicalNotes: 'Blood pressure elevated at 145/92 mmHg. Starting combination therapy.',
      diagnosis: ['Essential Hypertension'],
      vitals: { bloodPressure: '145/92', heartRate: 86, temperature: '98.4 F', weight: 75 },
    };

    const recordSaveRes = await mockApi.post(`/doctors/patients/${selectedPatient.healthId}/records`, clinicalRecordData);
    expect(recordSaveRes.data.success).toBe(true);
    expect(recordSaveRes.data.data.title).toBe('Consultation & BP Evaluation');

    // Step 5: Doctor proceeds to Write Prescription
    const prescribeNav = router.navigate(`/doctor/patient/${selectedPatient.healthId}/prescribe`);
    expect(prescribeNav.status).toBe(200);
    expect(prescribeNav.component).toBe('WritePrescription');

    const prescriptionData = {
      diagnosis: ['Essential Hypertension'],
      medicines: [
        {
          name: 'Telmisartan',
          type: 'tablet',
          dosage: '40mg',
          frequency: '1-0-0',
          timing: 'before_meal',
          duration: '30 days',
          quantity: 30,
        },
        {
          name: 'Hydrochlorothiazide',
          type: 'tablet',
          dosage: '12.5mg',
          frequency: '1-0-0',
          timing: 'after_meal',
          duration: '30 days',
          quantity: 30,
        }
      ],
      tests: ['Serum Creatinine', 'Serum Potassium'],
      advice: 'Avoid processed foods. Log blood pressure twice weekly.',
      followUpDate: '2026-04-30T00:00:00Z',
    };

    const prescriptionSaveRes = await mockApi.post(`/doctors/patients/${selectedPatient.healthId}/prescriptions`, prescriptionData);
    expect(prescriptionSaveRes.data.success).toBe(true);
    expect(prescriptionSaveRes.data.data.medicines.length).toBe(2);
    expect(prescriptionSaveRes.data.data.isActive).toBe(true);
  });
});
