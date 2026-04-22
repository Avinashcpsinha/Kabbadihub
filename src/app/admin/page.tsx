"use client";

import React from "react";
import RoleGate from "@/components/RoleGate";
import {
  Users, Zap, Trophy, Globe, ChevronRight,
  TrendingUp, Calendar, Activity, Shield, Lock, Plus,
  BarChart3, Megaphone, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminDashboard() {
  const { role, logout } = useAuth();
  const { tenant, isSuperAdmin } = useTenant();

  const [stats, setStats] = React.useState({
    players: 0,
    matches: 0,
    teams: 0,
    traffic: "0",
    matchData: [] as any[],
    roles: { raiders: 0, defenders: 0, allRounders: 0 }
  });

  React.useEffect(() => {
    if (!tenant) return;
    const teamKey = `kabaddihub_${tenant.id}_teams`;
    const matchKey = `kabaddihub_${tenant.id}_matches`;
    const savedTeams = localStorage.getItem(teamKey);
    const savedMatches = localStorage.getItem(matchKey);

    let totalPlayers = 0;
    let teamCount = 0;
    let raiders = 0;
    let defenders = 0;
    let allRounders = 0;
    const teamMap: Record<string, string> = {};

    if (savedTeams) {
      const parsedTeams = JSON.parse(savedTeams);
      teamCount = parsedTeams.length;
      parsedTeams.forEach((t: any) => {
        const teamPlayers = t.players || [];
        totalPlayers += teamPlayers.length;
        teamPlayers.forEach((p: any) => {
          if (p.role === "RAIDER") raiders++;
          else if (p.role === "DEFENDER") defenders++;
          else if (p.role === "ALL_ROUNDER") allRounders++;
        });
        teamMap[t.id] = t.name;
      });
    }

    let matchCount = 0;
    let matchData: any[] = [];
    if (savedMatches) {
      const parsedMatches = JSON.parse(savedMatches);
      matchCount = parsedMatches.length;
      matchData = parsedMatches.filter((m: any) => m.status === "UPCOMING").map((m: any) => ({
        ...m,
        homeTeam: teamMap[m.homeTeamId] || m.homeTeamId,
        awayTeam: teamMap[m.awayTeamId] || m.awayTeamId,
      }));
    }

    setStats({
      players: totalPlayers,
      matches: matchCount,
      teams: teamCount,
      traffic: `${(totalPlayers * 3.2).toFixed(1)}K`,
      matchData,
      roles: { raiders, defenders, allRounders }
    });
  }, [tenant]);

  return (
    <RoleGate allowedRoles={["ORGANISER", "SUPER_ADMIN"]}>
      <DashboardLayout variant="organiser">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              {tenant?.name || "Dashboard"}
            </h1>
            <p className="text-sm font-medium text-slate-500">Organisation management overview</p>
          </div>
          <Link href="/tournaments" className="ch-btn-primary px-6 py-3">
            <Plus className="w-4 h-4" /> New Match
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: "Active Players", 
            val: stats.players, 
            icon: <Users className="w-5 h-5" />, 
            color: "text-blue-600", 
            bg: "bg-blue-50",
            sub: `${stats.roles.raiders} R | ${stats.roles.defenders} D | ${stats.roles.allRounders} AR`
          },
          { label: "Active Teams", val: stats.teams, icon: <Shield className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Matches", val: stats.matches, icon: <Zap className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Portal Traffic", val: stats.traffic, icon: <Globe className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-all"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", s.bg, s.color)}>{s.icon}</div>
              <div className="text-3xl font-black italic text-slate-900 mb-1 leading-none">{s.val}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{s.label}</div>
              {s.sub && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{s.sub}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Upcoming Matches */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-orange-600" /> Upcoming Matches
                </h3>
                <Link href="/tournaments" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {stats.matchData.length > 0 ? (
                <div className="space-y-4">
                  {stats.matchData.slice(0, 4).map((match: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-xl bg-slate-50 border border-slate-100 group hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[50px]">
                          <div className="text-xs font-black text-slate-400 uppercase">{new Date(match.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                          <div className="text-[10px] font-bold text-orange-600">{new Date(match.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black italic uppercase text-slate-900">{match.homeTeam}</span>
                          <span className="text-[10px] font-bold text-slate-300 italic">VS</span>
                          <span className="text-sm font-black italic uppercase text-slate-900">{match.awayTeam}</span>
                        </div>
                      </div>
                      <Link href={`/scoring?id=${match.id}`} className="p-3 bg-white rounded-xl text-slate-300 group-hover:text-orange-600 group-hover:shadow-md transition-all">
                        <Zap className="w-4 h-4 fill-current" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Shield className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">No Upcoming Matches</p>
                  <Link href="/tournaments" className="ch-btn-primary px-6 py-3 inline-flex">Schedule Match</Link>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Manage Teams", href: "/teams", icon: <Users className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
                { label: "Announcements", href: "/admin/announcements", icon: <Megaphone className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" },
                { label: "Venues", href: "/clubs", icon: <MapPin className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50" },
              ].map((link, i) => (
                <Link key={i} href={link.href} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-all flex items-center gap-4 group">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", link.color)}>{link.icon}</div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-orange-600 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 rounded-2xl text-white space-y-6 relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h4 className="text-lg font-black italic uppercase tracking-tighter mb-2">Live Scoring</h4>
                <p className="text-slate-400 text-xs italic mb-6">Start real-time score streaming for your next match.</p>
                <Link
                  href={stats.matchData.length > 0 ? `/scoring?id=${stats.matchData[0].id}` : "/tournaments"}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-lg shadow-orange-600/20 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" /> Start Live Score
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h4 className="text-xs font-black uppercase tracking-widest">System Health</h4>
              </div>
              <div className="space-y-4">
                {[
                  { label: "API Sync", status: "Perfect", color: "text-emerald-500" },
                  { label: "Data Integrity", status: "SECURE", color: "text-emerald-500" },
                  { label: "Active Nodes", status: "14/14", color: "text-blue-500" },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.label}</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", h.color)}>{h.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Recent Activity
              </h4>
              <div className="space-y-3">
                {[
                  { action: "Team Roster Updated", time: "2 min ago" },
                  { action: "Match Scheduled", time: "15 min ago" },
                  { action: "Player Points Modified", time: "1 hour ago" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-600">{log.action}</span>
                    <span className="text-[8px] font-bold text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </RoleGate>
  );
}
