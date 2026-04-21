export type PlayerRole = "RAIDER" | "DEFENDER" | "ALL_ROUNDER";

export interface Player {
  id: string;
  name: string;
  number: string;
  role: PlayerRole;
  teamId?: string;
  teamName?: string;
  age?: number;
  height?: string;
  weight?: string;
  panCard?: string;
  aadharCard?: string;
  photoUrl?: string;
  stats: {
    raidPoints: number;
    tacklePoints: number;
    matches: number;
    superTens: number;
    highFives: number;
    superRaids?: number;
    superTackles?: number;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  city: string;
  players: Player[];
}

export interface MatchSession {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: Date;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  result?: MatchResult;
  tenantId?: string;
  venue?: string;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  mvpPlayerId?: string;
  mvpPlayerName?: string;
  completedAt: number;
  summary?: string;
}

export type PlayerCategory = "A" | "B" | "C";
export type PlayerPosition = "RAIDER" | "DEFENDER" | "ALL_ROUNDER";

export interface AuctionPlayer extends Player {
  category: PlayerCategory;
  basePrice: number;
  soldPrice?: number;
  soldToTeamId?: string;
  status: "UNSOLD" | "SOLD" | "ON_BLOCK" | "UPCOMING";
}

export interface AuctionSession {
  id: string;
  tournamentId: string;
  basePurse: number;
  minPlayers: number;
  maxPlayers: number;
  status: "DRAFT" | "LIVE" | "COMPLETED";
  currentPlayerId?: string;
  bids: AuctionBid[];
}

export interface AuctionBid {
  id: string;
  playerId: string;
  teamId: string;
  amount: number;
  timestamp: number;
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  type: "INFO" | "MATCH" | "TRANSFER" | "URGENT";
  createdAt: number;
  authorName: string;
}

export interface TournamentStanding {
  teamId: string;
  teamName: string;
  shortName: string;
  primaryColor: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  raidPointsFor: number;
  raidPointsAgainst: number;
}
