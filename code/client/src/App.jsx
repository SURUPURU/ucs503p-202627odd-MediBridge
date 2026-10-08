import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DoctorRegister from './pages/auth/DoctorRegister';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Pages
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import PatientProfile from './pages/profile/PatientProfile';
import EmergencyProfile from './pages/profile/EmergencyProfile';
import HealthIdPage from './pages/profile/HealthIdPage';
import HospitalSearch from './pages/hospitals/HospitalSearch';
import HospitalDetail from './pages/hospitals/HospitalDetail';
import MedicalRecords from './pages/records/MedicalRecords';
import UploadRecord from './pages/records/UploadRecord';
import FindPatient from './pages/doctor/FindPatient';
import ApplyLoan from './pages/financial/ApplyLoan';
import EmergencyPublic from './pages/emergency/EmergencyPublic';
import BookAppointment from './pages/hospitals/BookAppointment';
import Appointments from './pages/dashboard/Appointments';

// Placeholders for remaining ones so the app doesn't break
const Placeholder = ({ name }) => <div className="p-8 text-xl font-bold">{name} Page (Coming Soon)</div>;

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      
      {/* Auth required routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        
        {/* Patient Routes */}
        <Route path="/dashboard" element={<RoleRoute allow={['patient']}><PatientDashboard /></RoleRoute>} />
        <Route path="/profile" element={<PatientProfile />} />
        <Route path="/profile/emergency" element={<EmergencyProfile />} />
        <Route path="/profile/health-id" element={<HealthIdPage />} />
        <Route path="/hospitals" element={<HospitalSearch />} />
        <Route path="/hospitals/:id" element={<HospitalDetail />} />
        <Route path="/hospitals/:id/book" element={<RoleRoute allow={['patient']}><BookAppointment /></RoleRoute>} />
        <Route path="/appointments" element={<RoleRoute allow={['patient']}><Appointments /></RoleRoute>} />
        
        <Route path="/records" element={<MedicalRecords />} />
        <Route path="/records/upload" element={<UploadRecord />} />
        <Route path="/records/:id" element={<Placeholder name="Record Detail" />} />
        
        <Route path="/prescriptions" element={<Placeholder name="Prescriptions" />} />
        <Route path="/prescriptions/:id" element={<Placeholder name="Prescription Detail" />} />
        <Route path="/access-log" element={<Placeholder name="Access Log" />} />
        <Route path="/financial/apply" element={<ApplyLoan />} />
        <Route path="/financial/result" element={<Placeholder name="Loan Result" />} />
        <Route path="/financial/history" element={<Placeholder name="Loan History" />} />
        <Route path="/fundraiser/create" element={<Placeholder name="Create Fundraiser" />} />
        <Route path="/fundraiser/my" element={<Placeholder name="My Fundraisers" />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<RoleRoute allow={['doctor']}><DoctorDashboard /></RoleRoute>} />
        <Route path="/doctor/find-patient" element={<RoleRoute allow={['doctor']}><FindPatient /></RoleRoute>} />
        <Route path="/doctor/patient/:healthId/add-record" element={<RoleRoute allow={['doctor']}><Placeholder name="Add Record" /></RoleRoute>} />
        <Route path="/doctor/patient/:healthId/prescribe" element={<RoleRoute allow={['doctor']}><Placeholder name="Write Prescription" /></RoleRoute>} />
        <Route path="/doctor/my-patients" element={<RoleRoute allow={['doctor']}><Placeholder name="My Patients" /></RoleRoute>} />

      </Route>

      {/* Public Routes */}
      <Route path="/emergency/:healthId" element={<EmergencyPublic />} />
      <Route path="/fundraiser/:slug" element={<Placeholder name="Fundraiser Campaign" />} />
      
    </Routes>
  );
};

export default App;
