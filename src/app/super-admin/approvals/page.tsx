"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ShieldCheck, Building2, User, CheckCircle2, 
  XCircle, Clock, Search, Filter, ChevronRight,
  Zap, Info, AlertCircle, Mail, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type ApprovalRequest = {
  id: string;
  type: "ORGANISATION" | "PLAYER";
  name: string;
  email: string;
  detail: string;
  date: string;
  status: "PENDING";
  location?: string;
  subDetail?: string;
};

const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: "org_1",
    type: "ORGANISATION",
    name: "Karnataka Warriors League",
    email: "contact@kwleague.in",
    detail: "Applying for Pro-Tier Multi-Tenant Franchise License.",
    date: "2024-04-23",
    status: "PENDING",
    location: "Bengaluru, India",
    subDetail: "Proposed 8-Team Regional Tournament"
  },
  {
    id: "ply_1",
    type: "PLAYER",
    name: "Sandeep Narwal",
    email: "sandeep.k@athlete.com",
    detail: "Professional Raider Certification Request.",
    date: "2024-04-22",
    status: "PENDING",
    location: "Haryana",
    subDetail: "Weight: 78kg | Height: 178cm"
  },
  {
    id: "org_2",
    type: "ORGANISATION",
    name: "Rural Kabaddi Association",
    email: "info@rural-kabaddi.org",
    detail: "Grassroots Development Program - Standard License.",
    date: "2024-04-21",
    status: "PENDING",
    location: "Pune, Maharashtra",
    subDetail: "Community Driven Rural League"
  }
];

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "ORGANISATION" | "PLAYER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MOCK_APPROVALS.filter(req => {
    const matchesTab = activeTab === "ALL" || req.type === activeTab;
    const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout variant="admin">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              Registration <span className="text-orange-600">Approvals</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 italic">Vetting incoming franchise licenses and professional athlete registries.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{MOCK_APPROVALS.length} Pending Actions</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-600" />
            <Search className="w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search registries by name or email..."
              className="bg-transparent flex-1 outline-none text-sm font-medium text-slate-600 placeholder:text-slate-300"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-full md:w-auto">
            {(["ALL", "ORGANISATION", "PLAYER"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 md:flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-white text-orange-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab === "ALL" ? "All Requests" : tab === "ORGANISATION" ? "Franchises" : "Athletes"}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((req, i) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col xl:flex-row xl:items-center gap-10 group hover:border-orange-600/30 transition-all shadow-sm hover:shadow-2xl relative overflow-hidden"
              >
                 {/* Left Section: Identity & Type */}
                 <div className="xl:w-80 shrink-0 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center border",
                         req.type === "ORGANISATION" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-orange-50 border-orange-100 text-orange-600"
                       )}>
                          {req.type === "ORGANISATION" ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                       </div>
                       <div>
                          <div className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] mb-1",
                            req.type === "ORGANISATION" ? "text-blue-500" : "text-orange-500"
                          )}>
                             {req.type === "ORGANISATION" ? "Entity License" : "Professional Registry"}
                          </div>
                          <div className="text-lg font-black italic uppercase text-slate-900 leading-none">{req.name}</div>
                       </div>
                    </div>
                    <div className="space-y-2 opacity-60">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <Mail className="w-3.5 h-3.5" /> {req.email}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <MapPin className="w-3.5 h-3.5" /> {req.location}
                       </div>
                    </div>
                 </div>

                 {/* Center Section: Details */}
                 <div className="flex-1 space-y-4">
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                       <div className="flex items-start gap-4">
                          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                          <div>
                             <p className="text-sm font-semibold text-slate-600 italic">"{req.detail}"</p>
                             {req.subDetail && (
                               <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mt-2">{req.subDetail}</p>
                             )}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <Clock className="w-4 h-4 text-slate-300" /> Submitted: {req.date}
                       </div>
                       <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" /> High Priority Vetting
                       </div>
                    </div>
                 </div>

                 {/* Right Section: Action Controls */}
                 <div className="xl:w-72 shrink-0 flex items-center gap-3 justify-end border-t xl:border-t-0 xl:border-l border-slate-50 pt-6 xl:pt-0 xl:pl-10">
                    <button className="flex-1 xl:flex-none ch-btn-outline border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 group/btn">
                       <XCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Reject</span>
                    </button>
                    <button className="flex-1 xl:flex-none ch-btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 px-8 py-4 rounded-2xl flex items-center justify-center gap-2 group/btn">
                       <CheckCircle2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-white">Approve</span>
                    </button>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
               </div>
               <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-2">Gate is Clear</h3>
               <p className="text-sm text-slate-400 italic">No pending licenses or player registries currently requiring your signature.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
