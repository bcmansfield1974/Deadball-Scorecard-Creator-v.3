import React, { useState, useEffect } from 'react';
import { fetchTeams, fetchSchedule, fetchRoster, fetchPlayerDetails, fetchBoxscore, fetchScheduleByRange, fetchTeamRecord } from './services/mlbService';
import { ScorecardData, DeadballPlayer, Team, SeriesGameInfo } from './types';
import { constructRoster, getHistoricalVenue, getBatterTraits, getPitcherTraits, getPitchDie, calculateBtObt, cleanHandCode } from './utils/deadball';
import { ScorecardView } from './components/ScorecardView';
import { Calendar, Users, Trophy, ChevronRight, Loader2, Search, Shuffle, PlayCircle, ArrowLeft, Beaker, CheckCircle2, XCircle, Play, Dices } from 'lucide-react';

enum Mode {
  MENU,
  FIND_GAME,
  SERIES,
  HYPOTHETICAL,
  RANDOM_MENU
}

// Helper to determine league based on name and year
const isAmericanLeague = (teamName: string, year: number): boolean => {
    const name = teamName.toLowerCase();
    
    // Handle League Switchers
    if (name.includes('brewers')) return year <= 1997; // AL until 1997
    if (name.includes('astros') || name.includes('colt .45s') || name.includes('colt 45s')) return year >= 2013; // AL from 2013

    // Washington Nationals Exception: 
    // The AL Senators were officially the "Nationals" from 1905-1956, though Senators was widely used.
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

// Centralized DH Logic
const calculateIsDH = (homeTeamName: string, year: number, context: 'regular' | 'world_series'): boolean => {
    // 1. Universal DH (2020, 2022+)
    if (year >= 2022) return true;
    if (year === 2020) return true;

    // 2. Pre-DH Era
    if (year < 1973) return false;

    // 3. World Series Specific Rules (1973-2021)
    if (context === 'world_series') {
        // 1973-1975: No DH in WS at all
        if (year >= 1973 && year <= 1975) return false;
        
        // 1976-1985: Alternating Years (Even=DH, Odd=No DH)
        if (year >= 1976 && year <= 1985) {
            return (year % 2 === 0);
        }
        
        // 1986-2019, 2021: Home Team Rules (Fall through to default logic below)
    }

    // 4. Standard Rules (Home Team League Rules)
    // Used for Regular Season, ALCS/NLCS, and WS (1986-2019, 2021)
    return isAmericanLeague(homeTeamName, year);
};

function App() {
  const [mode, setMode] = useState<Mode>(Mode.MENU);
  const [scorecards, setScorecards] = useState<ScorecardData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hypothetical Mode State: Default to 2025
  const [hypoAwayYear, setHypoAwayYear] = useState(2025);
  const [hypoHomeYear, setHypoHomeYear] = useState(2025);
  const [hypoAwayTeams, setHypoAwayTeams] = useState<Team[]>([]);
  const [hypoHomeTeams, setHypoHomeTeams] = useState<Team[]>([]);
  const [hypoAwayId, setHypoAwayId] = useState<number>(0);
  const [hypoHomeId, setHypoHomeId] = useState<number>(0);
  const [hypoSeriesLength, setHypoSeriesLength] = useState<number>(7);
  
  // Specific Lineup Dates for Hypothetical
  const [hypoAwayDate, setHypoAwayDate] = useState('');
  const [hypoHomeDate, setHypoHomeDate] = useState('');

  // Find Game State
  const [findDate, setFindDate] = useState('');
  const [foundGames, setFoundGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  // Series State
  const [seriesYear, setSeriesYear] = useState(2025);
  const [foundSeries, setFoundSeries] = useState<any[]>([]);

  // Fetch teams when years change for Hypothetical Mode
  useEffect(() => {
    if (mode === Mode.HYPOTHETICAL) {
        fetchTeams(hypoAwayYear).then(t => setHypoAwayTeams(t.sort((a, b) => a.name.localeCompare(b.name))));
    }
  }, [hypoAwayYear, mode]);

  useEffect(() => {
    if (mode === Mode.HYPOTHETICAL) {
        fetchTeams(hypoHomeYear).then(t => setHypoHomeTeams(t.sort((a, b) => a.name.localeCompare(b.name))));
    }
  }, [hypoHomeYear, mode]);

  // --- RANDOM SMOKE TESTS ---
  const handleRandomGame = async () => {
      setLoading(true);
      setError('');
      try {
          let found = false;
          let attempts = 0;
          while (!found && attempts < 15) {
              attempts++;
              const currentYear = new Date().getFullYear();
              const year = Math.floor(Math.random() * (currentYear - 1901) + 1901);
              const month = Math.floor(Math.random() * 6) + 4; // 4-9
              const day = Math.floor(Math.random() * 28) + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const games = await fetchSchedule(dateStr);
              if (games && games.length > 0) {
                   const g = games[Math.floor(Math.random() * games.length)];
                   // Ensure it's a final game
                   if (g.status.abstractGameState !== 'Final') continue;

                   await processGame(g.gamePk, 
                        { id: g.teams.away.team.id, name: g.teams.away.team.name, year: year },
                        { id: g.teams.home.team.id, name: g.teams.home.team.name, year: year },
                        g.officialDate
                   );
                   found = true;
              }
          }
          if (!found) setError("Could not find a random game after 15 attempts. Try again.");
      } catch (e) {
          console.error(e);
          setError("Error fetching random game.");
          setLoading(false);
      }
      // Note: processGame sets loading false
  };

  const handleRandomSeries = async () => {
      setLoading(true);
      setError('');
      try {
          let found = false;
          let attempts = 0;
          while (!found && attempts < 15) {
              attempts++;
              // Postseason 1903-Present
              const currentYear = new Date().getFullYear();
              const year = Math.floor(Math.random() * (currentYear - 1903) + 1903);
              if (year === 1904 || year === 1994) continue; // No WS

              const start = `${year}-09-01`;
              const end = `${year}-11-30`;
              const games = await fetchScheduleByRange(start, end);

              // Group series logic (simplified from findPostseasonSeries)
              const seriesMap = new Map<string, any>();
              games.forEach(g => {
                  const state = g.status.detailedState;
                  const abstract = g.status.abstractGameState;
                  if (state === 'Postponed' || state === 'Cancelled') return;
                  if (abstract !== 'Final' && abstract !== 'Live') return;
                  if (['W','L','D','F'].includes(g.gameType)) {
                      const teams = [g.teams.away.team.name, g.teams.home.team.name].sort();
                      const key = `${g.seriesDescription} - ${teams[0]} vs ${teams[1]}`;
                      if (!seriesMap.has(key)) seriesMap.set(key, { label: key, games: [] });
                      const existing = seriesMap.get(key).games.find((ex: any) => ex.gamePk === g.gamePk);
                      if (!existing) seriesMap.get(key).games.push(g);
                  }
              });

              const allSeries = Array.from(seriesMap.values());
              if (allSeries.length > 0) {
                  const randomSeries = allSeries[Math.floor(Math.random() * allSeries.length)];
                  // Sort games
                  randomSeries.games.sort((a: any, b: any) => new Date(a.officialDate).getTime() - new Date(b.officialDate).getTime());
                  
                  // Use the seriesYear state if needed, or better, pass year to generateFullSeries? 
                  // generateFullSeries relies on seriesYear state currently. We must update it.
                  setSeriesYear(year); 
                  await generateFullSeries(randomSeries);
                  found = true;
              }
          }
          if (!found) {
              setError("Could not find a random series after 15 attempts.");
              setLoading(false);
          }
      } catch (e) {
          console.error(e);
          setError("Error fetching random series.");
          setLoading(false);
      }
  };

  const handleRandomHypothetical = async () => {
      setLoading(true);
      setError('');
      try {
          const currentYear = new Date().getFullYear();
          const y1 = Math.floor(Math.random() * (currentYear - 1901) + 1901);
          const y2 = Math.floor(Math.random() * (currentYear - 1901) + 1901);
          
          const [teams1, teams2] = await Promise.all([fetchTeams(y1), fetchTeams(y2)]);
          if (teams1.length === 0 || teams2.length === 0) {
               throw new Error("Failed to fetch teams for years " + y1 + " or " + y2);
          }

          const t1 = teams1[Math.floor(Math.random() * teams1.length)];
          const t2 = teams2[Math.floor(Math.random() * teams2.length)];

          // Populate the hypothetical generator
          await generateHypotheticalSeries({
              awayId: t1.id, awayYear: y1, awayTeam: t1,
              homeId: t2.id, homeYear: y2, homeTeam: t2,
              length: 7,
              awayDate: null, homeDate: null
          });

      } catch (e) {
          console.error(e);
          setError("Error creating random matchup.");
          setLoading(false);
      }
  };

  // Helper to process a single game (used for clicking specific games)
  const processGame = async (gamePk: number, awayMeta: any, homeMeta: any, date: string) => {
    setLoading(true);
    setError('');

    try {
      const data = await buildGameData(gamePk, awayMeta, homeMeta, date);
      if(data) setScorecards([data.scorecard]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate scorecard.");
    } finally {
      setLoading(false);
    }
  };

  // Logic extracted to support batch processing
  const buildGameData = async (gamePk: number, awayMeta: any, homeMeta: any, date: string, isHypothetical: boolean = false): Promise<{ scorecard: ScorecardData, raw: any } | null> => {
      const box = await fetchBoxscore(gamePk);
      const awayTeamId = awayMeta.id;
      const homeTeamId = homeMeta.id;
      const year = awayMeta.year;

      const gameSeriesDescription = box?.gameData?.game?.seriesDescription;
      const gameSeriesGameNumber = box?.gameData?.game?.seriesGameNumber;

      // Fetch roster, passing the series description to trigger Wikipedia filtering if needed
      const rosterA = await fetchRoster(awayTeamId, year, isHypothetical ? undefined : date, gameSeriesDescription);
      const rosterH = await fetchRoster(homeTeamId, year, isHypothetical ? undefined : date, gameSeriesDescription);
      
      // If we have boxscore, ensure all players in the game are in our roster list
      if (box && box.teams) {
          const addFromBox = (roster: any[], teamBox: any) => {
              const boxPlayers = Object.values(teamBox.players || {});
              boxPlayers.forEach((p: any) => {
                  if (!roster.find(r => r.id === p.person.id)) {
                      roster.push({
                          id: p.person.id,
                          fullName: p.person.fullName,
                          primaryPosition: p.position
                      });
                  }
              });
          };
          addFromBox(rosterA, box.teams.away);
          addFromBox(rosterH, box.teams.home);
      }

      // Fetch aggregated season stats (no team filter to ensure full season data)
      const statsA = await fetchPlayerDetails(rosterA.map(p => p.id), year);
      const statsH = await fetchPlayerDetails(rosterH.map(p => p.id), year);

      // Extract STARTING batting orders if available
      const getStartingLineup = (teamBox: any) => {
        if (!teamBox?.players) return [];
        const players = Object.values(teamBox.players) as any[];
        return players
            .filter(p => p.battingOrder && parseInt(p.battingOrder) % 100 === 0)
            .sort((a, b) => parseInt(a.battingOrder) - parseInt(b.battingOrder))
            .map(p => p.person.id);
      };

      const orderA = getStartingLineup(box?.teams?.away);
      const orderH = getStartingLineup(box?.teams?.home);
      
      const getGamePositions = (teamBox: any) => {
          const map = new Map<number, string>();
          if (!teamBox?.players) return map;
          Object.values(teamBox.players).forEach((p: any) => {
             const hasBattingOrder = p.battingOrder !== undefined;
             const hasPitchingStats = p.stats?.pitching && (p.stats.pitching.inningsPitched || p.stats.pitching.gamesPlayed > 0);
             const hasBattingStats = p.stats?.batting && (p.stats.batting.gamesPlayed > 0 || p.stats.batting.plateAppearances > 0);
             const hasFieldingStats = p.stats?.fielding && (p.stats.fielding.gamesPlayed > 0);

             if ((hasBattingOrder || hasPitchingStats || hasBattingStats || hasFieldingStats) && p.person && p.position) {
                 map.set(p.person.id, p.position.abbreviation);
             }
          });
          return map;
      };

      const posMapA = getGamePositions(box?.teams?.away);
      const posMapH = getGamePositions(box?.teams?.home);
      
      const getStarterId = (teamBox: any) => {
        return teamBox?.pitchers && teamBox.pitchers.length > 0 ? teamBox.pitchers[0] : undefined;
      };
      
      const starterIdA = getStarterId(box?.teams?.away);
      const starterIdH = getStarterId(box?.teams?.home);

      // Determine DH rule with correct historical context
      const gameType = box?.gameData?.game?.type;
      const context = (gameType === 'W') ? 'world_series' : 'regular';
      const isDH = calculateIsDH(homeMeta.name, year, context);

      const teamAData = constructRoster(rosterA, statsA.stats, statsA.profiles, year, orderA, isDH, starterIdA, false, posMapA);
      const teamHData = constructRoster(rosterH, statsH.stats, statsH.profiles, year, orderH, isDH, starterIdH, false, posMapH);
      
      const venueName = box?.gameData?.venue?.name;
      const venueId = box?.gameData?.venue?.id;
      const venue = getHistoricalVenue(homeTeamId, year, venueName);
      
      let dateDisplay = '';
      if (!isHypothetical) {
          const [y, m, d] = date.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d); 
          dateDisplay = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      // Handle Series Label normalization for single games
      let finalSeriesLabel = gameSeriesDescription;
      
      // Determine League Context using home team
      const isAL = isAmericanLeague(homeMeta.name, year);
      const leaguePrefix = isAL ? "American League" : "National League";
      
      if (finalSeriesLabel) {
           // Standardize generic names to specific names
           if (finalSeriesLabel === "League Championship Series") finalSeriesLabel = `${leaguePrefix} Championship Series`;
           if (finalSeriesLabel === "Division Series") finalSeriesLabel = `${leaguePrefix} Division Series`;
           if (finalSeriesLabel === "Wild Card Series") finalSeriesLabel = `${leaguePrefix} Wild Card Series`;
           if (finalSeriesLabel === "Wild Card Game") finalSeriesLabel = `${leaguePrefix} Wild Card Game`;
           
           // Expand acronyms if API returns them directly
           if (finalSeriesLabel === "ALCS") finalSeriesLabel = "American League Championship Series";
           if (finalSeriesLabel === "NLCS") finalSeriesLabel = "National League Championship Series";
           if (finalSeriesLabel === "ALDS") finalSeriesLabel = "American League Division Series";
           if (finalSeriesLabel === "NLDS") finalSeriesLabel = "National League Division Series";
           if (finalSeriesLabel === "ALWC") finalSeriesLabel = "American League Wild Card Series";
           if (finalSeriesLabel === "NLWC") finalSeriesLabel = "National League Wild Card Series";
      }
      
      let finalSeriesGame = undefined;
      if (gameSeriesGameNumber) {
          finalSeriesGame = `Game ${gameSeriesGameNumber}`;
      }

      return {
        scorecard: {
            awayTeam: {
              meta: awayMeta,
              batters: teamAData.batters,
              pitchers: teamAData.pitchers,
              bench: teamAData.bench,
              bullpen: teamAData.bullpen
            },
            homeTeam: {
              meta: homeMeta,
              batters: teamHData.batters,
              pitchers: teamHData.pitchers,
              bench: teamHData.bench,
              bullpen: teamHData.bullpen
            },
            meta: {
              dateDisplay: dateDisplay,
              venue: venue,
              venueId: venueId,
              seriesGame: finalSeriesGame || "Single Game",
              seriesLabel: finalSeriesLabel,
              isHypothetical: isHypothetical,
              isDH: isDH
            }
        },
        raw: {
            away: { roster: rosterA, stats: statsA, order: orderA },
            home: { roster: rosterH, stats: statsH, order: orderH }
        }
      };
  };

  const generateFullSeries = async (series: any) => {
    setLoading(true);
    setError('');
    
    let yearToUse = seriesYear;
    if (series.games && series.games.length > 0) {
        yearToUse = new Date(series.games[0].officialDate).getFullYear();
    }
    
    try {
        const gameList = series.games;
        const playedCount = gameList.length;
        let seriesLabel = series.label.split('-')[0].trim(); 
        
        // Determine League Context from Series Title or Teams
        // We use the first game's home team to guess logic if series label is generic.
        // Or if label is specific, we rely on it.
        const g1 = gameList[0];
        const isAL = isAmericanLeague(g1.teams.home.team.name, yearToUse);
        const leaguePrefix = isAL ? "American League" : "National League";

        // Series Label Normalization: Ensure League is specified
        if (seriesLabel === "League Championship Series") seriesLabel = `${leaguePrefix} Championship Series`;
        if (seriesLabel === "Division Series") seriesLabel = `${leaguePrefix} Division Series`;
        if (seriesLabel === "Wild Card Series") seriesLabel = `${leaguePrefix} Wild Card Series`;
        if (seriesLabel === "Wild Card Game") seriesLabel = `${leaguePrefix} Wild Card Game`;
        
        // Expand Acronyms
        if (seriesLabel === "ALCS") seriesLabel = "American League Championship Series";
        if (seriesLabel === "NLCS") seriesLabel = "National League Championship Series";
        if (seriesLabel === "ALDS") seriesLabel = "American League Division Series";
        if (seriesLabel === "NLDS") seriesLabel = "National League Division Series";
        if (seriesLabel === "ALWC") seriesLabel = "American League Wild Card Series";
        if (seriesLabel === "NLWC") seriesLabel = "National League Wild Card Series";

        const isWS = seriesLabel.includes('World Series') || seriesLabel.includes('WS');
        const context = isWS ? 'world_series' : 'regular';
        
        let maxGames = 7;
        // Check for substring matches since label is now fully expanded
        if (seriesLabel.includes('Division Series')) maxGames = 5;
        if (seriesLabel.includes('Wild Card')) maxGames = (yearToUse >= 2022) ? 3 : 1;
        if (yearToUse < 1985 && seriesLabel.includes('Championship Series')) maxGames = 5;
        
        // World Series special cases
        if (isWS) {
            if ([1903, 1919, 1920, 1921].includes(yearToUse)) {
                maxGames = 9;
            }
        }

        const totalGamesToProcess = Math.max(playedCount, maxGames);
        const fullSeriesData: ScorecardData[] = [];
        
        const g1Box = await fetchBoxscore(g1.gamePk);
        const seriesHighSeedId = g1Box.teams.home.team.id; 
        
        let highSeedRawData: any = null;
        let lowSeedRawData: any = null;
        let highSeedMeta: any = null;
        let lowSeedMeta: any = null;

        for (let i = 0; i < totalGamesToProcess; i++) {
            const gameNum = i + 1;
            
            if (i < playedCount) {
                const g = gameList[i];
                const awayMeta = { id: g.teams.away.team.id, name: g.teams.away.team.name, year: yearToUse };
                const homeMeta = { id: g.teams.home.team.id, name: g.teams.home.team.name, year: yearToUse };
                
                const result = await buildGameData(g.gamePk, awayMeta, homeMeta, g.officialDate);
                
                if (result) {
                    const data = result.scorecard;
                    data.meta.seriesGame = `Game ${gameNum}`;
                    data.meta.seriesLabel = seriesLabel;
                    fullSeriesData.push(data);
                    
                    if (i === 0) {
                        if (data.homeTeam.meta.id === seriesHighSeedId) {
                            highSeedRawData = result.raw.home;
                            lowSeedRawData = result.raw.away;
                            highSeedMeta = data.homeTeam.meta;
                            lowSeedMeta = data.awayTeam.meta;
                        } else {
                            highSeedRawData = result.raw.away;
                            lowSeedRawData = result.raw.home;
                            highSeedMeta = data.awayTeam.meta;
                            lowSeedMeta = data.homeTeam.meta;
                        }
                    }
                }
            } else {
                if (!highSeedRawData || !lowSeedRawData) continue; 

                let isHighSeedHome = false;
                if (maxGames === 3) {
                     if ([0, 2].includes(i)) isHighSeedHome = true; 
                } else if (maxGames === 5) {
                    if ([0, 1, 4].includes(i)) isHighSeedHome = true;
                } else if (maxGames === 7) {
                    if ([0, 1, 5, 6].includes(i)) isHighSeedHome = true;
                } else if (maxGames === 9) {
                    if ([0, 1, 5, 6].includes(i)) isHighSeedHome = true;
                }

                const homeRaw = isHighSeedHome ? highSeedRawData : lowSeedRawData;
                const awayRaw = isHighSeedHome ? lowSeedRawData : highSeedRawData;
                const homeMeta = isHighSeedHome ? highSeedMeta : lowSeedMeta;
                const awayMeta = isHighSeedHome ? lowSeedMeta : highSeedMeta;

                const venue = getHistoricalVenue(homeMeta.id, yearToUse);
                const isDH = calculateIsDH(homeMeta.name, yearToUse, context);
                
                const homeOrder = isDH ? (homeRaw.order || []) : [];
                const awayOrder = isDH ? (awayRaw.order || []) : [];

                const homeTeamData = constructRoster(homeRaw.roster, homeRaw.stats.stats, homeRaw.stats.profiles, yearToUse, homeOrder, isDH, undefined, true);
                const awayTeamData = constructRoster(awayRaw.roster, awayRaw.stats.stats, awayRaw.stats.profiles, yearToUse, awayOrder, isDH, undefined, true);
                
                fullSeriesData.push({
                    awayTeam: {
                        meta: awayMeta,
                        batters: awayTeamData.batters,
                        pitchers: awayTeamData.pitchers,
                        bench: awayTeamData.bench,
                        bullpen: awayTeamData.bullpen
                    },
                    homeTeam: {
                        meta: homeMeta,
                        batters: homeTeamData.batters,
                        pitchers: homeTeamData.pitchers,
                        bench: homeTeamData.bench,
                        bullpen: homeTeamData.bullpen
                    },
                    meta: {
                        dateDisplay: "", 
                        venue: venue,
                        seriesGame: `Game ${gameNum} (If Nec.)`,
                        seriesLabel: seriesLabel,
                        isHypothetical: true,
                        isDH: isDH
                    }
                });
            }
        }
        setScorecards(fullSeriesData);
    } catch (e) {
        console.error(e);
        setError("Error generating series.");
    } finally {
        setLoading(false);
    }
  };
  
  // Helper to fetch data for specific dates (lineups/starting pitchers)
  const fetchSpecificGameData = async (teamId: number, dateStr: string) => {
      try {
          // Normalize date input to API friendly format if needed
          let apiDate = dateStr.trim();
          if (apiDate.length > 0) {
            apiDate = apiDate.replace(/\s+/g, '/');
          }
          const games = await fetchSchedule(apiDate);
          if (!games || games.length === 0) return null;
          
          // Find the game involving the requested team
          const game = games.find((g: any) => g.teams.away.team.id === teamId || g.teams.home.team.id === teamId);
          if (!game) return null;
          
          const box = await fetchBoxscore(game.gamePk);
          if (!box) return null;
          
          const isAway = box.teams.away.team.id === teamId;
          const teamBox = isAway ? box.teams.away : box.teams.home;
          
          // Extract Lineup
          const getStartingLineup = (tb: any) => {
            if (!tb?.players) return [];
            const players = Object.values(tb.players) as any[];
            return players
                .filter(p => p.battingOrder && parseInt(p.battingOrder) % 100 === 0)
                .sort((a, b) => parseInt(a.battingOrder) - parseInt(b.battingOrder))
                .map(p => p.person.id);
          };
          const order = getStartingLineup(teamBox);
          
          // Extract Positions
          const getGamePositions = (tb: any) => {
              const map = new Map<number, string>();
              if (!tb?.players) return map;
              Object.values(tb.players).forEach((p: any) => {
                 // Check if player actually played or was in lineup
                 const hasBattingOrder = p.battingOrder !== undefined;
                 const hasStats = (p.stats?.pitching?.gamesPlayed > 0) || (p.stats?.batting?.gamesPlayed > 0) || (p.stats?.fielding?.gamesPlayed > 0);
                 if ((hasBattingOrder || hasStats) && p.person && p.position) {
                     map.set(p.person.id, p.position.abbreviation);
                 }
              });
              return map;
          };
          const positionMap = getGamePositions(teamBox);
          
          // Extract Starter
          const starterId = teamBox.pitchers && teamBox.pitchers.length > 0 ? teamBox.pitchers[0] : undefined;

          // Extract all players to ensure roster completeness (even if not in fullSeason roster)
          const boxPlayers: any[] = [];
          if (teamBox.players) {
              Object.values(teamBox.players).forEach((p: any) => {
                  boxPlayers.push({
                      id: p.person.id,
                      fullName: p.person.fullName,
                      primaryPosition: p.position
                  });
              });
          }
          
          return { order, starterId, positionMap, boxPlayers };
          
      } catch (e) {
          console.warn("Could not fetch specific date lineup", e);
          return null;
      }
  };

  const generateHypotheticalSeries = async (override?: { 
      awayId: number, awayYear: number, awayTeam: Team,
      homeId: number, homeYear: number, homeTeam: Team,
      length: number,
      awayDate: string | null, homeDate: string | null
  }) => {
    // Resolve Configuration
    const aId = override ? override.awayId : hypoAwayId;
    const aYear = override ? override.awayYear : hypoAwayYear;
    const hId = override ? override.homeId : hypoHomeId;
    const hYear = override ? override.homeYear : hypoHomeYear;
    const sLength = override ? override.length : hypoSeriesLength;
    const aDate = override ? override.awayDate : hypoAwayDate;
    const hDate = override ? override.homeDate : hypoHomeDate;

    if (!aId || !hId) return;
    setLoading(true);
    setError('');

    try {
        // We need team info (names/venues)
        let teamAInfo = override ? override.awayTeam : hypoAwayTeams.find(t => t.id === aId);
        let teamBInfo = override ? override.homeTeam : hypoHomeTeams.find(t => t.id === hId);
        
        // Helper to format date for Roster Fetch (YYYY-MM-DD)
        const formatRosterDate = (input: string | null) => {
            if (!input) return undefined;
            // Normalize spaces to slashes for Date parsing
            const normalized = input.replace(/\s+/g, '/');
            const d = new Date(normalized);
            if (isNaN(d.getTime())) return undefined;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const rosterADate = formatRosterDate(aDate);
        const rosterBDate = formatRosterDate(hDate);

        // 1. Fetch Specific Game Data FIRST (if dates exist)
        // We do this first so we can merge players into the main roster list before fetching stats
        let specificA = null;
        let specificB = null;
        
        if (aDate && aDate.length > 0) {
            specificA = await fetchSpecificGameData(aId, aDate);
            if (!specificA) setError(prev => prev + ` Could not find valid game for Team A on ${aDate}. Using season defaults.`);
        }
        if (hDate && hDate.length > 0) {
            specificB = await fetchSpecificGameData(hId, hDate);
            if (!specificB) setError(prev => prev + ` Could not find valid game for Team B on ${hDate}. Using season defaults.`);
        }

        // 2. Fetch Base Rosters (filtered by date if provided to ensure Fatigue Tracker accuracy)
        const rosterA = await fetchRoster(aId, aYear, rosterADate);
        const rosterB = await fetchRoster(hId, hYear, rosterBDate);

        // 3. Merge Specific Game Players into Roster
        // This ensures players in the lineup are available for roster construction, even if missed by the general roster fetch
        if (specificA && specificA.boxPlayers) {
             specificA.boxPlayers.forEach((p: any) => {
                 if (!rosterA.find(r => r.id === p.id)) {
                     rosterA.push(p);
                 }
             });
        }
        if (specificB && specificB.boxPlayers) {
             specificB.boxPlayers.forEach((p: any) => {
                 if (!rosterB.find(r => r.id === p.id)) {
                     rosterB.push(p);
                 }
             });
        }

        // 4. Fetch Stats (now using the merged roster list)
        const statsA = await fetchPlayerDetails(rosterA.map(p => p.id), aYear);
        const winPctA = await fetchTeamRecord(aId, aYear);

        const statsB = await fetchPlayerDetails(rosterB.map(p => p.id), hYear);
        const winPctB = await fetchTeamRecord(hId, hYear);
        
        const advObj = (winPctA > winPctB) ? 
            { meta: { id: aId, name: teamAInfo?.name || '', year: aYear }, info: teamAInfo, roster: rosterA, stats: statsA, specific: specificA } : 
            { meta: { id: hId, name: teamBInfo?.name || '', year: hYear }, info: teamBInfo, roster: rosterB, stats: statsB, specific: specificB };
            
        const disadvObj = (winPctA > winPctB) ? 
            { meta: { id: hId, name: teamBInfo?.name || '', year: hYear }, info: teamBInfo, roster: rosterB, stats: statsB, specific: specificB } : 
            { meta: { id: aId, name: teamAInfo?.name || '', year: aYear }, info: teamAInfo, roster: rosterA, stats: statsA, specific: specificA };

        const venueHomeAdv = getHistoricalVenue(advObj.meta.id, advObj.meta.year, advObj.info?.venue?.name);
        const venueAwayAdv = getHistoricalVenue(disadvObj.meta.id, disadvObj.meta.year, disadvObj.info?.venue?.name);

        const seriesLabel = `${aYear} ${teamAInfo?.name || ''} vs ${hYear} ${teamBInfo?.name || ''}`;

        const games: ScorecardData[] = [];

        for (let i = 0; i < sLength; i++) {
            let isAdvantageTeamHosting = true;
            if (sLength === 7) {
                isAdvantageTeamHosting = [0, 1, 5, 6].includes(i);
            } else if (sLength === 5) {
                isAdvantageTeamHosting = [0, 1, 4].includes(i);
            } else if (sLength === 3) {
                 isAdvantageTeamHosting = [0, 2].includes(i);
            } else {
                isAdvantageTeamHosting = true;
            }

            const homeObj = isAdvantageTeamHosting ? advObj : disadvObj;
            const awayObj = isAdvantageTeamHosting ? disadvObj : advObj;

            const isDH = calculateIsDH(homeObj.meta.name, homeObj.meta.year, 'regular');
            
            // Determine Batting Order
            // If specific date found, use that order. Else empty (auto-gen).
            const homeOrder = homeObj.specific ? homeObj.specific.order : [];
            const awayOrder = awayObj.specific ? awayObj.specific.order : [];
            
            // Determine Starter
            // Only force the specific starter for Game 1 (i=0) if provided.
            const homeStarter = (i === 0 && homeObj.specific) ? homeObj.specific.starterId : undefined;
            const awayStarter = (i === 0 && awayObj.specific) ? awayObj.specific.starterId : undefined;
            
            // Determine Positions
            // Use map if available to ensure accurate fielding positions
            const homePosMap = homeObj.specific ? homeObj.specific.positionMap : new Map();
            const awayPosMap = awayObj.specific ? awayObj.specific.positionMap : new Map();

            const homeTeamData = constructRoster(homeObj.roster, homeObj.stats.stats, homeObj.stats.profiles, homeObj.meta.year, homeOrder, isDH, homeStarter, true, homePosMap);
            const awayTeamData = constructRoster(awayObj.roster, awayObj.stats.stats, awayObj.stats.profiles, awayObj.meta.year, awayOrder, isDH, awayStarter, true, awayPosMap);

            games.push({
                awayTeam: {
                    meta: awayObj.meta,
                    batters: awayTeamData.batters,
                    pitchers: awayTeamData.pitchers,
                    bench: awayTeamData.bench,
                    bullpen: awayTeamData.bullpen
                },
                homeTeam: {
                    meta: homeObj.meta,
                    batters: homeTeamData.batters,
                    pitchers: homeTeamData.pitchers,
                    bench: homeTeamData.bench,
                    bullpen: homeTeamData.bullpen
                },
                meta: {
                    dateDisplay: "", 
                    venue: isAdvantageTeamHosting ? venueHomeAdv : venueAwayAdv,
                    seriesGame: `Game ${i + 1}`,
                    seriesLabel: seriesLabel,
                    isHypothetical: true,
                    isDH: isDH
                }
            });
        }
        setScorecards(games);
    } catch (e) {
        console.error(e);
        setError("Error generating series.");
    } finally {
        setLoading(false);
    }
  };

  const findGames = async () => {
    setLoading(true);
    setSelectedGame(null); 
    
    let apiDate = findDate.trim();
    if (apiDate.length > 0) {
        apiDate = apiDate.replace(/\s+/g, '/');
    }

    const games = await fetchSchedule(apiDate);
    setFoundGames(games);
    setLoading(false);
  };

  const findPostseasonSeries = async () => {
      setLoading(true);
      const start = `${seriesYear}-09-01`;
      const end = `${seriesYear}-11-30`;
      const games = await fetchScheduleByRange(start, end);
      
      const seriesMap = new Map<string, any>();
      games.forEach(g => {
          // FILTER: Only include Final or Live games. Exclude Postponed/Cancelled.
          // This prevents double-counting rescheduled games (e.g. 1951 WS had postponed games).
          const state = g.status.detailedState;
          const abstract = g.status.abstractGameState;
          if (state === 'Postponed' || state === 'Cancelled') return;
          if (abstract !== 'Final' && abstract !== 'Live') return;

          if (['W','L','D','F'].includes(g.gameType)) {
              const teams = [g.teams.away.team.name, g.teams.home.team.name].sort();
              const key = `${g.seriesDescription} - ${teams[0]} vs ${teams[1]}`;
              
              if (!seriesMap.has(key)) {
                  seriesMap.set(key, { label: key, games: [] });
              }
              
              // Deduplicate by gamePk to ensure we don't add the same game record twice
              const existing = seriesMap.get(key).games.find((ex: any) => ex.gamePk === g.gamePk);
              if (!existing) {
                  seriesMap.get(key).games.push(g);
              }
          }
      });
      
      // Sort games by date for each series
      const result = Array.from(seriesMap.values()).map(s => {
          s.games.sort((a: any, b: any) => {
              // Sort by date, then by gamePk to ensure stable order
              const dateDiff = new Date(a.officialDate).getTime() - new Date(b.officialDate).getTime();
              return dateDiff !== 0 ? dateDiff : a.gamePk - b.gamePk;
          });
          return s;
      });

      setFoundSeries(result);
      setLoading(false);
  };

  if (scorecards) {
    return <ScorecardView data={scorecards} onBack={() => setScorecards(null)} />;
  }

  const BackButton = () => (
    <button 
        onClick={() => setMode(Mode.MENU)} 
        className="text-gray-500 hover:text-gray-700 px-4 py-2 font-medium hover:bg-gray-100 rounded transition-colors"
    >
        Cancel & Back to Menu
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-3xl">⚾</span>
                Deadball Scorecard Creator
            </h1>
        </div>

        <div className="p-6">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {loading && <div className="text-center py-8"><Loader2 className="animate-spin w-8 h-8 mx-auto text-blue-600 mb-2" />Generating...</div>}

            {!loading && mode === Mode.MENU && (
                <div className="grid gap-4">
                    <button onClick={() => setMode(Mode.FIND_GAME)} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4">
                            <Calendar className="w-6 h-6 text-green-600" />
                            <div className="text-left">
                                <div className="font-bold text-lg">Single Historical Game</div>
                                <div className="text-sm text-slate-500">Replay a specific day in history</div>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-slate-600" />
                    </button>

                    <button onClick={() => setMode(Mode.SERIES)} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4">
                            <Trophy className="w-6 h-6 text-purple-600" />
                            <div className="text-left">
                                <div className="font-bold text-lg">Historical Postseason Series</div>
                                <div className="text-sm text-slate-500">Generate scorecards for an entire playoff series</div>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-slate-600" />
                    </button>

                    <button onClick={() => setMode(Mode.HYPOTHETICAL)} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4">
                            <Shuffle className="w-6 h-6 text-orange-600" />
                            <div className="text-left">
                                <div className="font-bold text-lg">Hypothetical Series</div>
                                <div className="text-sm text-slate-500">Pit any two teams from history against each other</div>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-slate-600" />
                    </button>

                     <button onClick={() => setMode(Mode.RANDOM_MENU)} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4">
                            <Dices className="w-6 h-6 text-gray-600" />
                            <div className="text-left">
                                <div className="font-bold text-lg">Random Generator</div>
                                <div className="text-sm text-slate-500">Generate random games, series, or matchups</div>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-slate-600" />
                    </button>
                </div>
            )}

            {!loading && mode === Mode.RANDOM_MENU && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <div>
                            <h2 className="text-xl font-bold">Random Generator</h2>
                            <p className="text-sm text-slate-500">Select a mode to generate random baseball content from 1901-Present.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button 
                            onClick={handleRandomGame}
                            className="bg-green-50 border border-green-200 p-6 rounded-lg hover:bg-green-100 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 font-bold text-green-900 mb-2 text-xl">
                                <Calendar className="w-6 h-6" /> Random Historical Game
                            </div>
                            <div className="text-green-800">Generates a scorecard for a random date (1901-Present).</div>
                        </button>

                        <button 
                            onClick={handleRandomSeries}
                            className="bg-purple-50 border border-purple-200 p-6 rounded-lg hover:bg-purple-100 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 font-bold text-purple-900 mb-2 text-xl">
                                <Trophy className="w-6 h-6" /> Random Historical Series
                            </div>
                            <div className="text-purple-800">Generates a random Postseason series (1903-Present).</div>
                        </button>

                            <button 
                            onClick={handleRandomHypothetical}
                            className="bg-orange-50 border border-orange-200 p-6 rounded-lg hover:bg-orange-100 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 font-bold text-orange-900 mb-2 text-xl">
                                <Shuffle className="w-6 h-6" /> Random Hypothetical Series
                            </div>
                            <div className="text-orange-800">Generates a 7-game series between two random teams (1901-Present).</div>
                        </button>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <BackButton />
                    </div>
                </div>
            )}

            {!loading && mode === Mode.HYPOTHETICAL && (
                <div className="space-y-6">
                     <h2 className="text-xl font-bold mb-4">Hypothetical Series</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">Team A</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Season Year</label>
                                    <input type="number" min="1901" max={new Date().getFullYear()} value={hypoAwayYear} onChange={e => setHypoAwayYear(Number(e.target.value))} className="w-full border p-2 rounded bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Team</label>
                                    <select className="w-full border p-2 rounded bg-white" onChange={e => setHypoAwayId(Number(e.target.value))}>
                                        <option value="">Select Team</option>
                                        {hypoAwayTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Lineup Date (Optional)</label>
                                    <input type="text" placeholder="MM DD YYYY" value={hypoAwayDate} onChange={e => setHypoAwayDate(e.target.value)} className="w-full border p-2 rounded bg-white" />
                                    <p className="text-[10px] text-gray-500 mt-1">If set, uses batting order & Game 1 starter from this date.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">Team B</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Season Year</label>
                                    <input type="number" min="1901" max={new Date().getFullYear()} value={hypoHomeYear} onChange={e => setHypoHomeYear(Number(e.target.value))} className="w-full border p-2 rounded bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Team</label>
                                    <select className="w-full border p-2 rounded bg-white" onChange={e => setHypoHomeId(Number(e.target.value))}>
                                        <option value="">Select Team</option>
                                        {hypoHomeTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Lineup Date (Optional)</label>
                                    <input type="text" placeholder="MM DD YYYY" value={hypoHomeDate} onChange={e => setHypoHomeDate(e.target.value)} className="w-full border p-2 rounded bg-white" />
                                    <p className="text-[10px] text-gray-500 mt-1">If set, uses batting order & Game 1 starter from this date.</p>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-bold text-blue-800 mb-2">Series Length</label>
                        <div className="flex gap-4">
                            {[3, 5, 7].map(len => (
                                <label key={len} className="flex items-center cursor-pointer">
                                    <input type="radio" name="seriesLen" value={len} checked={hypoSeriesLength === len} onChange={() => setHypoSeriesLength(len)} className="mr-2" />
                                    <span className="text-sm font-medium">{len} Games</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-2">Home Field Advantage is automatically assigned to the team with the historically better winning percentage.</p>
                     </div>

                     <div className="flex justify-end items-center gap-4 pt-4">
                        <BackButton />
                        <button onClick={() => generateHypotheticalSeries()} disabled={loading || !hypoAwayId || !hypoHomeId} className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2 font-bold shadow-md">
                           {loading && <Loader2 className="animate-spin w-4 h-4" />} Generate Matchup
                        </button>
                     </div>
                </div>
            )}

            {!loading && mode === Mode.FIND_GAME && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Single Historical Game</h2>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="MM DD YYYY"
                            value={findDate} 
                            onChange={e => setFindDate(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && findGames()}
                            className="flex-1 border p-2 rounded" 
                        />
                        <button onClick={findGames} className="bg-blue-600 text-white px-4 py-2 rounded">
                            Find
                        </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2">
                        {foundGames.length === 0 && findDate.length > 5 && <p className="text-sm text-gray-500 text-center py-4">No games found.</p>}
                        {foundGames.map(g => (
                            <button 
                                key={g.gamePk} 
                                onClick={() => setSelectedGame(g)} 
                                className={`w-full text-left p-4 border rounded-lg flex justify-between items-center transition-all ${selectedGame?.gamePk === g.gamePk ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md' : 'hover:bg-slate-50 border-slate-200'}`}
                            >
                                <div>
                                    <div className="font-bold text-lg">{g.teams.away.team.name} @ {g.teams.home.team.name}</div>
                                    <div className="text-sm text-slate-500">{g.venue?.name}</div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${g.status.abstractGameState === 'Final' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{g.status.detailedState || g.status.abstractGameState}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <BackButton />
                        <button 
                            disabled={!selectedGame}
                            onClick={() => {
                                if(!selectedGame) return;
                                const gameYear = new Date(selectedGame.officialDate).getFullYear();
                                processGame(
                                    selectedGame.gamePk, 
                                    { id: selectedGame.teams.away.team.id, name: selectedGame.teams.away.team.name, year: gameYear }, 
                                    { id: selectedGame.teams.home.team.id, name: selectedGame.teams.home.team.name, year: gameYear }, 
                                    selectedGame.officialDate
                                );
                            }}
                            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin w-4 h-4" />} Generate Scorecard
                        </button>
                    </div>
                </div>
            )}

            {!loading && mode === Mode.SERIES && (
                 <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Historical Postseason Series</h2>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={seriesYear} 
                            onChange={e => setSeriesYear(Number(e.target.value))} 
                            onKeyDown={(e) => e.key === 'Enter' && findPostseasonSeries()}
                            className="flex-1 border p-2 rounded" 
                            min="1903" 
                            max={new Date().getFullYear()} 
                        />
                        <button onClick={findPostseasonSeries} className="bg-blue-600 text-white px-4 py-2 rounded">Find</button>
                    </div>
                    
                    <div className="space-y-2">
                        {foundSeries.map((s, idx) => (
                             <div key={idx} className="border rounded p-3">
                                 <div className="flex justify-between items-center mb-2">
                                     <div className="font-bold">{s.label}</div>
                                     <button 
                                        onClick={() => generateFullSeries(s)}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 shadow flex items-center gap-1 min-w-[150px] justify-center"
                                     >
                                        <Trophy className="w-3 h-3" /> Generate Full Series
                                     </button>
                                 </div>
                                 <div className="text-sm text-gray-500 mb-2">{s.games.length} Games Played</div>
                                 <div className="flex flex-wrap gap-2">
                                     {s.games.map((g: any, i: number) => (
                                         <button key={g.gamePk} 
                                            onClick={() => processGame(g.gamePk, { id: g.teams.away.team.id, name: g.teams.away.team.name, year: seriesYear }, { id: g.teams.home.team.id, name: g.teams.home.team.name, year: seriesYear }, g.officialDate)}
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">
                                            Game {i+1}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-4">
                        <BackButton />
                    </div>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;