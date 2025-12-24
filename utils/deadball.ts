import { DeadballPlayer, PlayerStats } from '../types';

export const MODERN_TEAMS = [
    "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox",
    "Chicago Cubs", "Chicago White Sox", "Cincinnati Reds", "Cleveland Guardians",
    "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals",
    "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers",
    "Minnesota Twins", "New York Mets", "New York Yankees", "Oakland Athletics",
    "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
    "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers",
    "Toronto Blue Jays", "Washington Nationals"
];

// Comprehensive Venue History
// Updated to reflect historical name changes of the same facility
export const VENUE_HISTORY: Record<number, Array<[number, number, string]>> = {
    // 108: Angels
    108: [ 
        [1961, 1961, "Wrigley Field (LA)"], 
        [1962, 1965, "Dodger Stadium"], 
        [1966, 1997, "Anaheim Stadium"],
        [1998, 2003, "Edison International Field"],
        [2004, 2099, "Angel Stadium"] 
    ],
    // 109: D-Backs
    109: [ 
        [1998, 2005, "Bank One Ballpark"],
        [2006, 2099, "Chase Field"] 
    ],
    // 110: Orioles / Browns
    110: [ [1901, 1901, "Lloyd Street Grounds"], [1902, 1953, "Sportsman's Park"], [1954, 1991, "Memorial Stadium"], [1992, 2099, "Camden Yards"] ],
    // 111: Red Sox
    111: [ [1901, 1911, "Huntington Avenue Grounds"], [1912, 2099, "Fenway Park"] ],
    // 112: Cubs
    112: [ [1901, 1915, "West Side Grounds"], [1916, 2099, "Wrigley Field"] ],
    // 113: Reds
    113: [ 
        [1901, 1901, "League Park"], 
        [1902, 1911, "Palace of the Fans"], 
        [1912, 1970, "Crosley Field"], 
        [1970, 1996, "Riverfront Stadium"],
        [1996, 2002, "Cinergy Field"], 
        [2003, 2099, "Great American Ball Park"] 
    ],
    // 114: Guardians / Indians
    114: [ 
        [1901, 1931, "League Park"], 
        [1932, 1946, "Cleveland Stadium"], 
        [1947, 1993, "Cleveland Stadium"], 
        [1994, 2008, "Jacobs Field"],
        [2009, 2099, "Progressive Field"] 
    ],
    // 115: Rockies
    115: [ [1993, 1994, "Mile High Stadium"], [1995, 2099, "Coors Field"] ],
    // 116: Tigers
    116: [ [1901, 1911, "Bennett Park"], [1912, 1999, "Tiger Stadium"], [2000, 2099, "Comerica Park"] ],
    // 117: Astros
    117: [ 
        [1962, 1964, "Colt Stadium"], 
        [1965, 1999, "Astrodome"], 
        [2000, 2001, "Enron Field"],
        [2002, 2024, "Minute Maid Park"],
        [2025, 2099, "Daikin Park"]
    ],
    // 118: Royals
    118: [ 
        [1969, 1972, "Municipal Stadium"], 
        [1973, 1993, "Royals Stadium"],
        [1993, 2099, "Kauffman Stadium"] 
    ],
    // 119: Dodgers
    119: [ [1901, 1912, "Washington Park"], [1913, 1957, "Ebbets Field"], [1958, 1961, "Los Angeles Memorial Coliseum"], [1962, 2099, "Dodger Stadium"] ],
    // 120: Nationals / Expos
    120: [ [1969, 1976, "Jarry Park"], [1977, 2004, "Olympic Stadium"], [2005, 2007, "RFK Stadium"], [2008, 2099, "Nationals Park"] ],
    // 121: Mets
    121: [ [1962, 1963, "Polo Grounds"], [1964, 2008, "Shea Stadium"], [2009, 2099, "Citi Field"] ],
    // 133: Athletics
    133: [ 
        [1901, 1908, "Columbia Park"], 
        [1909, 1954, "Shibe Park"], 
        [1955, 1967, "Municipal Stadium"], 
        [1968, 1997, "Oakland-Alameda County Coliseum"],
        [1998, 2004, "Network Associates Coliseum"],
        [2004, 2008, "McAfee Coliseum"],
        [2008, 2011, "Oakland-Alameda County Coliseum"],
        [2011, 2015, "O.co Coliseum"],
        [2016, 2019, "Oakland Coliseum"],
        [2020, 2024, "RingCentral Coliseum"], 
        [2025, 2027, "Sutter Health Park"] 
    ],
    // 134: Pirates
    134: [ [1901, 1909, "Exposition Park"], [1909, 1970, "Forbes Field"], [1970, 2000, "Three Rivers Stadium"], [2001, 2099, "PNC Park"] ],
    // 135: Padres
    135: [ 
        [1969, 1980, "San Diego Stadium"], 
        [1981, 1997, "Jack Murphy Stadium"],
        [1997, 2003, "Qualcomm Stadium"], 
        [2004, 2099, "Petco Park"] 
    ],
    // 136: Mariners
    136: [ 
        [1977, 1999, "Kingdome"], 
        [1999, 2018, "Safeco Field"],
        [2019, 2099, "T-Mobile Park"]
    ],
    // 137: Giants
    137: [ 
        [1901, 1957, "Polo Grounds"], 
        [1958, 1959, "Seals Stadium"], 
        [1960, 1999, "Candlestick Park"], 
        [2000, 2003, "Pacific Bell Park"],
        [2004, 2005, "SBC Park"],
        [2006, 2018, "AT&T Park"],
        [2019, 2099, "Oracle Park"]
    ],
    // 138: Cardinals
    138: [ [1901, 1920, "Robison Field"], [1920, 1966, "Sportsman's Park"], [1966, 2005, "Busch Stadium II"], [2006, 2099, "Busch Stadium III"] ],
    // 139: Rays
    139: [ [1998, 2024, "Tropicana Field"], [2025, 2029, "George M. Steinbrenner Field"] ],
    // 140: Rangers / Senators II
    140: [ 
        [1961, 1961, "Griffith Stadium"], 
        [1962, 1971, "RFK Stadium"], 
        [1972, 1993, "Arlington Stadium"], 
        [1994, 2004, "The Ballpark in Arlington"], 
        [2004, 2006, "Ameriquest Field in Arlington"],
        [2007, 2013, "Rangers Ballpark in Arlington"],
        [2014, 2019, "Globe Life Park in Arlington"],
        [2020, 2099, "Globe Life Field"] 
    ],
    // 141: Blue Jays
    141: [ 
        [1977, 1989, "Exhibition Stadium"], 
        [1989, 2004, "SkyDome"],
        [2005, 2099, "Rogers Centre"] 
    ],
    // 142: Twins / Senators I
    142: [ [1901, 1910, "National Park"], [1911, 1960, "Griffith Stadium"], [1961, 1981, "Metropolitan Stadium"], [1982, 2009, "Hubert H. Humphrey Metrodome"], [2010, 2099, "Target Field"] ],
    // 143: Phillies
    143: [ [1901, 1938, "Baker Bowl"], [1938, 1970, "Shibe Park"], [1971, 2003, "Veterans Stadium"], [2004, 2099, "Citizens Bank Park"] ],
    // 144: Braves
    144: [ 
        [1901, 1914, "South End Grounds"], 
        [1915, 1952, "Braves Field"], 
        [1953, 1965, "Milwaukee County Stadium"], 
        [1966, 1996, "Atlanta-Fulton County Stadium"], 
        [1997, 2016, "Turner Field"], 
        [2017, 2019, "SunTrust Park"],
        [2020, 2099, "Truist Park"] 
    ],
    // 145: White Sox
    145: [ 
        [1901, 1910, "South Side Park"], 
        [1910, 1990, "Comiskey Park"], 
        [1991, 2002, "Comiskey Park"], 
        [2003, 2016, "U.S. Cellular Field"],
        [2017, 2099, "Guaranteed Rate Field"]
    ],
    // 146: Marlins
    146: [ 
        [1993, 1996, "Joe Robbie Stadium"],
        [1996, 2004, "Pro Player Stadium"],
        [2005, 2009, "Dolphins Stadium"],
        [2009, 2010, "Land Shark Stadium"],
        [2010, 2011, "Sun Life Stadium"], 
        [2012, 2020, "Marlins Park"], 
        [2021, 2099, "loanDepot park"] 
    ],
    // 147: Yankees
    147: [ [1903, 1912, "Hilltop Park"], [1913, 1922, "Polo Grounds"], [1923, 1973, "Yankee Stadium"], [1974, 1975, "Shea Stadium"], [1976, 2008, "Yankee Stadium"], [2009, 2099, "Yankee Stadium"] ],
    // 158: Brewers / Pilots
    158: [ 
        [1969, 1969, "Sick's Stadium"], 
        [1970, 2000, "Milwaukee County Stadium"], 
        [2001, 2020, "Miller Park"],
        [2021, 2099, "American Family Field"] 
    ]
};

