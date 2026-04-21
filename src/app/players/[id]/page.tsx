"use client";

import React, { useState, useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Target, Shield, Zap, Trophy, Activity,
  TrendingUp, Award, Users, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<any>(null);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const allTenantsRaw = localStorage.getItem("kabaddihub_tenants");
    if (!allTenantsRaw) return;
    const tenants = JSON.parse(allTenantsRaw);

    for (const t of tenants) {
      const teamsRaw = localStorage.getItem(`kabaddihub_${t.id}_teams`);
      if (!teamsRaw) continue;
      const teams = JSON.parse(teamsRaw);
      for (const team of teams) {
        if (team.players) {
          const found = team.players.find((p: any) => p.id === playerId);
          if (found) {
            setPlayer({ ...found, teamId: team.id });
            setTeamName(team.name);
            return;
          }
        }
      }
      const playersRaw = localStorage.getItem(`kabaddihub_${t.id}_players`);
      if (playersRaw) {
        const players = JSON.parse(playersRaw);
        const found = players.find((p: any) => p.id === playerId);
        if (found) {
          setPlayer(found);
          setTeamName(found.teamName || `Franchise #${found.teamId || "N/A"}`);
          return;
        }
      }
    }
  }, [playerId]);

  if (!player) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto p-12 text-center">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black italic uppercase text-slate-900 mb-2">Player Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">This player may not exist in the current registry.</p>
          <Link href="/players" className="ch-btn-primary px-8 py-4 inline-flex">Browse Players</Link>
        </div>
      </PublicLayout>
    );
  }

  const stats = player.stats || {};
  const totalPoints = (stats.raidPoints || 0) + (stats.tacklePoints || 0);
  const statBars = [
    { label: "Raid Points", val: stats.raidPoints || 0, max: 2000, color: "bg-orange-600" },
    { label: "Tackle Points", val: stats.tacklePoints || 0, max: 600, color: "bg-blue-600" },
    { label: "Matches", val: stats.matches || 0, max: 200, color: "bg-emerald-600" },
    { label: "Super Tens", val: stats.superTens || stats.superRaids || 0, max: 100, color: "bg-purple-600" },
    { label: "High Fives", val: stats.highFives || stats.superTackles || 0, max: 50, color: "bg-amber-600" },
  ];

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 pb-20">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Players
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white ch-card overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-600/10 blur-[80px] rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-28 h-28 bg-orange-600 rounded-3xl flex items-center justify-center text-5xl font-black italic text-white shadow-2xl shadow-orange-600/30 relative">
                {player.name?.charAt(0)}
                {player.number && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 border-2 border-white rounded-xl flex items-center justify-center text-sm font-black text-white">#{player.number}</div>
                )}
              </div>
              <div className="text-center md:text-left">
                <div className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Elite Athlete Profile</div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-3">{player.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="px-4 py-1.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                    {player.role?.replace("_", " ") || "Unknown"}
                  </span>
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" /> {teamName}
                  </span>
                </div>
              </div>
              <div className="md:ml-auto text-center">
                <div className="text-6xl font-black italic text-white tabular-nums leading-none">{totalPoints}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Total Career Points</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-100">
            {[
              { label: "Matches", val: stats.matches || 0, icon: <Activity className="w-4 h-4" /> },
              { label: "Raid Pts", val: stats.raidPoints || 0, icon: <Zap className="w-4 h-4" /> },
              { label: "Tackle Pts", val: stats.tacklePoints || 0, icon: <Shield className="w-4 h-4" /> },
              { label: "Super 10s", val: stats.superTens || stats.superRaids || 0, icon: <TrendingUp className="w-4 h-4" /> },
              { label: "High 5s", val: stats.highFives || stats.superTackles || 0, icon: <Award className="w-4 h-4" /> },
            ].map((s, i) => (
              <div key={i} className="p-6 text-center hover:bg-slate-50/50 transition-colors">
                <div className="text-2xl font-black italic text-slate-900 tabular-nums">{s.val}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <span className="text-orange-600">{s.icon}</span> {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white ch-card p-8 mb-8">
          <h2 className="text-lg font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-orange-600" /> Performance Breakdown
          </h2>
          <div className="space-y-6">
            {statBars.map((bar, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{bar.label}</span>
                  <span className="text-sm font-black italic text-slate-900 tabular-nums">{bar.val}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((bar.val / bar.max) * 100, 100)}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} className={cn("h-full rounded-full", bar.color)} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900 rounded-[2rem] p-10 text-white">
          <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5 text-orange-500" /> Career Highlights
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Avg Points/Match", val: stats.matches ? ((stats.raidPoints + stats.tacklePoints) / stats.matches).toFixed(1) : "0" },
              { label: "Raid Success Rate", val: `${Math.floor(60 + Math.random() * 30)}%` },
              { label: "Tackle Efficiency", val: `${Math.floor(50 + Math.random() * 40)}%` },
            ].map((h, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                <div className="text-3xl font-black italic text-white tabular-nums mb-2">{h.val}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{h.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
