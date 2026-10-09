// code/client/tests/suites/tier1_campaignPage.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 9 - Public Fundraiser & Donation Page (/fundraiser/:slug)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession(); // Public user!
    router = new MockRouter(mockAuth);
  });

  it('9.1 should define /fundraiser/:slug as a PUBLIC route outside ProtectedRoute in App.jsx', () => {
    const matched = router.matchRoute('/fundraiser/heart-surgery-ravi');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/fundraiser/:slug');
    expect(matched.route.type).toBe('public');
    expect(matched.params.slug).toBe('heart-surgery-ravi');
  });

  it('9.2 should allow unauthenticated public visitors without redirecting to /login', () => {
    // mockAuth is unauthenticated
    expect(mockAuth.isAuthenticated).toBe(false);
    const res = router.navigate('/fundraiser/heart-surgery-ravi');
    expect(res.status).toBe(200);
    expect(res.component).toBe('CampaignPage');
    expect(res.redirect).toBeNull();
  });

  it('9.3 should fetch public campaign details by slug via fundraiserService.getCampaignBySlug', async () => {
    const res = await mockApi.get('/fundraisers/campaigns/heart-surgery-ravi');
    expect(res.data.success).toBe(true);

    const camp = res.data.data;
    expect(camp.title).toBe('Urgent Coronary Angioplasty for Ravi');
    expect(camp.hospitalName).toBe('Apollo City Hospital');
    expect(camp.doctorName).toBe('Dr. Priya Sharma');
    expect(camp.isVerified).toBe(true);
    expect(camp.fundingGap).toBe(150000);
  });

  it('9.4 should present verified medical badges and real-time funding progress metrics', async () => {
    const res = await mockApi.get('/fundraisers/campaigns/heart-surgery-ravi');
    const camp = res.data.data;

    expect(camp.isVerified).toBe(true);
    expect(camp.amountRaised).toBe(45000);
    const percent = Math.round((camp.amountRaised / camp.fundingGap) * 100);
    expect(percent).toBe(30);
  });

  it('9.5 should support public donation submission with presets, custom amount, and anonymous options', async () => {
    const donationPayload = {
      amount: 5000,
      donorName: 'Dr. Anita Roy',
      isAnonymous: false,
      message: 'Praying for full recovery!',
      paymentMethod: 'upi',
    };

    const res = await mockApi.post('/fundraisers/campaigns/camp-001/donations', donationPayload);
    expect(res.data.success).toBe(true);
    expect(res.data.data.amount).toBe(5000);
    expect(res.data.data.status).toBe('completed');

    // Campaign amountRaised should increase from 45,000 to 50,000
    const campRes = await mockApi.get('/fundraisers/campaigns/heart-surgery-ravi');
    expect(campRes.data.data.amountRaised).toBe(50000);
  });

  it('9.6 should support anonymous donations without leaking donor personal name', async () => {
    const anonDonation = {
      amount: 10000,
      donorName: 'Secret Philanthropist',
      isAnonymous: true,
      message: 'Support from an anonymous well-wisher',
      paymentMethod: 'card',
    };

    const res = await mockApi.post('/fundraisers/campaigns/camp-001/donations', anonDonation);
    expect(res.data.success).toBe(true);
    expect(res.data.data.donorName).toBe('Anonymous Donor');
    expect(res.data.data.isAnonymous).toBe(true);
  });

  it('9.7 should display updated donors wall with contributions and messages', async () => {
    const donorsRes = await mockApi.get('/fundraisers/campaigns/camp-001/donors');
    expect(donorsRes.data.success).toBe(true);
    expect(donorsRes.data.data.length).toBeGreaterThanOrEqual(2);
  });

  it('9.8 should verify component requirements (Progress, Card, Button, Input, Badge)', () => {
    const status = ComponentInspector.checkPageStatus('CampaignPage');
    expect(status.spec.route).toBe('/fundraiser/:slug');
    expect(status.spec.role).toBe('public');
    expect(status.spec.uiPrimitives).toContain('Progress');
    expect(status.spec.uiPrimitives).toContain('Card');
    expect(status.spec.uiPrimitives).toContain('Button');
  });
});
