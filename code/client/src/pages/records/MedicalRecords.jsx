import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Download, Clock, ChevronRight } from 'lucide-react';
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
      setRecords(res.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDownload = (e, record) => {
    e.preventDefault();
    e.stopPropagation();

    if (record.fileUrl) {
      window.open(record.fileUrl, '_blank');
      return;
    }

    const content = `MEDIBRIDGE MEDICAL REPORT\n-------------------------\nTitle: ${record.title}\nCategory: ${record.category}\nDate: ${new Date(record.recordDate || record.createdAt).toLocaleDateString()}\nHospital: ${record.hospitalName || 'Apollo Hospital'}\nDoctor: ${record.doctorName || 'Dr. Ananya Roy'}\n\nNotes:\n${record.clinicalNotes || record.description || 'Clinical observation.'}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.title.replace(/\s+/g, '_')}_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded report summary');
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all your diagnostic reports and clinical documents</p>
        </div>
        <Link 
          to="/records/upload" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Upload Record
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No records found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">You haven't uploaded or received any medical records yet.</p>
          <Link to="/records/upload" className="text-blue-600 font-medium hover:underline">
            Upload your first record
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <Link
              key={record._id}
              to={`/records/${record._id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                    {record.category?.replace('_', ' ') || 'General'}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {record.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  {record.clinicalNotes || record.description || 'Verified hospital record'}
                </p>
              </div>

              <div>
                <div className="flex items-center text-xs text-gray-400 mb-4 gap-1">
                  <Clock size={14} />
                  {new Date(record.recordDate || record.createdAt).toLocaleDateString()}
                  {record.hospitalName && <span className="ml-2 font-medium text-slate-500">• {record.hospitalName}</span>}
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <span className="flex-1 text-center py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center">
                    View Details <ChevronRight size={14} className="ml-1" />
                  </span>
                  <button
                    onClick={(e) => handleQuickDownload(e, record)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Download Report"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
