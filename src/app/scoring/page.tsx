"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import { useAuth } from "@/context/AuthContext";
import { useMatch } from "@/context/MatchContext";
import { useTenant } from "@/context/TenantContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ─── Raid Outcomes ────────────────────────────────────────────────────────────
const RAID_OUTCOMES = [
  { key: "touch_point",  label: "Touch Point",  pts: 1, icon: "✋", color: "#22c55e", type: "TOUCH" as const },
  { key: "bonus_point",  label: "Bonus Point",  pts: 1, icon: "⭐", color: "#eab308", type: "BONUS" as const },
  { key: "super_raid",   label: "Super Raid",   pts: 3, icon: "🔥", color: "#f97316", type: "SUPER_RAID" as const },
  { key: "super_tackle", label: "Super Tackle", pts: 2, icon: "💥", color: "#a855f7", type: "SUPER_TACKLE" as const },
  { key: "do_or_die",    label: "Do-or-Die",    pts: 1, icon: "⚡", color: "#3b82f6", type: "TOUCH" as const },
  { key: "empty_raid",   label: "Empty Raid",   pts: 0, icon: "🔄", color: "#6b7280", type: "TECHNICAL_POINT" as const },
  { key: "tackle",       label: "Tackle Out",   pts: 1, icon: "🛡️", color: "#ef4444", type: "TACKLE" as const },
  { key: "out_of_bounds",label: "Out of Bounds",pts: 1, icon: "📍", color: "#f59e0b", type: "TACKLE" as const },
];

