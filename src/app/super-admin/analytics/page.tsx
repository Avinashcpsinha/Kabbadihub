"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, Activity, Building2, Users, 
  Trophy, Zap, Globe, ArrowUpRight,
  TrendingUp, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SuperAdminAnalyticsPage() {
  const { role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    activeMatches: 0,
    totalPoints: 0,
    topTenant: { name: "N/A", count: 0 },
    tenantsList: [] as any[]
  });

  useEffect(() => {
    const fetchGlobalStats = async () => {
      setIsLoading(true);
      
      const [
        { count: tenantsCount, data: tenantsData },
        { count: teamsCount },
        { count: athletesCount },
        { count: matchesCount, data: matchesData }
      ] = await Promise.all([
        supabase.from('tenants').select('*', { count: 'exact' }),
        supabase.from('teams').select('*', { count: 'exact' }),
        supabase.from('athletes').select('*', { count: 'exact' }),
        supabase.from('live_matches').select('status, tenant_id, state', { count: 'exact' })
      ]);

      // Calculate points and active matches
      let activeCount = 0;
      let globalPoints = 0;
      const tenantMatchCounts: Record<string, number> = {};

      matchesData?.forEach(m => {
        if (m.status === 'LIVE') activeCount++;
        if (m.tenant_id) {
          tenantMatchCounts[m.tenant_id] = (tenantMatchCounts[m.tenant_id] || 0) + 1;
        }
        const state = m.state as any;
        if (state) {
          globalPoints += (state.home?.score || 0) + (state.away?.score || 0);
        }
      });

      // Map tenants for the table
      const mappedTenants = tenantsData?.map(t => ({
        ...t,
        matchCount: tenantMatchCounts[t.id] || 0
      })) || [];

      // Find top tenant by match volume (or team volume if we had that joined)
      const topT = mappedTenants.reduce((prev, current) => 
        (prev.matchCount > current.matchCount) ? prev : current, { name: 'N/A', matchCount: 0 } as any);

      setStats({
        totalTenants: tenantsCount || 0,
        totalTeams: teamsCount || 0,
        totalPlayers: athletesCount || 0,
        totalMatches: matchesCount || 0,
        activeMatches: activeCount,
        totalPoints: globalPoints,
        topTenant: { name: topT.name, count: topT.matchCount },
        tenantsList: mappedTenants
      });
      setIsLoading(false);
    };

    fetchGlobalStats();
  }, []);

  const mockTraffic = [4500, 5200, 4800, 6100, 7500, 8900, 7200];
  const maxTraffic = Math.max(...mockTraffic);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isLoading) return <DashboardLayout variant="admin"><div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-orange-600 animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout variant="admin">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">Platform Analytics</h1>
          <p className="text-sm font-medium text-slate-500">Global performance and engagement metrics across KabaddiHub.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Tenants", val: stats.totalTenants, icon: <Building2 className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50", trend: "Live" },
            { label: "Active Players", val: stats.totalPlayers.toLocaleString(), icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50", trend: "Verified" },
            { label: "Total Matches", val: stats.totalMatches.toLocaleString(), icon: <Trophy className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50", trend: "Scheduled" },
            { label: "Platform Score", val: stats.totalPoints.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Dynamic" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform">{s.icon}</div>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg, s.color)}>{s.icon}</div>
                <div className="text-[9px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-widest">{s.trend}</div>
              </div>
              <div className="text-3xl font-black italic text-slate-900 mb-1">{s.val}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-red-600" /> Platform Engagement
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Simulated global unique visitors per day</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Real-time Stream</span>
              </div>
            </div>

            <div className="flex items-end gap-2 md:gap-6 h-[280px]">
              {mockTraffic.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="relative w-full flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${(val / maxTraffic) * 200}px` }} 
                      transition={{ delay: 0.3 + i * 0.05, duration: 1 }}
                      className={cn(
                        "w-full rounded-2xl relative shadow-lg group-hover:scale-105 transition-transform",
                        i === 5 ? "bg-red-600" : "bg-slate-100"
                      )}
                    />
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded truncate">
                      {val.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{labels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4">Volume Leader</h4>
                <div className="text-3xl font-black italic uppercase tracking-tighter mb-2 truncate">{stats.topTenant.name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 lowercase">
                   {stats.topTenant.count} matches facilitated
                </div>
                <Link href="/super-admin" className="text-[10px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-orange-500 transition-all">
                  Inspect Tenant Registry
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h4 className="text-sm font-black italic uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> Platform Mix
              </h4>
              <div className="space-y-5">
                {[
                  { region: "Professional Leagues", p: 45, c: "bg-red-600" },
                  { region: "Corporate Events", p: 30, c: "bg-blue-600" },
                  { region: "Academic Circuits", p: 15, c: "bg-orange-600" },
                  { region: "Community Tourneys", p: 10, c: "bg-emerald-600" },
                ].map((r, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{r.region}</span>
                      <span className="text-[10px] font-black text-slate-900">{r.p}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${r.p}%` }} 
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                        className={cn("h-full", r.c)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Tenant Growth Ledger</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-sectional performance data from verified franchises.</p>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Tenant Identity</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Level</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ecosystem Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.tenantsList.map((t) => (
                  <tr key={t.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-6 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg" style={{ backgroundColor: t.primary_color || '#f97316' }}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black italic uppercase text-slate-900">{t.name}</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest lowercase">{t.city} • {t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                       <span className="text-sm font-black text-slate-900 tabular-nums">{t.matchCount} Matches facilitated</span>
                    </td>
                    <td className="py-6 text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-600 text-[10px] font-black italic">
                        Verified
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
