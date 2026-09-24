import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Handshake,
  Users,
  Video,
  Image,
  Calendar,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { countRows, fetchAll } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    applications: 3,
    pendingApps: 2,
    collaborations: 4,
    members: 22,
    videos: 2,
    gallery: 8,
    events: 3,
  });

  const [recentApplications, setRecentApplications] = useState([
    { id: '1', name: 'Alex M.', in_game_name: 'Apex_Ghost', driving_style: 'Drift & Tandem', created_at: new Date().toISOString(), status: 'pending' },
    { id: '2', name: 'Ryosuke T.', in_game_name: 'FC_Takahashi', driving_style: 'Mountain Touge', created_at: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'pending' },
    { id: '3', name: 'Marcus K.', in_game_name: 'Viper_Speed', driving_style: 'Drag Racing', created_at: new Date(Date.now() - 86400000).toISOString(), status: 'approved' },
  ]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [appCount, colCount, memCount, vidCount, galCount, evtCount] = await Promise.allSettled([
          countRows('applications'),
          countRows('collaboration_requests'),
          countRows('members'),
          countRows('videos'),
          countRows('gallery'),
          countRows('events'),
        ]);

        setStats((prev) => ({
          ...prev,
          applications: appCount.status === 'fulfilled' && appCount.value > 0 ? appCount.value : prev.applications,
          collaborations: colCount.status === 'fulfilled' && colCount.value > 0 ? colCount.value : prev.collaborations,
          members: memCount.status === 'fulfilled' && memCount.value > 0 ? memCount.value : prev.members,
          videos: vidCount.status === 'fulfilled' && vidCount.value > 0 ? vidCount.value : prev.videos,
          gallery: galCount.status === 'fulfilled' && galCount.value > 0 ? galCount.value : prev.gallery,
          events: evtCount.status === 'fulfilled' && evtCount.value > 0 ? evtCount.value : prev.events,
        }));

        const recent = await fetchAll('applications', { limit: 5, order: { column: 'created_at', ascending: false } });
        if (recent && recent.length > 0) {
          setRecentApplications(recent);
        }
      } catch (err) {
        console.warn('Could not load live dashboard counters:', err);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Join Applications', value: stats.applications, sub: `${stats.pendingApps} pending review`, icon: UserPlus, link: '/admin/applications', gradient: 'from-orange-500/15 to-amber-600/10', borderColor: 'rgba(249,115,22,0.3)', iconBg: 'rgba(249,115,22,0.12)' },
    { label: 'Clan Collaborations', value: stats.collaborations, sub: 'Partnership requests', icon: Handshake, link: '/admin/collaborations', gradient: 'from-blue-500/15 to-indigo-600/10', borderColor: 'rgba(59,130,246,0.3)', iconBg: 'rgba(59,130,246,0.12)' },
    { label: 'Active Roster', value: stats.members, sub: 'Registered clan pilots', icon: Users, link: '/admin/members', gradient: 'from-emerald-500/15 to-teal-600/10', borderColor: 'rgba(16,185,129,0.3)', iconBg: 'rgba(16,185,129,0.12)' },
    { label: 'Montages / Videos', value: stats.videos, sub: 'CPM media reels', icon: Video, link: '/admin/montages', gradient: 'from-purple-500/15 to-pink-600/10', borderColor: 'rgba(168,85,247,0.3)', iconBg: 'rgba(168,85,247,0.12)' },
    { label: 'Photo Archive', value: stats.gallery, sub: 'Custom livery builds', icon: Image, link: '/admin/gallery', gradient: 'from-cyan-500/15 to-blue-600/10', borderColor: 'rgba(6,182,212,0.3)', iconBg: 'rgba(6,182,212,0.12)' },
    { label: 'Meets & Events', value: stats.events, sub: 'Scheduled gatherings', icon: Calendar, link: '/admin/events', gradient: 'from-rose-500/15 to-red-600/10', borderColor: 'rgba(244,63,94,0.3)', iconBg: 'rgba(244,63,94,0.12)' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1
          className="text-3xl sm:text-4xl font-black font-heading text-white"
          style={{ letterSpacing: '0.04em' }}
        >
          Command Dashboard
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 leading-relaxed">
          Real-time summary of IDLE COUNTRY CLUB operations, incoming recruits, and content pipeline.
        </p>
      </div>

      {/* Stat Cards Grid — Spacious with bigger numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
            >
              <Link
                to={card.link}
                className={`block p-7 rounded-2xl bg-gradient-to-br ${card.gradient} transition-all group no-underline hover:-translate-y-1`}
                style={{
                  border: `1px solid ${card.borderColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                      {card.label}
                    </span>
                    <div
                      className="text-4xl sm:text-5xl font-black font-heading text-white mt-2"
                      style={{ lineHeight: 1.1 }}
                    >
                      {card.value}
                    </div>
                  </div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                    style={{
                      background: card.iconBg,
                      border: `1px solid ${card.borderColor}`,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div
                  className="pt-4 flex items-center justify-between text-sm"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-white/40 font-medium">{card.sub}</span>
                  <span className="text-[var(--color-accent)] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Manage <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Applications Table — Spacious */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl p-8"
        style={{
          background: 'rgba(15, 12, 8, 0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Recent Recruitment Submissions
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Drivers awaiting trial review or interview
            </p>
          </div>
          <Link
            to="/admin/applications"
            className="text-sm font-bold text-[var(--color-accent)] hover:underline flex items-center gap-1.5 no-underline"
          >
            View All Applications <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                className="text-white/40 uppercase tracking-wider text-xs"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <th className="pb-4 font-semibold">Applicant</th>
                <th className="pb-4 font-semibold">CPM In-Game Name</th>
                <th className="pb-4 font-semibold">Discipline</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app, idx) => (
                <tr
                  key={app.id || idx}
                  className="hover:bg-white/[0.03] transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="py-5 font-bold text-white">{app.name}</td>
                  <td className="py-5 text-white/60 font-mono text-sm">{app.in_game_name}</td>
                  <td className="py-5 text-[var(--color-accent)] font-semibold">{app.driving_style || 'General'}</td>
                  <td className="py-5">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : app.status === 'rejected'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {app.status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <Link
                      to="/admin/applications"
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors text-sm no-underline"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
