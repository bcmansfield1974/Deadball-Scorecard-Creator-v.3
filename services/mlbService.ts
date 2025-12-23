import { Team, PlayerInfo, PlayerProfile, PlayerStats } from '../types';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

// Helper to determine league based on name and year (Copied for service usage)
const isAmericanLeague = (teamName: string, year: number): boolean => {
    const name = teamName.toLowerCase();
    
    // Handle League Switchers
    if (name.includes('brewers')) return year <= 1997; // AL until 1997
    if (name.includes('astros') || name.includes('colt .45s') || name.includes('colt 45s')) return year >= 2013; // AL from 2013

    // Washington Nationals Exception: 
    // The AL Senators were officially the "Nationals" from 1905-1956.
    // The Modern Nationals (Expos) are NL (2005-Present).
    if (name.includes('nationals')) return year < 2005;

    // Always American League Franchises (including defunct names)
    const alKeywords = [
        'yankees', 'highlanders', 
        'red sox', 'americans', 
        'white sox', 
        'tigers', 
        'guardians', 'indians', 'naps', 'bronchos', 'blues',
        'orioles', 'browns',
        'twins', 'senators', 
        'athletics', 'a\'s', 
        'royals', 
        'angels', 
        'rangers', 
        'mariners', 
        'blue jays', 
        'rays', 
        'pilots'
    ];

    return alKeywords.some(k => name.includes(k));
};

export const fetchTeams = async (year: number): Promise<Team[]> => {
  try {
    const response = await fetch(`${BASE_URL}/teams?season=${year}&sportId=1`);
    const data = await response.json();
    // Filter for American League (103) and National League (104) only
    return (data.teams || []).filter((t: any) => {
        const leagueId = t.league?.id;
        return leagueId === 103 || leagueId === 104;
    });
  } catch (e) {
    console.error("Error fetching teams", e);
    return [];
  }
};

export const fetchTeamRecord = async (teamId: number, year: number): Promise<number> => {
    try {
        // Standings endpoint gives the most accurate W-L record
        const response = await fetch(`${BASE_URL}/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason`);
        const data = await response.json();
        let winPct = 0;
        data.records?.forEach((division: any) => {
            division.teamRecords?.forEach((rec: any) => {
                if (rec.team.id === teamId) {
                    winPct = Number(rec.winningPercentage);
                }
            });
        });
        return winPct;
    } catch (e) {
        console.error("Error fetching team record", e);
        return 0;
    }
};

export const fetchSchedule = async (date: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/schedule?sportId=1&date=${date}`);
    const data = await response.json();
    if (data.dates && data.dates.length > 0) {
      return data.dates[0].games;
    }
    return [];
  } catch (e) {
    console.error("Error fetching schedule", e);
    return [];
  }
};

export const fetchScheduleByRange = async (startDate: string, endDate: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}&gameTypes=F,D,L,W`);
      const data = await response.json();
      const games: any[] = [];
      data.dates?.forEach((d: any) => {
          d.games?.forEach((g: any) => games.push(g));
      });
      return games;
    } catch (e) {
      console.error("Error fetching schedule range", e);
      return [];
    }
  };

