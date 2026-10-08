import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorService.getMyPatients().then(res => {
      setPatients(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Patients</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
        {patients.length === 0 ? <p className="p-8 text-center text-slate-500">No patients found</p> : 
          patients.map((p, i) => (
            <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50">
              <div><p className="font-bold">{p.firstName} {p.lastName}</p><p className="text-sm text-slate-500">ID: {p.healthId}</p></div>
            </div>
          ))
        }
      </div>
    </div>
  );
};
export default MyPatients;
