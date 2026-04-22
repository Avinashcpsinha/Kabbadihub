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

    const demoPlayers: AuctionPlayer[] = [
      // Category A - Raiders
      { id: "p1", name: "Pawan Sehrawat", number: "17", role: "RAIDER", category: "A", basePrice: 3000000, status: "UPCOMING", stats: { raidPoints: 120, tacklePoints: 5, matches: 20, superTens: 10, highFives: 0 } },
      { id: "p2", name: "Naveen Kumar", number: "10", role: "RAIDER", category: "A", basePrice: 2800000, status: "UPCOMING", stats: { raidPoints: 115, tacklePoints: 2, matches: 18, superTens: 11, highFives: 0 } },
      { id: "p3", name: "Maninder Singh", number: "9", role: "RAIDER", category: "A", basePrice: 2500000, status: "UPCOMING", stats: { raidPoints: 110, tacklePoints: 1, matches: 19, superTens: 9, highFives: 0 } },
      { id: "p4", name: "Pardeep Narwal", number: "1", role: "RAIDER", category: "A", basePrice: 2700000, status: "UPCOMING", stats: { raidPoints: 130, tacklePoints: 0, matches: 22, superTens: 12, highFives: 0 } },
      { id: "p5", name: "Arjun Deshwal", number: "4", role: "RAIDER", category: "A", basePrice: 2600000, status: "UPCOMING", stats: { raidPoints: 105, tacklePoints: 3, matches: 17, superTens: 8, highFives: 0 } },
      
      // Category A - Defenders
      { id: "p6", name: "Fazel Atrachali", number: "7", role: "DEFENDER", category: "A", basePrice: 2000000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 80, matches: 22, superTens: 0, highFives: 8 } },
      { id: "p7", name: "Mohammadreza Chiyaneh", number: "13", role: "DEFENDER", category: "A", basePrice: 2200000, status: "UPCOMING", stats: { raidPoints: 5, tacklePoints: 85, matches: 21, superTens: 0, highFives: 9 } },
      { id: "p8", name: "Sagar Rathee", number: "5", role: "DEFENDER", category: "A", basePrice: 1800000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 75, matches: 20, superTens: 0, highFives: 7 } },
      { id: "p9", name: "Surjeet Singh", number: "6", role: "DEFENDER", category: "A", basePrice: 1900000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 78, matches: 22, superTens: 0, highFives: 6 } },
      
      // Category A - All Rounders
      { id: "p10", name: "Mohammad Nabibakhsh", number: "11", role: "ALL_ROUNDER", category: "A", basePrice: 1800000, status: "UPCOMING", stats: { raidPoints: 60, tacklePoints: 45, matches: 20, superTens: 2, highFives: 3 } },
      { id: "p11", name: "Vijay Malik", number: "8", role: "ALL_ROUNDER", category: "A", basePrice: 1700000, status: "UPCOMING", stats: { raidPoints: 75, tacklePoints: 35, matches: 19, superTens: 3, highFives: 1 } },
      
      // Category B - Raiders
      { id: "p12", name: "Bharat Hooda", number: "21", role: "RAIDER", category: "B", basePrice: 1500000, status: "UPCOMING", stats: { raidPoints: 85, tacklePoints: 8, matches: 18, superTens: 5, highFives: 0 } },
      { id: "p13", name: "Abhishek Singh", number: "12", role: "RAIDER", category: "B", basePrice: 1400000, status: "UPCOMING", stats: { raidPoints: 78, tacklePoints: 4, matches: 16, superTens: 4, highFives: 0 } },
      { id: "p14", name: "Vikash Kandola", number: "15", role: "RAIDER", category: "B", basePrice: 1300000, status: "UPCOMING", stats: { raidPoints: 70, tacklePoints: 2, matches: 17, superTens: 3, highFives: 0 } },
      { id: "p15", name: "Chandran Ranjit", number: "14", role: "RAIDER", category: "B", basePrice: 1200000, status: "UPCOMING", stats: { raidPoints: 65, tacklePoints: 3, matches: 15, superTens: 2, highFives: 0 } },
      { id: "p16", name: "Meet Ibrahim", number: "22", role: "RAIDER", category: "B", basePrice: 1100000, status: "UPCOMING", stats: { raidPoints: 60, tacklePoints: 1, matches: 14, superTens: 2, highFives: 0 } },
      { id: "p17", name: "Guman Singh", number: "25", role: "RAIDER", category: "B", basePrice: 1450000, status: "UPCOMING", stats: { raidPoints: 72, tacklePoints: 5, matches: 16, superTens: 4, highFives: 0 } },
      { id: "p18", name: "Manjeet Sharma", number: "30", role: "RAIDER", category: "B", basePrice: 1150000, status: "UPCOMING", stats: { raidPoints: 58, tacklePoints: 2, matches: 13, superTens: 1, highFives: 0 } },
      
      // Category B - Defenders
      { id: "p19", name: "Sahil Singh", number: "3", role: "DEFENDER", category: "B", basePrice: 1200000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 55, matches: 18, superTens: 0, highFives: 4 } },
      { id: "p20", name: "Jaideep Dahiya", number: "18", role: "DEFENDER", category: "B", basePrice: 1300000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 62, matches: 19, superTens: 0, highFives: 5 } },
      { id: "p21", name: "Saurabh Nandal", number: "16", role: "DEFENDER", category: "B", basePrice: 1100000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 58, matches: 17, superTens: 0, highFives: 4 } },
      { id: "p22", name: "Vishal Bhardwaj", number: "2", role: "DEFENDER", category: "B", basePrice: 1000000, status: "UPCOMING", stats: { raidPoints: 2, tacklePoints: 52, matches: 16, superTens: 0, highFives: 3 } },
      { id: "p23", name: "Parvesh Bhainswal", number: "19", role: "DEFENDER", category: "B", basePrice: 1150000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 54, matches: 18, superTens: 0, highFives: 4 } },
      { id: "p24", name: "Mahender Singh", number: "23", role: "DEFENDER", category: "B", basePrice: 950000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 48, matches: 15, superTens: 0, highFives: 2 } },
      
      // Category B - All Rounders
      { id: "p25", name: "Rohit Gulia", number: "20", role: "ALL_ROUNDER", category: "B", basePrice: 1000000, status: "UPCOMING", stats: { raidPoints: 55, tacklePoints: 25, matches: 17, superTens: 1, highFives: 1 } },
      { id: "p26", name: "Nitin Rawal", number: "24", role: "ALL_ROUNDER", category: "B", basePrice: 900000, status: "UPCOMING", stats: { raidPoints: 45, tacklePoints: 30, matches: 16, superTens: 0, highFives: 2 } },
      { id: "p27", name: "Akash Shinde", number: "27", role: "RAIDER", category: "B", basePrice: 850000, status: "UPCOMING", stats: { raidPoints: 52, tacklePoints: 3, matches: 14, superTens: 1, highFives: 0 } },
      
      // Category C - Raiders
      { id: "p28", name: "Ajinkya Pawar", number: "31", role: "RAIDER", category: "C", basePrice: 600000, status: "UPCOMING", stats: { raidPoints: 45, tacklePoints: 2, matches: 12, superTens: 1, highFives: 0 } },
      { id: "p29", name: "Aslam Inamdar", number: "32", role: "RAIDER", category: "C", basePrice: 700000, status: "UPCOMING", stats: { raidPoints: 48, tacklePoints: 10, matches: 13, superTens: 1, highFives: 0 } },
      { id: "p30", name: "Mohit Goyat", number: "33", role: "RAIDER", category: "C", basePrice: 650000, status: "UPCOMING", stats: { raidPoints: 42, tacklePoints: 15, matches: 12, superTens: 0, highFives: 0 } },
      { id: "p31", name: "Sachin Tanwar", number: "34", role: "RAIDER", category: "C", basePrice: 750000, status: "UPCOMING", stats: { raidPoints: 50, tacklePoints: 5, matches: 14, superTens: 1, highFives: 0 } },
      { id: "p32", name: "Siddharth Desai", number: "35", role: "RAIDER", category: "C", basePrice: 800000, status: "UPCOMING", stats: { raidPoints: 55, tacklePoints: 0, matches: 11, superTens: 2, highFives: 0 } },
      { id: "p33", name: "Monu Goyat", number: "36", role: "RAIDER", category: "C", basePrice: 600000, status: "UPCOMING", stats: { raidPoints: 38, tacklePoints: 5, matches: 13, superTens: 0, highFives: 0 } },
      { id: "p34", name: "Surender Gill", number: "37", role: "RAIDER", category: "C", basePrice: 700000, status: "UPCOMING", stats: { raidPoints: 46, tacklePoints: 8, matches: 14, superTens: 1, highFives: 0 } },
      { id: "p35", name: "K. Prapanjan", number: "38", role: "RAIDER", category: "C", basePrice: 550000, status: "UPCOMING", stats: { raidPoints: 35, tacklePoints: 2, matches: 12, superTens: 0, highFives: 0 } },
      
      // Category C - Defenders
      { id: "p36", name: "Mohit Chhillar", number: "39", role: "DEFENDER", category: "C", basePrice: 600000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 40, matches: 15, superTens: 0, highFives: 2 } },
      { id: "p37", name: "Ravinder Pahal", number: "40", role: "DEFENDER", category: "C", basePrice: 650000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 45, matches: 16, superTens: 0, highFives: 3 } },
      { id: "p38", name: "Girish Ernak", number: "41", role: "DEFENDER", category: "C", basePrice: 500000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 38, matches: 14, superTens: 0, highFives: 2 } },
      { id: "p39", name: "Sandeep Dhull", number: "42", role: "DEFENDER", category: "C", basePrice: 550000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 42, matches: 15, superTens: 0, highFives: 2 } },
      { id: "p40", name: "Rinku Narwal", number: "43", role: "DEFENDER", category: "C", basePrice: 450000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 35, matches: 13, superTens: 0, highFives: 1 } },
      { id: "p41", name: "Aman Sehrawat", number: "44", role: "DEFENDER", category: "C", basePrice: 500000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 37, matches: 14, superTens: 0, highFives: 2 } },
      { id: "p42", name: "Nitesh Kumar", number: "45", role: "DEFENDER", category: "C", basePrice: 600000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 41, matches: 16, superTens: 0, highFives: 2 } },
      { id: "p43", name: "Sumit Sangwan", number: "46", role: "DEFENDER", category: "C", basePrice: 580000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 39, matches: 15, superTens: 0, highFives: 2 } },
      
      // Category C - All Rounders
      { id: "p44", name: "Deepak Niwas Hooda", number: "47", role: "ALL_ROUNDER", category: "C", basePrice: 800000, status: "UPCOMING", stats: { raidPoints: 40, tacklePoints: 20, matches: 14, superTens: 0, highFives: 0 } },
      { id: "p45", name: "Sandeep Narwal", number: "48", role: "ALL_ROUNDER", category: "C", basePrice: 750000, status: "UPCOMING", stats: { raidPoints: 30, tacklePoints: 35, matches: 16, superTens: 0, highFives: 1 } },
      { id: "p46", name: "Prateek Dahiya", number: "49", role: "ALL_ROUNDER", category: "C", basePrice: 600000, status: "UPCOMING", stats: { raidPoints: 35, tacklePoints: 15, matches: 12, superTens: 0, highFives: 0 } },
      { id: "p47", name: "Amirhossein Bastami", number: "50", role: "DEFENDER", category: "C", basePrice: 500000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 32, matches: 13, superTens: 0, highFives: 1 } },
      { id: "p48", name: "Nitin Dhankar", number: "51", role: "RAIDER", category: "C", basePrice: 400000, status: "UPCOMING", stats: { raidPoints: 30, tacklePoints: 1, matches: 10, superTens: 0, highFives: 0 } },
      { id: "p49", name: "Surender Nada", number: "52", role: "DEFENDER", category: "C", basePrice: 600000, status: "UPCOMING", stats: { raidPoints: 0, tacklePoints: 38, matches: 14, superTens: 0, highFives: 2 } },
      { id: "p50", name: "Ran Singh", number: "53", role: "ALL_ROUNDER", category: "C", basePrice: 500000, status: "UPCOMING", stats: { raidPoints: 20, tacklePoints: 25, matches: 12, superTens: 0, highFives: 0 } },
    ];

    // Force update if the player pool is old/incomplete (less than 50 players)
    if (savedPlayers) {
      const parsed = JSON.parse(savedPlayers);
      if (parsed.length < demoPlayers.length) {
        setPlayers(demoPlayers);
        localStorage.setItem(getStorageKey("players"), JSON.stringify(demoPlayers));
      } else {
        setPlayers(parsed);
      }
    } else {
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
