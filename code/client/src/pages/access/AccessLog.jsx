import React, { useState, useEffect } from 'react';
import { accessService } from '../../services/accessService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AccessLog = () => {
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccessData = async () => {
    try {
      setLoading(true);
      const [logsRes, sessionsRes] = await Promise.all([
        accessService.getAccessLog(),
        accessService.getActiveSessions()
      ]);
      setLogs(logsRes.data.data || []);
      setSessions(sessionsRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load access activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessData();
  }, []);

  const revoke = async (id) => {
    try {
      await accessService.revokeSession(id);
      setSessions(sessions.filter(s => s._id !== id));
      toast.success('Session revoked successfully');
      fetchAccessData();
    } catch (e) {
      toast.error('Failed to revoke session');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access & Audit Trail</h1>
          <p className="text-sm text-slate-500">Monitor who accessed your medical records and control active permissions</p>
        </div>
        <button
          onClick={fetchAccessData}
          className="flex items-center text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </button>
      </div>

      <section>
        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-slate-900">Active Doctor Sessions ({sessions.length})</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No active sessions</p>
              <p className="text-xs text-slate-400 mt-1">When you share your 4-digit PIN with a doctor, their active 24-hr session will appear here.</p>
            </div>
          ) : (
            sessions.map((s) => {
              const doctorDisplayName = s.doctorId?.firstName
                ? `Dr. ${s.doctorId.firstName} ${s.doctorId.lastName}`
                : (s.doctorName || 'Authorized Physician');
              return (
                <div key={s._id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                        Active 24hr Grant
                      </span>
                      <span className="text-xs text-slate-400">
                        Granted: {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-base">{doctorDisplayName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Expires: {new Date(s.expiresAt).toLocaleDateString()} at {new Date(s.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => revoke(s._id)}
                    className="self-start sm:self-auto bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Revoke Access Now
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Audit Log & History ({logs.length})</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          {logs.length === 0 ? (
            <p className="p-6 text-slate-500 text-center text-sm">No activity recorded yet.</p>
          ) : (
            logs.map((log) => {
              const docName = log.doctorId?.firstName 
                ? `Dr. ${log.doctorId.firstName} ${log.doctorId.lastName}`
                : (log.doctorName || 'Doctor');
              return (
                <div key={log._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-800 text-sm capitalize">
                        {log.action?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">by {docName}</span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(log.createdAt || log.timestamp).toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default AccessLog;
