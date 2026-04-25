"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import { supabase } from "@/lib/supabase";
import { Team, MatchSession } from "@/types";

interface MatchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchSelectorModal({ isOpen, onClose }: MatchSelectorModalProps) {
  const { tenant } = useTenant();
  const currentTenantId = tenant?.id;
  const [matches, setMatches] = useState<MatchSession[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentTenantId) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      // Load Teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tenant_id', currentTenantId);

      if (teamsData) {
        setTeams(teamsData.map(t => ({
          id: t.id,
          name: t.name,
          shortName: t.short_name,
          primaryColor: t.primary_color,
          secondaryColor: t.secondary_color,
          city: t.city,
          players: []
        })));
      }

      // Load Matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('live_matches')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });

      if (matchesData) {
        setMatches(matchesData.map(m => ({
          id: m.id,
          homeTeamId: m.home_team_id,
          awayTeamId: m.away_team_id,
          status: m.status as any,
          scheduledAt: new Date(m.created_at), // Fallback if no specific scheduled_at column
          tenantId: m.tenant_id
        })));
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [isOpen, currentTenantId]);

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
            className="bg-[#0a0a0f] border border-white/10 rounded-[2rem] w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">Select Match</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Choose a fixture to begin live scoring</p>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6 bg-[#0a0a0f]">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-widest text-white mb-2">No upcoming matches</h4>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Schedule a match in the Tournament Hub first.</p>
                </div>
              ) : (
                matches.map((match) => {
                  const home = getTeam(match.homeTeamId);
                  const away = getTeam(match.awayTeamId);
                  
                  return (
                    <div key={match.id} className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-center gap-8">
                      {/* Teams Info */}
                      <div className="flex-1 w-full flex items-center justify-between">
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black italic text-3xl shadow-lg border border-white/20 mb-4" style={{ backgroundColor: home?.primaryColor || "#333" }}>
                             {home?.shortName || "HME"}
                          </div>
                          <div className="text-base font-black uppercase tracking-tighter text-center text-white">{home?.name || "Home Team"}</div>
                        </div>

                        <div className="px-6 text-center">
                          <div className="text-orange-500 font-black italic text-2xl tracking-tighter mb-2">VS</div>
                          <div className="text-xs font-black text-slate-300 uppercase tracking-widest px-4 py-1.5 bg-white/10 rounded-full whitespace-nowrap">
                             {match.status}
                          </div>
                        </div>

                        <div className="flex flex-col items-center flex-1">
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black italic text-3xl shadow-lg border border-white/20 mb-4" style={{ backgroundColor: away?.primaryColor || "#333" }}>
                             {away?.shortName || "AWY"}
                          </div>
                          <div className="text-base font-black uppercase tracking-tighter text-center text-white">{away?.name || "Away Team"}</div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-6 sm:pt-0 sm:pl-8 text-center">
                        <Link 
                          href={`/scoring?id=${match.id}`}
                          onClick={onClose}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/30"
                        >
                          <Zap className="w-5 h-5 fill-current" /> Start Scoring
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
