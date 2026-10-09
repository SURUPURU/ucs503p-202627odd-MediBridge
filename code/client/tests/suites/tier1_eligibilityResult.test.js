// code/client/tests/suites/tier1_eligibilityResult.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 5 - Loan Eligibility Result Page (/financial/result)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('5.1 should define the route /financial/result in App.jsx with protected access', () => {
    const matched = router.matchRoute('/financial/result');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/financial/result');
    expect(matched.route.type).toBe('protected');
  });

  it('5.2 should redirect unauthenticated access attempts to /login', () => {
    const res = router.navigate('/financial/result');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('5.3 should permit authenticated patient to access Eligibility Result view', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/financial/result');
    expect(res.status).toBe(200);
    expect(res.component).toBe('EligibilityResult');
  });

  it('5.4 should perform dual-scoring calculation with ML confidence and rule engine score', async () => {
    mockAuth.setPatientSession();
    const evalData = {
      treatmentType: 'Coronary Angioplasty',
      amountRequested: 300000,
      monthlyIncome: 45000,
      loanAmountTerm: 24,
      creditHistory: '1',
    };
    const res = await mockApi.post('/financial/eligibility', evalData);
    expect(res.data.success).toBe(true);

    const result = res.data.data;
    expect(result.ruleScore).toBeGreaterThanOrEqual(50);
    expect(result.mlPrediction).toBeDefined();
    expect(result.mlPrediction.confidence).toBeGreaterThan(50);
    expect(result.finalDecision).toBeDefined();
    expect(['approved', 'partial', 'rejected']).toContain(result.finalDecision);
  });

  it('5.5 should calculate approved amount, monthly EMI, and funding gap correctly', async () => {
    mockAuth.setPatientSession();
    const evalData = {
      amountRequested: 500000,
      monthlyIncome: 30000,
      loanAmountTerm: 12,
      creditHistory: '0',
    };
    const res = await mockApi.post('/financial/eligibility', evalData);
    const result = res.data.data;

    expect(result.amountRequested).toBe(500000);
    expect(result.approvedAmount).toBeLessThanOrEqual(500000);
    expect(result.fundingGap).toBe(result.amountRequested - result.approvedAmount);
    expect(result.loanTerms.monthlyEmi).toBeGreaterThan(0);
  });

  it('5.6 should navigate to /fundraiser/create with prefilled funding gap state upon Bridge CTA click', () => {
    mockAuth.setPatientSession();
    const bridgeState = {
      totalRequired: 500000,
      loanApproved: 300000,
      fundingGap: 200000,
      treatmentType: 'Coronary Angioplasty',
    };

    const navRes = router.navigate('/fundraiser/create', { state: bridgeState });
    expect(navRes.status).toBe(200);
    expect(navRes.component).toBe('CreateCampaign');
    expect(navRes.state).toEqual(bridgeState);
    expect(navRes.state.fundingGap).toBe(200000);
  });

  it('5.7 should verify component specification and UI design tokens', () => {
    const status = ComponentInspector.checkPageStatus('EligibilityResult');
    expect(status.spec.route).toBe('/financial/result');
    expect(status.spec.uiPrimitives).toContain('Progress');
    expect(status.spec.uiPrimitives).toContain('Button');
    expect(status.spec.uiPrimitives).toContain('Card');
  });
});
