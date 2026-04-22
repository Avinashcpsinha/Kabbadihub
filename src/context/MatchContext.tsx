"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTenant } from "./TenantContext";
import { supabase } from "@/lib/supabase";

export type Team = {
  id?: string;
  name: string;
  shortName: string;
  score: number;
  outs: number;
  matCount: number; // Current active players on mat (starts at 7)
  timeouts: number;
  bonusPoints: number;
  players?: any[]; // For tracking individual player stats in the state
};

export type PlayerStats = {
  touchPoints: number;
  bonusPoints: number;
  tackles: number;
  superTackles: number;
  superRaids: number;
  active: boolean;
};

export type MatchEvent = {
  id: string;
  team: "home" | "away";
  points: number;
  type: "TOUCH" | "BONUS" | "TACKLE" | "SUPER_TACKLE" | "ALL_OUT" | "TECHNICAL_POINT" | "TIMEOUT" | "SUPER_RAID";
  raider?: string;
  defendersTouched?: string[];
  gameTime: number;
  timestamp: number;
  isUndoable: boolean;
};

export type MatchState = {
  home: Team;
  away: Team;
  timer: number;
  isActive: boolean;
  currentRaider: string | null;
  raidClock: number;
  isDoOrDie: boolean;
  history: MatchEvent[];
  lastAction: string | null;
  half: 1 | 2;
  playerStats: { [playerId: string]: PlayerStats };
};

type MatchContextType = {
  state: MatchState;
  activeMatchId: string | null;
  setMatchId: (id: string) => void;
  recordEvent: (event: Omit<MatchEvent, "id" | "timestamp" | "isUndoable">) => void;
  undoLastAction: () => void;
  toggleTimer: () => void;
  resetMatch: () => void;
  setRaider: (name: string | null) => void;
  setDoOrDie: (val: boolean) => void;
  resetRaidClock: () => void;
  switchHalf: () => void;
  undoToEvent: (eventId: string) => void;
};

