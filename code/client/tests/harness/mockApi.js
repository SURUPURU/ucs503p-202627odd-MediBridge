// code/client/tests/harness/mockApi.js
/**
 * Realistic Mock API Adapter for MediBridge Testing
 * Conforms strictly to ARCHITECTURE.md and PROJECT.md backend response contracts
 */

export class MockApiAdapter {
  constructor() {
    this.reset();
  }

  reset() {
    this.calls = [];
    this.failureOverrides = new Map(); // endpoint -> { status, message }
    this.latencyMs = 0;

    // Fixture state
    this.records = [
      {
        _id: 'rec-001',
        patientId: 'pat-123',
        title: 'Annual Cardiology Assessment',
        category: 'diagnosis',
        description: 'Comprehensive cardiac review and ECG baseline',
        clinicalNotes: 'Mild systolic murmur observed, normal sinus rhythm on ECG. Recommend low sodium diet.',
        diagnosis: ['Hypertension - Stage 1', 'Sinus Tachycardia'],
        vitals: {
          bloodPressure: '138/88',
          heartRate: 84,
          temperature: '98.6 F',
          weight: 72,
          oxygenLevel: 98,
        },
        fileUrl: 'https://cloudinary.com/medibridge/rec-001.pdf',
        fileType: 'application/pdf',
        fileSize: 1048576,
        hospitalName: 'Apollo City Hospital',
        doctorName: 'Dr. Priya Sharma',
        recordDate: '2026-03-15T10:30:00Z',
        createdAt: '2026-03-15T10:30:00Z',
        uploadedBy: { type: 'doctor', doctorName: 'Dr. Priya Sharma' }
      },
      {
        _id: 'rec-002',
        patientId: 'pat-123',
        title: 'Complete Blood Count (CBC)',
        category: 'lab_report',
        description: 'Routine blood panel',
        clinicalNotes: 'All counts within normal reference limits.',
        diagnosis: ['Routine Health Check'],
        vitals: {},
        fileUrl: 'https://cloudinary.com/medibridge/rec-002.jpg',
        fileType: 'image/jpeg',
        fileSize: 524288,
        hospitalName: 'Max Healthcare',
        doctorName: 'Dr. Ramesh Patel',
        recordDate: '2026-02-10T09:15:00Z',
        createdAt: '2026-02-10T09:15:00Z',
        uploadedBy: { type: 'self' }
      }
    ];

    this.prescriptions = [
      {
        _id: 'rx-001',
        patientId: 'pat-123',
        doctorId: {
          _id: 'doc-456',
          firstName: 'Priya',
          lastName: 'Sharma',
          specialization: 'Cardiology',
          licenseNumber: 'MCI-2018-9941',
        },
        hospitalId: {
          _id: 'hosp-789',
          name: 'Apollo City Hospital',
          city: 'Mumbai',
        },
        doctorName: 'Dr. Priya Sharma',
        hospitalName: 'Apollo City Hospital',
        diagnosis: ['Hypertension - Stage 1'],
        symptoms: ['Mild morning headaches', 'Palpitations'],
        medicines: [
          {
            name: 'Telmisartan',
            type: 'tablet',
            dosage: '40mg',
            frequency: '1-0-0',
            duration: '30 days',
            timing: 'before_meal',
            instructions: 'Take every morning with water',
            quantity: 30,
          },
          {
            name: 'Amlodipine',
            type: 'tablet',
            dosage: '5mg',
            frequency: '0-0-1',
            duration: '30 days',
            timing: 'bedtime',
            instructions: 'Take at night before sleep',
            quantity: 30,
          }
        ],
        vitals: {
          bloodPressure: '138/88',
          heartRate: 84,
          weight: 72,
        },
        tests: ['Serum Electrolytes', 'Lipid Profile'],
        advice: 'Reduce dietary salt. Maintain 30 mins brisk walking daily.',
        isActive: true,
        followUpDate: '2026-04-15T00:00:00Z',
        createdAt: '2026-03-15T11:00:00Z',
      },
      {
        _id: 'rx-002',
        patientId: 'pat-123',
        doctorName: 'Dr. Ramesh Patel',
        hospitalName: 'Max Healthcare',
        diagnosis: ['Acute Bacterial Bronchitis'],
        symptoms: ['Cough', 'Low-grade fever'],
        medicines: [
          {
            name: 'Azithromycin',
            type: 'tablet',
            dosage: '500mg',
            frequency: '1-0-0',
            duration: '5 days',
            timing: 'after_meal',
            instructions: 'Complete full course',
            quantity: 5,
          }
        ],
        isActive: false,
        followUpDate: '2026-01-20T00:00:00Z',
        createdAt: '2026-01-10T14:20:00Z',
      }
    ];

    this.accessSessions = [
      {
        _id: 'sess-001',
        patientId: 'pat-123',
        doctorId: {
          _id: 'doc-456',
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@apollo.com'
        },
        doctorName: 'Priya Sharma',
        hospitalName: 'Apollo City Hospital',
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours left
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      }
    ];

    this.accessLogs = [
      {
        _id: 'log-001',
        patientId: 'pat-123',
        doctorId: {
          _id: 'doc-456',
          firstName: 'Priya',
          lastName: 'Sharma',
        },
        doctorName: 'Priya Sharma',
        hospitalName: 'Apollo City Hospital',
        action: 'access_granted',
        ipAddress: '192.168.1.45',
        timestamp: '2026-03-15T10:00:00Z',
        createdAt: '2026-03-15T10:00:00Z',
      },
      {
        _id: 'log-002',
        patientId: 'pat-123',
        doctorId: {
          _id: 'doc-456',
          firstName: 'Priya',
          lastName: 'Sharma',
        },
        doctorName: 'Priya Sharma',
        hospitalName: 'Apollo City Hospital',
        action: 'added_record',
        ipAddress: '192.168.1.45',
        timestamp: '2026-03-15T10:35:00Z',
        createdAt: '2026-03-15T10:35:00Z',
      }
    ];

    this.loanApplications = [
      {
        _id: 'loan-001',
        patientId: 'pat-123',
        treatmentType: 'Coronary Angioplasty',
        estimatedCost: 350000,
        amountRequested: 300000,
        approvedAmount: 200000,
        loanAmountTerm: 24,
        monthlyIncome: 45000,
        status: 'partial',
        ruleScore: 68,
        mlConfidence: 74.5,
        estimatedEmi: 9850,
        createdAt: '2026-03-10T12:00:00Z',
      }
    ];

    this.fundraisers = [
      {
        _id: 'camp-001',
        patientId: 'pat-123',
        shareSlug: 'heart-surgery-ravi',
        title: 'Urgent Coronary Angioplasty for Ravi',
        story: 'Ravi was diagnosed with severe coronary arterial blockage requiring urgent intervention...',
        treatmentType: 'Coronary Angioplasty',
        hospitalName: 'Apollo City Hospital',
        doctorName: 'Dr. Priya Sharma',
        totalRequired: 350000,
        loanApproved: 200000,
        fundingGap: 150000,
        amountRaised: 45000,
        status: 'active',
        isVerified: true,
        deadline: '2026-05-01T00:00:00Z',
        createdAt: '2026-03-11T09:00:00Z',
      }
    ];

    this.donations = [
      {
        _id: 'don-001',
        campaignId: 'camp-001',
        donorName: 'Anil Kumar',
        amount: 25000,
        isAnonymous: false,
        paymentMethod: 'upi',
        message: 'Wishing Ravi a speedy and full recovery!',
        createdAt: '2026-03-12T14:30:00Z',
      },
      {
        _id: 'don-002',
        campaignId: 'camp-001',
        donorName: 'Anonymous Donor',
        amount: 20000,
        isAnonymous: true,
        paymentMethod: 'card',
        message: 'Get well soon!',
        createdAt: '2026-03-13T16:15:00Z',
      }
    ];

    this.doctorPatients = [
      {
        _id: 'pat-123',
        healthId: 'MB-2026-104928',
        firstName: 'Ravi',
        lastName: 'Verma',
        gender: 'male',
        dateOfBirth: '1985-06-12',
        bloodGroup: 'B+',
        hasActiveSession: true,
        consultationCount: 3,
        lastConsultation: '2026-03-15T10:30:00Z',
      },
      {
        _id: 'pat-456',
        healthId: 'MB-2026-894721',
        firstName: 'Sunita',
        lastName: 'Rao',
        gender: 'female',
        dateOfBirth: '1992-11-04',
        bloodGroup: 'O+',
        hasActiveSession: false,
        consultationCount: 1,
        lastConsultation: '2026-02-28T15:00:00Z',
      }
    ];
  }

