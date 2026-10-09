// code/client/tests/suites/tier1_createCampaign.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 7 - Create Fundraiser Page (/fundraiser/create)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('7.1 should define the route /fundraiser/create in App.jsx with protected access', () => {
    const matched = router.matchRoute('/fundraiser/create');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/fundraiser/create');
    expect(matched.route.type).toBe('protected');
  });

  it('7.2 should redirect unauthenticated access to /login', () => {
    const res = router.navigate('/fundraiser/create');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('7.3 should grant access to authenticated patient to create a campaign', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/fundraiser/create');
    expect(res.status).toBe(200);
    expect(res.component).toBe('CreateCampaign');
  });

  it('7.4 should receive and hydrate prefilled state from loan eligibility evaluation', () => {
    mockAuth.setPatientSession();
    const loanHandoff = {
      totalRequired: 400000,
      loanApproved: 250000,
      fundingGap: 150000,
      treatmentType: 'Chemotherapy Treatment',
    };

    const res = router.navigate('/fundraiser/create', { state: loanHandoff });
    expect(res.state).toEqual(loanHandoff);
    expect(res.state.fundingGap).toBe(150000);
    expect(res.state.treatmentType).toBe('Chemotherapy Treatment');
  });

  it('7.5 should submit new campaign via fundraiserService.createCampaign and auto-generate shareSlug', async () => {
    mockAuth.setPatientSession();
    const campaignData = {
      title: 'Support Ravi Cardiac Rehabilitation',
      story: 'Ravi requires continued cardiac rehabilitation post-procedure...',
      treatmentType: 'Cardiac Rehab',
      hospitalName: 'Apollo City Hospital',
      doctorName: 'Dr. Priya Sharma',
      totalRequired: 300000,
      loanApproved: 180000,
      fundingGap: 120000,
      deadline: '2026-06-30T00:00:00Z',
    };

    const res = await mockApi.post('/fundraisers/campaigns', campaignData);
    expect(res.data.success).toBe(true);
    const created = res.data.data;
    expect(created._id).toBeDefined();
    expect(created.shareSlug).toBe('support-ravi-cardiac-rehabilitation');
    expect(created.amountRaised).toBe(0);
    expect(created.fundingGap).toBe(120000);
  });

  it('7.6 should calculate fundingGap as (totalRequired - loanApproved) accurately', async () => {
    mockAuth.setPatientSession();
    const campaignData = {
      title: 'Pediatric Surgery Fund',
      totalRequired: 500000,
      loanApproved: 200000,
    };
    const res = await mockApi.post('/fundraisers/campaigns', campaignData);
    expect(res.data.data.fundingGap).toBe(300000);
  });

  it('7.7 should transition user to /fundraiser/my upon campaign submission', () => {
    mockAuth.setPatientSession();
    const navRes = router.navigate('/fundraiser/my');
    expect(navRes.status).toBe(200);
    expect(navRes.component).toBe('MyCampaigns');
  });

  it('7.8 should verify component requirements (Input, Textarea, Button, Card)', () => {
    const status = ComponentInspector.checkPageStatus('CreateCampaign');
    expect(status.spec.route).toBe('/fundraiser/create');
    expect(status.spec.uiPrimitives).toContain('Input');
    expect(status.spec.uiPrimitives).toContain('Textarea');
    expect(status.spec.uiPrimitives).toContain('Button');
  });
});
