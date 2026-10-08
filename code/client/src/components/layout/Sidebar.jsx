import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Hospital, FileText, HeartPulse, UserCircle, AlertCircle, CreditCard, Clock, Search, Users, Calendar } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuthStore();

  const patientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hospitals', icon: Hospital, label: 'Hospitals' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/records', icon: FileText, label: 'Medical Records' },
    { to: '/prescriptions', icon: HeartPulse, label: 'Prescriptions' },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
    { to: '/profile/emergency', icon: AlertCircle, label: 'Emergency Info' },
    { to: '/financial/apply', icon: CreditCard, label: 'Financial' },
    { to: '/access-log', icon: Clock, label: 'Access Log' }
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/find-patient', icon: Search, label: 'Find Patient' },
    { to: '/doctor/my-patients', icon: Users, label: 'My Patients' },
    { to: '/profile', icon: UserCircle, label: 'Profile' }
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} pt-16`}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink 
                to={link.to} 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg hover:bg-slate-800 transition ${isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`
                }
              >
                <link.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
