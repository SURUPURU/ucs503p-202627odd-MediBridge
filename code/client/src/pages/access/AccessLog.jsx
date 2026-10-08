import React, { useState, useEffect } from 'react';
import { accessService } from '../../services/accessService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const AccessLog = () => {
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessData = async () => {
      try {
        const [logsRes, sessionsRes] = await Promise.all([
          accessService.getAccessLog(),
          accessService.getActiveSessions()
        ]);
        setLogs(logsRes.data.data || []);
        setSessions(sessionsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessData();
  }, []);

  const revoke = async (id) => {
    try {
      await accessService.revokeSession(id);
      setSessions(sessions.filter(s => s._id !== id));
      toast.success('Session revoked');
    } catch (e) {
      toast.error('Failed to revoke');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Access Log</h1>
      
      <section>
        <h2 className="text-lg font-bold mb-4">Active Sessions</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
          {sessions.length === 0 ? <p className="p-6 text-slate-500">No active sessions.</p> :
            sessions.map(s => (
              <div key={s._id} className="p-4 flex justify-between items-center">
                <div><p className="font-bold">Dr. {s.doctorName}</p><p className="text-sm text-slate-500">Expires: {new Date(s.expiresAt).toLocaleString()}</p></div>
                <button onClick={() => revoke(s._id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100">Revoke</button>
              </div>
            ))
          }
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Activity History</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
          {logs.map(log => (
            <div key={log._id} className="p-4 flex flex-col gap-1">
              <div className="flex justify-between"><p className="font-bold text-slate-800">{log.action}</p><span className="text-sm text-slate-500">{new Date(log.timestamp).toLocaleString()}</span></div>
              <p className="text-sm text-slate-600">By Dr. {log.doctorName} {log.hospitalName ? `at ${log.hospitalName}` : ''}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default AccessLog;
