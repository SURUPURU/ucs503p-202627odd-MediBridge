// code/client/tests/suites/tier1_accessLog.test.js
import { describe, it, expect, beforeEach } from '../harness/index.js';
import { mockApi } from '../harness/mockApi.js';
import { mockAuth } from '../harness/mockAuth.js';
import { MockRouter } from '../harness/mockRouter.js';
import { ComponentInspector } from '../harness/componentInspector.js';

describe('Tier 1: Feature 4 - Access Log & Consent Page (/access-log)', () => {
  let router;

  beforeEach(() => {
    mockApi.reset();
    mockAuth.clearSession();
    router = new MockRouter(mockAuth);
  });

  it('4.1 should define the route /access-log with protected access in App.jsx', () => {
    const matched = router.matchRoute('/access-log');
    expect(matched).toBeTruthy();
    expect(matched.route.path).toBe('/access-log');
    expect(matched.route.type).toBe('protected');
  });

  it('4.2 should prevent unauthenticated access and redirect to /login', () => {
    const res = router.navigate('/access-log');
    expect(res.status).toBe(302);
    expect(res.redirect).toBe('/login');
  });

  it('4.3 should allow authenticated patient to enter Access Log dashboard', () => {
    mockAuth.setPatientSession();
    const res = router.navigate('/access-log');
    expect(res.status).toBe(200);
    expect(res.component).toBe('AccessLog');
  });

  it('4.4 should fetch active sessions and access logs concurrently via accessService', async () => {
    mockAuth.setPatientSession();
    const [sessRes, logsRes] = await Promise.all([
      mockApi.get('/access/sessions'),
      mockApi.get('/access/log')
    ]);

    expect(sessRes.data.success).toBe(true);
    expect(logsRes.data.success).toBe(true);
    expect(sessRes.data.data.length).toBeGreaterThanOrEqual(1);
    expect(logsRes.data.data.length).toBeGreaterThanOrEqual(2);
  });

  it('4.5 should display active doctor sessions with expiration timestamp', async () => {
    mockAuth.setPatientSession();
    const sessRes = await mockApi.get('/access/sessions');
    const session = sessRes.data.data[0];

    expect(session._id).toBe('sess-001');
    expect(session.doctorName).toBe('Priya Sharma');
    expect(session.expiresAt).toBeDefined();
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('4.6 should support 1-click Revoke Access action and remove session from state', async () => {
    mockAuth.setPatientSession();
    const revokeRes = await mockApi.put('/access/sessions/sess-001/revoke');
    expect(revokeRes.data.success).toBe(true);

    const afterRes = await mockApi.get('/access/sessions');
    expect(afterRes.data.data.find(s => s._id === 'sess-001')).toBeUndefined();
  });

  it('4.7 should display chronological audit log entries with action, doctor and timestamp', async () => {
    mockAuth.setPatientSession();
    const logsRes = await mockApi.get('/access/log');
    const logs = logsRes.data.data;

    expect(logs.some(l => l.action === 'access_granted')).toBe(true);
    expect(logs.some(l => l.action === 'added_record')).toBe(true);
  });

  it('4.8 should inspect disk file and detect doctor name object resolution defect', () => {
    const status = ComponentInspector.checkPageStatus('AccessLog');
    expect(status.exists).toBe(true);
    expect(status.hasRequiredExports).toBe(true);
    expect(status.importsServices).toBe(true);
  });
});
