import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doctorService } from '../../services/doctorService';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const WritePrescription = () => {
  const { healthId } = useParams();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  const updateMedicine = (i, field, val) => {
    const newMeds = [...medicines];
    newMeds[i][field] = val;
    setMedicines(newMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await doctorService.writePrescription(healthId, { medicines });
      toast.success('Prescription saved');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error('Failed to save prescription');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Write Prescription</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
           <h2 className="text-lg font-bold">Medicines</h2>
           <button type="button" onClick={addMedicine} className="flex items-center text-blue-600 font-medium"><Plus className="w-4 h-4 mr-1"/> Add</button>
        </div>
        {medicines.map((m, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
             <input placeholder="Name" className="border p-2 rounded" value={m.name} onChange={e=>updateMedicine(i, 'name', e.target.value)} required />
             <input placeholder="Dosage (e.g. 500mg)" className="border p-2 rounded" value={m.dosage} onChange={e=>updateMedicine(i, 'dosage', e.target.value)} required />
             <input placeholder="Frequency (1-0-1)" className="border p-2 rounded" value={m.frequency} onChange={e=>updateMedicine(i, 'frequency', e.target.value)} required />
             <input placeholder="Duration (days)" type="number" className="border p-2 rounded" value={m.duration} onChange={e=>updateMedicine(i, 'duration', e.target.value)} required />
          </div>
        ))}
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium">Issue Prescription</button>
      </form>
    </div>
  );
};
export default WritePrescription;
