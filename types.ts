
export interface Team {
  id: number;
  name: string;
  league?: { id: number; name: string };
  venue?: { name: string };
}

export interface PlayerInfo {
  id: number;
  fullName: string;
  primaryPosition: {
    code: string;
    abbreviation: string;
  };
  boxscoreOrder?: number; // From boxscore battingOrder
}

export interface PlayerStats {
  season: string;
  stat: {
    gamesPlayed?: number;
    gamesStarted?: number;
    atBats?: number;
    hits?: number;
    doubles?: number;
    triples?: number;
    homeRuns?: number;
    baseOnBalls?: number;
    hitByPitch?: number;
    sacFlies?: number;
    strikeOuts?: number;
    stolenBases?: number;
    avg?: string;
    obp?: string;
    slg?: string;
    ops?: string;
    inningsPitched?: string;
    earnedRuns?: number;
    saves?: number;
    era?: string;
    fieldingPercentage?: string;
    putOuts?: number;
    assists?: number;
    errors?: number;
    plateAppearances?: number;
    position?: { abbreviation: string; code: string };
  };
}

export interface PlayerProfile {
  id: number;
  pitchHand: { code: string; description: string };
  batSide: { code: string; description: string };
}

export interface DeadballPlayer {
  id: number;
  name: string;
  pos: string;
  isPitcher: boolean;
  order: number;
  bats: string;
  throws: string;
  btObt: string; // "AVG/OBP"
  traits: string[];
  pa: number;
  stats?: PlayerStats['stat']; // Raw stats for hypothetical logic
  
  // Pitcher specific
  role?: 'SP' | 'RP' | 'CP';
  pitchDie?: string;
  ip?: number;
  pitcherBatting?: {
    bats: string;
    btObt: string;
    traits: string[];
  };
}

export interface ScorecardData {
  awayTeam: {
    meta: { id: number; name: string; year: number; date?: string; venue?: string };
    batters: DeadballPlayer[];
    pitchers: DeadballPlayer[];
    bench: DeadballPlayer[];
    bullpen: DeadballPlayer[];
  };
  homeTeam: {
    meta: { id: number; name: string; year: number; date?: string; venue?: string };
    batters: DeadballPlayer[];
    pitchers: DeadballPlayer[];
    bench: DeadballPlayer[];
    bullpen: DeadballPlayer[];
  };
  meta: {
    dateDisplay: string;
    venue: string;
    venueId?: number;
    seriesGame?: string;
    seriesLabel?: string; // e.g. "ALCS", "World Series"
    isHypothetical?: boolean;
    isDH?: boolean;
  };
}

export interface SeriesGameInfo {
  gamePk: number;
  gameDate: string;
  awayId: number;
  homeId: number;
  awayName: string;
  homeName: string;
}

// Add global window type for Electron
declare global {
  interface Window {
    electronAPI?: {
      savePDF: () => Promise<void>;
    };
  }
}
