"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuctionPlayer, AuctionSession, AuctionBid, Team } from "@/types";
import { useTenant } from "./TenantContext";
import { supabase } from "@/lib/supabase";

interface AuctionContextType {
  players: AuctionPlayer[];
  session: AuctionSession | null;
  teams: Team[];
  currentPlayer: AuctionPlayer | null;
  lastBid: AuctionBid | null;
  startAuction: (tournamentId: string) => Promise<void>;
  putPlayerOnBlock: (playerId: string) => Promise<void>;
  placeBid: (teamId: string, amount: number) => Promise<void>;
  markSold: () => Promise<void>;
  markUnsold: () => Promise<void>;
  isLoading: boolean;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [players, setPlayers] = useState<AuctionPlayer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [session, setSession] = useState<AuctionSession | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all auction data from Supabase
  const fetchData = useCallback(async () => {
    if (!tenant) return;
    setIsLoading(true);

    try {
      // 1. Fetch Athletes from global pool
      const { data: athletes } = await supabase
        .from('athletes')
        .select('*')
        .order('name');
      
      if (athletes) {
        setPlayers(athletes.map(a => ({
          id: a.id,
          name: a.name,
          number: a.number || "00",
          role: a.role as any,
          category: (a as any).category || "C",
          basePrice: (a as any).base_price || 500000,
          status: (a as any).auction_status || "UPCOMING",
          soldPrice: (a as any).sold_price,
          soldToTeamId: (a as any).sold_to_team_id,
          stats: {
            raidPoints: a.raid_points || 0,
            tacklePoints: a.tackle_points || 0,
            matches: a.matches_played || 0,
            superTens: 0,
            highFives: 0
          }
        })));
      }

      // 2. Fetch Teams for this tenant
      const { data: tenantTeams } = await supabase
        .from('teams')
        .select('*')
        .eq('tenant_id', tenant.id);
      
      if (tenantTeams) {
        setTeams(tenantTeams.map(t => ({
          id: t.id,
          name: t.name,
          shortName: t.short_name,
          primaryColor: t.primary_color,
          city: t.city,
          players: [] // Will be populated if needed
        })));
      }

      // 3. Fetch Active Auction Session
      // Note: We use a generic 'metadata' approach if dedicated table doesn't exist
      // Here we assume an 'auction_sessions' table or similar logic
      const { data: activeSession } = await supabase
        .from('live_matches') // Reusing for state if needed, but ideally a dedicated table
        .select('state')
        .eq('id', `auction_${tenant.id}`)
        .single();
      
      if (activeSession && activeSession.state) {
        const s = activeSession.state as any;
        setSession(s);
        setCurrentPlayerId(s.currentPlayerId || null);
      }
    } catch (e) {
      console.error("Auction data sync failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates for the auction state
    if (tenant) {
      const channel = supabase
        .channel(`auction_${tenant.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'live_matches', 
          filter: `id=eq.auction_${tenant.id}` 
        }, () => {
          fetchData();
        })
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
    }
  }, [tenant, fetchData]);

  const saveToCloud = async (newState: any) => {
    if (!tenant) return;
    await supabase
      .from('live_matches')
      .upsert({
        id: `auction_${tenant.id}`,
        state: newState,
        updated_at: new Date().toISOString()
      });
  };

  const startAuction = async (tournamentId: string) => {
    const newSession: AuctionSession = {
      id: `auc_${tenant?.id}_${Date.now()}`,
      tournamentId,
      basePurse: 50000000,
      minPlayers: 12,
      maxPlayers: 18,
      status: "LIVE",
      bids: []
    };
    await saveToCloud(newSession);
    setSession(newSession);
  };

  const putPlayerOnBlock = async (playerId: string) => {
    if (!session || !tenant) return;
    
    // Update local state and cloud
    const updatedSession = { ...session, currentPlayerId: playerId, bids: [] };
    await saveToCloud(updatedSession);

    // Update athlete status in global registry
    await supabase
      .from('athletes')
      .update({ auction_status: 'ON_BLOCK' })
      .eq('id', playerId);
    
    setCurrentPlayerId(playerId);
  };

  const placeBid = async (teamId: string, amount: number) => {
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
    await saveToCloud(updatedSession);
  };

  const markSold = async () => {
    if (!session || !currentPlayerId || session.bids.length === 0) return;
    
    const lastBid = session.bids[session.bids.length - 1];
    
    // Persistent DB update
    await supabase.from('athletes').update({
       auction_status: 'SOLD',
       sold_price: lastBid.amount,
       sold_to_team_id: lastBid.teamId
    }).eq('id', currentPlayerId);

    // Also insert into team_athletes junction
    await supabase.from('team_athletes').insert([{
       team_id: lastBid.teamId,
       athlete_id: currentPlayerId,
       joined_at: new Date().toISOString()
    }]);

    const updatedSession = { ...session, currentPlayerId: undefined, bids: [] };
    await saveToCloud(updatedSession);
    setCurrentPlayerId(null);
  };

  const markUnsold = async () => {
    if (!session || !currentPlayerId) return;
    
    await supabase.from('athletes').update({ auction_status: 'UNSOLD' }).eq('id', currentPlayerId);

    const updatedSession = { ...session, currentPlayerId: undefined, bids: [] };
    await saveToCloud(updatedSession);
    setCurrentPlayerId(null);
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
      markUnsold,
      isLoading
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
