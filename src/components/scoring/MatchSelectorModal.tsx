"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import { Team, MatchSession } from "@/types";

interface MatchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchSelectorModal({ isOpen, onClose }: MatchSelectorModalProps) {
  const { tenant } = useTenant();
  const [matches, setMatches] = useState<MatchSession[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const activeTenant = tenant || JSON.parse(localStorage.getItem("kabaddihub_current_tenant") || "null") || { id: "global" };
    const tenantId = activeTenant.id;
    
    // Load Teams
    const teamKey = `kabaddihub_${tenantId}_teams`;
    const savedTeams = localStorage.getItem(teamKey);
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      const globalTeams = localStorage.getItem('kabaddihub_global_teams');
      if (globalTeams) setTeams(JSON.parse(globalTeams));
    }

    // Load Matches
    const matchKey = `kabaddihub_${tenantId}_matches`;
    const savedMatches = localStorage.getItem(matchKey);
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    } else if (tenantId !== "global") {
        // Fallback for demo
        const initialMatches: MatchSession[] = [
            {
              id: `m1`,
              homeTeamId: "1",
              awayTeamId: "2",
              scheduledAt: new Date(Date.now() + 86400000), 
              status: "UPCOMING"
            }
          ];
          setMatches(initialMatches);
    }
  }, [isOpen, tenant]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">Select Match</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Choose a fixture to begin live scoring</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">No upcoming matches</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Schedule a match in the Tournament Hub first.</p>
                </div>
              ) : (
                matches.map((match) => {
                  const home = getTeam(match.homeTeamId);
                  const away = getTeam(match.awayTeamId);
                  
                  return (
                    <div key={match.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                      {/* Teams Info */}
                      <div className="flex-1 w-full flex items-center justify-between">
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black italic text-lg shadow-sm border border-slate-100 mb-2" style={{ backgroundColor: home?.primaryColor || "#f1f5f9" }}>
                             {home?.shortName || "HME"}
                          </div>
                          <div className="text-xs font-black uppercase tracking-tighter text-center">{home?.name || "Home Team"}</div>
                        </div>

                        <div className="px-4 text-center">
                          <div className="text-orange-600 font-black italic text-sm tracking-tighter mb-1">VS</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-full whitespace-nowrap">
                             {new Date(match.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                          </div>
                        </div>

                        <div className="flex flex-col items-center flex-1">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black italic text-lg shadow-sm border border-slate-100 mb-2" style={{ backgroundColor: away?.primaryColor || "#f1f5f9" }}>
                             {away?.shortName || "AWY"}
                          </div>
                          <div className="text-xs font-black uppercase tracking-tighter text-center">{away?.name || "Away Team"}</div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 text-center">
                        <Link 
                          href={`/scoring?id=${match.id}`}
                          onClick={onClose}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20"
                        >
                          <Zap className="w-4 h-4" /> Start Scoring
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
