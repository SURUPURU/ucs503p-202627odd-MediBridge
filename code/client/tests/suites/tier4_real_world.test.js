// code/client/tests/suites/tier4_real_world.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';

describe('Tier 4: Real-World Application Scenarios', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('4.1 Real-World Scenario 1: Public Emergency Crowdfunding & Anonymous Community Support', async () => {
    // 1. External donor receives WhatsApp link to public campaign: /fundraiser/heart-surgery-ravi
    expect(mockAuth.isAuthenticated).toBe(false); // Guest / Public

    const landing = router.navigate('/fundraiser/heart-surgery-ravi');
    expect(landing.status).toBe(200);
    expect(landing.component).toBe('CampaignPage');

    // 2. Query campaign details
    const campRes = await mockApi.get('/fundraisers/campaigns/heart-surgery-ravi');
    expect(campRes.data.success).toBe(true);
    const campaign = campRes.data.data;

    // 3. Verify medical authenticity credentials
    expect(campaign.isVerified).toBe(true);
    expect(campaign.hospitalName).toBe('Apollo City Hospital');
    expect(campaign.doctorName).toBe('Dr. Priya Sharma');

    const initialRaised = campaign.amountRaised; // 45,000

    // 4. Donor makes anonymous contribution of ₹2,500 using preset button
    const anonymousDonation = {
      amount: 2500,
      donorName: 'Dr. Suresh Sen', // Provided name
      isAnonymous: true,           // Flagged anonymous
      message: 'Praying for swift recovery and healing.',
      paymentMethod: 'upi',
    };

    const donationRes = await mockApi.post(`/fundraisers/campaigns/${campaign._id}/donations`, anonymousDonation);
    expect(donationRes.data.success).toBe(true);
    expect(donationRes.data.data.status).toBe('completed');
    expect(donationRes.data.data.donorName).toBe('Anonymous Donor'); // Identity masked

    // 5. Verify campaign total is incremented
    const updatedCampRes = await mockApi.get('/fundraisers/campaigns/heart-surgery-ravi');
    expect(updatedCampRes.data.data.amountRaised).toBe(initialRaised + 2500);

    // 6. Verify donor wall includes the anonymous gift
    const donorsRes = await mockApi.get(`/fundraisers/campaigns/${campaign._id}/donors`);
    const latestDonor = donorsRes.data.data[0];
    expect(latestDonor.amount).toBe(2500);
    expect(latestDonor.donorName).toBe('Anonymous Donor');
    expect(latestDonor.message).toBe('Praying for swift recovery and healing.');
  });

  it('4.2 Real-World Scenario 2: High-Acuity Clinical Consultation Workflow with Strict Enums & Vitals', async () => {
    // 1. Doctor logs in
    mockAuth.setDoctorSession({
      firstName: 'Priya',
      lastName: 'Sharma',
      specialization: 'Cardiology',
    });
    expect(mockAuth.user.role).toBe('doctor');

    // 2. Doctor opens patient MB-2026-104928 in consultation room
    const patientHealthId = 'MB-2026-104928';

    // 3. Document clinical encounter
    const encounterData = {
      title: 'Emergency Hypertensive Consultation',
      category: 'diagnosis', // Valid Mongoose enum
      clinicalNotes: 'Patient presented with acute occipital headache and BP 165/102. Administering immediate oral therapy.',
      diagnosis: ['Hypertensive Urgency', 'Left Ventricular Hypertrophy'],
      vitals: {
        bloodPressure: '165/102',
        heartRate: 94,
        temperature: '98.8 F',
        weight: 76,
        oxygenLevel: 98,
      },
    };

    const addRecRes = await mockApi.post(`/doctors/patients/${patientHealthId}/records`, encounterData);
    expect(addRecRes.data.success).toBe(true);
    expect(addRecRes.data.data.uploadedBy.type).toBe('doctor');

    // 4. Construct digital prescription
    const prescriptionData = {
      diagnosis: ['Hypertensive Urgency'],
      medicines: [
        {
          name: 'Telmisartan',
          type: 'tablet',
          dosage: '80mg',
          frequency: '1-0-0',
          timing: 'before_meal',
          duration: '14 days',
          instructions: 'Take 1 tablet every morning before breakfast',
          quantity: 14,
        },
        {
          name: 'Amlodipine',
          type: 'tablet',
          dosage: '5mg',
          frequency: '0-0-1',
          timing: 'bedtime',
          duration: '14 days',
          instructions: 'Take 1 tablet at night before sleep',
          quantity: 14,
        }
      ],
      vitals: encounterData.vitals,
      tests: ['2D Echocardiogram', 'Serum Creatinine', 'Serum Electrolytes'],
      advice: 'Strict low sodium intake (< 2g/day). Strict rest for 48 hours. Record daily BP log.',
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const rxRes = await mockApi.post(`/doctors/patients/${patientHealthId}/prescriptions`, prescriptionData);
    expect(rxRes.data.success).toBe(true);
    expect(rxRes.data.data.medicines.length).toBe(2);
    expect(rxRes.data.data.tests.length).toBe(3);

    // 5. Patient logs in and verifies newly added records and active prescriptions
    mockAuth.setPatientSession();
    const patientRxRes = await mockApi.get('/prescriptions/active');
    expect(patientRxRes.data.data.length).toBeGreaterThan(0);
  });

  it('4.3 Real-World Scenario 3: Graceful Fallback When Python ML Microservice is Offline', async () => {
    // 1. Patient requests medical loan evaluation
    mockAuth.setPatientSession();
    const loanPayload = {
      treatmentType: 'Knee Replacement Surgery',
      amountRequested: 250000,
      monthlyIncome: 42000,
      loanAmountTerm: 18,
      creditHistory: '1',
    };

    // 2. Backend executes eligibility check with fallback rule engine
    const evalRes = await mockApi.post('/financial/eligibility', loanPayload);
    expect(evalRes.data.success).toBe(true);

    const result = evalRes.data.data;
    // Rule engine must produce valid scoring regardless of external ML microservice availability
    expect(result.ruleScore).toBeGreaterThanOrEqual(40);
    expect(result.finalDecision).toBe('approved'); // 42k income + good credit history >= 70
    expect(result.approvedAmount).toBe(250000);
    expect(result.fundingGap).toBe(0);

    // 3. Verify scenario where rule engine gives partial approval
    const marginalLoanPayload = {
      treatmentType: 'Spinal Decompression',
      amountRequested: 600000,
      monthlyIncome: 25000,
      loanAmountTerm: 24,
      creditHistory: '0',
    };

    const marginalRes = await mockApi.post('/financial/eligibility', marginalLoanPayload);
    expect(marginalRes.data.success).toBe(true);
    expect(marginalRes.data.data.finalDecision).toBe('partial');
    expect(marginalRes.data.data.fundingGap).toBeGreaterThan(0);

    // 4. Verify Bridge CTA handoff remains guaranteed in fallback mode
    const bridgeState = {
      totalRequired: marginalRes.data.data.amountRequested,
      loanApproved: marginalRes.data.data.approvedAmount,
      fundingGap: marginalRes.data.data.fundingGap,
      treatmentType: marginalLoanPayload.treatmentType,
    };

    const bridgeNav = router.navigate('/fundraiser/create', { state: bridgeState });
    expect(bridgeNav.status).toBe(200);
    expect(bridgeNav.state.fundingGap).toBe(240000); // 600k - 360k = 240k
  });
});
