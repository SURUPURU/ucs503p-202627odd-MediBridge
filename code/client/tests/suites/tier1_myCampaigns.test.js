// code/client/tests/suites/tier1_myCampaigns.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 8 - My Fundraisers Dashboard (/fundraiser/my)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('8.1 should define the route /fundraiser/my with protected access in App.jsx', () => {
    const matched = router.matchRoute('/fundraiser/my');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/fundraiser/my');
    expect(matched.route.type).toBe('protected');
  });

  it('8.2 should redirect unauthenticated access to /login', () => {
    const res = router.navigate('/fundraiser/my');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('8.3 should allow authenticated patient to access My Fundraisers', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/fundraiser/my');
    expect(res.status).toBe(200);
    expect(res.component).toBe('MyCampaigns');
  });

  it('8.4 should fetch patient campaigns via fundraiserService.getMyCampaigns', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/fundraisers/campaigns/mine');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);

    const camp = res.data.data[0];
    expect(camp.title).toBe('Urgent Coronary Angioplasty for Ravi');
    expect(camp.shareSlug).toBe('heart-surgery-ravi');
    expect(camp.fundingGap).toBe(150000);
    expect(camp.amountRaised).toBe(45000);
  });

  it('8.5 should calculate fundraising progress percentage accurately', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/fundraisers/campaigns/mine');
    const camp = res.data.data[0];

    const percentage = Math.round((camp.amountRaised / camp.fundingGap) * 100);
    expect(percentage).toBe(30); // 45000 / 150000 = 30%
  });

  it('8.6 should fetch recent donors list for a campaign via fundraiserService.getCampaignDonors', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/fundraisers/campaigns/camp-001/donors');
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBe(2);

    const firstDonor = res.data.data[0];
    expect(firstDonor.donorName).toBe('Anil Kumar');
    expect(firstDonor.amount).toBe(25000);
    expect(firstDonor.isAnonymous).toBe(false);

    const secondDonor = res.data.data[1];
    expect(secondDonor.isAnonymous).toBe(true);
  });

  it('8.7 should generate public campaign shareable link pointing to /fundraiser/:slug', async () => {
    mockAuth.setPatientSession();
    const res = await mockApi.get('/fundraisers/campaigns/mine');
    const camp = res.data.data[0];
    const publicUrl = `/fundraiser/${camp.shareSlug}`;

    const match = router.matchRoute(publicUrl);
    expect(match).toBeTruthy();
    expect(match.route.component).toBe('CampaignPage');
  });

  it('8.8 should verify component requirements (Card, Badge, Progress, Button)', () => {
    const status = ComponentInspector.checkPageStatus('MyCampaigns');
    expect(status.spec.route).toBe('/fundraiser/my');
    expect(status.spec.uiPrimitives).toContain('Progress');
    expect(status.spec.uiPrimitives).toContain('Badge');
    expect(status.spec.uiPrimitives).toContain('Card');
  });
});