  setFailure(endpointPattern, status = 500, message = 'Internal Server Error') {
    this.failureOverrides.set(endpointPattern, { status, message });
  }

  clearFailures() {
    this.failureOverrides.clear();
  }

  recordCall(method, url, data = null, headers = {}) {
    this.calls.push({
      method,
      url,
      data,
      headers,
      timestamp: Date.now(),
    });
  }

  checkFailure(url) {
    for (const [pattern, error] of this.failureOverrides.entries()) {
      if (url.includes(pattern)) {
        const err = new Error(error.message);
        err.response = {
          status: error.status,
          data: { success: false, message: error.message },
        };
        throw err;
      }
    }
  }

  // --- HTTP Dispatch Simulation matching axios methods ---
  async get(url, config = {}) {
    this.recordCall('GET', url, null, config.headers);
    this.checkFailure(url);

    // /records/:id
    if (url.match(/^\/records\/([a-zA-Z0-9_-]+)$/)) {
      const id = url.split('/')[2];
      const rec = this.records.find(r => r._id === id);
      if (!rec) {
        const err = new Error('Medical record not found');
        err.response = { status: 404, data: { success: false, message: 'Medical record not found' } };
        throw err;
      }
      return { data: { success: true, data: rec } };
    }

    // /records
    if (url === '/records' || url.startsWith('/records?')) {
      return { data: { success: true, data: this.records, count: this.records.length } };
    }

    // /prescriptions/active
    if (url === '/prescriptions/active') {
      const active = this.prescriptions.filter(p => p.isActive);
      return { data: { success: true, data: active } };
    }

    // /prescriptions/:id
    if (url.match(/^\/prescriptions\/([a-zA-Z0-9_-]+)$/)) {
      const id = url.split('/')[2];
      const rx = this.prescriptions.find(p => p._id === id);
      if (!rx) {
        const err = new Error('Prescription not found');
        err.response = { status: 404, data: { success: false, message: 'Prescription not found' } };
        throw err;
      }
      return { data: { success: true, data: rx } };
    }

    // /prescriptions
    if (url === '/prescriptions' || url.startsWith('/prescriptions?')) {
      return { data: { success: true, data: this.prescriptions } };
    }

    // /access/log
    if (url === '/access/log') {
      return { data: { success: true, data: this.accessLogs } };
    }

    // /access/sessions
    if (url === '/access/sessions') {
      return { data: { success: true, data: this.accessSessions } };
    }

    // /financial/loans/:id
    if (url.match(/^\/financial\/loans\/([a-zA-Z0-9_-]+)$/)) {
      const id = url.split('/')[3];
      const loan = this.loanApplications.find(l => l._id === id);
      if (!loan) {
        const err = new Error('Loan application not found');
        err.response = { status: 404, data: { success: false, message: 'Not found' } };
        throw err;
      }
      return { data: { success: true, data: loan } };
    }

    // /financial/loans
    if (url === '/financial/loans') {
      return { data: { success: true, data: this.loanApplications } };
    }

    // /fundraisers/campaigns/mine
    if (url === '/fundraisers/campaigns/mine') {
      return { data: { success: true, data: this.fundraisers } };
    }

    // /fundraisers/campaigns/:id/donors
    if (url.match(/^\/fundraisers\/campaigns\/([a-zA-Z0-9_-]+)\/donors$/)) {
      const campaignId = url.split('/')[3];
      const dons = this.donations.filter(d => d.campaignId === campaignId);
      return { data: { success: true, data: dons } };
    }

    // /fundraisers/campaigns/:slug
    if (url.match(/^\/fundraisers\/campaigns\/([a-zA-Z0-9_-]+)$/)) {
      const slugOrId = url.split('/')[3];
      const camp = this.fundraisers.find(c => c.shareSlug === slugOrId || c._id === slugOrId);
      if (!camp) {
        const err = new Error('Fundraiser campaign not found');
        err.response = { status: 404, data: { success: false, message: 'Fundraiser campaign not found' } };
        throw err;
      }
      return { data: { success: true, data: camp } };
    }

    // /doctors/patients/search?healthId=...
    if (url.startsWith('/doctors/patients/search')) {
      const healthId = config.params?.healthId;
      const patient = this.doctorPatients.find(p => p.healthId === healthId);
      if (!patient) {
        const err = new Error('Patient not found');
        err.response = { status: 404, data: { success: false, message: 'Patient not found' } };
        throw err;
      }
      return { data: { success: true, data: patient } };
    }

    // /doctors/patients/:healthId/records
    if (url.match(/^\/doctors\/patients\/([a-zA-Z0-9_-]+)\/records$/)) {
      return { data: { success: true, data: this.records } };
    }

    // /doctors/patients
    if (url === '/doctors/patients') {
      return { data: { success: true, data: this.doctorPatients } };
    }

    throw new Error(`Unhandled mock GET endpoint: ${url}`);
  }

