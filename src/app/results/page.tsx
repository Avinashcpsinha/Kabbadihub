"use client";

import React, { useState, useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, ChevronRight, Star, Award, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultsPage() {
  const { role } = useAuth();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const allTenantsRaw = localStorage.getItem("kabaddihub_tenants");
    if (!allTenantsRaw) return;
    const tenants = JSON.parse(allTenantsRaw);
    const allResults: any[] = [];

    tenants.forEach((t: any) => {
      const matchesRaw = localStorage.getItem(`kabaddihub_${t.id}_matches`);
      const teamsRaw = localStorage.getItem(`kabaddihub_${t.id}_teams`);
      if (!matchesRaw) return;
      const matches = JSON.parse(matchesRaw);
      const teams = teamsRaw ? JSON.parse(teamsRaw) : [];

      matches.forEach((m: any) => {
        const stateKey = `kabaddi_${t.id}_match_${m.id}_state`;
        const liveState = localStorage.getItem(stateKey);
        if (liveState) {
          const parsed = JSON.parse(liveState);
          if (parsed.home?.score > 0 || parsed.away?.score > 0) {
            const homeT = teams.find((tm: any) => tm.id === m.homeTeamId);
            const awayT = teams.find((tm: any) => tm.id === m.awayTeamId);
            allResults.push({
              id: m.id,
              homeName: homeT?.name || parsed.home?.name || "Home",
              awayName: awayT?.name || parsed.away?.name || "Away",
              homeShort: homeT?.shortName || parsed.home?.shortName || "HME",
              awayShort: awayT?.shortName || parsed.away?.shortName || "AWY",
              homeColor: homeT?.primaryColor || "#f97316",
              awayColor: awayT?.primaryColor || "#2563eb",
              homeScore: parsed.home?.score || 0,
              awayScore: parsed.away?.score || 0,
              date: m.scheduledAt,
              tenantName: t.name,
              status: m.status,
              half: parsed.half || 1,
              timer: parsed.timer || 0,
            });
          }
        }
      });
    });

    allResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setResults(allResults);
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
            <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-orange-600 hover:text-orange-600 transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {results.length > 0 ? (
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
                        <div>
                          <div className={cn("text-lg font-black italic uppercase leading-none", homeWin ? "text-slate-900" : "text-slate-400")}>{r.homeName}</div>
                          {homeWin && <div className="text-[8px] font-black text-emerald-600 mt-1 flex items-center gap-1 justify-end"><Award className="w-3 h-3" /> WINNER</div>}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md" style={{ backgroundColor: r.homeColor }}>
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md" style={{ backgroundColor: r.awayColor }}>
                          {r.awayShort}
                        </div>
                        <div>
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

  if (role === "PUBLIC") return <PublicLayout>{Content}</PublicLayout>;
  return (
    <DashboardLayout variant={role === "USER" ? "user" : "organiser"}>
       {Content}
    </DashboardLayout>
  );
}
