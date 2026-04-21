"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import {
  BarChart3, TrendingUp, Users, Zap, Trophy,
  Target, Calendar, Activity, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalyticsPage() {
  const { tenant } = useTenant();
  const [data, setData] = useState({ teams: 0, players: 0, matches: 0, liveMatches: 0, raidPoints: 0, tacklePoints: 0 });

  useEffect(() => {
    if (!tenant) return;
    const teamsRaw = localStorage.getItem(`kabaddihub_${tenant.id}_teams`);
    const matchesRaw = localStorage.getItem(`kabaddihub_${tenant.id}_matches`);
    const teams = teamsRaw ? JSON.parse(teamsRaw) : [];
    const matches = matchesRaw ? JSON.parse(matchesRaw) : [];

    let totalPlayers = 0, totalRaid = 0, totalTackle = 0;
    teams.forEach((t: any) => {
      totalPlayers += t.players?.length || 0;
      t.players?.forEach((p: any) => {
        totalRaid += p.stats?.raidPoints || 0;
        totalTackle += p.stats?.tacklePoints || 0;
      });
    });

    setData({
      teams: teams.length,
      players: totalPlayers,
      matches: matches.length,
      liveMatches: matches.filter((m: any) => m.status === "LIVE").length,
      raidPoints: totalRaid,
      tacklePoints: totalTackle,
    });
  }, [tenant]);

  const mockWeeklyData = [35, 50, 28, 65, 42, 78, 55];
  const maxVal = Math.max(...mockWeeklyData);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <DashboardLayout variant="organiser">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">Analytics</h1>
          <p className="text-sm font-medium text-slate-500">Performance insights for {tenant?.name || "your organization"}.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Players", val: data.players, icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
            { label: "Total Teams", val: data.teams, icon: <Target className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2" },
            { label: "Matches Played", val: data.matches, icon: <Trophy className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50", trend: "+8" },
            { label: "Raid Points Total", val: data.raidPoints.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50", trend: "+340" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg, s.color)}>{s.icon}</div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {s.trend}
                </span>
              </div>
              <div className="text-3xl font-black italic text-slate-900 mb-1">{s.val}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Match Activity Chart */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-orange-600" /> Weekly Match Activity
              </h3>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">This Week</span>
            </div>
            <div className="flex items-end gap-4 h-[240px]">
              {mockWeeklyData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 tabular-nums">{val}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxVal) * 100}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                    className={cn(
                      "w-full rounded-xl min-h-[8px]",
                      i === mockWeeklyData.indexOf(maxVal) ? "bg-orange-600" : "bg-slate-200"
                    )}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sport Breakdown */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-sm font-black italic uppercase tracking-tighter mb-8 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> Points Distribution
            </h3>
            <div className="space-y-6">
              {[
                { label: "Raid Points", val: data.raidPoints, color: "bg-orange-600", pct: data.raidPoints + data.tacklePoints > 0 ? Math.round((data.raidPoints / (data.raidPoints + data.tacklePoints)) * 100) : 50 },
                { label: "Tackle Points", val: data.tacklePoints, color: "bg-blue-600", pct: data.raidPoints + data.tacklePoints > 0 ? Math.round((data.tacklePoints / (data.raidPoints + data.tacklePoints)) * 100) : 50 },
              ].map((bar, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{bar.label}</span>
                    <span className="text-sm font-black italic text-slate-900 tabular-nums">{bar.val.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${bar.pct}%` }} transition={{ delay: 0.5, duration: 0.8 }}
                      className={cn("h-full rounded-full", bar.color)} />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-[8px] font-black text-slate-400">{bar.pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-center">
                <div className="text-4xl font-black italic text-slate-900 tabular-nums mb-1">
                  {(data.raidPoints + data.tacklePoints).toLocaleString()}
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Combined Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <h3 className="text-lg font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Team Performance Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Team", "Players", "Raid Pts", "Tackle Pts", "Total", "Avg/Player"].map(h => (
                    <th key={h} className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(() => {
                  if (!tenant) return null;
                  const teamsRaw = localStorage.getItem(`kabaddihub_${tenant.id}_teams`);
                  if (!teamsRaw) return null;
                  const teams = JSON.parse(teamsRaw);
                  return teams.map((t: any, i: number) => {
                    const raid = t.players?.reduce((s: number, p: any) => s + (p.stats?.raidPoints || 0), 0) || 0;
                    const tackle = t.players?.reduce((s: number, p: any) => s + (p.stats?.tacklePoints || 0), 0) || 0;
                    const total = raid + tackle;
                    const avg = t.players?.length ? (total / t.players.length).toFixed(1) : "0";
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: t.primaryColor || "#f97316" }}>{t.shortName}</div>
                            <span className="text-sm font-black italic uppercase text-slate-900">{t.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-6 text-sm font-bold text-slate-600 tabular-nums">{t.players?.length || 0}</td>
                        <td className="py-4 pr-6 text-sm font-bold text-orange-600 tabular-nums">{raid}</td>
                        <td className="py-4 pr-6 text-sm font-bold text-blue-600 tabular-nums">{tackle}</td>
                        <td className="py-4 pr-6 text-sm font-black text-slate-900 tabular-nums">{total}</td>
                        <td className="py-4 text-sm font-bold text-slate-500 tabular-nums">{avg}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