const PENALTIES = [
  { key: "yellow_card", label: "Yellow Card", icon: "🟡", color: "#eab308" },
  { key: "red_card",    label: "Red Card",    icon: "🔴", color: "#ef4444" },
  { key: "green_card",  label: "Green Card",  icon: "🟢", color: "#22c55e" },
  { key: "timeout",     label: "Timeout",     icon: "⏱️", color: "#6b7280" },
  { key: "review",      label: "Team Review", icon: "📹", color: "#8b5cf6" },
];

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ toasts }: { toasts: { id: number; msg: string; color: string; icon: string }[] }) {
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.color || "#1e293b", color: "#fff", padding: "10px 20px",
          borderRadius: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16,
          fontWeight: 700, letterSpacing: 1, boxShadow: `0 4px 20px ${t.color}66`,
          animation: "slideDown 0.3s ease",
        }}>
          {t.icon} {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Main Scorer ──────────────────────────────────────────────────────────────
function ScoringContent() {
  const { role } = useAuth();
  const { tenant } = useTenant();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { state, activeMatchId, setMatchId, recordEvent, undoLastAction, undoToEvent, toggleTimer, resetMatch, setRaider, setDoOrDie, switchHalf } = useMatch();

  const [rosters, setRosters] = React.useState<{ home: any[], away: any[] }>({ home: [], away: [] });
  const [activeTab, setActiveTab] = React.useState<"score" | "events" | "players" | "stats">("score");
  const [activeTeam, setActiveTeam] = React.useState<"home" | "away">("home");
  const [selectedPlayer, setSelectedPlayer] = React.useState<any>(null);
  const [toasts, setToasts] = React.useState<{ id: number; msg: string; color: string; icon: string }[]>([]);
  const [toastId, setToastId] = React.useState(0);
  const [reviewsHome, setReviewsHome] = React.useState(2);
  const [reviewsAway, setReviewsAway] = React.useState(2);
  const [playerStats, setPlayerStats] = React.useState<{ [id: string]: { touchPoints: number; bonusPoints: number; tackles: number; active: boolean } }>({});
  const [successTackles, setSuccessTackles] = React.useState({ home: 0, away: 0 });
  const [raidTimer, setRaidTimer] = React.useState(30);
  const [isRaidActive, setIsRaidActive] = React.useState(false);

  const homeColor = "#FF6B35";
  const awayColor = "#1A6DFF";

  const addToast = React.useCallback((msg: string, color: string, icon: string) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts((t) => [...t, { id, msg, color, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, [toastId]);

  React.useEffect(() => {
    if (matchId) {
      setMatchId(matchId);
      
      const fetchRosters = async () => {
        const { data: match } = await supabase
          .from('live_matches')
          .select('home_team_id, away_team_id')
          .eq('id', matchId)
          .single();

        if (match) {
          // 1. Fetch junction table records
          const [{ data: hTA }, { data: aTA }] = await Promise.all([
            supabase.from('team_athletes').select('*').eq('team_id', match.home_team_id),
            supabase.from('team_athletes').select('*').eq('team_id', match.away_team_id)
          ]);

          // 2. Fetch all unique athletes
          const allAthleteIds = [...(hTA || []), ...(aTA || [])].map(ta => ta.athlete_id);
          const { data: athletesData } = await supabase
            .from('athletes')
            .select('*')
            .in('id', allAthleteIds);

          const athleteMap = new Map(athletesData?.map(a => [a.id, a]));

          const mapRoster = (taList: any[]) => taList.map(ta => {
            const a = athleteMap.get(ta.athlete_id);
            return {
              id: ta.athlete_id,
              name: a?.name || "Unknown Player",
              number: ta.jersey_number || a?.jersey_no || "0",
            };
          }).filter(p => p.id);

          const homeRoster = mapRoster(hTA || []);
          const awayRoster = mapRoster(aTA || []);

          setRosters({ home: homeRoster, away: awayRoster });

          const stats: typeof playerStats = {};
          [...homeRoster, ...awayRoster].forEach((p: any) => { 
            stats[p.id] = { touchPoints: 0, bonusPoints: 0, tackles: 0, active: true }; 
          });
          setPlayerStats(stats);
        }
      };

      fetchRosters();
    }
  }, [matchId, setMatchId]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Raid Timer Effect
  React.useEffect(() => {
    let interval: any;
    if (isRaidActive && raidTimer > 0) {
      interval = setInterval(() => {
        setRaidTimer(t => t - 1);
      }, 1000);
    } else if (raidTimer === 0) {
      setIsRaidActive(false);
      addToast("RAID TIME UP!", "#ef4444", "⏰");
    }
    return () => clearInterval(interval);
  }, [isRaidActive, raidTimer, addToast]);

  const handleMasterStop = () => {
    if (state.isActive) toggleTimer();
    setIsRaidActive(false);
    addToast("ALL TIMERS HALTED", "#6b7280", "🛑");
  };

  const handlePlayerSelect = (p: any) => {
    if (selectedPlayer?.id === p.id) {
      setSelectedPlayer(null);
      setIsRaidActive(false);
    } else {
      setSelectedPlayer(p);
      setRaidTimer(30);
      setIsRaidActive(true);
      if (!state.isActive) toggleTimer(); // Also start match timer if it's not running
    }
  };

  const handleRaidOutcome = (outcome: typeof RAID_OUTCOMES[0]) => {
    if (!selectedPlayer) { addToast("Select a player first!", "#ef4444", "⚠️"); return; }
    const scoringTeam = outcome.key === "tackle" || outcome.key === "super_tackle"
      ? (activeTeam === "home" ? "away" : "home")
      : activeTeam;

    recordEvent({ team: scoringTeam, points: outcome.pts, type: outcome.type, raider: selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : undefined, gameTime: state.timer });

    // Update local player stats
    setPlayerStats(prev => {
      const s = { ...prev };
      if (!s[selectedPlayer.id]) s[selectedPlayer.id] = { touchPoints: 0, bonusPoints: 0, tackles: 0, active: true };
      const p = { ...s[selectedPlayer.id] };
      if (outcome.key === "touch_point" || outcome.key === "super_raid" || outcome.key === "do_or_die") p.touchPoints++;
      if (outcome.key === "bonus_point") p.bonusPoints++;
      if (outcome.key === "tackle") { p.active = false; p.tackles++; }
      s[selectedPlayer.id] = p;
      return s;
    });

    if (outcome.key === "super_raid") setSuperRaids(r => ({ ...r, [activeTeam]: r[activeTeam as "home" | "away"] + 1 }));
    if (outcome.key === "tackle" || outcome.key === "super_tackle") setSuccessTackles(r => ({ ...r, [activeTeam === "home" ? "away" : "home"]: r[activeTeam === "home" ? "away" : "home"] + 1 }));
    if (outcome.key !== "tackle" && outcome.key !== "super_tackle" && outcome.key !== "empty_raid") setRaidCount(r => ({ ...r, [activeTeam]: r[activeTeam as "home" | "away"] + 1 }));

    addToast(`${outcome.icon} ${outcome.label} +${outcome.pts}pt${outcome.pts !== 1 ? "s" : ""}`, outcome.color, outcome.icon);
    setSelectedPlayer(null);
    setIsRaidActive(false);
    setRaidTimer(30);
  };

  const handlePenalty = (penalty: typeof PENALTIES[0]) => {
    if (penalty.key === "review") {
      if (activeTeam === "home") { if (reviewsHome <= 0) { addToast("No reviews left!", "#ef4444", "⚠️"); return; } setReviewsHome(r => r - 1); }
      else { if (reviewsAway <= 0) { addToast("No reviews left!", "#ef4444", "⚠️"); return; } setReviewsAway(r => r - 1); }
    }
    if (penalty.key === "timeout") {
      recordEvent({ team: activeTeam, points: 0, type: "TIMEOUT", gameTime: state.timer });
    }
    addToast(`${penalty.icon} ${penalty.label} — ${activeTeam === "home" ? state.home.shortName : state.away.shortName}`, penalty.color, penalty.icon);
  };

  const handleAllOut = (team: "home" | "away") => {
    const scoringTeam = team === "home" ? "away" : "home";
    recordEvent({ team: scoringTeam, points: 2, type: "ALL_OUT", gameTime: state.timer });
    const tName = team === "home" ? state.home.name : state.away.name;
    addToast(`🏆 ALL OUT! ${tName} +2`, team === "home" ? awayColor : homeColor, "🏆");
  };

  const handleRevive = (team: "home" | "away") => {
    setPlayerStats(prev => {
      const s = { ...prev };
      const roster = team === "home" ? rosters.home : rosters.away;
      roster.forEach((p: any) => { if (s[p.id]) s[p.id] = { ...s[p.id], active: true }; });
      return s;
    });
    addToast(`↑ ${team === "home" ? state.home.shortName : state.away.shortName} Revived`, "#22c55e", "↑");
  };

  const activePlayersCount = (team: "home" | "away") => {
    const roster = team === "home" ? rosters.home : rosters.away;
    return roster.filter((p: any) => playerStats[p.id]?.active !== false).length;
  };

  const currentTeamColor = activeTeam === "home" ? homeColor : awayColor;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulseLive { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .arena-btn:hover { filter: brightness(1.2); transform: scale(1.01); }
        .arena-btn:active { transform: scale(0.97); }
        .player-btn:hover { filter: brightness(1.15); }
        .comm-row { animation: slideIn 0.35s ease; }
        .comm-row:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>
      <Toast toasts={toasts} />

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f 0%, #0f1020 50%, #0a0f1a 100%)", fontFamily: "'Barlow Condensed', sans-serif", color: "#fff", paddingBottom: 80 }}>

        {/* Header Bar */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#888", textTransform: "uppercase" }}>⚡ Pro Kabaddi Live</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#555", letterSpacing: 1 }}>Half {state.half} / 2</span>
            
            {activeMatchId && (
              <Link 
                href={`/overlay?id=${activeMatchId}`} 
                target="_blank" 
                style={{ background: "#ea580c", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: 11, fontWeight: 800, letterSpacing: 1, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)", transition: "all 0.2s" }}
                className="hover:bg-orange-500 hover:-translate-y-0.5"
              >
                📺 OPEN BROADCAST MONITOR
              </Link>
            )}

            {role === "PUBLIC" && (
              <Link href="/tournaments" style={{ color: "#555", fontSize: 12, textDecoration: "none", marginLeft: 8 }}>← Back</Link>
            )}
          </div>
        </div>

        {/* Scoreboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "14px 12px", background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Home */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: homeColor, marginBottom: 3, textTransform: "uppercase" }}>Home</div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, marginBottom: 6, color: "#fff" }}>{state.home.name}</div>
            <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1, color: "#fff", textShadow: `0 0 40px ${homeColor}66` }}>{state.home.score}</div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 7 }}>
              {(rosters.home.length > 0 ? rosters.home : Array(7).fill(null)).map((p: any, i: number) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: (p && playerStats[p.id]?.active !== false) ? homeColor : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{state.home.matCount} on mat</div>
          </div>

          {/* Timer */}
          <div style={{ textAlign: "center", padding: "0 14px" }}>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 3, color: state.isActive ? "#22c55e" : "#f59e0b", fontVariantNumeric: "tabular-nums" }}>{fmt(state.timer)}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "center" }}>
              <button className="arena-btn" onClick={toggleTimer} style={{ background: state.isActive ? "#ef4444" : "#22c55e", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 6, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                {state.isActive ? "⏸ STOP" : "▶ START"}
              </button>
              <button className="arena-btn" onClick={handleMasterStop} style={{ background: "#334155", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 6, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                🛑 MASTER STOP
              </button>
              <button className="arena-btn" onClick={resetMatch} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "6px 10px", borderRadius: 6, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>↺</button>
            </div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 7, letterSpacing: 1 }}>VS</div>
          </div>

          {/* Away */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: awayColor, marginBottom: 3, textTransform: "uppercase" }}>Away</div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, marginBottom: 6, color: "#fff" }}>{state.away.name}</div>
            <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1, color: "#fff", textShadow: `0 0 40px ${awayColor}66` }}>{state.away.score}</div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 7 }}>
              {(rosters.away.length > 0 ? rosters.away : Array(7).fill(null)).map((p: any, i: number) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: (p && playerStats[p.id]?.active !== false) ? awayColor : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{state.away.matCount} on mat</div>
          </div>
        </div>

        {/* Resources Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#555" }}>⏱️ {state.home.timeouts}</span>
            <span style={{ fontSize: 11, color: "#555" }}>📹 {reviewsHome}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: homeColor, letterSpacing: 1 }}>{state.home.shortName}</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: awayColor, letterSpacing: 1 }}>{state.away.shortName}</span>
            <span style={{ fontSize: 11, color: "#555" }}>📹 {reviewsAway}</span>
            <span style={{ fontSize: 11, color: "#555" }}>⏱️ {state.away.timeouts}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 12px" }}>
          {(["score", "events", "players", "stats"] as const).map((tab) => {
            const labels: Record<string, string> = { score: "⚡ SCORE", events: "📋 EVENTS", players: "👤 PLAYERS", stats: "📊 STATS" };
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #f97316" : "2px solid transparent", color: activeTab === tab ? "#fff" : "#555", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}>
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "12px" }}>

          {/* ── SCORE TAB ─────────────────────────────────────────── */}
          {activeTab === "score" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" }}>
            {/* ── LEFT: Scorer Controls ── */}
            <div>
              {/* Raiding Team Toggle */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Raiding Team</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["home", "away"] as const).map((team) => {
                    const tName = team === "home" ? state.home.name : state.away.name;
                    const tColor = team === "home" ? homeColor : awayColor;
                    const isActive = activeTeam === team;
                    return (
                      <button key={team} className="arena-btn" onClick={() => { setActiveTeam(team); setSelectedPlayer(null); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${isActive ? tColor : "rgba(255,255,255,0.1)"}`, background: isActive ? `${tColor}22` : "rgba(255,255,255,0.03)", color: isActive ? tColor : "#555", fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 13, letterSpacing: 2, cursor: "pointer", transition: "all 0.2s" }}>
                        {tName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Player Selection Grid */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Select Raider</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {(activeTeam === "home" ? rosters.home : rosters.away).map((p: any) => {
                    const isOut = playerStats[p.id]?.active === false;
                    const isSelected = selectedPlayer?.id === p.id;
                    return (
                      <button key={p.id} className="player-btn" onClick={() => !isOut && handlePlayerSelect(p)} style={{ padding: "8px 4px", borderRadius: 8, border: `2px solid ${isSelected ? currentTeamColor : isOut ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.12)"}`, background: isSelected ? `${currentTeamColor}33` : isOut ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.04)", color: isOut ? "#333" : "#fff", fontFamily: "'Barlow Condensed'", cursor: isOut ? "not-allowed" : "pointer", textAlign: "center", transition: "all 0.15s", opacity: isOut ? 0.4 : 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, color: isSelected ? currentTeamColor : isOut ? "#333" : "#fff" }}>#{p.number}</div>
                        <div style={{ fontSize: 9, letterSpacing: 0.5, marginTop: 2, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name.split(" ")[0]}</div>
                        {isOut && <div style={{ fontSize: 8, color: "#ef4444", fontWeight: 700, marginTop: 1 }}>OUT</div>}
                      </button>
                    );
                  })}
                </div>
                {selectedPlayer && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 11, color: currentTeamColor, fontWeight: 700, letterSpacing: 1 }}>
                      ▸ #{selectedPlayer.number} {selectedPlayer.name} selected
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.4)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span style={{ fontSize: 10, color: "#555", fontWeight: 800 }}>RAID TIMER</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: raidTimer < 10 ? "#ef4444" : "#22c55e", fontVariantNumeric: "tabular-nums", width: 24, textAlign: "center" }}>{raidTimer}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Raid Outcome Grid */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Raid Outcome</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {RAID_OUTCOMES.map((outcome) => (
                    <button key={outcome.key} className="arena-btn" onClick={() => handleRaidOutcome(outcome)} style={{ padding: "12px", borderRadius: 8, border: `1px solid ${outcome.color}44`, background: `${outcome.color}11`, color: "#fff", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
                      <span style={{ fontSize: 18 }}>{outcome.icon}</span>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ color: outcome.color }}>{outcome.label}</div>
                        <div style={{ fontSize: 10, color: "#555" }}>+{outcome.pts} pt{outcome.pts !== 1 ? "s" : ""}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Penalties */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Penalties & Actions</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {PENALTIES.map((p) => (
                    <button key={p.key} className="arena-btn" onClick={() => handlePenalty(p)} style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${p.color}44`, background: `${p.color}11`, color: p.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Out */}
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button className="arena-btn" onClick={() => handleAllOut("home")} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1px solid #ef444444", background: "#ef444411", color: "#ef4444", fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                  🏆 ALL OUT — {state.home.shortName}
                </button>
                <button className="arena-btn" onClick={() => handleAllOut("away")} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1px solid #ef444444", background: "#ef444411", color: "#ef4444", fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                  🏆 ALL OUT — {state.away.shortName}
                </button>
              </div>

              {/* Revive + Undo */}
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button className="arena-btn" onClick={() => handleRevive("home")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #22c55e44", background: "#22c55e11", color: "#22c55e", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                  ↑ Revive {state.home.shortName}
                </button>
                <button className="arena-btn" onClick={() => handleRevive("away")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #22c55e44", background: "#22c55e11", color: "#22c55e", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                  ↑ Revive {state.away.shortName}
                </button>
                <button className="arena-btn" onClick={undoLastAction} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#888", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>
                  ↩ Undo
                </button>
              </div>

              {/* Half Time */}
              {state.half === 1 && (
                <button className="arena-btn" onClick={switchHalf} style={{ width: "100%", marginTop: 8, padding: "12px", borderRadius: 8, border: "1px solid #f97316", background: "#f9731611", color: "#f97316", fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 2, transition: "all 0.15s" }}>
                  ⏱️ START HALF TIME → 2ND HALF
                </button>
              )}
            </div>{/* end LEFT */}

            {/* ── RIGHT: Live Commentary Panel ── */}
            <div style={{ display: "flex", flexDirection: "column", background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, height: "fit-content", minHeight: 400, maxHeight: "80vh", overflow: "hidden" }}>

              {/* Panel Header */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulseLive 1.4s ease-in-out infinite", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: "#e2e8f0", textTransform: "uppercase" }}>🎙️ Live Commentary</span>
                </div>
                <span style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 10 }}>{state.history.length} events</span>
              </div>

              {/* Current Raider Banner */}
              {state.currentRaider && (
                <div style={{ padding: "8px 14px", background: `${homeColor}25`, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🏃</span>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase" }}>Now Raiding</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: homeColor }}>{state.currentRaider}</div>
                  </div>
                </div>
              )}

              {/* Commentary Feed — scrollable */}
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

                {state.history.length === 0 ? (
                  <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, lineHeight: 1.8 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🎙️</div>
                    <div style={{ color: "#475569", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>No events yet</div>
                    <div style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>Record a raid outcome to begin</div>
                  </div>
                ) : (
                  state.history.map((e, idx) => {
                    const isHome = e.team === "home";
                    const tColor  = isHome ? homeColor : awayColor;
                    const tName   = isHome ? state.home.name  : state.away.name;
                    const tShort  = isHome ? state.home.shortName : state.away.shortName;
                    const fmtT    = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

                    const ICONS: Record<string,string> = {
                      TOUCH:           "✋",
                      BONUS:           "⭐",
                      SUPER_RAID:      "🔥",
                      TACKLE:          "🛡️",
                      SUPER_TACKLE:    "💥",
                      ALL_OUT:         "🏆",
                      TECHNICAL_POINT: "🔄",
                      TIMEOUT:         "⏱️",
                    };
                    const icon = ICONS[e.type] ?? "📌";

                    const TEXTS: Record<string,string> = {
                      TOUCH:           e.raider ? `${e.raider} scores a Touch Point!` : `Touch Point for ${tName}!`,
                      BONUS:           e.raider ? `${e.raider} crosses the Bonus Line!` : `Bonus Point — ${tName}!`,
                      SUPER_RAID:      e.raider ? `SUPER RAID! ${e.raider} overwhelms the defence!` : `Super Raid — ${tName}!`,
                      SUPER_TACKLE:    `SUPER TACKLE! ${tName} hold the raider!`,
                      TACKLE:          e.raider ? `${e.raider} is tackled out! ${tName} scores.` : `Tackle Out — ${tName} earns a point!`,
                      ALL_OUT:         `ALL OUT! ${tName} eliminates the full squad — +2 bonus!`,
                      TECHNICAL_POINT: `Technical point awarded to ${tName}.`,
                      TIMEOUT:         `${tName} calls a Timeout.`,
                    };
                    const commentary = TEXTS[e.type] ?? `${e.type.replace(/_/g, " ")} — ${tName}`;
                    const isLatest   = idx === 0;

                    return (
                      <div
                        key={e.id}
                        className="comm-row"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "12px 14px",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          background: isLatest ? `${tColor}18` : "transparent",
                          borderLeft: `3px solid ${isLatest ? tColor : "transparent"}`,
                        }}
                      >
                        {/* Icon */}
                        <div style={{ fontSize: 20, lineHeight: 1.2, flexShrink: 0 }}>{icon}</div>

                        {/* Commentary text block */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {isLatest && (
                            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 2, color: tColor, textTransform: "uppercase", marginBottom: 3 }}>● LATEST</div>
                          )}
                          <div style={{
                            fontSize: 13,
                            fontWeight: isLatest ? 800 : 600,
                            color: isLatest ? "#f1f5f9" : "#94a3b8",
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                          }}>
                            {commentary}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, color: "#475569", fontVariantNumeric: "tabular-nums", background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>{fmtT(e.gameTime)}</span>
                            <span style={{ fontSize: 9, fontWeight: 800, color: tColor, letterSpacing: 1, background: `${tColor}20`, padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" }}>{tShort}</span>
                            {e.points > 0 && (
                              <span style={{ fontSize: 12, fontWeight: 900, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "1px 6px", borderRadius: 4 }}>+{e.points} pts</span>
                            )}
                          </div>
                        </div>

                        {/* Revert button */}
                        <button
                          onClick={() => undoToEvent(e.id)}
                          title="Revert match to this point"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 7px",
                            borderRadius: 5,
                            flexShrink: 0,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            letterSpacing: 0.5,
                          }}
                        >↩</button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Panel Footer — score summary */}
              <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "#0f172a" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: homeColor, lineHeight: 1 }}>{state.home.score}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{state.home.shortName}</div>
                </div>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 3 }}>VS</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: awayColor, lineHeight: 1 }}>{state.away.score}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{state.away.shortName}</div>
                </div>
              </div>

            </div>{/* end RIGHT */}

            </div>/* end two-col grid */
          )}

          {/* ── EVENTS TAB ─────────────────────────────────────────── */}
          {activeTab === "events" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#888", letterSpacing: 2 }}>MATCH EVENTS ({state.history.length})</div>
              </div>
              {state.history.length === 0 && <div style={{ textAlign: "center", color: "#333", padding: "40px 0", fontSize: 14 }}>No events yet. Start scoring!</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {state.history.map((e) => {
                  const isHome = e.team === "home";
                  const tColor = isHome ? homeColor : awayColor;
                  const tShort = isHome ? state.home.shortName : state.away.shortName;
                  const icons: Record<string, string> = { TOUCH: "✋", BONUS: "⭐", SUPER_RAID: "🔥", TACKLE: "🛡️", SUPER_TACKLE: "💥", ALL_OUT: "🏆", TECHNICAL_POINT: "🔄", TIMEOUT: "⏱️" };
                  const fmt2 = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
                  return (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${tColor}` }}>
                      <div style={{ fontSize: 20 }}>{icons[e.type] || "📌"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{e.type.replace("_", " ")}</div>
                        <div style={{ fontSize: 11, color: "#555" }}>{e.raider || "—"} · {fmt2(e.gameTime)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: tColor, textAlign: "right" }}>{tShort}</div>
                        {e.points > 0 && <div style={{ fontSize: 16, fontWeight: 900, color: "#22c55e", textAlign: "right" }}>+{e.points}</div>}
                      </div>
                      <button onClick={() => undoToEvent(e.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 11, fontFamily: "'Barlow Condensed'", fontWeight: 700, padding: "4px 6px" }} title="Revert to this point">↩</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PLAYERS TAB ─────────────────────────────────────────── */}
          {activeTab === "players" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {([["home", state.home.name, homeColor, rosters.home], ["away", state.away.name, awayColor, rosters.away]] as const).map(([team, tName, tColor, roster]) => (
                <div key={team}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: tColor, letterSpacing: 3, marginBottom: 8 }}>{tName}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {roster.map((p: any) => {
                      const ps = playerStats[p.id] || { touchPoints: 0, bonusPoints: 0, tackles: 0, active: true };
                      const isOut = ps.active === false;
                      return (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: isOut ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.04)", opacity: isOut ? 0.5 : 1 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: isOut ? "#333" : tColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>#{p.number}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>{isOut ? "OUT" : "Active"}</div>
                          </div>
                          <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                            <div style={{ textAlign: "center" }}><div style={{ color: "#22c55e", fontWeight: 900, fontSize: 16 }}>{ps.touchPoints}</div><div style={{ color: "#444" }}>Touch</div></div>
                            <div style={{ textAlign: "center" }}><div style={{ color: "#eab308", fontWeight: 900, fontSize: 16 }}>{ps.bonusPoints}</div><div style={{ color: "#444" }}>Bonus</div></div>
                            <div style={{ textAlign: "center" }}><div style={{ color: "#f97316", fontWeight: 900, fontSize: 16 }}>{ps.tackles}</div><div style={{ color: "#444" }}>Tackle</div></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STATS TAB ─────────────────────────────────────────── */}
          {activeTab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                ["Total Raids", raidCount.home, raidCount.away, "#3b82f6"],
                ["Super Raids", superRaids.home, superRaids.away, "#f97316"],
                ["Successful Tackles", successTackles.home, successTackles.away, "#a855f7"],
                ["On Mat", state.home.matCount, state.away.matCount, "#22c55e"],
                ["Timeouts Left", state.home.timeouts, state.away.timeouts, "#f59e0b"],
                ["Reviews Left", reviewsHome, reviewsAway, "#8b5cf6"],
              ] as [string, number, number, string][]).map(([label, a, b, color]) => {
                const total = (a + b) || 1;
                return (
                  <div key={label} style={{ padding: "12px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#777" }}>
                      <span style={{ color: homeColor }}>{a}</span>
                      <span>{label}</span>
                      <span style={{ color: awayColor }}>{b}</span>
                    </div>
                    <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                      <div style={{ width: `${(a / total) * 100}%`, background: homeColor, transition: "width 0.5s" }} />
                      <div style={{ width: `${(b / total) * 100}%`, background: awayColor, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}

              {/* Score Breakdown */}
              <div style={{ padding: "16px", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginTop: 8 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Score Breakdown</div>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  {([["HOME", state.home.score, homeColor, state.home.shortName], ["AWAY", state.away.score, awayColor, state.away.shortName]] as const).map(([label, score, color, short]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", textShadow: `0 0 30px ${color}88` }}>{score}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: 2 }}>{short}</div>
                      <div style={{ fontSize: 10, color: "#444" }}>{label}</div>
                    </div>
                  ))}
                </div>
                {state.home.score !== state.away.score && (
                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, fontWeight: 700, color: state.home.score > state.away.score ? homeColor : awayColor }}>
                    {state.home.score > state.away.score ? `${state.home.name} leads by ${state.home.score - state.away.score}` : `${state.away.name} leads by ${state.away.score - state.home.score}`}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ─── Page Wrapper ─────────────────────────────────────────────────────────────
export default function ScoringPage() {
  const { role } = useAuth();
  const Content = (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", color: "#555", fontSize: 18, letterSpacing: 3 }}>LOADING ARENA...</div>}>
      <ScoringContent />
    </Suspense>
  );

  if (role === "PUBLIC") return <PublicLayout>{Content}</PublicLayout>;
  return (
    <DashboardLayout variant="organiser">
      {Content}
    </DashboardLayout>
  );
}
