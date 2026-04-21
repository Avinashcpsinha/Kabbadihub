"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, PieChart, Activity, Building2, Users, 
  Trophy, TrendingUp, Zap, Globe, ArrowUpRight,
  TrendingDown, Percent
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SuperAdminAnalyticsPage() {
  const { tenants } = useTenant();
  const { role } = useAuth();
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    activeMatches: 0,
    totalRaidPoints: 0,
    topTenant: { name: "N/A", count: 0 }
  });

  useEffect(() => {
    let teamsCount = 0, playersCount = 0, matchesCount = 0, activeMatchesCount = 0, pointsCount = 0;
    let maxTeams = -1, topTName = "N/A";

    tenants.forEach(t => {
      const teamsRaw = localStorage.getItem(`kabaddihub_${t.id}_teams`);
      const matchesRaw = localStorage.getItem(`kabaddihub_${t.id}_matches`);
      const tTeams = teamsRaw ? JSON.parse(teamsRaw) : [];
      const tMatches = matchesRaw ? JSON.parse(matchesRaw) : [];

      teamsCount += tTeams.length;
      if (tTeams.length > maxTeams) {
        maxTeams = tTeams.length;
        topTName = t.name;
      }

      tTeams.forEach((tm: any) => {
        playersCount += (tm.players?.length || 0);
        tm.players?.forEach((p: any) => {
          pointsCount += (p.stats?.raidPoints || 0) + (p.stats?.tacklePoints || 0);
        });
      });

      matchesCount += tMatches.length;
      activeMatchesCount += tMatches.filter((m: any) => m.status === "LIVE").length;
    });

    setStats({
      totalTenants: tenants.length,
      totalTeams: teamsCount,
      totalPlayers: playersCount,
      totalMatches: matchesCount,
      activeMatches: activeMatchesCount,
      totalRaidPoints: pointsCount,
      topTenant: { name: topTName, count: maxTeams }
    });
  }, [tenants]);

  const mockTraffic = [4500, 5200, 4800, 6100, 7500, 8900, 7200];
  const maxTraffic = Math.max(...mockTraffic);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <DashboardLayout variant="admin">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">Platform Analytics</h1>
          <p className="text-sm font-medium text-slate-500">Global performance and engagement metrics across KabaddiHub.</p>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Tenants", val: stats.totalTenants, icon: <Building2 className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50", trend: "+2" },
            { label: "Active Players", val: stats.totalPlayers.toLocaleString(), icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50", trend: "+148" },
            { label: "Total Matches", val: stats.totalMatches.toLocaleString(), icon: <Trophy className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50", trend: "+12%" },
            { label: "Points Logged", val: stats.totalRaidPoints.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", trend: "High" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg, s.color)}>{s.icon}</div>
                <div className="text-[9px] font-black text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {s.trend}</div>
              </div>
              <div className="text-3xl font-black italic text-slate-900 mb-1">{s.val}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-red-600" /> Platform Traffic
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global unique visitors per day</p>
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

          {/* Leaderboard Small */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4">Leading Tenant</h4>
                <div className="text-3xl font-black italic uppercase tracking-tighter mb-2">{stats.topTenant.name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                  <Building2 className="w-4 h-4" /> {stats.topTenant.count} Teams Registered
                </div>
                <Link href="/super-admin" className="text-[10px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-red-500 transition-all">
                  Inspect Tenant Registry
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h4 className="text-sm font-black italic uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> Regional Share
              </h4>
              <div className="space-y-5">
                {[
                  { region: "North India", p: 45, c: "bg-red-600" },
                  { region: "South India", p: 30, c: "bg-blue-600" },
                  { region: "West India", p: 15, c: "bg-orange-600" },
                  { region: "East India", p: 10, c: "bg-emerald-600" },
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

        {/* Full Tenant Performance Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Tenant Growth Ledger</h3>
            <button className="ch-btn-outline px-6 py-3">Download Global CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Tenant</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Creation Date</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Matches</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Growth</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenants.map((t, i) => {
                  const matchesRaw = localStorage.getItem(`kabaddihub_${t.id}_matches`);
                  const mCount = matchesRaw ? JSON.parse(matchesRaw).length : 0;
                  return (
                    <tr key={t.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-6 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg" style={{ backgroundColor: t.primaryColor }}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-black italic uppercase text-slate-900">{t.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-sm font-bold text-slate-500 tabular-nums">Jan 21, 2026</td>
                      <td className="py-6 text-sm font-black text-slate-900 tabular-nums">{mCount}</td>
                      <td className="py-6">
                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black italic">
                          <TrendingUp className="w-3 h-3" /> +{(Math.random() * 20).toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-600 text-[10px] font-black italic">
                          98.4 / 100
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
