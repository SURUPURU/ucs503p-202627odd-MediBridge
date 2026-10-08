import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doctorService } from '../../services/doctorService';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

const AddRecord = () => {
  const { healthId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', category: 'General', clinicalNotes: '' });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (file) data.append('file', file);
    try {
      await doctorService.addRecord(healthId, data);
      toast.success('Record added successfully');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error('Failed to add record');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Patient Record</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        <div><label className="block mb-1 font-medium">Title</label><input type="text" className="w-full border p-2 rounded-lg" onChange={e=>setFormData({...formData, title:e.target.value})} required/></div>
        <div><label className="block mb-1 font-medium">Category</label><select className="w-full border p-2 rounded-lg" onChange={e=>setFormData({...formData, category:e.target.value})}><option>General</option><option>Lab Reports</option></select></div>
        <div><label className="block mb-1 font-medium">Clinical Notes</label><textarea className="w-full border p-2 rounded-lg" rows="4" onChange={e=>setFormData({...formData, clinicalNotes:e.target.value})}></textarea></div>
        <div><label className="block mb-1 font-medium">Attach File (Optional)</label><FileUpload onFileSelect={setFile} selectedFile={file} /></div>
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium">Save Record</button>
      </form>
    </div>
  );
};
export default AddRecord;
