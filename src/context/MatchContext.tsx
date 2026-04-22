"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTenant } from "./TenantContext";

export type Team = {
  id?: string;
  name: string;
  shortName: string;
  score: number;
  outs: number;
  matCount: number; // Current active players on mat (starts at 7)
  timeouts: number;
  bonusPoints: number;
};

export type MatchEvent = {
  id: string;
  team: "home" | "away";
  points: number;
  type: "TOUCH" | "BONUS" | "TACKLE" | "SUPER_TACKLE" | "ALL_OUT" | "TECHNICAL_POINT" | "TIMEOUT";
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
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [state, setState] = useState<MatchState>(initialState);

  const getStorageKey = useCallback((id: string | null) => {
    if (!id) return `kabaddi_${tenant?.id || "global"}_match_state`;
    return `kabaddi_${tenant?.id || "global"}_match_${id}_state`;
  }, [tenant]);

  // Handle Match ID switching
  const setMatchId = useCallback((id: string) => {
    if (!tenant) return;
    setActiveMatchId(id);
    
    const key = getStorageKey(id);
    const saved = localStorage.getItem(key);
    
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      // Try resolving team names from the tournament list if it's the first time
      const matchKey = `kabaddihub_${tenant.id}_matches`;
      const teamKey = `kabaddihub_${tenant.id}_teams`;
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
          return;
        }
      }
      setState(initialState);
    }
  }, [tenant, getStorageKey]);

  // Sync with LocalStorage for external updates (Broadcaster)
  useEffect(() => {
    if (!tenant || !activeMatchId) return;
    
    const key = getStorageKey(activeMatchId);
    const syncState = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, [tenant, activeMatchId, getStorageKey]);

  const saveAndSetState = (newState: MatchState) => {
    setState(newState);
    localStorage.setItem(getStorageKey(activeMatchId), JSON.stringify(newState));
  };

  const recordEvent = (event: Omit<MatchEvent, "id" | "timestamp" | "isUndoable">) => {
    const newState = { ...state };
    const { team, points, type, raider, defendersTouched } = event;
    const opponent = team === "home" ? "away" : "home";

    // 1. Update Core Points
    newState[team].score += points;

    // 2. Kabaddi Logic: Revivals & Eliminations
    if (type === "TOUCH" || type === "SUPER_TACKLE" || type === "TACKLE") {
      // Points scored - revive players for the scoring team
      const revivalCount = type === "SUPER_TACKLE" ? 2 : points;
      newState[team].matCount = Math.min(7, newState[team].matCount + revivalCount);
      
      // If it's a touch or tackle, someone from opponent goes out
      if (type === "TOUCH") {
        newState[opponent].matCount = Math.max(0, newState[opponent].matCount - points);
        newState[opponent].outs += points;
      } else if (type === "TACKLE" || type === "SUPER_TACKLE") {
        newState[opponent].matCount = Math.max(0, newState[opponent].matCount - 1);
        newState[opponent].outs += 1;
      }
    }

    // 3. All Out Detection
    if (newState[opponent].matCount === 0) {
      newState[team].score += 2; // All-out bonus points
      newState[opponent].matCount = 7; // Full revival for opponent
      newState.lastAction = `ALL OUT! ${newState[team].name} wipes ${newState[opponent].name}`;
      
      // Add All-out to history as sub-event? Or just log it.
    }

    // 4. Update History
    const newHistoryEvent: MatchEvent = {
      ...event,
      id: `ev_${Date.now()}`,
      timestamp: Date.now(),
      isUndoable: true,
      gameTime: state.timer
    };

    newState.history = [newHistoryEvent, ...state.history].slice(0, 100);
    
    // Update labels
    const actionLabel = `${type.replace("_", " ")} +${points}`;
    newState.lastAction = raider ? `${raider} - ${actionLabel}` : actionLabel;
    
    saveAndSetState(newState);
    if (type === "TOUCH" || type === "BONUS" || type === "TACKLE" || type === "SUPER_TACKLE") {
      setRaider(null); // Raid over
    }
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

  // Internal Timer Core
  useEffect(() => {
    let interval: any = null;
    if (state.isActive && state.timer > 0) {
      interval = setInterval(() => {
        const newState = { ...state, timer: state.timer - 1 };
        if (state.currentRaider) {
          newState.raidClock = Math.max(0, state.raidClock - 1);
        }
        setState(newState);
        // We don't save to localStorage every second for performance, 
        // but broadcaster will be slightly out of sync unless we do.
        // For KabaddiHub, let's sync every 5 seconds or on events.
        if (newState.timer % 5 === 0) {
           localStorage.setItem(getStorageKey(activeMatchId), JSON.stringify(newState));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isActive, state.timer, state.raidClock, state.currentRaider, activeMatchId, getStorageKey]);

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
