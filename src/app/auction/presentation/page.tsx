"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Users, 
  Trophy, 
  Star,
  Activity,
  History,
  Target,
  Gavel,
  ShieldCheck,
  TrendingUp,
  Award,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuction } from "@/context/AuctionContext";

export default function AuctionPresentation() {
  const { currentPlayer, lastBid, session, teams } = useAuction();
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: any;
    if (currentPlayer && !lastBid) {
      setTimer(30);
    }
    if (lastBid) {
      setTimer(20);
    }
    
    interval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPlayer, lastBid]);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-12 text-center text-white">
         <div className="w-32 h-32 bg-orange-600 rounded-[3rem] flex items-center justify-center mb-12 shadow-[0_0_100px_rgba(234,88,12,0.3)] animate-pulse">
            <Gavel className="w-16 h-16" />
         </div>
         <h1 className="text-8xl font-black italic uppercase tracking-tighter mb-4">Elite Draft</h1>
         <div className="text-2xl font-black uppercase tracking-[0.5em] text-orange-500 animate-pulse">Waiting for next player on block</div>
         <div className="mt-24 flex gap-12 grayscale opacity-40">
            {/* Visual bottom bar with team logos or placeholders */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-2xl bg-white/10" />
            ))}
         </div>
      </div>
    );
  }

  const biddingTeam = teams.find(t => t.id === lastBid?.teamId);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col p-12 lg:p-24 relative">
       {/* Background Aesthetics */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent" />
       <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/5 blur-[200px] rounded-full translate-x-1/2 -translate-y-1/2" />
       <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-orange-600/5 blur-[200px] rounded-full -translate-x-1/2 translate-y-1/2" />

       {/* Header */}
       <header className="relative z-10 flex items-center justify-between mb-24">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                <Zap className="w-6 h-6 fill-current" />
             </div>
             <span className="text-3xl font-black italic tracking-tighter uppercase">KabaddiHub Draft</span>
          </div>
          <div className="flex items-center gap-12">
             <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Session ID</div>
                <div className="text-xl font-black italic uppercase tracking-tight">{session?.id.split('_')[1]}</div>
             </div>
             <div className="w-px h-12 bg-white/10" />
             <div className="flex items-center gap-4">
                <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Presentation Mode
                </div>
             </div>
          </div>
       </header>

       <div className="grid lg:grid-cols-12 gap-24 flex-1 items-stretch relative z-10">
          {/* Main Info */}
          <div className="lg:col-span-8 flex flex-col justify-between">
             <div className="space-y-12">
                <div className="flex items-center gap-6">
                   <span className="px-6 py-2 bg-orange-600 rounded-lg text-[12px] font-black uppercase tracking-widest">Player #{currentPlayer.number}</span>
                   <span className="px-6 py-2 bg-white/10 border border-white/10 rounded-lg text-[12px] font-black uppercase tracking-widest text-orange-500">Category {currentPlayer.category}</span>
                </div>
                <h1 className="text-[10rem] font-black italic uppercase tracking-tighter leading-[0.8]">
                   {currentPlayer.name.split(' ')[0]} <br/> 
                   <span className="text-orange-500">{currentPlayer.name.split(' ')[1]}</span>
                </h1>
                
                <div className="flex gap-16 pt-12">
                   {[
                     { label: "Role", val: currentPlayer.role, icon: <Users className="w-5 h-5" /> },
                     { label: "Base Price", val: `₹${(currentPlayer.basePrice/100000).toFixed(1)}L`, icon: <TrendingUp className="w-5 h-5 text-orange-500" /> },
                     { label: "Raid Points", val: (currentPlayer as any).stats?.raidPoints || '0', icon: <Zap className="w-5 h-5" /> }
                   ].map((s, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           {s.icon} {s.label}
                        </div>
                        <div className="text-4xl font-black italic tracking-tight">{s.val}</div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Footer Team Reel */}
             <div className="flex items-center gap-12 overflow-hidden border-t border-white/5 pt-12">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 shrink-0">Field Hubs</div>
                <div className="flex items-center gap-8">
                   {teams.map(t => (
                     <div key={t.id} className={cn(
                       "w-20 h-14 rounded-xl flex items-center justify-center font-black italic text-xl border transition-all",
                       lastBid?.teamId === t.id ? "bg-orange-600 border-orange-500 text-white scale-110 shadow-2xl shadow-orange-600/40" : "bg-white/5 border-white/5 text-slate-500 opacity-40"
                     )}>
                        {t.shortName}
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Bidding Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-12">
             {/* Bidding Card */}
             <div className={cn(
               "flex-1 rounded-[4rem] p-12 flex flex-col items-center justify-center text-center transition-all duration-500 border-4",
               lastBid 
                ? "bg-orange-600 border-orange-400 shadow-[0_0_150px_rgba(234,88,12,0.3)]" 
                : "bg-white/5 border-white/5"
             )}>
                <AnimatePresence mode="wait">
                   {lastBid ? (
                     <motion.div 
                       key="bid"
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0.8, opacity: 0 }}
                       className="space-y-12"
                     >
                        <div>
                           <div className="text-2xl font-black uppercase tracking-[0.3em] text-white/60 mb-8">Current Bid</div>
                           <div className="text-[10rem] font-black italic tracking-tighter leading-none mb-4 animate-in zoom-in-50 duration-300">
                              ₹{(lastBid.amount / 100000).toFixed(1)}
                           </div>
                           <div className="text-2xl font-black uppercase tracking-widest text-white">LAC</div>
                        </div>

                        <div className="space-y-4">
                           <div className="w-24 h-24 bg-white text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                              <ShieldCheck className="w-12 h-12" />
                           </div>
                           <div className="text-3xl font-black uppercase italic tracking-tighter">{biddingTeam?.name}</div>
                           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Verified Bid Confirmation</div>
                        </div>
                     </motion.div>
                   ) : (
                     <motion.div 
                       key="nobid"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="space-y-6"
                     >
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/10">
                           <Gavel className="w-12 h-12 text-slate-700" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Starting Price</div>
                        <div className="text-7xl font-black italic tracking-tighter">₹{(currentPlayer.basePrice/100000).toFixed(1)}L</div>
                        <p className="text-slate-500 font-medium italic">Waiting for teams <br/> to initiate bidding...</p>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>

             {/* Timer Section */}
             <div className="h-64 rounded-[4rem] bg-white text-slate-900 p-12 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Bidding Window</div>
                <div className={cn(
                  "text-8xl font-black tabular-nums tracking-tighter transition-colors",
                  timer <= 5 ? "text-red-600 animate-pulse" : "text-slate-900"
                )}>
                   00:{timer < 10 ? `0${timer}` : timer}
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-6 overflow-hidden">
                   <motion.div 
                     initial={{ width: "100%" }}
                     animate={{ width: `${(timer/30)*100}%` }}
                     className={cn("h-full transition-colors", timer <= 5 ? "bg-red-600" : "bg-orange-600")}
                   />
                </div>
             </div>
          </div>
       </div>

       {/* Floating Decor Items */}
       <div className="fixed bottom-12 right-12 flex items-center gap-6 z-20 opacity-40">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <Award className="w-5 h-5 text-orange-600" />
          <Activity className="w-5 h-5 text-orange-600" />
       </div>
    </div>
  );
}