// Historical ERA Data for calculation
const HEROIC_ERAS = [
    { end: 1919, avg: 2.82 },
    { end: 1935, avg: 4.20 },
    { end: 1962, avg: 3.90 },
    { end: 1969, avg: 3.20 },
    { end: 1992, avg: 3.80 },
    { end: 2009, avg: 4.60 },
    { end: 2025, avg: 4.15 },
];

export const getEraType = (year: number): "Ancient" | "Modern" => {
    return year <= 1915 ? "Ancient" : "Modern";
};

export const getHistoricalVenue = (teamId: number, year: number, currentVenueName?: string): string => {
    if (currentVenueName && currentVenueName !== "Unknown Stadium" && currentVenueName !== "None") {
        return currentVenueName;
    }
    const history = VENUE_HISTORY[teamId];
    if (history) {
        for (const [start, end, name] of history) {
            if (year >= start && year <= end) return name;
        }
    }
    return "Home Field";
};

export const cleanHandCode = (raw: string | undefined, isPitcher: boolean): string => {
    if (!raw) return isPitcher ? "RHP" : "R";
    const val = raw.trim().toUpperCase().charAt(0);
    const code = (val === 'L' || val === 'R' || val === 'S') ? val : 'R';
    return isPitcher ? `${code}HP` : code;
};

