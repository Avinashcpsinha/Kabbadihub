"use client";

import React, { useState, useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Calendar, Clock, ChevronRight, Zap, Activity,
  Filter, Search, Trophy, Eye, MapPin, Plus
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

export default function MatchesIndexPage() {
  const { role } = useAuth();
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

        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((match) => (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Link
                    href={match.status === "LIVE" || match.status === "COMPLETED" ? `/overlay?id=${match.id}` : `/matches/${match.id}`}
                    className="block bg-white ch-card overflow-hidden group hover:border-orange-600/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-6 md:w-48 flex items-center gap-3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                        <Trophy className="w-4 h-4 text-orange-600 shrink-0" />
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{match.tenantName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={cn(
                              "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest",
                              match.status === "LIVE" ? "bg-red-100 text-red-600 animate-pulse" :
                              match.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" :
                              "bg-slate-100 text-slate-500"
                            )}>
                              {match.status === "LIVE" && <span className="inline-block w-1 h-1 rounded-full bg-red-600 mr-1" />}
                              {match.status}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex items-center justify-center gap-8">
                        <div className="text-right flex items-center gap-4">
                          <div className="hidden md:block">
                            <div className="text-lg font-black italic uppercase text-slate-900 leading-none">{match.homeTeamName}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">HOME</div>
                          </div>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md shrink-0" style={{ backgroundColor: match.homeColor }}>
                            {match.homeShort}
                          </div>
                        </div>

                        <div className="text-center min-w-[80px]">
                          {match.homeScore !== undefined ? (
                            <div className="text-3xl font-black tabular-nums text-slate-900">
                              {match.homeScore} <span className="text-slate-300">:</span> {match.awayScore}
                            </div>
                          ) : (
                            <div className="text-lg font-black italic text-orange-600">VS</div>
                          )}
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {new Date(match.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" · "}
                            {new Date(match.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>

                        <div className="text-left flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md shrink-0" style={{ backgroundColor: match.awayColor }}>
                            {match.awayShort}
                          </div>
                          <div className="hidden md:block">
                            <div className="text-lg font-black italic uppercase text-slate-900 leading-none">{match.awayTeamName}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">AWAY</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex items-center border-t md:border-t-0 md:border-l border-slate-100">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-all">
                          {match.status === "LIVE" ? <Eye className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
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

  if (role === "PUBLIC") return <PublicLayout>{Content}</PublicLayout>;
  return (
    <DashboardLayout variant={role === "USER" ? "user" : "organiser"}>
       {Content}
    </DashboardLayout>
  );
}
