"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { 
  FileText, Search, Filter, Calendar, Clock, 
  Building2, User, ShieldAlert, CheckCircle2, 
  AlertCircle, Activity, ChevronRight, FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type AuditLog = {
  id: string;
  timestamp: number;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
};

export default function SuperAdminAuditPage() {
  const { tenants } = useTenant();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<AuditLog["severity"] | "ALL">("ALL");

  useEffect(() => {
    // Generate some mock audit logs based on state
    const generatedLogs: AuditLog[] = [];
    tenants.forEach((t, index) => {
      generatedLogs.push({
        id: `log_1_${t.id}`,
        timestamp: Date.now() - (index * 3600000 * 2),
        tenantId: t.id,
        tenantName: t.name,
        userId: "admin_123",
        userName: "League Admin",
        action: "TENANT_SETTINGS_UPDATE",
        details: "Modified primary brand color and contact email.",
        severity: "INFO"
      });
      generatedLogs.push({
        id: `log_2_${t.id}`,
        timestamp: Date.now() - (index * 3600000 * 5),
        tenantId: t.id,
        tenantName: t.name,
        userId: "admin_123",
        userName: "League Admin",
        action: "MATCH_SCORING_START",
        details: "Live scoring session initialized for Match #M-4421.",
        severity: "INFO"
      });
      if (index % 3 === 0) {
        generatedLogs.push({
          id: `log_3_${t.id}`,
          timestamp: Date.now() - (index * 3600000 * 12),
          tenantId: t.id,
          tenantName: t.name,
          userId: "sys_auto",
          userName: "System Sentinel",
          action: "SECURITY_THRESHOLD_ALERT",
          details: "Multiple failed login attempts detected from IP 192.168.1.104.",
          severity: "WARNING"
        });
      }
    });

    setLogs(generatedLogs.sort((a, b) => b.timestamp - a.timestamp));
  }, [tenants]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === "ALL" || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityStyles = (severity: AuditLog["severity"]) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-50 text-red-600 border-red-100";
      case "WARNING": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
  };

  const getSeverityIcon = (severity: AuditLog["severity"]) => {
    switch (severity) {
      case "CRITICAL": return <ShieldAlert className="w-4 h-4" />;
      case "WARNING": return <AlertCircle className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout variant="admin">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">Audit Logs</h1>
            <p className="text-sm font-medium text-slate-500">Track all major actions and security events across the platform.</p>
          </div>
          <button className="ch-btn-outline px-6 py-3 flex items-center gap-3">
             <FileSearch className="w-4 h-4" /> Export Audit Log
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <Search className="w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Filter logs by tenant, action or description..."
              className="bg-transparent flex-1 outline-none text-sm font-medium text-slate-600 placeholder:text-slate-300"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
            {(["ALL", "INFO", "WARNING", "CRITICAL"] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={cn(
                  "flex-1 md:flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  filterSeverity === sev ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Audit List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredLogs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col lg:flex-row lg:items-center gap-6 group hover:border-red-100 transition-all shadow-sm"
              >
                <div className="flex items-center gap-6 lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-50 pb-4 lg:pb-0 shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                    getSeverityStyles(log.severity)
                  )}>
                    {getSeverityIcon(log.severity)}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{log.tenantName}</div>
                    <div className="text-xs font-black italic uppercase text-slate-900 truncate">{log.action.replace(/_/g, " ")}</div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 italic">"{log.details}"</p>
                  <div className="flex flex-wrap items-center gap-6 mt-3">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300">
                      <User className="w-3.5 h-3.5" />
                      Auth: {log.userName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:ml-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                  <button className="p-3 bg-slate-50 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredLogs.length === 0 && (
            <div className="py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black italic uppercase text-slate-900 mb-2">No Matching Logs</h3>
              <p className="text-sm text-slate-400 italic">Adjustment filters to view more audit history.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
