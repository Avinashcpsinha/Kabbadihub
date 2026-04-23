"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import {
  BarChart3, TrendingUp, Users, Zap, Trophy,
  Target, Activity, ArrowUpRight, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AdminAnalyticsPage() {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ 
    teams: 0, 
    players: 0, 
    matches: 0, 
    raidPoints: 0, 
    tacklePoints: 0,
    teamStats: [] as any[]
  });

  useEffect(() => {
    if (!tenant) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch teams for tenant
        const { data: teams } = await supabase
          .from('teams')
          .select('*, athletes!team_athletes(*)')
          .eq('tenant_id', tenant.id);
        
        // 2. Fetch matches for tenant
        const { count: matchesCount } = await supabase
          .from('live_matches')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        let totalPlayers = 0;
        let totalRaid = 0;
        let totalTackle = 0;
        const mappedTeams: any[] = [];

        teams?.forEach(t => {
          const players = (t as any).athletes || [];
          totalPlayers += players.length;
          
          let teamRaid = 0;
          let teamTackle = 0;
          players.forEach((p: any) => {
            teamRaid += p.raid_points || 0;
            teamTackle += p.tackle_points || 0;
          });

          totalRaid += teamRaid;
          totalTackle += teamTackle;

          mappedTeams.push({
            name: t.name,
            shortName: t.short_name,
            primaryColor: t.primary_color,
            playersCount: players.length,
            raid: teamRaid,
            tackle: teamTackle,
            total: teamRaid + teamTackle,
            avg: players.length ? ((teamRaid + teamTackle) / players.length).toFixed(1) : "0"
          });
        });

        setData({
          teams: teams?.length || 0,
          players: totalPlayers,
          matches: matchesCount || 0,
          raidPoints: totalRaid,
          tacklePoints: totalTackle,
          teamStats: mappedTeams
        });
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [tenant]);

  const mockWeeklyData = [35, 50, 28, 65, 42, 78, 55];
  const maxVal = Math.max(...mockWeeklyData);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (!tenant) return <div className="p-10 text-center">Identifying Organisation...</div>;
  if (isLoading) return <DashboardLayout variant="organiser"><div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout variant="organiser">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">Performance Intelligence</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">Real-time analytics for {tenant.name}.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Squad Depth", val: data.players, icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50", trend: "Verified" },
            { label: "Franchise Units", val: data.teams, icon: <Target className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Active" },
            { label: "Concluded Tier", val: data.matches, icon: <Trophy className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50", trend: "Secured" },
            { label: "Raid Points", val: data.raidPoints.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50", trend: "Peak" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 rotate-12 transition-transform group-hover:rotate-0">{s.icon}</div>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg, s.color)}>{s.icon}</div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {s.trend}
                </span>
              </div>
              <div className="text-3xl font-black italic text-slate-900 mb-1 leading-none">{s.val}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-orange-600" /> Tactical Activity
              </h3>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Match Volume</span>
            </div>
            <div className="flex items-end gap-4 h-[240px]">
              {mockWeeklyData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">{val}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxVal) * 100}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                    className={cn(
                      "w-full rounded-xl transition-all group-hover:scale-105",
                      i === mockWeeklyData.indexOf(maxVal) ? "bg-orange-600" : "bg-slate-100"
                    )}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
            <h3 className="text-sm font-black italic uppercase tracking-tighter mb-8 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> Strategy Profile
            </h3>
            <div className="space-y-8">
              {[
                { label: "Offensive (Raid)", val: data.raidPoints, color: "bg-orange-600", pct: data.raidPoints + data.tacklePoints > 0 ? Math.round((data.raidPoints / (data.raidPoints + data.tacklePoints)) * 100) : 50 },
                { label: "Defensive (Tackle)", val: data.tacklePoints, color: "bg-blue-600", pct: data.raidPoints + data.tacklePoints > 0 ? Math.round((data.tacklePoints / (data.raidPoints + data.tacklePoints)) * 100) : 50 },
              ].map((bar, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{bar.label}</span>
                    <span className="text-sm font-black italic text-slate-900 tabular-nums">{bar.val.toLocaleString()}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${bar.pct}%` }} transition={{ delay: 0.5, duration: 0.8 }}
                      className={cn("h-full rounded-full shadow-lg", bar.color)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                <div className="text-4xl font-black italic text-slate-900 tabular-nums mb-1">
                  {(data.raidPoints + data.tacklePoints).toLocaleString()}
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Competitive Points</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 overflow-hidden">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Unit Performance Index
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Squad Name", "Units", "Raid", "Tackle", "Aggregate", "P.P.A."].map(h => (
                    <th key={h} className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.teamStats.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover:rotate-6 transition-transform" style={{ backgroundColor: t.primaryColor || "#f97316" }}>{t.shortName}</div>
                        <span className="text-sm font-black italic uppercase text-slate-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-6 pr-6 text-sm font-bold text-slate-600 tabular-nums">{t.playersCount}</td>
                    <td className="py-6 pr-6 text-sm font-bold text-orange-600 tabular-nums">{t.raid}</td>
                    <td className="py-6 pr-6 text-sm font-bold text-blue-600 tabular-nums">{t.tackle}</td>
                    <td className="py-6 pr-6 text-sm font-black text-slate-900 tabular-nums">{t.total}</td>
                    <td className="py-6"><span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black italic border border-emerald-100">{t.avg}</span></td>
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
