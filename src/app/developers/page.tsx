"use client";

import React, { useState } from "react";
import { 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Zap, 
  Webhook, 
  Cpu, 
  ArrowRight,
  ChevronRight,
  Search,
  BookOpen,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DevelopersPage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    { method: "GET", path: "/v1/match/live", desc: "Get real-time score and raid data for the current match." },
    { method: "GET", path: "/v1/teams/:id/stats", desc: "Fetch historical performance and season metrics for a team." },
    { method: "POST", path: "/v1/broadcast/overlay", desc: "Push a custom graphic event to the broadcast overlay." },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Left: Sticky Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex flex-col gap-10 shrink-0">
           <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Back to Hub</span>
              </Link>
              <div className="flex items-center gap-3 mb-2">
                 <Cpu className="w-6 h-6 text-orange-500" />
                 <h1 className="text-2xl font-black italic tracking-tighter uppercase">Dev Portal</h1>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">v1.2.4 Documentation</p>
           </div>

           <nav className="flex flex-col gap-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Introduction</div>
              {["Getting Started", "Authentication", "Rate Limits"].map((item) => (
                <button key={item} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium text-slate-400 hover:text-white transition-all">
                   {item} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-8 mb-4">Core APIs</div>
              {["Match API", "Team Registry", "Social Challenges", "Webhooks"].map((item, i) => (
                <button key={item} className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  i === 0 ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}>
                   {item}
                </button>
              ))}
           </nav>
        </aside>

        {/* Right: Documentation Content */}
        <main className="flex-1 max-w-4xl">
           
           {/* Section: Welcome */}
           <section className="mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
                 <Zap className="w-3.5 h-3.5 text-orange-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Low-Latency Real-time API</span>
              </div>
              <h2 className="text-6xl font-black italic tracking-tighter uppercase mb-8">Build with KabaddiHub</h2>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-10">
                Unlock the power of real-time sports data. Our API provides broadcasters, sponsors, and developers with 10ms latency updates from the mat.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="glass p-8 rounded-3xl border-white/5 hover:border-orange-500/20 transition-all cursor-pointer group">
                    <Terminal className="w-8 h-8 text-orange-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">REST API</h3>
                    <p className="text-sm text-slate-500">Full control over match sessions, team data, and player registries.</p>
                 </div>
                 <div className="glass p-8 rounded-3xl border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group">
                    <Webhook className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Webhooks</h3>
                    <p className="text-sm text-slate-500">Subscribe to live match events like Raids, Tackles, and All-Outs.</p>
                 </div>
              </div>
           </section>

           {/* Section: Live Score API */}
           <section className="mb-20">
              <div className="h-px bg-white/5 w-full mb-20" />
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                <Globe className="w-8 h-8 text-slate-500" />
                Live Score Endpoints
              </h3>

              <div className="space-y-6 mb-12">
                 {endpoints.map((ep, i) => (
                   <div key={i} className="glass rounded-2xl border-white/5 p-6 flex items-center justify-between gap-6 group hover:bg-white/[0.01]">
                      <div className="flex items-center gap-6">
                         <span className={cn(
                           "px-4 py-1.5 rounded-lg text-xs font-black italic",
                           ep.method === "GET" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                         )}>
                            {ep.method}
                         </span>
                         <div>
                            <code className="text-sm font-mono text-slate-300 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{ep.path}</code>
                            <p className="text-xs text-slate-500 mt-1">{ep.desc}</p>
                         </div>
                      </div>
                      <button className="p-3 glass rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                         <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
              </div>

              {/* Code Example */}
              <div className="glass rounded-[2rem] border-white/5 overflow-hidden shadow-2xl">
                 <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                       <Terminal className="w-4 h-4 text-slate-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">cURL / Example Request</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard("curl -X GET https://api.kabaddihub.com/v1/match/live")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[10px] font-bold text-slate-500 hover:text-white transition-all"
                    >
                       {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                       {copied ? "Copied!" : "Copy URL"}
                    </button>
                 </div>
                 <div className="bg-[#0f172a] p-8">
                    <pre className="text-sm font-mono leading-relaxed overflow-x-auto custom-scrollbar">
                       <code className="text-slate-300">
{`curl -X GET "https://api.kabaddihub.com/v1/match/live" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"`}
                       </code>
                    </pre>
                 </div>
                 <div className="bg-slate-900 border-t border-white/5 p-8">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                       <Check className="w-3 h-3 text-emerald-500" />
                       Expected JSON Response
                    </div>
                    <pre className="text-sm font-mono leading-relaxed text-emerald-400/80">
{`{
  "match_id": "m102",
  "status": "LIVE",
  "home": { "name": "PAN", "score": 24 },
  "away": { "name": "WAR", "score": 18 },
  "timer": "12:45",
  "current_raid": {
    "raider": "P. SEHWAG",
    "clock": 22
  }
}`}
                    </pre>
                 </div>
              </div>
           </section>

           {/* Section: Authentication */}
           <section className="mb-20">
              <div className="h-px bg-white/5 w-full mb-20" />
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                <Lock className="w-8 h-8 text-slate-500" />
                Security & Authentication
              </h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                All API requests require a Bearer token in the <code className="bg-white/5 px-2 py-0.5 rounded text-orange-400 text-xs">Authorization</code> header. You can generate multiple API keys for different environments (Production, Development, Staging).
              </p>
              <div className="p-8 rounded-[2rem] bg-orange-500/5 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-8 group">
                 <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-xl">
                       <Lock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h4 className="text-lg font-bold mb-1 italic">Generate New API Key</h4>
                       <p className="text-xs text-orange-500/60 font-semibold tracking-wide">Developer access required for production keys.</p>
                    </div>
                 </div>
                 <button className="px-10 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl text-xs font-black uppercase tracking-widest italic transition-all shadow-xl shadow-orange-900/40">
                    Get My Keys
                 </button>
              </div>
           </section>

        </main>
      </div>
    </div>
  );
}
