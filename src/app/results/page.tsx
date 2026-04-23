"use client";

import React, { useState, useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, ChevronRight, Star, Award, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get("view") === "spectator";
  const { role } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      const { data: matches, error } = await supabase
        .from('live_matches')
        .select(`
          id,
          scheduled_at,
          status,
          state,
          home:home_team_id(name, short_name, primary_color),
          away:away_team_id(name, short_name, primary_color),
          tenants(name)
        `)
        .not('state', 'is', null)
        .order('scheduled_at', { ascending: false });

      if (matches) {
        const mapped = matches.filter(m => {
          const state = m.state as any;
          return state?.home?.score > 0 || state?.away?.score > 0;
        }).map(m => {
          const state = m.state as any;
          const homeTeam = m.home as any;
          const awayTeam = m.away as any;
          const tenant = m.tenants as any;

          return {
            id: m.id,
            homeName: homeTeam?.name || "Home",
            awayName: awayTeam?.name || "Away",
            homeShort: homeTeam?.short_name || "HME",
            awayShort: awayTeam?.short_name || "AWY",
            homeColor: homeTeam?.primary_color || "#f97316",
            awayColor: awayTeam?.primary_color || "#2563eb",
            homeScore: state?.home?.score || 0,
            awayScore: state?.away?.score || 0,
            date: m.scheduled_at,
            tenantName: tenant?.name || "Global",
            status: m.status
          };
        });
        setResults(mapped);
      }
      setIsLoading(false);
    };

    fetchResults();
  }, []);

  const Content = (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-20 bg-transparent">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              Match <span className="text-orange-600">Results</span>
            </h1>
            <p className="text-sm font-medium text-slate-500">Scorecards and outcomes from across the platform.</p>
          </div>
          <div className="flex items-center gap-3">
             {/* Filter placeholder */}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((r, i) => {
              const homeWin = r.homeScore > r.awayScore;
              const awayWin = r.awayScore > r.homeScore;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white ch-card overflow-hidden group hover:border-orange-600/20 transition-all"
                >
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="p-5 md:w-44 flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                      <Trophy className="w-4 h-4 text-orange-600 shrink-0" />
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{r.tenantName}</div>
                        <div className="text-[8px] font-bold text-slate-300 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 flex items-center justify-center gap-8">
                      <div className="flex items-center gap-4 text-right flex-1 justify-end">
                        <div className="hidden md:block">
                          <div className={cn("text-lg font-black italic uppercase leading-none", homeWin ? "text-slate-900" : "text-slate-400")}>{r.homeName}</div>
                          {homeWin && <div className="text-[8px] font-black text-emerald-600 mt-1 flex items-center gap-1 justify-end"><Award className="w-3 h-3" /> WINNER</div>}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md shrink-0" style={{ backgroundColor: r.homeColor }}>
                          {r.homeShort}
                        </div>
                      </div>

                      <div className="text-center min-w-[100px]">
                        <div className="text-4xl font-black tabular-nums text-slate-900 leading-none">
                          {r.homeScore} <span className="text-slate-200">-</span> {r.awayScore}
                        </div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">FULL TIME</div>
                      </div>

                      <div className="flex items-center gap-4 text-left flex-1">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md shrink-0" style={{ backgroundColor: r.awayColor }}>
                          {r.awayShort}
                        </div>
                        <div className="hidden md:block">
                          <div className={cn("text-lg font-black italic uppercase leading-none", awayWin ? "text-slate-900" : "text-slate-400")}>{r.awayName}</div>
                          {awayWin && <div className="text-[8px] font-black text-emerald-600 mt-1 flex items-center gap-1"><Award className="w-3 h-3" /> WINNER</div>}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex items-center border-t md:border-t-0 md:border-l border-slate-100">
                      <Link href={`/overlay?id=${r.id}`} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white ch-card">
            <Star className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-black italic uppercase text-slate-900 mb-2">No Results Yet</h3>
            <p className="text-sm text-slate-400 mb-6">Once matches are scored, their results will appear here.</p>
            <Link href="/matches" className="ch-btn-primary px-8 py-4 inline-flex">Browse Matches</Link>
          </div>
        )}
      </div>
  );

  // Conditionally render layout
  if (isSpectator || role === "PUBLIC") {
    return <PublicLayout>{Content}</PublicLayout>;
  }

  // Default to DashboardLayout for logged-in users navigating through Admin/User consoles
  return <DashboardLayout variant={role === "USER" ? "user" : "organiser"}>{Content}</DashboardLayout>;
}
