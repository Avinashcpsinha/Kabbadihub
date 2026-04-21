"use client";

import React from "react";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Calendar, Users, Activity, Zap, ChevronRight,
  Target, Star, TrendingUp, Eye, Shield, Heart,
  MapPin, Award
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function UserDashboardPage() {
  const { currentUser, role, updateUser } = useAuth();
  const router = useRouter();
  const [recentMatches, setRecentMatches] = React.useState<any[]>([]);
  const [followedTeams, setFollowedTeams] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (role === "PUBLIC") {
      router.push("/login");
      return;
    }

    // Aggregate matches from all tenants
    const allTenantsRaw = localStorage.getItem("kabaddihub_tenants");
    if (allTenantsRaw) {
      const tenants = JSON.parse(allTenantsRaw);
      let allMatches: any[] = [];
      let allTeams: any[] = [];
      tenants.forEach((t: any) => {
        const m = localStorage.getItem(`kabaddihub_${t.id}_matches`);
        const tm = localStorage.getItem(`kabaddihub_${t.id}_teams`);
        if (m) allMatches = [...allMatches, ...JSON.parse(m).map((match: any) => ({ ...match, tenantName: t.name }))];
        if (tm) allTeams = [...allTeams, ...JSON.parse(tm)];
      });
      setRecentMatches(allMatches.slice(0, 5));

      // Get followed teams
      if (currentUser?.followedTeams?.length) {
        const followed = allTeams.filter(t => currentUser.followedTeams.includes(t.id));
        setFollowedTeams(followed);
      }
    }
  }, [role, router, currentUser]);

  if (!currentUser) return null;

  const DashboardContent = (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-10 pb-20">
      {/* Athlete Onboarding / Status Card */}
      {currentUser.position && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-orange-600/20"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
             <Trophy className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                   <Target className="w-10 h-10 text-white" />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-200 mb-2">Professional Athlete Profile</div>
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">Ready for Selection</h2>
                   <p className="text-sm font-medium text-orange-100 max-w-sm">Your profile is now visible to league scouts. Keep your stats updated to increase your selection chances.</p>
                </div>
             </div>
             <div className="flex gap-4 w-full md:w-auto">
                <Link href="/user/profile" className="flex-1 md:flex-none px-8 py-4 bg-white text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-center">
                   Update Experience
                </Link>
                <button className="flex-1 md:flex-none px-8 py-4 bg-slate-900/50 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">
                   View Scouting Log
                </button>
             </div>
          </div>
        </motion.div>
      )}

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center text-4xl font-black italic shadow-2xl shadow-orange-600/30">
              {currentUser.photoUrl ? (
                <img src={currentUser.photoUrl} className="w-full h-full object-cover rounded-3xl" />
              ) : (
                currentUser.avatarInitial
              )}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Welcome Back</div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">{currentUser.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                {currentUser.position && (
                  <span className="flex items-center gap-1"><Target className="w-3 h-3 text-orange-500" /> {currentUser.position.replace("_", " ")}</span>
                )}
                {currentUser.city && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {currentUser.city}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/user/profile" className="px-6 py-3 bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              Edit Profile
            </Link>
            <Link href="/matches" className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/30">
              Browse Matches
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Followed Teams", val: currentUser.followedTeams?.length || 0, icon: <Heart className="w-5 h-5" />, color: "text-pink-600", bg: "bg-pink-50" },
          { label: "Matches Watched", val: Math.floor(Math.random() * 50) + 10, icon: <Eye className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Challenges", val: Math.floor(Math.random() * 10), icon: <Zap className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Arena Reputation", val: `${Math.floor(Math.random() * 5000) + 1000}`, icon: <Award className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", s.bg, s.color)}>{s.icon}</div>
            <div className="text-2xl font-black italic text-slate-900 mb-1">{s.val}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Recent Matches */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white ch-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Trophy className="w-5 h-5 text-orange-600" /> Upcoming Matches
              </h2>
              <Link href="/matches" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((m, i) => (
                  <Link key={i} href={`/matches/${m.id}`} className="block p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(m.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{m.tenantName}</span>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                        m.status === "LIVE" ? "bg-red-100 text-red-600" : m.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {m.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <span className="text-sm font-black italic uppercase text-slate-900">{m.homeTeamId}</span>
                      <span className="text-[10px] font-bold text-slate-300 italic">VS</span>
                      <span className="text-sm font-black italic uppercase text-slate-900">{m.awayTeamId}</span>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-orange-600 transition-colors ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">No matches yet. Browse tournaments to find some!</p>
                <Link href="/tournaments" className="ch-btn-primary px-6 py-3 mt-4 inline-block">Explore Tournaments</Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Followed Teams */}
          <div className="bg-white ch-card p-8">
            <h3 className="text-sm font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" /> Followed Teams
            </h3>
            {followedTeams.length > 0 ? (
              <div className="space-y-4">
                {followedTeams.map((t: any) => (
                  <Link key={t.id} href={`/teams/${t.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: t.primaryColor }}>
                      {t.shortName}
                    </div>
                    <div>
                      <div className="text-sm font-black italic uppercase text-slate-900">{t.name}</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.city}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No teams followed yet</p>
                <Link href="/teams" className="text-[10px] font-black text-orange-600 mt-2 inline-block">Browse Teams →</Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6">
            <h3 className="text-sm font-black italic uppercase tracking-tighter">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/challenges" className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-bold">Find a Challenge</span>
              </Link>
              {currentUser.position && (
                <Link href="/teams" className="flex items-center gap-3 p-4 bg-orange-600/20 rounded-xl hover:bg-orange-600/30 transition-all border border-orange-500/20">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-bold">Join a Club / Trial</span>
                </Link>
              )}
              <Link href="/players" className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold">Leaderboard</span>
              </Link>
              <Link href="/results" className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold">Recent Results</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return currentUser.position ? (
    <DashboardLayout variant="user">
       {DashboardContent}
    </DashboardLayout>
  ) : (
    <PublicLayout>
       {DashboardContent}
    </PublicLayout>
  );
}
