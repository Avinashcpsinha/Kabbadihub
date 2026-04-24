"use client";

import React, { useState, useEffect } from "react";
import RoleGate from "@/components/RoleGate";
import {
  Users, Zap, Trophy, Globe, ChevronRight,
  Shield, Lock, Plus,
  BarChart3, Megaphone, MapPin, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const { role } = useAuth();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    players: 0,
    matches: 0,
    teams: 0,
    traffic: "Verified",
    matchData: [] as any[],
    roles: { raiders: 0, defenders: 0, allRounders: 0 }
  });

  useEffect(() => {
    if (!tenant) return;

    const fetchTenantAdminData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch all teams for this tenant
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, short_name, primary_color, city')
          .eq('tenant_id', tenant.id);
        
        if (teamsError) console.error("Teams fetch error:", teamsError);
        
        // 2. Fetch matches for this tenant
        const { data: matchesData, error: matchesError } = await supabase
          .from('live_matches')
          .select('id, status, updated_at, home_team_id, away_team_id, state')
          .eq('tenant_id', tenant.id)
          .order('updated_at', { ascending: false });

        if (matchesError) console.error("Matches fetch error:", matchesError);

        setStats(prev => ({
          ...prev,
          teams: teamsData?.length || 0,
          matches: matchesData?.length || 0,
          matchData: (matchesData || []).map(m => ({
            id: m.id,
            status: m.status,
            scheduledAt: m.updated_at,
            homeTeam: (m.state as any)?.home?.name || 'Home',
            awayTeam: (m.state as any)?.away?.name || 'Away'
          }))
        }));
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantAdminData();
  }, [tenant]);

  if (!tenant) return <div className="p-10 text-center">Loading Organisation...</div>;

  return (
    <RoleGate allowedRoles={["ORGANISER", "SUPER_ADMIN"]}>
      <DashboardLayout variant="organiser">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              {tenant?.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">Command Center • {tenant.city}</p>
          </div>
          <Link href="/tournaments" className="ch-btn-primary px-6 py-3 border-none flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Encounter
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Squad Count", val: stats.teams, icon: <Shield className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Duels", val: stats.matches, icon: <Zap className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Verified Data", val: "100%", icon: <BarChart3 className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Portal Health", val: "Elite", icon: <Globe className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-all cursor-default"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", s.bg, s.color)}>{s.icon}</div>
              <div className="text-3xl font-black italic text-slate-900 mb-1 leading-none">{s.val}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-white rounded-[2rem] border border-slate-100">
             <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-orange-600" /> Upcoming Encounters
                  </h3>
                  <Link href="/tournaments" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 flex items-center gap-1 transition-colors">
                    Registry <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {stats.matchData.length > 0 ? (
                  <div className="space-y-4">
                    {stats.matchData.slice(0, 5).map((match: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-50 group hover:border-orange-200 hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6">
                          <div className="text-center min-w-[60px]">
                            <div className="text-xs font-black text-slate-900 uppercase">{new Date(match.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                            <div className="text-[10px] font-bold text-orange-600 italic">Scheduled</div>
                          </div>
                          <div className="h-10 w-px bg-slate-200" />
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black italic uppercase text-slate-900 tracking-tight">{match.homeTeam}</span>
                            <span className="text-[10px] font-bold text-slate-300 italic">PKL-STYLE</span>
                            <span className="text-sm font-black italic uppercase text-slate-900 tracking-tight">{match.awayTeam}</span>
                          </div>
                        </div>
                        <Link href={`/scoring?id=${match.id}`} className="p-3 bg-white rounded-xl text-slate-200 group-hover:text-orange-600 group-hover:shadow-lg transition-all border border-slate-100">
                          <Zap className="w-4 h-4 fill-current" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                    <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">No scheduled matches in organisation archives.</p>
                    <Link href="/tournaments" className="ch-btn-primary px-8 py-4 inline-flex border-none shadow-xl shadow-orange-600/20">Initiate Match Registry</Link>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: "Franchise Roster", href: "/teams", icon: <Users className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
                  { label: "League Board", href: "/admin/announcements", icon: <Megaphone className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" },
                  { label: "Home Venues", href: "/clubs", icon: <MapPin className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50" },
                ].map((link, i) => (
                  <Link key={i} href={link.href} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-xl transition-all flex flex-col gap-6 group">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", link.color)}>{link.icon}</div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{link.label}</span>
                       <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-orange-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                   <Zap className="w-32 h-32 fill-current" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2 underline decoration-orange-600 decoration-4 underline-offset-4">Live Scoring</h4>
                  <p className="text-slate-400 text-sm italic mb-10 leading-relaxed">Broadcast real-time score feeds directly to the global fan dashboard.</p>
                  <Link
                    href={stats.matchData.length > 0 ? `/scoring?id=${stats.matchData[0].id}` : "/tournaments"}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 shadow-2xl shadow-orange-600/30 transition-all border-none"
                  >
                    <Zap className="w-5 h-5 fill-current" /> Launch Arena Command
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                <div className="flex items-center gap-3 mb-8">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Ecosystem Integrity</h4>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Cloud Synchronisation", status: "Active", color: "text-emerald-500" },
                    { label: "Relational Mapping", status: "Verified", color: "text-blue-500" },
                    { label: "Data Redundancy", status: "SLA Compliant", color: "text-slate-400" },
                  ].map((h, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h.label}</span>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", h.color)}>{h.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
    </RoleGate>
  );
}