const generatePitcherBatting = (): string => {
    const d1 = Math.floor(Math.random() * 8) + 1;
    const d2 = Math.floor(Math.random() * 8) + 1;
    const bt = d1 + d2;
    const obt = bt + 4;
    return `${bt}/${obt}`;
};

export const calculateBtObt = (stats: PlayerStats['stat']): string => {
    if (!stats) return "-/-";
    let ab = Number(stats.atBats || 0);
    let h = Number(stats.hits || 0);
    let bb = Number(stats.baseOnBalls || 0);
    let hbp = Number(stats.hitByPitch || 0);
    let sf = Number(stats.sacFlies || 0);
    
    let avg = 0;
    if (ab > 0) avg = h / ab;
    
    let obp = 0;
    const den = ab + bb + hbp + sf;
    if (den > 0) obp = (h + bb + hbp) / den;
    
    if (ab === 0 && den === 0) return "-/-";
    return `${Math.floor(avg * 100)}/${Math.floor(obp * 100)}`;
};

export const getBatterTraits = (stats: PlayerStats['stat'], year: number, fieldingStats?: any[]): string[] => {
    if (!stats) return [];
    const traits: string[] = [];
    const mode = getEraType(year);

    const hr = Number(stats.homeRuns || 0);
    const doubles = Number(stats.doubles || 0);
    const sb = Number(stats.stolenBases || 0);
    const ab = Number(stats.atBats || 0);
    const h = Number(stats.hits || 0);
    const so = Number(stats.strikeOuts || 0);
    const bb = Number(stats.baseOnBalls || 0);
    const pa = Number(stats.plateAppearances) || (ab + bb + Number(stats.hitByPitch || 0) + Number(stats.sacFlies || 0));
    const gp = Number(stats.gamesPlayed || 0);

    const avg = ab > 0 ? h / ab : 0;
    
    let safeSlg = 0;
    if (stats.slg) safeSlg = Number(stats.slg);
    else if (ab > 0) {
        const d2 = Number(stats.doubles || 0);
        const d3 = Number(stats.triples || 0);
        safeSlg = (h - d2 - d3 - hr + 2*d2 + 3*d3 + 4*hr) / ab;
    }

    const iso = safeSlg - avg;
    const bb_pct = pa > 0 ? bb / pa : 0;
    const stdGames = year <= 1960 ? 154 : 162;
    const normDoubles = gp > 0 ? (doubles / gp) * stdGames : 0;

    let fldPct = 0;
    if (fieldingStats && fieldingStats.length > 0) {
        let po = 0, a = 0, e = 0;
        fieldingStats.forEach(f => {
            po += Number(f.putOuts || 0);
            a += Number(f.assists || 0);
            e += Number(f.errors || 0);
        });
        const chances = po + a + e;
        if (chances > 0) fldPct = (po + a) / chances;
    } else if (stats.fieldingPercentage) {
        fldPct = Number(stats.fieldingPercentage);
    }
    
    if (mode === "Modern") {
        if (iso >= 0.260) traits.push("P++");
        else if (iso >= 0.220) traits.push("P+");
        
        if (iso <= 0.100) traits.push("P--");
        else if (iso <= 0.125) traits.push("P-");

        if (normDoubles >= 35) traits.push("C+");
        if (normDoubles < 10) traits.push("C-");

        if (sb >= 20) traits.push("S+");
        if (sb === 0) traits.push("S-");

        if (fldPct >= 0.998) traits.push("D+");
        else if (fldPct > 0 && fldPct < 0.950) traits.push("D-");
    } else {
        if (hr >= 10) traits.push("P++");
        else if (hr >= 5) traits.push("P+");
        
        if (hr === 0 && doubles < 10) traits.push("P-"); 
        if (hr === 0 && doubles < 5) traits.push("P--"); 

        if (normDoubles >= 25) traits.push("C+");
        if (so >= 70 || (bb_pct < 0.04 && pa > 0)) traits.push("C-");

        if (sb >= 35) traits.push("S+");
        if (sb === 0) traits.push("S-");
        
        if (fldPct >= 0.998) traits.push("D+");
        else if (fldPct > 0 && fldPct < 0.950) traits.push("D-");
    }

    return Array.from(new Set(traits));
};

