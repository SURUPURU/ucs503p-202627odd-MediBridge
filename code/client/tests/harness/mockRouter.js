// code/client/tests/harness/mockRouter.js
/**
 * Mock Router & Navigation simulator for MediBridge E2E Tests
 * Validates route definitions, path matching, route guards (ProtectedRoute, RoleRoute),
 * and history state transitions matching App.jsx
 */

export class MockRouter {
  constructor(authManager) {
    this.authManager = authManager;
    this.routes = [];
    this.history = [];
    this.currentLocation = { pathname: '/', search: '', state: null };
    this.initRoutes();
  }

  initRoutes() {
    // Route registry replicating App.jsx
    this.routes = [
      { path: '/', type: 'redirect', to: '/login' },
      { path: '/login', type: 'public', component: 'Login' },
      { path: '/register', type: 'public', component: 'Register' },
      { path: '/register/doctor', type: 'public', component: 'DoctorRegister' },
      
      // Patient Protected Routes
      { path: '/dashboard', type: 'role', allow: ['patient'], component: 'PatientDashboard' },
      { path: '/profile', type: 'protected', component: 'PatientProfile' },
      { path: '/profile/emergency', type: 'protected', component: 'EmergencyProfile' },
      { path: '/profile/health-id', type: 'protected', component: 'HealthIdPage' },
      { path: '/hospitals', type: 'protected', component: 'HospitalSearch' },
      { path: '/hospitals/:id', type: 'protected', component: 'HospitalDetail' },
      { path: '/hospitals/:id/book', type: 'role', allow: ['patient'], component: 'BookAppointment' },
      { path: '/appointments', type: 'role', allow: ['patient'], component: 'Appointments' },
      
      // Medical Records (Patient / Auth)
      { path: '/records', type: 'protected', component: 'MedicalRecords' },
      { path: '/records/upload', type: 'protected', component: 'UploadRecord' },
      { path: '/records/:id', type: 'protected', component: 'RecordDetail' },
      
      // Prescriptions (Patient / Auth)
      { path: '/prescriptions', type: 'protected', component: 'Prescriptions' },
      { path: '/prescriptions/:id', type: 'protected', component: 'PrescriptionDetail' },
      { path: '/access-log', type: 'protected', component: 'AccessLog' },
      
      // Financial & Crowdfunding
      { path: '/financial/apply', type: 'protected', component: 'ApplyLoan' },
      { path: '/financial/result', type: 'protected', component: 'EligibilityResult' },
      { path: '/financial/history', type: 'protected', component: 'LoanHistory' },
      { path: '/fundraiser/create', type: 'protected', component: 'CreateCampaign' },
      { path: '/fundraiser/my', type: 'protected', component: 'MyCampaigns' },
      
      // Doctor Routes (RoleRoute allow: ['doctor'])
      { path: '/doctor/dashboard', type: 'role', allow: ['doctor'], component: 'DoctorDashboard' },
      { path: '/doctor/find-patient', type: 'role', allow: ['doctor'], component: 'FindPatient' },
      { path: '/doctor/patient/:healthId/add-record', type: 'role', allow: ['doctor'], component: 'AddRecord' },
      { path: '/doctor/patient/:healthId/prescribe', type: 'role', allow: ['doctor'], component: 'WritePrescription' },
      { path: '/doctor/my-patients', type: 'role', allow: ['doctor'], component: 'MyPatients' },
      
      // Public Routes
      { path: '/emergency/:healthId', type: 'public', component: 'EmergencyPublic' },
      { path: '/fundraiser/:slug', type: 'public', component: 'CampaignPage' },
    ];
  }

  matchRoute(path) {
    for (const route of this.routes) {
      const pattern = '^' + route.path.replace(/:([a-zA-Z0-9_]+)/g, '(?<$1>[^/]+)') + '$';
      const regex = new RegExp(pattern);
      const match = path.match(regex);
      if (match) {
        return {
          route,
          params: match.groups || {},
        };
      }
    }
    return null;
  }

  navigate(to, options = {}) {
    const targetPath = typeof to === 'string' ? to : to.pathname;
    const targetState = options.state || null;
    this.history.push({ pathname: targetPath, state: targetState });
    this.currentLocation = { pathname: targetPath, state: targetState };
    return this.evaluateCurrentRoute();
  }

  evaluateCurrentRoute() {
    const { pathname } = this.currentLocation;
    const match = this.matchRoute(pathname);

    if (!match) {
      return {
        status: 404,
        component: null,
        redirect: null,
        error: 'Route not found',
      };
    }

    const { route, params } = match;

    if (route.type === 'redirect') {
      return {
        status: 302,
        component: null,
        redirect: route.to,
        params,
      };
    }

    // Public routes accessible to everyone
    if (route.type === 'public') {
      return {
        status: 200,
        component: route.component,
        redirect: null,
        params,
        state: this.currentLocation.state,
      };
    }

    // Protected routes require authentication
    if (!this.authManager.isAuthenticated) {
      return {
        status: 302,
        component: null,
        redirect: '/login',
        params,
        reason: 'Unauthenticated user redirected to /login',
      };
    }

    // Role-restricted routes
    if (route.type === 'role') {
      const user = this.authManager.user;
      if (!user) {
        return {
          status: 302,
          component: null,
          redirect: '/login',
        };
      }
      if (!route.allow.includes(user.role)) {
        const fallback = user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard';
        return {
          status: 302,
          component: null,
          redirect: fallback,
          reason: `Role '${user.role}' not permitted for route '${route.path}'. Redirected to '${fallback}'.`,
        };
      }
    }

    return {
      status: 200,
      component: route.component,
      redirect: null,
      params,
      state: this.currentLocation.state,
    };
  }
}
