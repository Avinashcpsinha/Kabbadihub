
"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Zap, Shield, Calendar, Loader2 } from "lucide-react";

export default function SeedTestMatchesPage() {
  const [status, setStatus] = useState<string>("Ready to seed");
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    setLoading(true);
    setStatus("Fetching organisations...");

    // 1. Fetch Tenants
    const { data: tenants } = await supabase.from('tenants').select('id, name');
    if (!tenants || tenants.length === 0) {
      setStatus("Error: No organisations found.");
      setLoading(false);
      return;
    }

    // 2. Fetch Teams
    setStatus(`Found ${tenants.length} organisations. Fetching teams...`);
    const { data: teams } = await supabase.from('teams').select('id, name, tenant_id');
    if (!teams || teams.length === 0) {
      setStatus("Error: No teams found.");
      setLoading(false);
      return;
    }

    const teamsByTenant = teams.reduce((acc: any, team: any) => {
      if (!acc[team.tenant_id]) acc[team.tenant_id] = [];
      acc[team.tenant_id].push(team);
      return acc;
    }, {});

    const matchesToInsert = [];
    const today = new Date();

    setStatus(`Generating 100 matches across ${tenants.length} franchises...`);

    for (const tenant of tenants) {
      const tenantTeams = teamsByTenant[tenant.id];
      if (!tenantTeams || tenantTeams.length < 2) continue;

      for (let i = 0; i < 10; i++) {
        let homeIdx = Math.floor(Math.random() * tenantTeams.length);
        let awayIdx = Math.floor(Math.random() * tenantTeams.length);
        while (awayIdx === homeIdx) {
          awayIdx = Math.floor(Math.random() * tenantTeams.length);
        }

        const homeTeam = tenantTeams[homeIdx];
        const awayTeam = tenantTeams[awayIdx];

        const daysOffset = Math.floor(Math.random() * 6);
        const hoursOffset = 10 + Math.floor(Math.random() * 12); // Between 10am and 10pm
        const scheduledAt = new Date(today);
        scheduledAt.setDate(today.getDate() + daysOffset);
        scheduledAt.setHours(hoursOffset, 0, 0, 0);

        matchesToInsert.push({
          tenant_id: tenant.id,
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          scheduled_at: scheduledAt.toISOString(),
          status: i === 0 ? "LIVE" : "UPCOMING",
          state: {
            home: { name: homeTeam.name, score: i === 0 ? Math.floor(Math.random() * 15) : 0, matCount: 7, timeouts: 2 },
            away: { name: awayTeam.name, score: i === 0 ? Math.floor(Math.random() * 15) : 0, matCount: 7, timeouts: 2 },
            timer: 1200,
            isActive: false,
            half: 1,
            history: []
          }
        });
      }
    }

    setStatus(`Injecting ${matchesToInsert.length} fixtures into Supabase...`);
    
    // Insert in batches of 20 to be safe
    for (let i = 0; i < matchesToInsert.length; i += 20) {
        const batch = matchesToInsert.slice(i, i + 20);
        const { error } = await supabase.from('live_matches').insert(batch);
        if (error) {
            console.error("Batch error:", error);
            setStatus(`Partial Error: ${error.message}`);
            setLoading(false);
            return;
        }
        setStatus(`Progress: ${i + batch.length}/${matchesToInsert.length} fixtures injected...`);
    }

    setStatus("✅ SUCCESS! 100 Matches have been scheduled across all franchises.");
    setLoading(false);
  };

  return (
    <DashboardLayout variant="admin">
      <div className="p-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Calendar className="w-10 h-10" />
            </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
            Global Match Seeder
          </h1>
          <p className="text-slate-500 font-medium mb-10">
            Generate 100 high-fidelity match fixtures (10 per franchise) spanning the next 5 days.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-sm font-bold text-slate-600 border border-slate-100">
            {loading ? (
                <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                    {status}
                </div>
            ) : status}
          </div>

          <button
            onClick={seed}
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-4"
          >
            {loading ? "Processing Ecosystem..." : "Execute Global Match Seeding"} <Zap className="w-5 h-5 text-orange-400" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
