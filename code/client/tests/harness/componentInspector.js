// code/client/tests/harness/componentInspector.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Static and Runtime Component Inspector for MediBridge Pages
 * Enables progressive testability and acceptance criteria validation.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_ROOT = path.resolve(__dirname, '../../');
const SRC_PAGES = path.join(CLIENT_ROOT, 'src/pages');

export const PAGE_REGISTRY = {
  RecordDetail: {
    route: '/records/:id',
    expectedPath: path.join(SRC_PAGES, 'records/RecordDetail.jsx'),
    role: 'patient',
    primaryService: 'recordService',
    primaryMethod: 'getRecordById',
    requiredElements: ['vitals', 'diagnosis', 'clinicalNotes', 'deleteRecord'],
    uiPrimitives: ['Card', 'Badge', 'Button'],
  },
  Prescriptions: {
    route: '/prescriptions',
    expectedPath: path.join(SRC_PAGES, 'prescriptions/Prescriptions.jsx'),
    role: 'patient',
    primaryService: 'prescriptionService',
    primaryMethod: 'getPrescriptions',
    requiredElements: ['active', 'tabs', 'medicines', 'markComplete'],
    uiPrimitives: ['Card', 'Badge', 'Tabs', 'Button'],
  },
  PrescriptionDetail: {
    route: '/prescriptions/:id',
    expectedPath: path.join(SRC_PAGES, 'prescriptions/PrescriptionDetail.jsx'),
    role: 'patient',
    primaryService: 'prescriptionService',
    primaryMethod: 'getPrescriptionById',
    requiredElements: ['medicines', 'dosage', 'frequency', 'duration', 'instructions', 'advice'],
    uiPrimitives: ['Card', 'Table', 'Badge', 'Button'],
  },
  AccessLog: {
    route: '/access-log',
    expectedPath: path.join(SRC_PAGES, 'access/AccessLog.jsx'),
    role: 'patient',
    primaryService: 'accessService',
    primaryMethod: 'getAccessLog',
    requiredElements: ['activeSessions', 'revoke', 'history', 'timestamp'],
    uiPrimitives: ['Card', 'Badge', 'Button'],
  },
  EligibilityResult: {
    route: '/financial/result',
    expectedPath: path.join(SRC_PAGES, 'financial/EligibilityResult.jsx'),
    role: 'patient',
    primaryService: 'financialService',
    primaryMethod: 'checkEligibility',
    requiredElements: ['ruleScore', 'mlPrediction', 'finalDecision', 'fundingGap', 'Bridge'],
    uiPrimitives: ['Card', 'Badge', 'Button', 'Progress'],
  },
  LoanHistory: {
    route: '/financial/history',
    expectedPath: path.join(SRC_PAGES, 'financial/LoanHistory.jsx'),
    role: 'patient',
    primaryService: 'financialService',
    primaryMethod: 'getMyApplications',
    requiredElements: ['applications', 'status', 'treatmentType', 'amountRequested'],
    uiPrimitives: ['Card', 'Badge', 'Button'],
  },
  CreateCampaign: {
    route: '/fundraiser/create',
    expectedPath: path.join(SRC_PAGES, 'fundraiser/CreateCampaign.jsx'),
    role: 'patient',
    primaryService: 'fundraiserService',
    primaryMethod: 'createCampaign',
    requiredElements: ['title', 'story', 'totalRequired', 'fundingGap', 'treatmentType'],
    uiPrimitives: ['Input', 'Textarea', 'Button', 'Card'],
  },
  MyCampaigns: {
    route: '/fundraiser/my',
    expectedPath: path.join(SRC_PAGES, 'fundraiser/MyCampaigns.jsx'),
    role: 'patient',
    primaryService: 'fundraiserService',
    primaryMethod: 'getMyCampaigns',
    requiredElements: ['campaigns', 'progress', 'amountRaised', 'fundingGap', 'share'],
    uiPrimitives: ['Card', 'Badge', 'Progress', 'Button'],
  },
  CampaignPage: {
    route: '/fundraiser/:slug',
    expectedPath: path.join(SRC_PAGES, 'fundraiser/CampaignPage.jsx'),
    role: 'public',
    primaryService: 'fundraiserService',
    primaryMethod: 'getCampaignBySlug',
    requiredElements: ['donate', 'amount', 'donors', 'progress', 'anonymous'],
    uiPrimitives: ['Card', 'Progress', 'Button', 'Input', 'Badge'],
  },
  AddRecord: {
    route: '/doctor/patient/:healthId/add-record',
    expectedPath: path.join(SRC_PAGES, 'doctor/AddRecord.jsx'),
    role: 'doctor',
    primaryService: 'doctorService',
    primaryMethod: 'addRecord',
    requiredElements: ['title', 'category', 'clinicalNotes', 'healthId'],
    uiPrimitives: ['Input', 'Button', 'Select', 'Textarea'],
  },
  WritePrescription: {
    route: '/doctor/patient/:healthId/prescribe',
    expectedPath: path.join(SRC_PAGES, 'doctor/WritePrescription.jsx'),
    role: 'doctor',
    primaryService: 'doctorService',
    primaryMethod: 'writePrescription',
    requiredElements: ['medicines', 'dosage', 'frequency', 'duration', 'healthId'],
    uiPrimitives: ['Input', 'Button', 'Select', 'Card'],
  },
  MyPatients: {
    route: '/doctor/my-patients',
    expectedPath: path.join(SRC_PAGES, 'doctor/MyPatients.jsx'),
    role: 'doctor',
    primaryService: 'doctorService',
    primaryMethod: 'getMyPatients',
    requiredElements: ['patients', 'healthId', 'name'],
    uiPrimitives: ['Card', 'Button', 'Input'],
  },
};

export class ComponentInspector {
  static checkPageStatus(componentName) {
    const spec = PAGE_REGISTRY[componentName];
    if (!spec) throw new Error(`Unknown component ${componentName}`);

    const fileExists = fs.existsSync(spec.expectedPath);
    let content = null;
    let analysis = {
      exists: fileExists,
      path: spec.expectedPath,
      spec,
      usesCorrectRouter: true,
      usesValidEnums: true,
      hasRequiredExports: false,
      importsServices: false,
    };

    if (fileExists) {
      content = fs.readFileSync(spec.expectedPath, 'utf8');
      analysis.content = content;
      analysis.hasRequiredExports = content.includes(`export default ${componentName}`) || content.includes('export default');
      analysis.importsServices = content.includes(spec.primaryService) || content.includes('Service');
      
      // Known defect checks
      if (content.includes("from 'react-router'") && !content.includes("from 'react-router-dom'")) {
        analysis.usesCorrectRouter = false;
        analysis.routerIssue = "Component imports from 'react-router' instead of 'react-router-dom'";
      }

      // Check category enum validity in medical record addition
      if (componentName === 'AddRecord') {
        if (content.includes('<option>General</option>') || content.includes('value="General"')) {
          analysis.usesValidEnums = false;
          analysis.enumIssue = "Category contains 'General' which is not in Mongoose enum ['lab_report', 'prescription', ...]";
        }
      }
    }

    return analysis;
  }

  static inspectAllPages() {
    const results = {};
    for (const name of Object.keys(PAGE_REGISTRY)) {
      results[name] = this.checkPageStatus(name);
    }
    return results;
  }
}
