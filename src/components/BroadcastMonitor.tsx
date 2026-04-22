"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMatch } from "@/context/MatchContext";
import { Activity, Zap, Trophy, User, Monitor } from "lucide-react";

export default function BroadcastMonitor() {
  const { state } = useMatch();

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
      {/* Monitor Header */}
      <div className="px-6 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-3 h-3 text-orange-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Live Broadcast Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-red-600 rounded-full animate-ping" />
          <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {/* Mini Scorebug */}
      <div className="p-4 bg-slate-950/50">
        <div className="flex items-stretch h-14 rounded-xl overflow-hidden border border-white/5 shadow-inner">
          {/* Home */}
          <div className="flex-1 bg-orange-600 flex flex-col items-center justify-center min-w-[60px]">
            <span className="text-white text-lg font-black leading-none">{state.home.shortName}</span>
            <span className="text-[6px] text-orange-200 font-bold uppercase tracking-widest mt-1">HOME</span>
          </div>
          
          {/* Home Score */}
          <div className="w-14 bg-slate-900 flex items-center justify-center border-x border-white/5">
            <AnimatePresence mode="wait">
              <motion.span 
                key={state.home.score}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-white text-2xl font-black tabular-nums"
              >
                {state.home.score}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Center Timer */}
          <div className="w-20 bg-white flex flex-col items-center justify-center">
            <span className={cn(
              "text-xl font-black leading-none tabular-nums",
              state.timer < 60 ? "text-red-600" : "text-slate-950"
            )}>
              {formatTime(state.timer)}
            </span>
            <span className="text-[6px] font-black text-slate-400 uppercase mt-1 tracking-tighter">
              {state.half === 1 ? "1ST HALF" : "2ND HALF"}
            </span>
          </div>

          {/* Away Score */}
          <div className="w-14 bg-slate-900 flex items-center justify-center border-x border-white/5">
            <AnimatePresence mode="wait">
              <motion.span 
                key={state.away.score}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-white text-2xl font-black tabular-nums"
              >
                {state.away.score}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Away */}
          <div className="flex-1 bg-slate-700 flex flex-col items-center justify-center min-w-[60px]">
            <span className="text-white text-lg font-black leading-none">{state.away.shortName}</span>
            <span className="text-[6px] text-slate-300 font-bold uppercase tracking-widest mt-1">AWAY</span>
          </div>
        </div>

        {/* Current Raider Info (Mini) */}
        <AnimatePresence>
          {state.currentRaider && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5"
            >
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">RAIDING NOW</div>
                <div className="text-[11px] font-black text-white uppercase italic truncate tracking-tight">{state.currentRaider}</div>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
                <Zap className={cn("w-3 h-3", state.raidClock <= 5 ? "text-red-500 animate-pulse" : "text-orange-600")} />
                <span className="text-sm font-black tabular-nums text-slate-900">{state.raidClock}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!state.currentRaider && (
          <div className="mt-4 flex flex-col items-center justify-center py-6 opacity-20">
             <Trophy className="w-8 h-8 text-slate-500 mb-2" />
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Awaiting Arena Action</span>
          </div>
        )}
      </div>

      {/* Monitor Footer */}
      <div className="px-6 py-3 bg-slate-950 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
           <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Feed: Stable</span>
        </div>
        <div className="text-[7px] font-black text-orange-500/50 uppercase tracking-[0.3em]">Pro Kabaddi Elite v2</div>
      </div>
    </div>
  );
}
