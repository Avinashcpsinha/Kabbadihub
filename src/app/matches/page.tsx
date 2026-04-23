"use client";

import React, { useState, useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar, Clock, ChevronRight, Zap, Activity,
  Filter, Search, Trophy, Eye, MapPin, Plus, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type AggregatedMatch = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeShort: string;
  awayShort: string;
  homeColor: string;
  awayColor: string;
  scheduledAt: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  homeScore?: number;
  awayScore?: number;
  tenantName: string;
  tenantId: string;
};

import { Suspense } from "react";

function MatchesIndexContent() {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get("view") === "spectator";
  const [matches, setMatches] = useState<AggregatedMatch[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "LIVE" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('live_matches')
        .select(`
          id,
          scheduled_at,
          status,
          state,
          tenant_id,
          home:home_team_id(id, name, short_name, primary_color),
          away:away_team_id(id, name, short_name, primary_color),
          tenants(name)
        `)
        .order('scheduled_at', { ascending: false });

      if (data) {
        const aggregated: AggregatedMatch[] = data.map((m: any) => {
          const state = m.state as any;
          return {
            id: m.id,
            homeTeamId: m.home?.id,
            awayTeamId: m.away?.id,
            homeTeamName: m.home?.name || "Home Team",
            awayTeamName: m.away?.name || "Away Team",
            homeShort: m.home?.short_name || "HME",
            awayShort: m.away?.short_name || "AWY",
            homeColor: m.home?.primary_color || "#f97316",
            awayColor: m.away?.primary_color || "#2563eb",
            scheduledAt: m.scheduled_at,
            status: m.status,
            homeScore: state?.home?.score,
            awayScore: state?.away?.score,
            tenantName: m.tenants?.name || "Global",
            tenantId: m.tenant_id
          };
        });
        setMatches(aggregated);
      }
      setIsLoading(false);
    };

    fetchMatches();
  }, []);

  const filtered = matches.filter(m => {
    const tabMatch = activeTab === "ALL" || m.status === activeTab;
    const searchMatch = !searchQuery ||
      m.homeTeamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.awayTeamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tenantName?.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && searchMatch;
  });

  const Content = (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-20 bg-transparent">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              Match <span className="text-orange-600">Center</span>
            </h1>
            <p className="text-sm font-medium text-slate-500">All matches across the KabaddiHub ecosystem.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams, leagues..."
                className="ch-input !pl-12 w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {role && role !== "PUBLIC" && (
              <Link
                href="/tournaments"
                className="ch-btn-primary px-8 py-4 shadow-xl shadow-orange-600/20 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Schedule Match
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
          {(["ALL", "LIVE", "UPCOMING", "COMPLETED"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab === "LIVE" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-2" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {isLoading ? (
            <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            Object.entries(
              filtered.reduce((acc, match) => {
                const group = match.tenantName;
                if (!acc[group]) acc[group] = [];
                acc[group].push(match);
                return acc;
              }, {} as Record<string, AggregatedMatch[]>)
            ).map(([tenantName, tenantMatches]) => (
              <div key={tenantName} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                   <div className="h-px flex-1 bg-slate-200" />
                   <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-600" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{tenantName}</span>
                   </div>
                   <div className="h-px flex-1 bg-slate-200" />
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {tenantMatches.map((match) => (
                      <motion.div
                        key={match.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Link
                          href={match.status === "LIVE" || match.status === "COMPLETED" ? `/overlay?id=${match.id}` : `/matches/${match.id}`}
                          className="block bg-white ch-card overflow-hidden group hover:border-orange-600/30 transition-all border-none shadow-sm hover:shadow-xl"
                        >
                          <div className="flex flex-col md:flex-row items-stretch">
                            <div className="p-6 md:w-40 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-50 bg-slate-50/30">
                              <div className={cn(
                                "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                match.status === "LIVE" ? "bg-red-600 text-white animate-pulse" :
                                match.status === "COMPLETED" ? "bg-emerald-500 text-white" :
                                "bg-slate-200 text-slate-500"
                              )}>
                                {match.status}
                              </div>
                            </div>

                            <div className="flex-1 p-6 md:p-8 flex items-center justify-center gap-10">
                              <div className="text-right flex items-center gap-4 flex-1 justify-end">
                                <div className="hidden sm:block">
                                  <div className="text-xl font-black italic uppercase text-slate-900 leading-none">{match.homeTeamName}</div>
                                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">HOME</div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform shrink-0" style={{ backgroundColor: match.homeColor }}>
                                  {match.homeShort}
                                </div>
                              </div>

                              <div className="text-center min-w-[120px] px-6 py-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                                {match.homeScore !== undefined ? (
                                  <div className="text-4xl font-black tabular-nums text-slate-900 leading-none mb-2">
                                    {match.homeScore} <span className="text-slate-300 mx-1">:</span> {match.awayScore}
                                  </div>
                                ) : (
                                  <div className="text-2xl font-black italic text-orange-600 mb-2">VS</div>
                                )}
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                  {new Date(match.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  {" • "}
                                  {new Date(match.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>

                              <div className="text-left flex items-center gap-4 flex-1">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-xl -rotate-3 group-hover:rotate-0 transition-transform shrink-0" style={{ backgroundColor: match.awayColor }}>
                                  {match.awayShort}
                                </div>
                                <div className="hidden sm:block">
                                  <div className="text-xl font-black italic uppercase text-slate-900 leading-none">{match.awayTeamName}</div>
                                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">AWAY</div>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-50 min-w-[100px]">
                              {match.status === "LIVE" ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6 animate-pulse" />
                                  </div>
                                  <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">Watch Live</span>
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                  <ChevronRight className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="py-24 text-center bg-white ch-card">
              <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-black italic uppercase text-slate-900 mb-2">No Matches Found</h3>
              <p className="text-sm text-slate-400">Try a different filter or check back later.</p>
            </div>
          )}
      </div>
    </div>
  );

  // Conditionally render layout
  if (isSpectator || role === "PUBLIC") {
    return <PublicLayout>{Content}</PublicLayout>;
  }

  // Default to DashboardLayout for logged-in users navigating through Admin/User consoles
  return <DashboardLayout variant={role === "USER" ? "user" : role === "SUPER_ADMIN" ? "admin" : "organiser"}>{Content}</DashboardLayout>;
}

export default function MatchesIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <MatchesIndexContent />
    </Suspense>
  );
}