export const getPitchDie = (era: number, year: number, isStarter: boolean): string => {
    let leagueAvg = 4.15;
    let gameSigma = 0.80;

    // 1. Determine League Average ERA and Sigma for the specific year/era
    for (const eraData of HEROIC_ERAS) {
        if (year <= eraData.end) {
            leagueAvg = eraData.avg;
            if (year <= 1920) gameSigma = 0.65;
            else if (year >= 1993 && year <= 2009) gameSigma = 0.95;
            else gameSigma = 0.80;
            break;
        }
    }

    // EXCEPTION: Reliever d20 Upgrade
    // If a non-starting pitcher's ERA is more than 2.0 Standard Deviations from the mean (better/lower), 
    // they get an automatic upgrade to d20.
    if (!isStarter) {
        const d20Cutoff = leagueAvg + (-2.0 * gameSigma);
        if (era <= d20Cutoff) return "d20";
    }

    // 2. Assign PD based on pitcher's ERA relative to the distribution (Percentile / Z-Score)
    // Ladder: d12, d8, d4, d0, -d4, -d6
    
    // Top 5% (Better ERA) -> d12
    // Z <= -1.645
    const cutoffD12 = leagueAvg + (-1.645 * gameSigma);

    // Next 10% (Cumul 15%) -> d8
    // Z <= -1.036
    const cutoffD8 = leagueAvg + (-1.036 * gameSigma);

    // Next 20% (Cumul 35%) -> d4
    // Z <= -0.385
    const cutoffD4 = leagueAvg + (-0.385 * gameSigma);

    // Middle 35% (Cumul 70%) -> d0
    // Z <= 0.524
    const cutoffD0 = leagueAvg + (0.524 * gameSigma);

    // Next 25% (Cumul 95%) -> -d4
    // Z <= 1.645
    const cutoffMinusD4 = leagueAvg + (1.645 * gameSigma);
    
    // Bottom 5% -> -d6
    // All remaining

    if (era <= cutoffD12) return "d12";
    if (era <= cutoffD8) return "d8";
    if (era <= cutoffD4) return "d4";
    if (era <= cutoffD0) return "d0";
    if (era <= cutoffMinusD4) return "-d4";
    
    return "-d6";
};

export const getPitcherTraits = (stats: PlayerStats['stat'], year: number, isStarter: boolean): string[] => {
    if (!stats) return [];
    const traits: string[] = [];
    const mode = getEraType(year);
    
    const ip = Number(stats.inningsPitched || 0);
    const k = Number(stats.strikeOuts || 0);
    const bb = Number(stats.baseOnBalls || 0);
    const era = Number(stats.era || 99);
    
    const k9 = ip > 0 ? (k * 9) / ip : 0;
    const bb9 = ip > 0 ? (bb * 9) / ip : 0;

    if (mode === "Modern") {
        if (k9 >= 10) traits.push("K+");
        if (isStarter && ip >= 200) traits.push("ST+");
        else if (!isStarter && ip >= 70) traits.push("ST+");
    } else {
        if (k9 >= 5) traits.push("K+");
        if (k9 <= 2.50 && era <= 2.50) traits.push("GB+");
        if (ip >= 300) traits.push("ST+");
    }

    if (bb9 < 2) traits.push("CN+");
    if (bb9 >= 3.5) traits.push("CN-");

    return traits;
};

