import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Download, Clock } from 'lucide-react';
import { recordService } from '../../services/recordService';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await recordService.getRecords();
      setRecords(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><span className="text-gray-500">Loading records...</span></div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all your health documents</p>
        </div>
        <Link 
          to="/records/upload" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Upload Record
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No records found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">You haven't uploaded any medical records yet.</p>
          <Link to="/records/upload" className="text-blue-600 font-medium hover:underline">
            Upload your first record
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {record.category || 'General'}
                </span>
              </div>
              
              <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{record.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{record.description || 'No description provided'}</p>
              
              <div className="flex items-center text-xs text-gray-400 mb-4 gap-1">
                <Clock size={14} />
                {new Date(record.recordDate || record.createdAt).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                <a 
                  href={record.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex justify-center items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download size={16} />
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