  async post(url, data, config = {}) {
    this.recordCall('POST', url, data, config.headers);
    this.checkFailure(url);

    // /financial/eligibility
    if (url === '/financial/eligibility') {
      const requested = Number(data.amountRequested || 0);
      const income = Number(data.monthlyIncome || 0);
      let ruleScore = 50;
      if (income >= 40000) ruleScore += 25;
      if (data.creditHistory === '1') ruleScore += 15;

      const approved = ruleScore >= 40;
      const finalDecision = ruleScore >= 70 ? 'approved' : ruleScore >= 40 ? 'partial' : 'rejected';
      const approvedAmount = finalDecision === 'approved' ? requested : finalDecision === 'partial' ? Math.round(requested * 0.6) : 0;
      const fundingGap = Math.max(0, requested - approvedAmount);

      return {
        data: {
          success: true,
          data: {
            ruleScore,
            mlPrediction: {
              approved,
              confidence: 78.4,
              probability: { approve: 0.784, reject: 0.216 }
            },
            finalDecision,
            approvedAmount,
            amountRequested: requested,
            fundingGap,
            loanTerms: {
              interestRate: 10.5,
              tenureMonths: Number(data.loanAmountTerm || 12),
              monthlyEmi: Math.round((approvedAmount * 1.1) / Number(data.loanAmountTerm || 12)),
            }
          }
        }
      };
    }

    // /financial/loans
    if (url === '/financial/loans') {
      const newLoan = {
        _id: `loan-${Date.now()}`,
        patientId: 'pat-123',
        ...data,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };
      this.loanApplications.push(newLoan);
      return { data: { success: true, data: newLoan, message: 'Loan application submitted' } };
    }

    // /fundraisers/campaigns
    if (url === '/fundraisers/campaigns') {
      const totalReq = Number(data.totalRequired || 0);
      const loanAppr = Number(data.loanApproved || 0);
      const fundingGap = Math.max(0, totalReq - loanAppr);
      const newCamp = {
        _id: `camp-${Date.now()}`,
        patientId: 'pat-123',
        shareSlug: (data.title || 'campaign').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        amountRaised: 0,
        fundingGap,
        status: 'active',
        isVerified: true,
        createdAt: new Date().toISOString(),
        ...data,
      };
      this.fundraisers.push(newCamp);
      return { data: { success: true, data: newCamp, message: 'Campaign created successfully' } };
    }

    // /fundraisers/campaigns/:id/donations
    if (url.match(/^\/fundraisers\/campaigns\/([a-zA-Z0-9_-]+)\/donations$/)) {
      const campaignId = url.split('/')[3];
      const camp = this.fundraisers.find(c => c._id === campaignId || c.shareSlug === campaignId);
      if (!camp) {
        const err = new Error('Campaign not found');
        err.response = { status: 404, data: { success: false, message: 'Not found' } };
        throw err;
      }
      const donationAmount = Number(data.amount || 0);
      camp.amountRaised = (camp.amountRaised || 0) + donationAmount;
      const newDonation = {
        _id: `don-${Date.now()}`,
        campaignId: camp._id,
        amount: donationAmount,
        donorName: data.isAnonymous ? 'Anonymous Donor' : (data.donorName || 'Generous Supporter'),
        isAnonymous: !!data.isAnonymous,
        message: data.message || '',
        paymentMethod: data.paymentMethod || 'upi',
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      this.donations.unshift(newDonation);
      return { data: { success: true, data: newDonation, message: 'Donation processed successfully' } };
    }

    // /doctors/patients/:healthId/records
    if (url.match(/^\/doctors\/patients\/([a-zA-Z0-9_-]+)\/records$/)) {
      const healthId = url.split('/')[3];
      const isFormData = typeof data?.get === 'function';
      const title = isFormData ? data.get('title') : data.title;
      const category = isFormData ? data.get('category') : data.category;
      const clinicalNotes = isFormData ? data.get('clinicalNotes') : data.clinicalNotes;

      const newRec = {
        _id: `rec-${Date.now()}`,
        patientId: healthId,
        title,
        category,
        clinicalNotes,
        uploadedBy: { type: 'doctor', doctorName: 'Dr. Test Doctor' },
        createdAt: new Date().toISOString(),
      };
      this.records.unshift(newRec);
      return { data: { success: true, data: newRec, message: 'Clinical record added' } };
    }

    // /doctors/patients/:healthId/prescriptions
    if (url.match(/^\/doctors\/patients\/([a-zA-Z0-9_-]+)\/prescriptions$/)) {
      const healthId = url.split('/')[3];
      const newRx = {
        _id: `rx-${Date.now()}`,
        patientId: healthId,
        doctorName: 'Dr. Test Doctor',
        isActive: true,
        createdAt: new Date().toISOString(),
        ...data,
      };
      this.prescriptions.unshift(newRx);
      return { data: { success: true, data: newRx, message: 'Prescription issued' } };
    }

    // /doctors/patients/access (PIN verification)
    if (url === '/doctors/patients/access') {
      if (data.pin === '1234') {
        const session = {
          _id: `sess-${Date.now()}`,
          patientHealthId: data.healthId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        };
        this.accessSessions.push(session);
        return { data: { success: true, data: session, message: 'Access granted for 24 hours' } };
      } else {
        const err = new Error('Invalid PIN');
        err.response = { status: 401, data: { success: false, message: 'Invalid 4-digit PIN' } };
        throw err;
      }
    }

    throw new Error(`Unhandled mock POST endpoint: ${url}`);
  }

  async put(url, data = {}) {
    this.recordCall('PUT', url, data);
    this.checkFailure(url);

    // /prescriptions/:id/complete
    if (url.match(/^\/prescriptions\/([a-zA-Z0-9_-]+)\/complete$/)) {
      const id = url.split('/')[2];
      const rx = this.prescriptions.find(p => p._id === id);
      if (!rx) {
        const err = new Error('Prescription not found');
        err.response = { status: 404, data: { success: false, message: 'Not found' } };
        throw err;
      }
      rx.isActive = false;
      return { data: { success: true, data: rx, message: 'Course marked as completed' } };
    }

    // /access/sessions/:id/revoke
    if (url.match(/^\/access\/sessions\/([a-zA-Z0-9_-]+)\/revoke$/)) {
      const id = url.split('/')[3];
      const sessionIndex = this.accessSessions.findIndex(s => s._id === id);
      if (sessionIndex === -1) {
        const err = new Error('Session not found');
        err.response = { status: 404, data: { success: false, message: 'Session not found' } };
        throw err;
      }
      const revoked = this.accessSessions.splice(sessionIndex, 1)[0];
      return { data: { success: true, data: revoked, message: 'Session revoked successfully' } };
    }

    // /fundraisers/campaigns/:id
    if (url.match(/^\/fundraisers\/campaigns\/([a-zA-Z0-9_-]+)$/)) {
      const id = url.split('/')[3];
      const camp = this.fundraisers.find(c => c._id === id);
      if (!camp) {
        const err = new Error('Campaign not found');
        err.response = { status: 404, data: { success: false, message: 'Not found' } };
        throw err;
      }
      Object.assign(camp, data);
      return { data: { success: true, data: camp, message: 'Campaign updated' } };
    }

    throw new Error(`Unhandled mock PUT endpoint: ${url}`);
  }

  async delete(url) {
    this.recordCall('DELETE', url);
    this.checkFailure(url);

    // /records/:id
    if (url.match(/^\/records\/([a-zA-Z0-9_-]+)$/)) {
      const id = url.split('/')[2];
      const idx = this.records.findIndex(r => r._id === id);
      if (idx === -1) {
        const err = new Error('Record not found');
        err.response = { status: 404, data: { success: false, message: 'Not found' } };
        throw err;
      }
      this.records.splice(idx, 1);
      return { data: { success: true, message: 'Medical record deleted' } };
    }

    throw new Error(`Unhandled mock DELETE endpoint: ${url}`);
  }
}

export const mockApi = new MockApiAdapter();
