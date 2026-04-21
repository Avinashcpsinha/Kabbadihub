"use client";

import React, { useState } from "react";
import { 
  Gavel, 
  Users, 
  Trophy, 
  Settings2, 
  Plus, 
  Search, 
  ArrowRight,
  Monitor,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  History,
  CheckCircle2,
  XCircle,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";
import { useTenant } from "@/context/TenantContext";

export default function AuctionDashboard() {
  const { tenant } = useTenant();
  const { players, session, teams, currentPlayer, lastBid, startAuction, putPlayerOnBlock, markSold, markUnsold } = useAuction();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <div className="w-24 h-24 rounded-[3rem] bg-orange-100 flex items-center justify-center mb-8 border border-orange-200">
            <Gavel className="w-12 h-12 text-orange-600" />
         </div>
         <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Auction Center</h1>
         <p className="text-slate-500 max-w-sm mb-12 italic">Initialize the player draft session for the current tournament organization.</p>
         <button 
           onClick={() => startAuction("t1")}
           className="ch-btn-primary px-12 py-5 shadow-2xl shadow-orange-600/20 flex items-center gap-3"
         >
            Initialize Session <Play className="w-5 h-5 fill-current" />
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-40">
       <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-6">
                <Link href="/" className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all">
                   <Users className="w-5 h-5" />
                </Link>
                <div>
                   <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">Auction Console</span>
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Live Draft Management • {tenant?.name || "Global"}</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Link href="/auction/presentation" target="_blank" className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                   <Monitor className="w-4 h-4" /> Presentation Mode
                </Link>
                <button className="p-3 bg-slate-100 rounded-xl text-slate-500">
                   <Settings2 className="w-5 h-5" />
                </button>
             </div>
          </div>
       </nav>

       <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          {/* Active Player Status */}
          <section className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative border border-slate-800">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
             
             <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="px-4 py-1.5 bg-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest">Currently on Block</div>
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                   </div>

                   {currentPlayer ? (
                     <div className="space-y-6">
                        <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none">{currentPlayer.name}</h2>
                        <div className="flex gap-8">
                           <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Base Price</div>
                              <div className="text-2xl font-black italic">₹{(currentPlayer.basePrice / 100000).toFixed(1)} Lac</div>
                           </div>
                           <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Category</div>
                              <div className="text-2xl font-black italic text-orange-500">{currentPlayer.category}</div>
                           </div>
                           <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Role</div>
                              <div className="text-2xl font-black italic">{currentPlayer.role}</div>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-700">Select Player <br/> To Start Bidding</h2>
                   )}
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 flex flex-col items-center text-center">
                   {lastBid ? (
                     <>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Highest Bid</div>
                        <div className="text-6xl font-black italic text-orange-500 mb-2">₹{(lastBid.amount / 100000).toFixed(1)} Lac</div>
                        <div className="text-lg font-black uppercase italic tracking-tight text-white/80">{teams.find(t => t.id === lastBid.teamId)?.name}</div>
                        
                        <div className="grid grid-cols-2 gap-4 w-full mt-10">
                           <button onClick={markSold} className="ch-btn-primary py-5 text-[10px] flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-5 h-5" /> Mark as Sold
                           </button>
                           <button onClick={markUnsold} className="bg-white/10 hover:bg-white/20 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                              <XCircle className="w-5 h-5" /> Unsold
                           </button>
                        </div>
                     </>
                   ) : (
                     <div className="py-12 space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-500">
                           <TrendingUp className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Awaiting First Bid...</p>
                        {currentPlayer && (
                          <button onClick={markUnsold} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest pt-4">Pass as Unsold</button>
                        )}
                     </div>
                   )}
                </div>
             </div>
          </section>

          {/* Player Feed & Registry */}
          <section className="grid lg:grid-cols-12 gap-12">
             <div className="lg:col-span-8 space-y-8">
                <div className="bg-white ch-card overflow-hidden">
                   <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Player Pool</h3>
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input 
                           type="text" 
                           placeholder="Filter name / role..." 
                           className="ch-input !pl-12 !py-2 w-64"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <tr>
                               <th className="px-8 py-5">Athlete</th>
                               <th className="px-8 py-5">Base</th>
                               <th className="px-8 py-5">Status</th>
                               <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {filteredPlayers.map(p => (
                              <tr key={p.id} className={cn("group transition-all", p.id === currentPlayer?.id ? "bg-orange-50/50" : "hover:bg-slate-50/30")}>
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black italic text-[10px]">#{p.number}</div>
                                       <div>
                                          <div className="text-sm font-black italic uppercase text-slate-900 leading-none mb-1">{p.name}</div>
                                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.role} • CAT {p.category}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="text-xs font-black tabular-nums text-slate-600">₹{(p.basePrice / 100000).toFixed(1)}L</span>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className={cn(
                                       "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                       p.status === "SOLD" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                       p.status === "ON_BLOCK" ? "bg-orange-100 text-orange-600 border-orange-200 animate-pulse" :
                                       p.status === "UNSOLD" ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                       {p.status} {p.status === "SOLD" && `• ${teams.find(t => t.id === p.soldToTeamId)?.shortName}`}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    {p.status === "UPCOMING" || p.status === "UNSOLD" ? (
                                      <button 
                                        onClick={() => putPlayerOnBlock(p.id)}
                                        className="p-2 bg-slate-900 text-white rounded-lg hover:bg-orange-600 transition-all active:scale-95"
                                      >
                                         <ArrowRight className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                                         <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                    )}
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-8">
                <div className="bg-white ch-card p-8">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                      <History className="w-4 h-4 text-orange-600" /> Recent Activity
                   </h3>
                   <div className="space-y-6">
                      {session.bids.length > 0 ? [...session.bids].reverse().slice(0, 5).map(b => (
                        <div key={b.id} className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black italic text-slate-400">{teams.find(t => t.id === b.teamId)?.shortName}</div>
                              <div>
                                 <div className="text-[10px] font-black uppercase text-slate-900">{teams.find(t => t.id === b.teamId)?.name}</div>
                                 <div className="text-[9px] font-black italic text-orange-600 tracking-widest">BID: ₹{(b.amount / 100000).toFixed(1)}L</div>
                              </div>
                           </div>
                           <div className="text-[8px] font-bold text-slate-300 uppercase tabular-nums">{new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        </div>
                      )) : (
                        <div className="py-12 text-center text-[10px] font-black text-slate-200 uppercase tracking-widest italic">Awaiting Bids...</div>
                      )}
                   </div>
                </div>

                <div className="bg-orange-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-orange-600/20">
                   <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4">Live Insights</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Sold Price</span>
                         <span className="text-lg font-black italic">₹{(players.filter(p => p.status === "SOLD").reduce((acc, p) => acc + (p.soldPrice || 0), 0) / (players.filter(p => p.status === "SOLD").length || 1) / 100000).toFixed(1)} Lac</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Top Category Sold</span>
                         <span className="text-lg font-black italic">A ({players.filter(p => p.status === "SOLD" && p.category === "A").length})</span>
                      </div>
                   </div>
                </div>
             </div>
          </section>
       </main>

       <footer className="py-20 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
          Certified Auction Node • High-Frequency Trading Protocol
       </footer>
    </div>
  );
}