const resolvePosition = (pos: string, id: number, fieldingStats: Record<number, any[]>): string => {
    if (['OF', 'TWP', 'Y', 'P'].includes(pos)) {
        const fStats = fieldingStats[id];
        if (!fStats || fStats.length === 0) return 'DH';

        let maxGames = -1;
        let bestPos = 'DH';
        
        fStats.forEach(entry => {
            const pAbbr = entry.position.abbreviation;
            const games = Number(entry.games || 0);
            if (pAbbr !== 'P' && games > maxGames) {
                maxGames = games;
                bestPos = pAbbr;
            }
        });
        return bestPos;
    }
    return pos;
};

export const constructRoster = (
    allPlayers: any[], 
    stats: { hitting: any, pitching: any, fielding: any },
    profiles: any,
    year: number,
    battingOrder: number[] = [], 
    isDH: boolean = false,
    startingPitcherId?: number,
    suppressPitcherEntry: boolean = false,
    gamePositions: Map<number, string> = new Map()
): { batters: DeadballPlayer[], pitchers: DeadballPlayer[], bench: DeadballPlayer[], bullpen: DeadballPlayer[] } => {
    
    const pitchers: DeadballPlayer[] = [];
    const candidates: any[] = [];

    allPlayers.forEach(p => {
        const isPitcher = p.primaryPosition.code === '1';
        const isTWP = p.primaryPosition.code === 'Y';
        const pStats = stats.pitching[p.id];
        const hStats = stats.hitting[p.id];
        const profile = profiles[p.id] || { pitchHand: { code: 'R' }, batSide: { code: 'R' } };

        if ((isPitcher || isTWP) && pStats) {
            const ip = Number(pStats.inningsPitched || 0);
            const gp = Number(pStats.gamesPlayed || 0);
            const isGamePlayer = gamePositions.has(p.id);

            // Removed IP/GP restrictions completely per request.
            // Eligibility is now determined by the Date-Specific Roster check in mlbService.
            const era = Number(pStats.era || 99);
            const gs = Number(pStats.gamesStarted || 0);
            const totalGp = Number(pStats.gamesPlayed || 0);
            const isStarter = (gs / totalGp) > 0.5;
            const saves = Number(pStats.saves || 0);
            const role = isStarter ? 'SP' : (saves > 0 ? 'RP' : 'RP'); 

            const pBatStats = hStats; 
            let pPa = 0;
            if (pBatStats) {
                pPa = Number(pBatStats.atBats || 0) + Number(pBatStats.baseOnBalls || 0) + Number(pBatStats.hitByPitch || 0) + Number(pBatStats.sacFlies || 0);
            }

            let pTraits = getBatterTraits(pBatStats, year, stats.fielding[p.id]); 
            let pBtObt = calculateBtObt(pBatStats);

            if (pBtObt === "-/-" || pPa < 20) {
                pBtObt = generatePitcherBatting();
                pTraits = pTraits.filter(t => t.includes('D'));
                pTraits.push("P--", "C-");
            }

            pitchers.push({
                id: p.id,
                name: p.fullName,
                pos: 'P',
                isPitcher: true,
                order: 0,
                bats: cleanHandCode(profile.batSide?.code, false),
                throws: cleanHandCode(profile.pitchHand?.code, true),
                btObt: "-/-",
                traits: getPitcherTraits(pStats, year, isStarter),
                ip,
                pitchDie: getPitchDie(era, year, isStarter),
                role, 
                pa: pPa,
                pitcherBatting: {
                    bats: cleanHandCode(profile.batSide?.code, false),
                    btObt: pBtObt,
                    traits: pTraits
                },
                stats: { ...pStats, saves }
            });
        } 
        
        if ((!isPitcher || isTWP) && hStats) {
            let effectivePos = p.primaryPosition.abbreviation;
            if (gamePositions.has(p.id)) {
                effectivePos = gamePositions.get(p.id)!;
            }
            const resolvedPos = resolvePosition(effectivePos, p.id, stats.fielding);
            
            candidates.push({
                id: p.id,
                name: p.fullName,
                stats: hStats,
                profile,
                pos: resolvedPos
            });
        }
    });

    if (startingPitcherId) {
        const foundSp = pitchers.find(p => p.id === startingPitcherId);
        if (foundSp) foundSp.role = 'SP';
    }

    const potentialStarters = pitchers.filter(p => p.role === 'SP').sort((a,b) => (b.ip || 0) - (a.ip || 0));
    if (startingPitcherId) {
        const idx = potentialStarters.findIndex(p => p.id === startingPitcherId);
        if (idx > -1) {
            const [item] = potentialStarters.splice(idx, 1);
            potentialStarters.unshift(item);
        }
    }
    
    // Take top 5 as rotation, rest go to bullpen pool
    const rotation = potentialStarters.slice(0, 5);
    const overflowStarters = potentialStarters.slice(5);
    const finalPitchers = rotation; 

    // NEW BULLPEN LOGIC
    // 1. Identify all pitchers on roster that are Not a starting pitcher.
    // Excluding all pitchers with 'SP' role.
    const bullpenPool = pitchers.filter(p => p.role !== 'SP');
    
    // 1b. Add overflow starters (6th starter etc) to bullpen pool as RPs
    overflowStarters.forEach(p => {
        p.role = 'RP';
        bullpenPool.push(p);
    });

    // 2. Sort by Saves Descending
    bullpenPool.sort((a, b) => (Number(b.stats?.saves || 0) - Number(a.stats?.saves || 0)));

    const finalBullpen: DeadballPlayer[] = [];

    // 3. CP is the one with most saves
    if (bullpenPool.length > 0) {
        const cp = bullpenPool.shift()!;
        cp.role = 'CP';
        finalBullpen.push(cp);
    }

    // 4. Remaining sorted by IP, take top 7
    bullpenPool.sort((a, b) => (b.ip || 0) - (a.ip || 0));
    const relief = bullpenPool.slice(0, 7);
    relief.forEach(p => p.role = 'RP');
    finalBullpen.push(...relief);

    candidates.forEach(c => {
        const h = Number(c.stats.hits || 0);
        const bb = Number(c.stats.baseOnBalls || 0);
        const hbp = Number(c.stats.hitByPitch || 0);
        const ab = Number(c.stats.atBats || 0);
        const sf = Number(c.stats.sacFlies || 0);
        const pa = ab + bb + hbp + sf;
        const obp = pa > 0 ? (h + bb + hbp) / pa : 0;
        const slg = Number(c.stats.slg || 0);
        c.obp = obp;
        c.ops = obp + slg;
        c.pa = Number(c.stats.plateAppearances) || pa;
    });

    const lineup: DeadballPlayer[] = [];
    const usedIds = new Set<number>();
    
    if (battingOrder && battingOrder.length > 0) {
        let currentOrder = 1;
        battingOrder.forEach((pid) => {
            let player: any = candidates.find(c => c.id === pid);
            let finalP: DeadballPlayer | null = null;
            if (player) {
                const btObt = calculateBtObt(player.stats);
                const traits = getBatterTraits(player.stats, year, stats.fielding[player.id]);
                finalP = {
                    id: player.id,
                    name: player.name,
                    pos: player.pos,
                    isPitcher: false,
                    order: currentOrder,
                    bats: cleanHandCode(player.profile.batSide?.code, false),
                    throws: cleanHandCode(player.profile.pitchHand?.code, true),
                    btObt: btObt,
                    traits: traits,
                    pa: player.pa,
                    stats: player.stats
                };
            } else {
                const p = pitchers.find(p => p.id === pid);
                if (p) {
                    finalP = {
                        id: p.id,
                        name: p.name,
                        pos: 'P',
                        isPitcher: true,
                        order: currentOrder,
                        bats: p.bats,
                        throws: p.throws,
                        btObt: p.pitcherBatting?.btObt || "-/-",
                        traits: p.pitcherBatting?.traits || [],
                        pa: p.pa,
                        stats: undefined
                    };
                }
            }
            if (finalP) {
                lineup.push(finalP);
                usedIds.add(finalP.id);
                currentOrder++;
            }
        });
        
        // --- DUPLICATE POSITION RESOLUTION ---
        const positionMap = new Map<string, DeadballPlayer[]>();
        lineup.forEach(p => {
             if (!positionMap.has(p.pos)) positionMap.set(p.pos, []);
             positionMap.get(p.pos)!.push(p);
        });

        // Resolve Multiple DHs first (Move extra DHs to the field)
        if ((positionMap.get('DH')?.length || 0) > 1) {
            const dhs = positionMap.get('DH')!;
            const requiredPositions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
            const takenPositions = new Set(lineup.map(p => p.pos));
            const missingPositions = requiredPositions.filter(p => !takenPositions.has(p));

            // Sort so players with matching fielding stats for missing positions are processed last (to be moved)
            dhs.sort((a, b) => {
                 const aMatch = stats.fielding[a.id]?.some(f => missingPositions.includes(f.position.abbreviation));
                 const bMatch = stats.fielding[b.id]?.some(f => missingPositions.includes(f.position.abbreviation));
                 if (aMatch && !bMatch) return 1; 
                 if (!aMatch && bMatch) return -1; 
                 return 0;
            });

            // Iterate backwards to move the best candidates
            for (let i = dhs.length - 1; i >= 1; i--) {
                const p = dhs[i];
                const fStats = stats.fielding[p.id] || [];
                const match = fStats.find(f => missingPositions.includes(f.position.abbreviation));
                if (match) {
                    p.pos = match.position.abbreviation;
                    missingPositions.splice(missingPositions.indexOf(p.pos), 1);
                    takenPositions.add(p.pos);
                } else if (missingPositions.length > 0) {
                     // Fallback: If Outfielder by stats, take an OF spot
                     const ofSpot = missingPositions.find(m => ['LF', 'CF', 'RF'].includes(m));
                     if (ofSpot && fStats.some(f => ['LF', 'CF', 'RF', 'OF'].includes(f.position.abbreviation))) {
                         p.pos = ofSpot;
                         missingPositions.splice(missingPositions.indexOf(p.pos), 1);
                         takenPositions.add(p.pos);
                     } else {
                         // Last resort: fill first missing slot
                         p.pos = missingPositions.shift()!;
                         takenPositions.add(p.pos);
                     }
                }
            }
        }

        // Resolve duplicates for specific positions (e.g. two SS)
        const finalCheckMap = new Map<string, DeadballPlayer[]>();
        lineup.forEach(p => {
             if (!finalCheckMap.has(p.pos)) finalCheckMap.set(p.pos, []);
             finalCheckMap.get(p.pos)!.push(p);
        });

        finalCheckMap.forEach((players, pos) => {
            if (players.length > 1 && pos !== 'P') { 
                 const requiredPositions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
                 const currentTaken = new Set(lineup.map(p => p.pos));
                 const missing = requiredPositions.filter(rp => !currentTaken.has(rp));

                 for (let i = 1; i < players.length; i++) {
                     const p = players[i];
                     const fStats = stats.fielding[p.id] || [];
                     const match = fStats.find(f => missing.includes(f.position.abbreviation));
                     
                     if (match) {
                         p.pos = match.position.abbreviation;
                         missing.splice(missing.indexOf(p.pos), 1);
                     } else {
                         if (['LF', 'CF', 'RF'].includes(pos)) {
                             const missingOF = missing.find(m => ['LF', 'CF', 'RF'].includes(m));
                             if (missingOF) {
                                 p.pos = missingOF;
                                 missing.splice(missing.indexOf(p.pos), 1);
                                 continue;
                             }
                         }
                         if (isDH && !currentTaken.has('DH')) {
                             p.pos = 'DH';
                             currentTaken.add('DH');
                             continue;
                         }
                         if (missing.length > 0) {
                             p.pos = missing.shift()!;
                         }
                     }
                 }
            }
        });

    } else {
        const starters: any[] = [];
        const findBestFielder = (posAbbr: string) => {
             let bestCand = null;
             let maxGames = -1;
             candidates.forEach(c => {
                 if (usedIds.has(c.id)) return;
                 const fStats = stats.fielding[c.id] || [];
                 const specificStat = fStats.find(f => f.position.abbreviation === posAbbr);
                 const games = specificStat ? Number(specificStat.games || 0) : 0;
                 if (games > 0) {
                     if (games > maxGames) {
                         maxGames = games;
                         bestCand = c;
                     } else if (games === maxGames) {
                         if (bestCand && (c.ops || 0) > (bestCand.ops || 0)) bestCand = c;
                     }
                 }
             });
             if (bestCand) return bestCand;
             const fallback = candidates
                .filter(c => !usedIds.has(c.id) && c.pos === posAbbr)
                .sort((a,b) => (b.ops || 0) - (a.ops || 0))[0];
             if (fallback) return fallback;
             if (['LF','CF','RF'].includes(posAbbr)) {
                 return candidates
                    .filter(c => !usedIds.has(c.id) && c.pos === 'OF')
                    .sort((a,b) => (b.ops || 0) - (a.ops || 0))[0];
             }
             return null;
        };

        const defensivePositions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
        defensivePositions.forEach(pos => {
            let p = findBestFielder(pos);
            if (p) {
                 p = { ...p, pos };
                 starters.push(p);
                 usedIds.add(p.id);
            }
        });

        if (isDH) {
             const bestHitter = candidates
                .filter(c => !usedIds.has(c.id))
                .sort((a,b) => (b.ops || 0) - (a.ops || 0))[0];
             if (bestHitter) {
                 const p = { ...bestHitter, pos: 'DH' };
                 starters.push(p);
                 usedIds.add(p.id);
             }
        }

        const targetSize = isDH ? 9 : 8;
        while (starters.length < targetSize) {
             const bestHitter = candidates
                .filter(c => !usedIds.has(c.id))
                .sort((a,b) => (b.ops || 0) - (a.ops || 0))[0];
             if (bestHitter) {
                 const takenPos = new Set(starters.map(s => s.pos));
                 const missing = defensivePositions.find(dp => !takenPos.has(dp)) || 'DH';
                 const p = { ...bestHitter, pos: missing };
                 starters.push(p);
                 usedIds.add(p.id);
             } else {
                 break;
             }
        }

        const sortedLineup: any[] = new Array(starters.length).fill(null);
        const pool = [...starters];
        
        const popBest = (metric: 'ops' | 'obp') => {
            if (pool.length === 0) return null;
            pool.sort((a, b) => (b[metric] || 0) - (a[metric] || 0));
            return pool.shift();
        }
        
        // 3-4-5 OPS
        if (pool.length > 0) sortedLineup[2] = popBest('ops');
        if (pool.length > 0) sortedLineup[3] = popBest('ops');
        if (pool.length > 0) sortedLineup[4] = popBest('ops');
        
        // 1-2 OBP
        if (pool.length > 0) sortedLineup[0] = popBest('obp');
        if (pool.length > 0) sortedLineup[1] = popBest('obp');
        
        // Remaining OPS
        let nextIdx = 5;
        while (pool.length > 0 && nextIdx < 9) {
            sortedLineup[nextIdx++] = popBest('ops');
        }

        const finalStarters = sortedLineup.filter(p => !!p);

        finalStarters.forEach((p, i) => {
             const btObt = calculateBtObt(p.stats);
             const traits = getBatterTraits(p.stats, year, stats.fielding[p.id]);
             lineup.push({
                 id: p.id,
                 name: p.name,
                 pos: p.pos,
                 isPitcher: false,
                 order: i + 1,
                 bats: cleanHandCode(p.profile.batSide?.code, false),
                 throws: cleanHandCode(p.profile.pitchHand?.code, true),
                 btObt: btObt,
                 traits: traits,
                 pa: p.pa,
                 stats: p.stats
             });
        });

        if (!isDH && !suppressPitcherEntry) {
             const sp = finalPitchers.length > 0 ? finalPitchers[0] : (finalBullpen.length > 0 ? finalBullpen[0] : null);
             if (sp) {
                 lineup.push({
                     id: sp.id,
                     name: sp.name,
                     pos: 'P',
                     isPitcher: true,
                     order: 9,
                     bats: sp.bats,
                     throws: sp.throws,
                     btObt: sp.pitcherBatting?.btObt || "-/-",
                     traits: sp.pitcherBatting?.traits || [],
                     pa: sp.pa,
                     stats: undefined 
                 });
             }
        }
    }

    // NEW BENCH LOGIC
    // 1. Not in lineup (usedIds)
    // 2. Not a pitcher (candidates already excludes pure pitchers)
    // 3. Top 4 by PA
    const benchCandidates = candidates.filter(c => !usedIds.has(c.id));
    benchCandidates.sort((a, b) => (b.pa || 0) - (a.pa || 0));
    
    const bench: DeadballPlayer[] = [];
    benchCandidates.slice(0, 4).forEach(c => {
         const btObt = calculateBtObt(c.stats);
         const traits = getBatterTraits(c.stats, year, stats.fielding[c.id]);
         bench.push({
             id: c.id,
             name: c.name,
             pos: c.pos,
             isPitcher: false,
             order: 0,
             bats: cleanHandCode(c.profile.batSide?.code, false),
             throws: cleanHandCode(c.profile.pitchHand?.code, true),
             btObt: btObt,
             traits: traits,
             pa: c.pa,
             stats: c.stats
         });
    });

    while (lineup.length < 9) {
        lineup.push({
            id: 0,
            name: "", 
            pos: "", 
            isPitcher: false, 
            order: lineup.length + 1,
            bats: "",
            throws: "",
            btObt: "", 
            traits: [],
            pa: 0
        });
    }

    return {
        batters: lineup,
        pitchers: finalPitchers,
        bench: bench,
        bullpen: finalBullpen
    };
};