export const fetchBoxscore = async (gamePk: number): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/game/${gamePk}/boxscore`);
    return await response.json();
  } catch (e) {
    console.error("Error fetching boxscore", e);
    return null;
  }
};

/**
 * Fetches the Set of all Player IDs who recorded a stat (hitting or pitching) 
 * for the team within a specific date range.
 * This is used to verify that bench players were actually active late in the season.
 */
const fetchActivePlayersByDateRange = async (teamId: number, year: number, startDate: string, endDate: string): Promise<Set<number>> => {
    const ids = new Set<number>();
    try {
        const groups = ['hitting', 'pitching'];
        
        // Fetch stats for both groups in parallel
        await Promise.all(groups.map(async (group) => {
            // Note: The team stats endpoint returns player splits when group is specified.
            // Adding startDate/endDate filters these splits to the window.
            const url = `${BASE_URL}/teams/${teamId}/stats?season=${year}&group=${group}&startDate=${startDate}&endDate=${endDate}`;
            const res = await fetch(url);
            const data = await res.json();
            
            // The structure is stats[0].splits
            const stats = data.stats;
            if (stats) {
                stats.forEach((statGroup: any) => {
                     const splits = statGroup.splits || [];
                     splits.forEach((s: any) => {
                         if (s.player) ids.add(s.player.id);
                     });
                });
            }
        }));
    } catch (e) {
        console.warn("Error fetching active players by date", e);
    }
    return ids;
};

export const fetchRoster = async (teamId: number, year: number, date?: string, seriesLabel?: string): Promise<PlayerInfo[]> => {
  try {
    // 1. Initial Candidate Pool: Full Season Roster
    const rosterUrl = `${BASE_URL}/teams/${teamId}/roster?season=${year}&rosterType=fullSeason`;
    const rosterRes = await fetch(rosterUrl);
    const rosterData = await rosterRes.json();
    const roster = rosterData.roster || [];
    
    const playersMap = new Map<number, PlayerInfo>();
    roster.forEach((p: any) => {
        playersMap.set(p.person.id, {
            id: p.person.id,
            fullName: p.person.fullName,
            primaryPosition: p.position
        });
    });

    // 2. Pitching Stats Backfill
    try {
        const statsRes = await fetch(`${BASE_URL}/teams/${teamId}/stats?season=${year}&group=pitching`);
        const statsData = await statsRes.json();
        const splits = statsData.stats?.[0]?.splits || [];
        splits.forEach((split: any) => {
            const pid = split.player.id;
            if (!playersMap.has(pid)) {
                playersMap.set(pid, {
                    id: pid,
                    fullName: split.player.fullName,
                    primaryPosition: { code: '1', abbreviation: 'P' }
                });
            }
        });
    } catch (e) { console.warn("Pitching stats backfill failed"); }

    // 3. Date-Based Filtering
    if (date) {
        // Determine Postseason status
        let isPostseason = false;
        if (date && parseInt(date.split('-')[1]) >= 10) isPostseason = true;
        if (seriesLabel && (seriesLabel.includes('World Series') || seriesLabel.includes('CS') || seriesLabel.includes('DS'))) isPostseason = true;

        // A. Whitelist: Postseason Stats Participation
        // Players who actually played in the postseason are immune to filtering.
        const safeIds = new Set<number>();
        if (isPostseason) {
             try {
                const psStatsRes = await fetch(`${BASE_URL}/teams/${teamId}/stats?season=${year}&group=hitting,pitching&gameType=P`);
                const psStatsData = await psStatsRes.json();
                (psStatsData.stats || []).forEach((g: any) => {
                    (g.splits || []).forEach((s: any) => safeIds.add(s.player.id));
                });
             } catch (e) {}
        }

        // B. Postseason Eligibility Check (The "Late Season Activity Rule")
        // To be eligible for the postseason roster (if they didn't play in it),
        // a player must have been active (recorded stats) for the team late in the regular season.
        // We use Aug 1 - Oct 31 as the window. This filters out players who left the team in July
        // or who were on the roster but never played (ghost entries).
        if (isPostseason) {
             const activeLateSeasonIds = await fetchActivePlayersByDateRange(teamId, year, `${year}-08-01`, `${year}-10-31`);
             
             // Safety: If API returns nothing (error or empty), don't filter anyone to avoid empty roster bugs.
             // Real postseason teams always have stats in this window.
             if (activeLateSeasonIds.size > 0) {
                 const currentIds = Array.from(playersMap.keys());
                 // Remove if: NOT in Postseason Safe List AND NOT Active in Late Season
                 const toRemove = currentIds.filter(id => !safeIds.has(id) && !activeLateSeasonIds.has(id));
                 
                 if (toRemove.length > 0) {
                     toRemove.forEach(id => playersMap.delete(id));
                 }
             }
        }
        
        // C. Roster Entry Verification (Secondary check for dates)
        // This is primarily for regular season date checks or modern era precision.
        const remainingIds = Array.from(playersMap.keys());
        const chunked = [];
        for (let i = 0; i < remainingIds.length; i += 25) {
            chunked.push(remainingIds.slice(i, i + 25));
        }

        for (const chunk of chunked) {
             try {
                 const idsStr = chunk.join(',');
                 // Hydrate rosterEntries to check precise dates
                 const peopleRes = await fetch(`${BASE_URL}/people?personIds=${idsStr}&hydrate=rosterEntries`);
                 const peopleData = await peopleRes.json();
                 
                 (peopleData.people || []).forEach((p: any) => {
                     const pid = p.id;
                     if (safeIds.has(pid)) return; // Always keep PS participants

                     const entries = p.rosterEntries || [];
                     const teamEntries = entries.filter((e: any) => e.team && e.team.id === teamId);
                     
                     if (teamEntries.length > 0) {
                         const isActive = teamEntries.some((e: any) => {
                             const start = e.startDate;
                             const end = e.endDate;
                             if (!start) return false;
                             if (date < start) return false;
                             if (end && date > end) return false;
                             return true;
                         });

                         if (!isActive) {
                             playersMap.delete(pid);
                         }
                     }
                 });
             } catch (e) {
                 console.error("Error verifying roster entries", e);
             }
        }
    }

    return Array.from(playersMap.values());
  } catch (e) {
    console.error("Error fetching roster", e);
    return [];
  }
};

const sumStats = (splits: any[], teamId?: number) => {
    const total: any = {
        gamesPlayed: 0, gamesStarted: 0, atBats: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0,
        baseOnBalls: 0, hitByPitch: 0, sacFlies: 0, strikeOuts: 0, stolenBases: 0,
        inningsPitched: 0, earnedRuns: 0, saves: 0, plateAppearances: 0
    };

    splits.forEach(s => {
        // FILTER: If teamId is provided, ignore stats from other teams
        // If teamId is undefined, aggregate all splits (full season stats)
        if (teamId && s.team && s.team.id != teamId) return;

        const st = s.stat;
        total.gamesPlayed += Number(st.gamesPlayed || 0);
        total.gamesStarted += Number(st.gamesStarted || 0);
        total.atBats += Number(st.atBats || 0);
        total.hits += Number(st.hits || 0);
        total.doubles += Number(st.doubles || 0);
        total.triples += Number(st.triples || 0);
        total.homeRuns += Number(st.homeRuns || 0);
        total.baseOnBalls += Number(st.baseOnBalls || 0);
        total.hitByPitch += Number(st.hitByPitch || 0);
        total.sacFlies += Number(st.sacFlies || 0);
        total.strikeOuts += Number(st.strikeOuts || 0);
        total.stolenBases += Number(st.stolenBases || 0);
        total.earnedRuns += Number(st.earnedRuns || 0);
        total.saves += Number(st.saves || 0);
        total.plateAppearances += Number(st.plateAppearances || 0);
        total.inningsPitched += Number(st.inningsPitched || 0);
    });

    // Recalculate rates
    if (total.atBats > 0) {
        total.avg = (total.hits / total.atBats).toFixed(3);
        const slg = (total.hits + total.doubles + 2*total.triples + 3*total.homeRuns) / total.atBats;
        total.slg = slg.toFixed(3);
    }
    const obpDenom = total.atBats + total.baseOnBalls + total.hitByPitch + total.sacFlies;
    if (obpDenom > 0) {
        total.obp = ((total.hits + total.baseOnBalls + total.hitByPitch) / obpDenom).toFixed(3);
    }
    if (total.inningsPitched > 0) {
        total.era = ((total.earnedRuns * 9) / total.inningsPitched).toFixed(2);
    } else {
        total.era = "0.00";
    }
    
    total.inningsPitched = total.inningsPitched.toString();
    return total;
};

// Batch fetch player stats and profiles
export const fetchPlayerDetails = async (playerIds: number[], year: number, teamId?: number) => {
  if (playerIds.length === 0) return { profiles: {}, stats: { hitting: {}, pitching: {}, fielding: {} } };

  const uniqueIds = Array.from(new Set(playerIds));
  // Process in chunks of 25 to avoid URL length issues
  const chunks = [];
  for (let i = 0; i < uniqueIds.length; i += 25) {
    chunks.push(uniqueIds.slice(i, i + 25));
  }

  const profiles: Record<number, PlayerProfile> = {};
  const hittingStats: Record<number, PlayerStats['stat']> = {};
  const pitchingStats: Record<number, PlayerStats['stat']> = {};
  const fieldingStats: Record<number, any[]> = {};

  for (const chunk of chunks) {
    try {
      const idsStr = chunk.join(',');
      // STRICTLY FILTER sportId=1 to avoid Minor League stats for prospects on 40-man
      // hydrate type=season and aggregate to capture multi-team players
      const url = `${BASE_URL}/people?personIds=${idsStr}&hydrate=stats(group=[hitting,pitching,fielding],type=[season],season=${year},sportId=1)`;
      const response = await fetch(url);
      const data = await response.json();

      (data.people || []).forEach((p: any) => {
        profiles[p.id] = {
          id: p.id,
          pitchHand: p.pitchHand,
          batSide: p.batSide
        };

        const statsList = p.stats || [];
        statsList.forEach((group: any) => {
            // Filter splits for the correct year
            const yearSplits = group.splits?.filter((s: any) => s.season === String(year)) || [];
            
            if (yearSplits.length > 0) {
                // If hitting or pitching, we sum the splits to get the total season stats
                // This handles players who played for multiple teams. We pass teamId to filter if desired, but often we want totals.
                if (group.group.displayName === 'hitting') {
                    hittingStats[p.id] = sumStats(yearSplits, teamId);
                } else if (group.group.displayName === 'pitching') {
                    pitchingStats[p.id] = sumStats(yearSplits, teamId);
                } else if (group.group.displayName === 'fielding') {
                    // For fielding, we list all positions played across all teams
                     if(!fieldingStats[p.id]) fieldingStats[p.id] = [];
                     yearSplits.forEach((split:any) => {
                        // Filter by teamId if provided
                        if (teamId && split.team && split.team.id != teamId) return;

                        fieldingStats[p.id].push({
                            position: split.position,
                            games: split.stat.games,
                            putOuts: split.stat.putOuts,
                            assists: split.stat.assists,
                            errors: split.stat.errors
                        });
                     });
                }
            }
        });
      });
    } catch (e) {
      console.error("Error fetching player details chunk", e);
    }
  }

  return { profiles, stats: { hitting: hittingStats, pitching: pitchingStats, fielding: fieldingStats } };
};