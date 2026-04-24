"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMatch } from "@/context/MatchContext";
import { useSearchParams } from "next/navigation";
import { Activity, Shield, Zap, Info, MessageSquare, History, Trophy, User } from "lucide-react";

import { Suspense } from "react";

function OverlayContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { state, isDataLoaded, setMatchId } = useMatch();

  React.useEffect(() => {
    if (matchId) {
      setMatchId(matchId);
    }
  }, [matchId, setMatchId]);

  if (!isDataLoaded) return <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center font-black italic text-white uppercase tracking-[0.5em] animate-pulse">Synchronizing Arena Stream...</div>;

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="w-full h-screen bg-transparent flex flex-col p-12 font-sans italic tracking-tighter overflow-hidden">
      
      {/* Top Scorebug (Pro Kabaddi Elite Style) */}
      <div className="flex items-start gap-0 h-24 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-md border-b-2 border-white/10 w-fit">
        {/* Home Team */}
        <div className="flex items-center gap-6 bg-orange-600 px-8 h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="relative z-10 flex flex-col items-center">
             <div className="text-white font-black text-3xl uppercase tracking-tighter leading-none">{state.home.shortName}</div>
             <div className="text-[10px] text-orange-200 font-bold uppercase tracking-widest mt-1">HOME</div>
          </div>
            {state.home.matCount}
          </div>
        
        {/* Home Score */}
        <div className="bg-slate-950 px-8 h-full flex items-center min-w-[120px] justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.span 
              key={state.home.score}
              initial={{ y: 30, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.5 }}
              className="text-white text-6xl font-black tabular-nums relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {state.home.score}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Center Timer & Match Status */}
        <div className="bg-white px-8 h-full flex flex-col items-center justify-center min-w-[160px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100" />
          <div className="relative z-10 flex flex-col items-center">
             <span className={cn(
               "text-4xl font-black leading-none tabular-nums transition-colors tracking-tight",
               state.timer < 60 ? "text-red-600 animate-pulse" : "text-slate-950"
             )}>
               {formatTime(state.timer)}
             </span>
             <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none px-2 py-1 bg-slate-100 rounded">
                  {state.half === 1 ? "1ST HALF" : "2ND HALF"}
                </span>
             </div>
          </div>
        </div>

        {/* Away Score */}
        <div className="bg-slate-950 px-8 h-full flex items-center min-w-[120px] justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.span 
              key={state.away.score}
              initial={{ y: 30, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.5 }}
              className="text-white text-6xl font-black tabular-nums relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {state.away.score}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-6 bg-slate-500 px-8 h-full relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
           <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center font-black text-black shrink-0 border-2 border-black/10 shadow-inner">
             {state.away.matCount}
           </div>
           <div className="relative z-10 flex flex-col items-center">
              <div className="text-black font-black text-3xl uppercase tracking-tighter leading-none">{state.away.shortName}</div>
              <div className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mt-1">AWAY</div>
           </div>
        </div>
      </div>

      {/* Main Grid: Action Area & Commentary Feed */}
      <div className="flex-1 grid grid-cols-12 gap-12 mt-8 overflow-hidden">
        
        {/* Left/Center: Raider Info & Notifications */}
        <div className="col-span-8 flex flex-col justify-start gap-8">
           <AnimatePresence>
            {state.currentRaider && (
              <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="flex items-stretch h-16 w-fit"
              >
                 <div className="bg-slate-900 border-l-4 border-orange-600 px-8 flex items-center gap-6 relative overflow-hidden skew-x-[-12deg] shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-transparent" />
                    <Activity className="w-6 h-6 text-orange-500 skew-x-[12deg]" />
                    <div className="flex flex-col skew-x-[12deg]">
                       <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">CURRENTLY RAIDING</span>
                       <span className="text-2xl font-black text-white uppercase tracking-tight italic">{state.currentRaider}</span>
                    </div>
                 </div>

                 <div className={cn(
                   "ml-2 px-10 flex items-center justify-center skew-x-[-12deg] transition-colors duration-300 shadow-2xl",
                   state.raidClock <= 5 ? "bg-red-600" : "bg-white"
                 )}>
                    <div className="flex items-center gap-3 skew-x-[12deg]">
                       <Zap className={cn("w-6 h-6", state.raidClock <= 5 ? "text-white animate-pulse" : "text-orange-600")} />
                       <span className={cn(
                         "text-4xl font-black tabular-nums tracking-tighter",
                         state.raidClock <= 5 ? "text-white" : "text-slate-900"
                       )}>
                         {state.raidClock}
                       </span>
                    </div>
                 </div>

                 {state.isDoOrDie && (
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="ml-2 bg-black flex items-center px-6 skew-x-[-12deg] border-2 border-red-600 animate-pulse"
                   >
                      <span className="text-red-500 text-sm font-black uppercase tracking-[0.3em] skew-x-[12deg]">DO OR DIE</span>
                   </motion.div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Central Match Events */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence>
              {state.lastAction && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.5, opacity: 0, y: -100 }}
                  className="relative p-12 px-24 bg-slate-900/60 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 text-center overflow-hidden"
                >
                  <div className="absolute -inset-4 bg-orange-600/30 blur-[80px] rounded-full -z-10 animate-pulse" />
                  
                  {/* Event Raider Detail */}
                  <div className="flex flex-col items-center">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-12 bg-orange-600/50" />
                        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-orange-400">MISSION SUCCESSFUL</span>
                        <div className="h-px w-12 bg-orange-600/50" />
                     </div>
                     <h2 className="text-[6rem] font-black italic tracking-tighter uppercase text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] whitespace-nowrap mb-6">
                       {state.lastAction}
                     </h2>
                     <div className="px-10 py-4 bg-orange-600 rounded-3xl text-white shadow-2xl shadow-orange-600/40 relative group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                           <User className="w-6 h-6 fill-current" />
                           {state.currentRaider || "ELITE ATHLETE"}
                        </span>
                     </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                     <div className="px-6 py-2 bg-black/40 rounded-full border border-white/5 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-orange-500" /> ARENA VERIFIED BROADCAST
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section: Live Commentary Feed */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
           <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg">
              <History className="w-6 h-6 text-orange-500" />
              <h3 className="text-sm font-black italic uppercase tracking-widest text-white">LIVE COMMENTARY</h3>
              <div className="ml-auto flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REAL-TIME</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              <AnimatePresence initial={false}>
                 {state.history.length > 0 ? state.history.map((event) => (
                   <motion.div 
                     key={event.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="bg-white/5 backdrop-blur-xl border-l-[6px] border-orange-600 border-y border-r border-white/5 p-6 rounded-r-[2rem] group hover:bg-white/10 transition-all shadow-xl"
                   >
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[12px] font-black text-orange-500 italic tabular-nums bg-orange-600/10 px-3 py-1 rounded-lg">
                            {formatTime(event.gameTime || 0)}
                         </span>
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="flex-1">
                            <div className="text-[13px] font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                               <span className="text-orange-400">{event.raider || "ATHLETE"}</span>
                               <span className="text-slate-600 mx-1">/</span>
                               <span className={cn(
                                 "text-[10px] px-3 py-0.5 rounded-full font-black tracking-widest",
                                 event.team === "home" ? "bg-orange-600 text-white" : "bg-slate-400 text-black"
                               )}>
                                  {event.team === "home" ? state.home.shortName : state.away.shortName}
                               </span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                               {event.type.replace("_", " ")} RECORDED. 
                               <span className="text-white ml-2 bg-orange-600/40 px-2 py-0.5 rounded">POINT +{event.points}</span>
                            </p>
                         </div>
                      </div>
                   </motion.div>
                 )) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                      <MessageSquare className="w-16 h-16 mb-6 text-slate-500" />
                      <p className="text-sm font-black uppercase tracking-[0.2em]">Awaiting First Arena Action</p>
                   </div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="mt-8 flex items-end justify-between">
         <div className="bg-slate-900/80 backdrop-blur-md px-10 py-5 rounded-tr-[3rem] border-t border-r border-white/10 flex items-center gap-12 shadow-2xl">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">PRO KABADDI ELITE</span>
               <span className="text-lg font-black text-white italic tracking-[0.2em] leading-none uppercase">KABADDI HUB BROADCAST</span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ARENA LOCATION</span>
               <span className="text-sm font-black text-orange-500 italic tracking-[0.1em] leading-none uppercase">SHIVAJI SPORTS HUB</span>
            </div>
         </div>

         <div className="bg-white px-10 py-5 rounded-tl-[3rem] border-t border-l border-orange-600 flex items-center gap-6 group shadow-2xl">
            <div className="relative">
               <Info className="w-6 h-6 text-orange-600 animate-pulse" />
               <div className="absolute inset-0 bg-orange-600/20 rounded-full animate-ping" />
            </div>
            <span className="text-sm font-black text-slate-900 uppercase tracking-widest group-hover:tracking-tighter transition-all">DATA STREAM: 10MS LATENCY [VERIFIED]</span>
         </div>
      </div>
    </div>
  );
}

export default function BroadcastOverlay() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center font-black italic text-white uppercase tracking-[0.5em]">Initializing Stream...</div>}>
      <OverlayContent />
    </Suspense>
  );
}
