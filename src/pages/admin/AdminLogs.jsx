import { useState } from 'react';
import { Shield, Clock, FileText, UserCheck, AlertCircle } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';

export default function AdminLogs() {
  const { data: dbLogs } = useSupabaseQuery('admin_activity_logs', {
    order: { column: 'created_at', ascending: false },
  });

  const logs = dbLogs || [];

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
          Admin Audit & Activity Logs
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
          Historical record of all administrative operations, roster adjustments, and site configuration changes.
        </p>
      </div>

      <div
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(16, 12, 8, 0.85)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <thead>
              <tr
                className="text-white/60 uppercase tracking-wider text-xs sm:text-sm font-extrabold"
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  borderBottom: '1.5px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Action</th>
                <th className="px-8 py-5">Administrator</th>
                <th className="px-8 py-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <Shield className="mx-auto mb-3 text-white/20" size={36} />
                    <p className="text-white/40 text-sm font-semibold tracking-wide">No activity logged yet.</p>
                    <p className="text-white/25 text-xs mt-1">Admin actions will appear here automatically.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-8 py-6 text-white/60 font-mono text-xs sm:text-sm whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-mono font-black tracking-wider bg-white/10 text-amber-400 border border-white/10">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-white text-base sm:text-lg">{log.admin_name || 'System Admin'}</td>
                    <td className="px-8 py-6 text-white/80 leading-relaxed text-sm sm:text-base">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
