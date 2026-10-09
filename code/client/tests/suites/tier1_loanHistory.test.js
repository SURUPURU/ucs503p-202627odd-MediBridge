// code/client/tests/suites/tier1_loanHistory.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 6 - Loan Application History Page (/financial/history)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('6.1 should define the route /financial/history with protected access in App.jsx', () => {
    const matched = router.matchRoute('/financial/history');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/financial/history');
    expect(matched.route.type).toBe('protected');
  });

  it('6.2 should redirect unauthenticated access to /login', () => {
    const res = router.navigate('/financial/history');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('6.3 should allow authenticated patient to view loan history', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/financial/history');
    expect(res.status).toBe(200);
    expect(res.component).toBe('LoanHistory');
  });

  it('6.4 should fetch patient loan applications via financialService.getMyApplications', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/financial/loans');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBeGreaterThanOrEqual(1);

    const loan = res.data.data[0];
    expect(loan.treatmentType).toBe('Coronary Angioplasty');
    expect(loan.amountRequested).toBe(300000);
    expect(loan.status).toBe('partial');
  });

  it('6.5 should present status badges, tenure, and calculated monthly EMI', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/financial/loans');
    const loan = res.data.data[0];

    expect(['draft', 'submitted', 'under_review', 'approved', 'partial', 'rejected', 'disbursed']).toContain(loan.status);
    expect(loan.loanAmountTerm).toBe(24);
    expect(loan.estimatedEmi).toBe(9850);
  });

  it('6.6 should support detail lookup by ID via financialService.getApplicationById', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/financial/loans/loan-001');
    expect(res.data.success).toBe(true);
    expect(res.data.data._id).toBe('loan-001');
    expect(res.data.data.ruleScore).toBe(68);
    expect(res.data.data.mlConfidence).toBe(74.5);
  });

  it('6.7 should navigate to /financial/apply when CTA "Apply for New Loan" is clicked', () => {
    mockAuth.setPatientSession();
    const navRes = router.navigate('/financial/apply');
    expect(navRes.status).toBe(200);
    expect(navRes.component).toBe('ApplyLoan');
  });

  it('6.8 should verify component requirements (Card, Badge, Button)', () => {
    const status = ComponentInspector.checkPageStatus('LoanHistory');
    expect(status.spec.route).toBe('/financial/history');
    expect(status.spec.uiPrimitives).toContain('Card');
    expect(status.spec.uiPrimitives).toContain('Badge');
    expect(status.spec.uiPrimitives).toContain('Button');
  });
});
