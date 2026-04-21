"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuctionPlayer, AuctionSession, AuctionBid, Team } from "@/types";
import { useTenant } from "./TenantContext";

interface AuctionContextType {
  players: AuctionPlayer[];
  session: AuctionSession | null;
  teams: Team[];
  currentPlayer: AuctionPlayer | null;
  lastBid: AuctionBid | null;
  startAuction: (tournamentId: string) => void;
  putPlayerOnBlock: (playerId: string) => void;
  placeBid: (teamId: string, amount: number) => void;
  markSold: () => void;
  markUnsold: () => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [players, setPlayers] = useState<AuctionPlayer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [session, setSession] = useState<AuctionSession | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  const getStorageKey = useCallback((key: string) => `kabaddihub_${tenant?.id || "global"}_auction_${key}`, [tenant]);

  // Initial load
  useEffect(() => {
    if (!tenant) return;
    
    const savedPlayers = localStorage.getItem(getStorageKey("players"));
    const savedTeams = localStorage.getItem(`kabaddihub_${tenant.id}_teams`);
    const savedSession = localStorage.getItem(getStorageKey("session"));

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    else {
      // Seed some demo players if empty
      const demoPlayers: AuctionPlayer[] = [
        { id: "p1", name: "Pawan Sehrawat", number: "17", role: "RAIDER", category: "A", basePrice: 3000000, status: "UPCOMING", stats: { raidPoints: 120, tacklePoints: 5, matches: 20, superTens: 10, highFives: 0 } },
        { id: "p2", name: "Fazel Atrachali", number: "7", role: "DEFENDER", category: "A", basePrice: 2000000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 80, matches: 22, superTens: 0, highFives: 8 } },
        { id: "p3", name: "Naveen Kumar", number: "10", role: "RAIDER", category: "B", basePrice: 1500000, status: "UPCOMING", stats: { raidPoints: 95, tacklePoints: 2, matches: 15, superTens: 7, highFives: 0 } },
        { id: "p4", name: "Mohammad Nabibakhsh", number: "11", role: "ALL_ROUNDER", category: "B", basePrice: 1200000, status: "UPCOMING", stats: { raidPoints: 40, tacklePoints: 30, matches: 18, superTens: 1, highFives: 2 } },
      ];
      setPlayers(demoPlayers);
      localStorage.setItem(getStorageKey("players"), JSON.stringify(demoPlayers));
    }

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedSession) {
      const s = JSON.parse(savedSession);
      setSession(s);
      setCurrentPlayerId(s.currentPlayerId || null);
    }
  }, [tenant, getStorageKey]);

  const savePlayers = (updated: AuctionPlayer[]) => {
    setPlayers(updated);
    localStorage.setItem(getStorageKey("players"), JSON.stringify(updated));
  };

  const saveSession = (updated: AuctionSession) => {
    setSession(updated);
    localStorage.setItem(getStorageKey("session"), JSON.stringify(updated));
  };

  const startAuction = (tournamentId: string) => {
    const newSession: AuctionSession = {
      id: `auc_${Date.now()}`,
      tournamentId,
      basePurse: 50000000, // 5 Cr
      minPlayers: 12,
      maxPlayers: 18,
      status: "LIVE",
      bids: []
    };
    saveSession(newSession);
  };

  const putPlayerOnBlock = (playerId: string) => {
    if (!session) return;
    setCurrentPlayerId(playerId);
    const updatedPlayers = players.map(p => 
      p.id === playerId ? { ...p, status: "ON_BLOCK" as const } : 
      p.status === "ON_BLOCK" ? { ...p, status: "UPCOMING" as const } : p
    );
    savePlayers(updatedPlayers);
    saveSession({ ...session, currentPlayerId: playerId, bids: [] });
  };

  const placeBid = (teamId: string, amount: number) => {
    if (!session || !currentPlayerId) return;
    
    const newBid: AuctionBid = {
      id: `bid_${Date.now()}`,
      playerId: currentPlayerId,
      teamId,
      amount,
      timestamp: Date.now()
    };

    const updatedSession = {
      ...session,
      bids: [...session.bids, newBid]
    };
    saveSession(updatedSession);
  };

  const markSold = () => {
    if (!session || !currentPlayerId || session.bids.length === 0) return;
    
    const lastBid = session.bids[session.bids.length - 1];
    const updatedPlayers = players.map(p => 
      p.id === currentPlayerId ? { 
        ...p, 
        status: "SOLD" as const, 
        soldPrice: lastBid.amount, 
        soldToTeamId: lastBid.teamId 
      } : p
    );
    
    savePlayers(updatedPlayers);
    setCurrentPlayerId(null);
    saveSession({ ...session, currentPlayerId: undefined, bids: [] });
  };

  const markUnsold = () => {
    if (!session || !currentPlayerId) return;
    
    const updatedPlayers = players.map(p => 
      p.id === currentPlayerId ? { ...p, status: "UNSOLD" as const } : p
    );
    
    savePlayers(updatedPlayers);
    setCurrentPlayerId(null);
    saveSession({ ...session, currentPlayerId: undefined, bids: [] });
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId) || null;
  const lastBid = session?.bids[session.bids.length - 1] || null;

  return (
    <AuctionContext.Provider value={{ 
      players, 
      session, 
      teams, 
      currentPlayer, 
      lastBid,
      startAuction, 
      putPlayerOnBlock, 
      placeBid, 
      markSold, 
      markUnsold 
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const context = useContext(AuctionContext);
  if (!context) throw new Error("useAuction must be used within an AuctionProvider");
  return context;
}
