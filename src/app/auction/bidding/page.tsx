"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  TrendingUp, 
  Users, 
  Wallet, 
  Gavel, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Star,
  Activity,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function FranchiseBiddingView() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { session, currentPlayer, lastBid, placeBid, players, teams } = useAuction();
  
  // Find which team this user belongs to (simplified for demo)
  const myTeam = teams.find(t => t.id === "1") || teams[0];
  const myBids = session?.bids.filter(b => b.teamId === myTeam?.id) || [];
  const spent = players.filter(p => p.soldToTeamId === myTeam?.id).reduce((acc, p) => acc + (p.soldPrice || 0), 0);
  const totalPurse = session?.basePurse || 50000000;
  const purseRemaining = totalPurse - spent;

  const handleQuickBid = () => {
    if (!currentPlayer || !myTeam) return;
    const currentAmount = lastBid ? lastBid.amount : currentPlayer.basePrice;
    
    // Increment logic: 1L if < 20L, 2L otherwise (simplified)
    const increment = currentAmount < 2000000 ? 100000 : 200000;
    const newBid = currentAmount + increment;
    
    if (newBid <= purseRemaining) {
      placeBid(myTeam.id, newBid);
    }
  };

  if (!session) return <div className="p-20 text-center uppercase font-black italic">Awaiting Session...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40">
       {/* Mobile-First Handheld Header */}
       <nav className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-50 shadow-2xl">
          <div className="max-w-xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
                   <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic text-[10px]">{myTeam?.shortName}</div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-tighter leading-none">{myTeam?.name}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Franchise Terminal</div>
                   </div>
                </div>
             </div>
             <div className="text-right">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Purse Left</div>
                <div className="text-sm font-black italic text-orange-500">₹{(purseRemaining / 100000).toFixed(1)} Lac</div>
             </div>
          </div>
       </nav>

       <main className="max-w-xl mx-auto p-4 space-y-4">
          {/* Current Status Card */}
          <section className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 blur-2xl rounded-full" />
             
             {currentPlayer ? (
               <div className="space-y-6">
                  <div className="flex justify-between items-start">
                     <div>
                        <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 w-fit">
                           <div className="w-1 h-1 bg-orange-600 rounded-full animate-pulse" /> LIVE ON BLOCK
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">{currentPlayer.name}</h2>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentPlayer.role} • CAT {currentPlayer.category}</div>
                     </div>
                     <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[100px]">
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Base</div>
                        <div className="text-sm font-black italic">₹{(currentPlayer.basePrice/100000).toFixed(1)}L</div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 py-4 border-y border-slate-50">
                     <div className="flex-1">
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Highest Bid</div>
                        <div className="text-2xl font-black italic text-orange-600">
                           {lastBid ? `₹${(lastBid.amount/100000).toFixed(1)} Lac` : "No Bids"}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">By Franchise</div>
                        <div className="text-xs font-black uppercase italic text-slate-900">
                           {lastBid ? teams.find(t => t.id === lastBid.teamId)?.shortName : "-"}
                        </div>
                     </div>
                  </div>

                  <div className="pt-2">
                     <button 
                       onClick={handleQuickBid}
                       disabled={lastBid?.teamId === myTeam?.id}
                       className={cn(
                         "w-full py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3",
                         lastBid?.teamId === myTeam?.id 
                           ? "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed" 
                           : "bg-orange-600 text-white shadow-orange-600/30 hover:bg-orange-700"
                       )}
                     >
                        {lastBid?.teamId === myTeam?.id ? "YOU ARE HIGHEST" : "PLACE NEXT BID"} <Gavel className="w-5 h-5" />
                     </button>
                     <p className="text-[8px] text-center font-bold text-slate-400 uppercase tracking-widest mt-4">Tapping confirms a bid at legal increment.</p>
                  </div>
               </div>
             ) : (
               <div className="py-20 text-center space-y-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                     <Lock className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-black uppercase italic tracking-wider text-slate-900 leading-none">Market Suspended</h4>
                  <p className="text-[10px] font-medium text-slate-400 max-w-[150px] mx-auto italic">Waiting for Organiser to bring the next athlete to the mat.</p>
               </div>
             )}
          </section>

          {/* Stats & Squad Status */}
          <section className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                   <Users className="w-4 h-4" />
                </div>
                <div className="text-xl font-black italic">{players.filter(p => p.soldToTeamId === myTeam?.id).length} / {session.maxPlayers}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Squad Built</div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                   <Wallet className="w-4 h-4" />
                </div>
                <div className="text-xl font-black italic">{(purseRemaining / totalPurse * 100).toFixed(0)}%</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Purse Health</div>
             </div>
          </section>

          {/* Recent Squad Additions */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-orange-600" /> New Signatures
             </h3>
             <div className="space-y-4">
                {players.filter(p => p.soldToTeamId === myTeam?.id).length > 0 ? players.filter(p => p.soldToTeamId === myTeam?.id).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-3">
                        <div className="text-[10px] font-black italic text-slate-600">{p.name}</div>
                        <div className="px-2 py-0.5 bg-white text-[7px] font-black uppercase rounded border border-slate-100">{p.role}</div>
                     </div>
                     <span className="text-[10px] font-black tabular-nums text-slate-900 italic">₹{(p.soldPrice!/100000).toFixed(1)}L</span>
                  </div>
                )) : (
                   <div className="text-center py-6 text-[8px] font-bold text-slate-300 uppercase italic">Your squad is currently empty.</div>
                )}
             </div>
          </section>
       </main>

       {/* Floating Bidding History Indicator */}
       <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4">
          <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl border border-white/5">
             <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Bids This Session: {myBids.length}</span>
             </div>
             <button className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">History</button>
          </div>
       </div>
    </div>
  );
}