const initialState: MatchState = {
  home: { name: "HOME", shortName: "HME", score: 0, outs: 0, matCount: 7, timeouts: 2, bonusPoints: 0 },
  away: { name: "AWAY", shortName: "AWY", score: 0, outs: 0, matCount: 7, timeouts: 2, bonusPoints: 0 },
  timer: 1200,
  isActive: false,
  currentRaider: null,
  raidClock: 30,
  isDoOrDie: false,
  history: [],
  lastAction: null,
  half: 1,
  playerStats: {},
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [state, setState] = useState<MatchState>(initialState);

  const getStorageKey = useCallback((id: string | null) => {
    if (!id) return `kabaddi_match_state_fallback`;
    return `kabaddi_match_${id}_state`; // Global streaming key for this match
  }, []);

  // Handle Match ID switching
  const setMatchId = useCallback((id: string) => {
    setActiveMatchId(id);
    
    const key = getStorageKey(id);
    const saved = localStorage.getItem(key);
    
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      // Try resolving team names from the tournament list if it's the first time
      const targetTenantId = tenant?.id || "global";
      const matchKey = `kabaddihub_${targetTenantId}_matches`;
      const teamKey = `kabaddihub_${targetTenantId}_teams`;
      const savedMatches = localStorage.getItem(matchKey);
      const savedTeams = localStorage.getItem(teamKey);

      if (savedMatches && savedTeams) {
        const matches = JSON.parse(savedMatches);
        const teams = JSON.parse(savedTeams);
        const match = matches.find((m: any) => m.id === id);
        
        if (match) {
          const homeT = teams.find((t: any) => t.id === match.homeTeamId);
          const awayT = teams.find((t: any) => t.id === match.awayTeamId);
          
          const newMatchState: MatchState = {
            ...initialState,
            home: { ...initialState.home, name: homeT?.name || "HOME", shortName: homeT?.shortName || "HME" },
            away: { ...initialState.away, name: awayT?.name || "AWAY", shortName: awayT?.shortName || "AWY" }
          };
          setState(newMatchState);
          localStorage.setItem(key, JSON.stringify(newMatchState));
          supabase.from('live_matches').upsert({ id, state: newMatchState, updated_at: new Date().toISOString() }).then();
          return;
        }
      }
      setState(initialState);
      localStorage.setItem(key, JSON.stringify(initialState));
      supabase.from('live_matches').upsert({ id, state: initialState, updated_at: new Date().toISOString() }).then();
    }
  }, [tenant, getStorageKey]);

  // Sync with Supabase Realtime (Global Cloud Sync)
  useEffect(() => {
    if (!activeMatchId) return;
    
    // 1. Initial Fetch from Cloud DB
    const fetchCloudState = async () => {
      const { data } = await supabase
        .from('live_matches')
        .select('state')
        .eq('id', activeMatchId)
        .single();
        
      if (data?.state && Object.keys(data.state).length > 0) {
        setState(data.state as MatchState);
      }
    };
    fetchCloudState();

    // 2. Subscribe to Global Broadcast Changes
    const channel = supabase
      .channel(`schema-db-changes-${activeMatchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_matches', filter: `id=eq.${activeMatchId}` },
        (payload: any) => {
          if (payload.new && payload.new.state) {
            setState(payload.new.state as MatchState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeMatchId]);

  const saveAndSetState = (newState: MatchState) => {
    setState(newState);
    
    // Local offline cache
    const key = getStorageKey(activeMatchId);
    if (activeMatchId) localStorage.setItem(key, JSON.stringify(newState));
    
    // Broadcast to the World via Supabase
    if (activeMatchId) {
      supabase.from('live_matches').upsert({
        id: activeMatchId,
        state: newState,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error("Cloud Broadcast Error:", error);
      });
    }
  };

  const recordEvent = (event: Omit<MatchEvent, "id" | "timestamp" | "isUndoable">) => {
    // Deep-copy mutable sub-objects to avoid reference mutation bugs
    const newState: MatchState = {
      ...state,
      home: { ...state.home },
      away: { ...state.away },
      playerStats: { ...state.playerStats },
    };
    const { team, points, type, raider } = event;
    const opponent = team === "home" ? "away" : "home";

    // 1. Update Core Points
    newState[team] = { ...newState[team], score: newState[team].score + points };

    // 2. Kabaddi Logic: Revivals & Eliminations
    if (type === "TOUCH" || type === "SUPER_TACKLE" || type === "TACKLE") {
      const revivalCount = type === "SUPER_TACKLE" ? 2 : points;
      newState[team] = { ...newState[team], matCount: Math.min(7, newState[team].matCount + revivalCount) };
      
      if (type === "TOUCH") {
        newState[opponent] = { ...newState[opponent], matCount: Math.max(0, newState[opponent].matCount - points), outs: newState[opponent].outs + points };
      } else {
        newState[opponent] = { ...newState[opponent], matCount: Math.max(0, newState[opponent].matCount - 1), outs: newState[opponent].outs + 1 };
      }
    }

    // 3. All Out Detection
    if (newState[opponent].matCount === 0) {
      newState[team] = { ...newState[team], score: newState[team].score + 2 };
      newState[opponent] = { ...newState[opponent], matCount: 7 };
      newState.lastAction = `ALL OUT! ${newState[team].name} wipes ${newState[opponent].name}`;
    }

    // 4. Build History Event
    const newHistoryEvent: MatchEvent = {
      ...event,
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      timestamp: Date.now(),
      isUndoable: true,
      gameTime: state.timer,
    };
    newState.history = [newHistoryEvent, ...state.history].slice(0, 100);
    
    // 5. Update Player Stats
    if (raider) {
      const existingStats = newState.playerStats[raider] || { touchPoints: 0, bonusPoints: 0, tackles: 0, superTackles: 0, superRaids: 0, active: true };
      const updatedStats = { ...existingStats };
      if (type === "TOUCH")        updatedStats.touchPoints += points;
      if (type === "BONUS")        updatedStats.bonusPoints += 1;
      if (type === "SUPER_RAID") { updatedStats.touchPoints += points; updatedStats.superRaids += 1; }
      if (type === "TACKLE")       updatedStats.tackles += 1;
      if (type === "SUPER_TACKLE") updatedStats.superTackles += 1;
      newState.playerStats = { ...newState.playerStats, [raider]: updatedStats };
    }
    
    // 6. Last Action label
    const actionLabel = `${type.replace(/_/g, " ")} +${points}`;
    newState.lastAction = raider ? `${raider} - ${actionLabel}` : actionLabel;

    // 7. Clear raider inline (within the SAME state update) so we don't
    //    get a second saveAndSetState call that overwrites history with stale state.
    if (type === "TOUCH" || type === "BONUS" || type === "TACKLE" || type === "SUPER_TACKLE" || type === "SUPER_RAID") {
      newState.currentRaider = null;
      newState.raidClock = 30;
    }

    saveAndSetState(newState);  // single save — scores + history + cleared raider all in one
  };

   const undoToEvent = (eventId: string) => {
     const eventIndex = state.history.findIndex(ev => ev.id === eventId);
     if (eventIndex === -1) return;
     
     // Remove everything from the start of history to this event inclusive
     // History is [newest, ..., oldest]
     const updatedHistory = state.history.slice(eventIndex + 1);
     replayFromHistory(updatedHistory);
   };

   const replayFromHistory = (history: MatchEvent[]) => {
      // Reset to initial and re-play all events (the safest way)
      let replayedState = { 
        ...initialState,
        home: { ...initialState.home, name: state.home.name, shortName: state.home.shortName },
        away: { ...initialState.away, name: state.away.name, shortName: state.away.shortName },
        timer: state.timer,
        half: state.half,
        history: history,
        lastAction: history.length > 0 ? "Undo Successful" : "Match Reset"
      };
      
      // Replay history in chronological order (oldest first)
      [...history].reverse().forEach(ev => {
         const team = ev.team;
         const opponent = team === "home" ? "away" : "home";
         replayedState[team].score += ev.points;
         
         // Replay Player Stats
         if (ev.raider) {
            if (!replayedState.playerStats[ev.raider]) {
               replayedState.playerStats[ev.raider] = { touchPoints: 0, bonusPoints: 0, tackles: 0, superTackles: 0, superRaids: 0, active: true };
            }
            if (ev.type === "TOUCH") replayedState.playerStats[ev.raider].touchPoints += ev.points;
            if (ev.type === "BONUS") replayedState.playerStats[ev.raider].bonusPoints += 1;
            // ... more types as needed
         }

         if (ev.type === "TOUCH" || ev.type === "SUPER_TACKLE" || ev.type === "TACKLE") {
            const rev = ev.type === "SUPER_TACKLE" ? 2 : ev.points;
            replayedState[team].matCount = Math.min(7, replayedState[team].matCount + rev);
            
            if (ev.type === "TOUCH") {
              replayedState[opponent].matCount = Math.max(0, replayedState[opponent].matCount - ev.points);
              replayedState[opponent].outs += ev.points;
            } else {
              replayedState[opponent].matCount = Math.max(0, replayedState[opponent].matCount - 1);
              replayedState[opponent].outs += 1;
            }
         }
         
         // All out detection during replay
         if (replayedState[opponent].matCount === 0) {
            replayedState[team].score += 2;
            replayedState[opponent].matCount = 7;
         }
      });

      saveAndSetState(replayedState);
   };

   const undoLastAction = () => {
     if (state.history.length === 0) return;
     const updatedHistory = state.history.slice(1);
     replayFromHistory(updatedHistory);
   };

  const switchHalf = () => {
    saveAndSetState({ ...state, half: state.half === 1 ? 2 : 1, timer: 1200, isActive: false });
  };

  const toggleTimer = () => {
    saveAndSetState({ ...state, isActive: !state.isActive });
  };

  const resetMatch = () => {
    saveAndSetState(initialState);
  };

  const setRaider = (name: string | null) => {
    saveAndSetState({ ...state, currentRaider: name, raidClock: 30 });
  };

  const setDoOrDie = (val: boolean) => {
    saveAndSetState({ ...state, isDoOrDie: val });
  };

  const resetRaidClock = () => {
    saveAndSetState({ ...state, raidClock: 30 });
  };

  // Internal Timer Core — uses functional updater to NEVER clobber concurrent state changes
  useEffect(() => {
    if (!state.isActive || state.timer <= 0) return;

    const interval = setInterval(() => {
      setState(prev => {
        // If timer was paused or expired since this interval was set up, do nothing
        if (!prev.isActive || prev.timer <= 0) return prev;

        const updated: MatchState = {
          ...prev,
          timer: prev.timer - 1,
          raidClock: prev.currentRaider ? Math.max(0, prev.raidClock - 1) : prev.raidClock,
        };

        // Persist to storage and cloud every 5 seconds (broadcaster live sync)
        if (updated.timer % 5 === 0 && activeMatchId) {
          localStorage.setItem(getStorageKey(activeMatchId), JSON.stringify(updated));
          supabase.from('live_matches').upsert({ id: activeMatchId, state: updated, updated_at: new Date().toISOString() }).then();
        }

        return updated;  // ← merges with latest state, NEVER overwrites history
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isActive, state.timer, activeMatchId, getStorageKey]);

  return (
    <MatchContext.Provider value={{ 
      state, 
      activeMatchId, 
      setMatchId, 
      recordEvent, 
      undoLastAction, 
      toggleTimer, 
      resetMatch, 
      setRaider, 
      setDoOrDie, 
      resetRaidClock,
      switchHalf,
      undoToEvent
    }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch() {
  const context = useContext(MatchContext);
  if (!context) throw new Error("useMatch must be used within a MatchProvider");
  return context;
}
