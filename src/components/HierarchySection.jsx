import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Star, User, ChevronDown } from 'lucide-react';
import { useInView, useSupabaseQuery } from '../lib/hooks';
import SectionHeader from './SectionHeader';
import { SkeletonGrid } from './LoadingSkeleton';
import { fallbackMembers } from '../pages/admin/AdminMembers';

const roleConfig = {
  'Owner': { icon: Crown, color: '#FFD700', order: 1 },
  'Co-Owner': { icon: Crown, color: '#C0C0C0', order: 2 },
  'President': { icon: Shield, color: '#EF4444', order: 3 },
  'Vice President': { icon: Shield, color: '#A855F7', order: 4 },
  'Head Admin': { icon: Shield, color: '#FF6B00', order: 5 },
  'Admin': { icon: Shield, color: '#FF8533', order: 6 },
  'Moderator': { icon: Shield, color: '#3B82F6', order: 7 },
  'Elite Member': { icon: Star, color: '#A855F7', order: 8 },
  'Member': { icon: User, color: '#22C55E', order: 9 },
  'New Member': { icon: User, color: '#10B981', order: 10 },
  'Trial Member': { icon: User, color: '#6B7280', order: 11 },
};

const DEFAULT_CONFIG = { icon: User, color: '#FF7A00', order: 99 };

function MemberCard({ member, index }) {
  const [ref, inView] = useInView();
  const config = roleConfig[member?.role] || DEFAULT_CONFIG;
  const Icon = config.icon || User;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative flex flex-col items-center text-center"
    >
      {/* Avatar */}
      <div className="relative mb-3">
        <div
          className="w-20 h-20 rounded-full border-2 overflow-hidden bg-[var(--color-surface-lighter)]"
          style={{ borderColor: config?.color || '#FF7A00' }}
        >
          {member.profile_image_url ? (
            <img src={member.profile_image_url} alt={member.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--color-muted)]">
              {(member.display_name || member.cpm_username || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 p-1 rounded-full"
          style={{ backgroundColor: config?.color || '#FF7A00' }}
        >
          <Icon size={12} className="text-white" />
        </div>
      </div>

      {/* Info */}
      <h4 className="text-white font-heading font-bold text-sm">{member.display_name || member.cpm_username}</h4>
      <p className="text-xs font-medium mt-0.5" style={{ color: config?.color || '#FF7A00' }}>{member.role}</p>
      {member.cpm_username && member.display_name && (
        <p className="text-[var(--color-muted)] text-xs mt-0.5">@{member.cpm_username}</p>
      )}
    </motion.div>
  );
}

export default function HierarchySection({ preview = false }) {
  const { data: dbMembers, loading } = useSupabaseQuery('members', {
    order: { column: 'hierarchy_order', ascending: true },
  });

  const memberList = Array.isArray(dbMembers) && dbMembers.length > 0 ? dbMembers : fallbackMembers;

  // Group by role
  const grouped = {};
  const roleOrder = ['Owner', 'Co-Owner', 'President', 'Vice President', 'Head Admin', 'Admin', 'Moderator', 'Elite Member', 'Member', 'New Member', 'Trial Member'];

  if (memberList) {
    roleOrder.forEach(role => {
      const roleMembers = memberList.filter(m => m && (m.role?.toLowerCase() === role.toLowerCase() || m.role === role));
      if (roleMembers.length > 0) {
        grouped[role] = roleMembers;
      }
    });
  }

  const displayRoles = preview ? roleOrder.slice(0, 5) : roleOrder;

  return (
    <section className="py-20 sm:py-28 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          label="Organization"
          title="THE CLUB HIERARCHY."
          description="The leadership and members that make IDLE COUNTRY CLUB what it is."
        />

        {loading ? (
          <SkeletonGrid count={6} />
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-muted)]">Hierarchy will be displayed here once members are added.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {displayRoles.map((role, roleIndex) => {
              if (!grouped[role]) return null;
              const config = roleConfig[role] || DEFAULT_CONFIG;
              return (
                <div key={role}>
                  {/* Role Title */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${config?.color || '#FF7A00'}40)` }} />
                    <span
                      className="text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border"
                      style={{ color: config?.color || '#FF7A00', borderColor: `${config?.color || '#FF7A00'}30` }}
                    >
                      {role}
                    </span>
                    <div className="h-px flex-1 max-w-[100px]" style={{ backgroundImage: `linear-gradient(to left, transparent, ${config?.color || '#FF7A00'}40)` }} />
                  </div>

                  {/* Connecting line */}
                  {roleIndex < displayRoles.filter(r => grouped[r]).length - 1 && (
                    <div className="hidden sm:block w-px h-8 mx-auto bg-gradient-to-b from-[var(--color-border)] to-transparent mb-0 -mt-2" />
                  )}

                  {/* Members Grid */}
                  <div className="flex flex-wrap justify-center gap-8">
                    {grouped[role].map((member, i) => (
                      <MemberCard key={member.id} member={member} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
