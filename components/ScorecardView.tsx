import React, { useState } from 'react';
import { ScorecardData, DeadballPlayer } from '../types';
import { getHistoricalLogo } from '../utils/logos';
import { Loader2 } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

interface Props {
  data: ScorecardData[];
  onBack: () => void;
}

const getFieldingTraits = (oppBatters: DeadballPlayer[]) => {
  return oppBatters
    .filter(p => !['DH', 'P', 'PH', 'PR', 'H'].includes(p.pos) && p.traits.some(t => t.includes('D+') || t.includes('D-')))
    .map(p => ({ pos: p.pos, trait: p.traits.find(t => t.includes('D+') || t.includes('D-')) || '' }))
    .sort((a, b) => 0); 
};

// Logo Retrieval Logic
const getLogoSource = (name: string, id: number) => {
    const manualLogo = getHistoricalLogo(name);
    if (manualLogo) return { type: 'manual', url: manualLogo };
    return { type: 'mlb', url: `https://midfield.mlbstatic.com/v1/team/${id}/spots/128` };
};

const getTeamAbbreviation = (name: string): string => {
    // Strip leading year (e.g. "1919 Chicago White Sox" -> "Chicago White Sox")
    const cleanName = name.replace(/^\d{4}\s+/, '');
    const n = cleanName.toUpperCase();

    if (n.includes("YANKEES")) return "NYY";
    if (n.includes("METS")) return "NYM";
    if (n.includes("WHITE SOX")) return "CWS";
    if (n.includes("CUBS")) return "CHC";
    if (n.includes("DODGERS")) {
        if (n.includes("BROOKLYN")) return "BRO";
        return "LAD";
    }
    if (n.includes("ANGELS")) return "LAA";
    if (n.includes("GIANTS")) {
        if (n.includes("NEW YORK")) return "NYG";
        return "SF";
    }
    if (n.includes("CARDINALS")) return "STL";
    if (n.includes("PADRES")) return "SD";
    if (n.includes("ROYALS")) return "KC";
    if (n.includes("RAYS") || n.includes("DEVIL RAYS")) return "TB";
    if (n.includes("ATHLETICS")) {
        if (n.includes("PHILADELPHIA")) return "PHA";
        if (n.includes("KANSAS CITY")) return "KCA";
        return "OAK";
    }
    if (n.includes("RED SOX")) return "BOS";
    if (n.includes("BRAVES")) {
        if (n.includes("BOSTON")) return "BSN";
        if (n.includes("MILWAUKEE")) return "MIL";
        return "ATL";
    }
    if (n.includes("INDIANS") || n.includes("GUARDIANS")) return "CLE";
    if (n.includes("TIGERS")) return "DET";
    if (n.includes("ASTROS") || n.includes("COLT")) return "HOU";
    if (n.includes("TWINS")) return "MIN";
    if (n.includes("PHILLIES")) return "PHI";
    if (n.includes("PIRATES")) return "PIT";
    if (n.includes("MARINERS")) return "SEA";
    if (n.includes("RANGERS") || n.includes("SENATORS")) { 
         if (n.includes("TEXAS")) return "TEX";
         return "WSH";
    }
    if (n.includes("BLUE JAYS")) return "TOR";
    if (n.includes("NATIONALS") || n.includes("EXPOS")) {
         if (n.includes("MONTREAL")) return "MON";
         return "WSH";
    }
    if (n.includes("REDS")) return "CIN";
    if (n.includes("ROCKIES")) return "COL";
    if (n.includes("MARLINS")) return "MIA";
    if (n.includes("DIAMONDBACKS")) return "ARI";
    if (n.includes("ORIOLES") || n.includes("BROWNS")) {
        if (n.includes("ST. LOUIS")) return "SLB";
        return "BAL";
    }
    if (n.includes("BREWERS") || n.includes("PILOTS")) return "MIL";
    
    // Fallback: First 3 chars of the clean name
    return cleanName.substring(0, 3).toUpperCase();
};

const Header = ({ teamMeta, oppName, gameMeta, isHome }: { teamMeta: { id: number, name: string, year: number }, oppName: string, gameMeta: any, isHome: boolean }) => {
    const logoSource = getLogoSource(teamMeta.name, teamMeta.id);
    
    // Construct the subheader text
    let subheaderText = gameMeta.seriesGame || "Game";
    if (gameMeta.seriesLabel) {
        if (gameMeta.isHypothetical) {
            subheaderText = `${gameMeta.seriesLabel}, ${subheaderText}`;
        } else {
            subheaderText = `${teamMeta.year} ${gameMeta.seriesLabel}, ${subheaderText}`;
        }
    }

    let awayAbbr = isHome ? getTeamAbbreviation(oppName) : getTeamAbbreviation(teamMeta.name);
    let homeAbbr = isHome ? getTeamAbbreviation(teamMeta.name) : getTeamAbbreviation(oppName);
    
    // Handle Collision for hypothetical games (e.g. 1953 Browns vs 1950 Browns -> SLB vs SLB)
    // Switch to using the Year as the identifier (e.g. '53 vs '50)
    if (awayAbbr === homeAbbr && gameMeta.isHypothetical) {
        const parseYear = (s: string) => {
            const m = s.match(/^(\d{4})\s/);
            return m ? parseInt(m[1]) : 0;
        }

        const opYear = parseYear(oppName);
        // teamMeta.year is always valid. oppName might have it if hypothetical.
        if (opYear > 0) {
            const awayY = isHome ? opYear : teamMeta.year;
            const homeY = isHome ? teamMeta.year : opYear;
            awayAbbr = `'${awayY.toString().slice(-2)}`;
            homeAbbr = `'${homeY.toString().slice(-2)}`;
        }
    }

    const showSeriesTracker = !!gameMeta.seriesLabel && !isHome;

    return (
        <div className="flex items-start gap-4 mb-6 h-20 relative">
            <div className="w-20 h-20 flex items-center justify-center pt-0">
                {logoSource ? (
                    <img 
                        src={logoSource.url}
                        alt={teamMeta.name}
                        crossOrigin="anonymous" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextSibling) nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div 
                    className={`${logoSource ? 'hidden' : 'flex'} w-16 h-16 rounded-full items-center justify-center text-2xl font-bold text-white shadow-md print:shadow-none print:border print:border-black ${isHome ? 'bg-red-800' : 'bg-blue-900'}`}
                >
                    {teamMeta.name.substring(0, 1)}
                </div>
            </div>
            {/* Shifted text up with -mt-1 */}
            <div className="flex-1 -mt-1">
                <h1 className="text-4xl font-bold leading-none mb-1 tracking-tighter">{teamMeta.year} {teamMeta.name}</h1>
                <div className="text-xl font-semibold leading-none mb-1 tracking-tighter">
                    {subheaderText}
                </div>
                {/* Consolidated Location and Date into this line */}
                <div className="text-base font-bold leading-tight tracking-tighter">
                    {isHome ? 'HOME' : 'AWAY'} vs {oppName} 
                    <span className="font-medium text-gray-600 text-sm ml-2 tracking-normal">
                        @ {gameMeta.venue} {gameMeta.dateDisplay ? `— ${gameMeta.dateDisplay}` : ''}
                    </span>
                </div>
            </div>
            
            {/* Series Tracker Table */}
            {showSeriesTracker && (
                <div className="absolute top-0 right-0 border-2 border-black bg-white shadow-sm print:shadow-none">
                    <div className="flex border-b border-black text-xs font-bold text-center bg-gray-100 print:bg-gray-100">
                        <div className="w-10 py-1 border-r border-black">{awayAbbr}</div>
                        <div className="w-10 py-1">{homeAbbr}</div>
                    </div>
                    <div className="flex text-center h-6">
                        <div className="w-10 border-r border-black"></div>
                        <div className="w-10"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Scoreboard = ({ awayName, homeName }: { awayName: string, homeName: string }) => (
    <div className="border-2 border-black mb-2 text-xs w-full">
      {/* Header Row: Shifted text up with pb-3 on children, removed items-center from parent to allow stretch */}
      <div className="grid grid-cols-[10rem_repeat(12,1fr)_2.5rem_2.5rem_2.5rem] text-center border-b border-black bg-gray-100 print:bg-gray-100 items-stretch pt-0 text-sm">
          <div className="text-left px-2 font-bold flex items-center pb-3 border-r border-black">Team</div>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`font-bold border-black flex items-center justify-center pb-3 ${i === 8 ? 'border-r-2' : ''} ${i === 11 ? 'border-r-4 border-double' : 'border-r'}`}>
                {i + 1}
            </div>
          ))}
          <div className="font-bold border-r-2 border-black flex items-center justify-center pb-3">R</div>
          <div className="font-bold border-r-2 border-black flex items-center justify-center pb-3">H</div>
          <div className="font-bold flex items-center justify-center pb-3">E</div>
      </div>
      {/* Team Rows: Added pb-3 to text cells to shift up */}
      <div className="grid grid-cols-[10rem_repeat(12,1fr)_2.5rem_2.5rem_2.5rem] text-center border-b border-black h-[2.3rem] items-center">
          <div className="text-left px-2 font-bold truncate border-r border-black h-full flex items-center pb-3 tracking-tighter">{awayName}</div>
          {[...Array(12)].map((_, i) => (
             <div key={i} className={`border-black h-full ${i === 8 ? 'border-r-2' : ''} ${i === 11 ? 'border-r-4 border-double' : 'border-r'}`}></div>
          ))}
          <div className="border-r-2 border-black h-full"></div><div className="border-r-2 border-black h-full"></div><div className="h-full"></div>
      </div>
      <div className="grid grid-cols-[10rem_repeat(12,1fr)_2.5rem_2.5rem_2.5rem] text-center h-[2.3rem] items-center">
          <div className="text-left px-2 font-bold truncate border-r border-black h-full flex items-center pb-3 tracking-tighter">{homeName}</div>
          {[...Array(12)].map((_, i) => (
             <div key={i} className={`border-black h-full ${i === 8 ? 'border-r-2' : ''} ${i === 11 ? 'border-r-4 border-double' : 'border-r'}`}></div>
          ))}
          <div className="border-r-2 border-black h-full"></div><div className="border-r-2 border-black h-full"></div><div className="h-full"></div>
      </div>
  </div>
);

const BattingTable = ({ batters }: { batters: DeadballPlayer[] }) => {
    const rows = Array(9).fill(null).map((_, i) => batters[i] || { name: '', pos: '', bats: '', btObt: '', traits: [] });

    return (
        <div className="mb-2 border-2 border-black w-full">
             {/* Header: Shifted text up (pb-3.5 on children), removed items-center from parent */}
             <div className="grid grid-cols-[2.0rem_6.5rem_1.5rem_2.5rem_2.5rem_repeat(12,1fr)] gap-0 text-sm font-bold border-b-2 border-black items-stretch pt-0 bg-gray-100 print:bg-gray-100">
                <div className="px-1 text-center flex items-center justify-center pb-3.5"></div>
                <div className="px-1 text-left flex items-center justify-start pl-2 text-sm pb-3.5">Lineup</div>
                <div className="px-1 text-center flex items-center justify-center pb-3.5"></div>
                <div className="px-1 text-center flex items-center justify-center pb-3.5"></div>
                <div className="px-1 text-center border-r border-black flex items-center justify-center pb-3.5"></div>
                {[...Array(12)].map((_, i) => <div key={i} className={`text-center border-r border-black last:border-r-0 text-sm flex items-center justify-center pb-3.5 ${i === 8 ? 'border-r-2' : ''}`}>{i+1}</div>)}
            </div>
            {/* Rows: Increased font sizes for stats columns */}
            {rows.map((p, i) => (
                <div key={i} className={`grid grid-cols-[2.0rem_6.5rem_1.5rem_2.5rem_2.5rem_repeat(12,1fr)] gap-0 text-[10px] items-center min-h-[2.6rem] ${i < 8 ? 'border-b border-black' : ''}`}>
                    <div className="font-bold px-1 h-full flex items-center justify-center pb-3 text-[10px]">{p.pos}</div>
                    <div className="font-semibold px-1 h-full flex items-center pb-3 text-[11px] leading-tight justify-start break-words" title={p.name}>{p.name}</div>
                    <div className="px-1 h-full flex items-center justify-center pb-3 text-[10px]">{p.bats}</div>
                    <div className="px-1 font-mono h-full flex items-center justify-center pb-3 text-[10px] tracking-tighter">{p.btObt}</div>
                    <div className="px-1 border-r border-black h-full flex items-center justify-center pb-3 text-[9px] leading-tight text-center break-words">{p.traits ? p.traits.join(' ') : ''}</div>
                    {[...Array(12)].map((_, j) => <div key={j} className={`border-r border-black last:border-r-0 h-full ${j === 8 ? 'border-r-2' : ''}`}></div>)}
                </div>
            ))}
        </div>
    );
};

const TeamSection: React.FC<{ 
  teamMeta: { id: number, name: string, year: number };
  isHome: boolean; 
  batters: DeadballPlayer[]; 
  opponentPitchers: DeadballPlayer[]; 
  bench: DeadballPlayer[];
  bullpen: DeadballPlayer[];
  opponentName: string;
  opponentBatters: DeadballPlayer[]; 
  gameMeta: any;
}> = ({ teamMeta, isHome, batters, opponentPitchers, bench, bullpen, opponentName, opponentBatters, gameMeta }) => {
  
  const fieldingTraits = getFieldingTraits(opponentBatters);
  const starter = opponentPitchers.find(p => p.role === 'SP') || { name: '', throws: '', pitchDie: '', traits: [], ip: '' };
  
  const isHypotheticalOrIfNec = gameMeta.isHypothetical || (gameMeta.seriesGame && gameMeta.seriesGame.includes("If Nec"));
  const showStarterRow = !isHypotheticalOrIfNec;

  const displayName = gameMeta.isHypothetical ? `${teamMeta.year} ${teamMeta.name}` : teamMeta.name;

  // Reduced padding from p-[32px] to p-[24px] to save space
  return (
    <div className="w-[816px] h-[1056px] mx-auto bg-white p-[24px] flex flex-col box-border relative shadow-2xl overflow-hidden print:shadow-none print:m-0 print:border-none">
      
      <Header teamMeta={teamMeta} oppName={opponentName} gameMeta={gameMeta} isHome={isHome} />
      
      {!isHome && <Scoreboard awayName={isHome ? opponentName : displayName} homeName={isHome ? displayName : opponentName} />}

      <BattingTable batters={batters} />

      {/* Reduced margin-bottom from mb-12 to mb-10 to push the bench up slightly */}
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-6 mb-10">
        {/* Opponent Pitchers */}
        <div>
            {/* Header: Increased padding bottom to pb-2 to shift text up relative to border */}
            <h3 className="font-bold border-b-2 border-black mb-1 pb-2 text-sm uppercase leading-none tracking-tighter">{opponentName} Pitchers</h3>
            
            {/* Pitcher Rows: Starter info */}
            {/* Modified Grid: Name(2fr), Throws, PD, Spacer(1fr), Traits */}
            <div className="grid grid-cols-[2fr_2.5rem_3rem_1fr_4.5rem] gap-1 text-[10px] items-center h-[2.3rem]">
                {showStarterRow ? (
                    <>
                        <div className="font-bold px-1 text-[11px] leading-tight flex items-center pb-3 h-full truncate">{starter.name}</div>
                        <div className="text-center flex items-center justify-center pb-3 h-full">{starter.throws}</div>
                        <div className="text-center font-mono flex items-center justify-center pb-3 h-full">{starter.pitchDie}</div>
                        <div className="flex items-center justify-center pb-3 h-full px-2">
                             {/* Blank Spacer for Notes */}
                        </div>
                        <div className="text-[9px] px-1 leading-tight flex items-center justify-center pb-3 h-full text-right">{Array.isArray(starter.traits) ? starter.traits.join(' ') : ''}</div>
                    </>
                ) : (
                    <>
                         <div></div><div></div><div></div><div></div><div></div>
                    </>
                )}
            </div>
            {/* Removed empty rows to reduce vertical space */}
        </div>

        {/* Opponent Fielding */}
        <div>
             {/* Header: Increased padding bottom to pb-2 */}
             <h3 className="font-bold border-b-2 border-black mb-1 pb-2 text-sm uppercase leading-none tracking-tighter">{opponentName} Fielding</h3>

             {/* Fielding Rows: Added pb-2.5 to text cells to shift up */}
             {fieldingTraits.map((f, i) => (
                 <div key={i} className="grid grid-cols-[2.5rem_1fr] gap-2 text-[10px] h-8 items-center w-full border-b border-gray-100 py-0.5">
                     <div className="font-bold px-1 flex items-center justify-center pb-2.5 h-full">{f.pos}</div>
                     <div className="px-1 flex items-center justify-center pb-2.5 h-full">{f.trait}</div>
                 </div>
             ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {/* Bench */}
        <div>
             {/* Header: Reduced top margin and increased bottom padding to pb-2 */}
             <h3 className="font-bold border-b-2 border-black mb-1 pb-2 text-sm uppercase leading-none mt-0 tracking-tighter">{teamMeta.name} Bench</h3>
             <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                {/* Bench Rows: Reduced min-height and text padding for compactness */}
                {bench.slice(0, 4).map((p, i) => (
                    <div key={i} className="grid grid-cols-[3ch_1fr_4ch_1fr] gap-2 text-[10px] border-b border-dotted border-gray-400 py-0.5 items-center min-h-[1.25rem]">
                        <span className="font-bold flex items-center pb-1 h-full">{p.pos}</span> 
                        <span className="truncate flex items-center pb-1 h-full">{p.name} ({p.bats})</span>
                        <span className="font-mono text-[9px] flex items-center pb-1 h-full">{p.btObt}</span>
                        <span className="text-[9px] text-gray-600 break-words leading-tight flex items-center pb-1 h-full">{p.traits.join(' ')}</span>
                    </div>
                ))}
             </div>
        </div>

        {/* Bullpen */}
        <div>
             {/* Header: Increased bottom padding to pb-2 */}
             <h3 className="font-bold border-b-2 border-black mb-1 pb-2 text-sm uppercase leading-none tracking-tighter">{teamMeta.name} Bullpen</h3>
             <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                {/* Bullpen Rows: Reduced min-height and text padding */}
                {bullpen.slice(0, 8).map((p, i) => {
                    const isDH = gameMeta.isDH;
                    let displayString = `${p.name} (${p.throws})`;
                    let metaString = p.pitchDie;
                    let traitString = p.traits ? p.traits.join(' ') : '';
                    
                    if (!isDH && p.pitcherBatting) {
                         traitString = `${traitString} // ${p.pitcherBatting.bats} ${p.pitcherBatting.btObt} ${p.pitcherBatting.traits?.join(' ')}`;
                    }

                    return (
                        <div key={i} className="grid grid-cols-[3ch_1fr_4ch_1fr] gap-2 text-[10px] border-b border-dotted border-gray-400 py-0.5 items-center min-h-[1.25rem]">
                             <span className="font-bold flex items-center pb-1 h-full">{p.role}</span> 
                             <span className="truncate flex items-center pb-1 h-full">{displayString}</span>
                             <span className="font-mono text-center text-[9px] flex items-center pb-1 h-full">{metaString}</span>
                             <span className="text-[9px] text-gray-600 leading-tight break-words flex items-center pb-1 h-full">{traitString}</span>
                        </div>
                    );
                })}
             </div>
        </div>
      </div>

    </div>
  );
};

// Helper to get unique pitchers from all games for a specific team ID
const getAllPitchers = (games: ScorecardData[], teamId: number, teamYear: number) => {
    const pitchersMap = new Map<number, DeadballPlayer>();

    const getRoleRank = (role: string | undefined) => {
        if (role === 'SP') return 0;
        if (role === 'CP') return 1;
        return 2;
    };
    
    games.forEach(game => {
        let team = null;
        if (game.awayTeam.meta.id === teamId && game.awayTeam.meta.year === teamYear) team = game.awayTeam;
        else if (game.homeTeam.meta.id === teamId && game.homeTeam.meta.year === teamYear) team = game.homeTeam;
        
        if (team) {
            [...team.pitchers, ...team.bullpen].forEach(p => {
                if (!pitchersMap.has(p.id)) {
                    pitchersMap.set(p.id, p);
                } else {
                    // Always prefer SP role if they started a game later
                    const existing = pitchersMap.get(p.id)!;
                    if (getRoleRank(p.role) < getRoleRank(existing.role)) {
                        pitchersMap.set(p.id, p);
                    }
                }
            });
        }
    });

    return Array.from(pitchersMap.values()).sort((a, b) => {
        const rankA = getRoleRank(a.role);
        const rankB = getRoleRank(b.role);

        // Sort by Role (SP -> CP -> RP)
        if (rankA !== rankB) return rankA - rankB;
        
        // Secondary sort by IP descending if available
        const ipA = a.ip || 0;
        const ipB = b.ip || 0;
        if (ipA !== ipB) return ipB - ipA;
        
        // Tertiary sort by Name
        return a.name.localeCompare(b.name);
    });
};

const getBorderClass = (gameIndex: number, totalGames: number) => {
    let isDouble = false;
    if (totalGames === 7) {
        if (gameIndex === 2 || gameIndex === 5) isDouble = true;
    } else if (totalGames === 5) {
        if (gameIndex === 2 || gameIndex === 4) isDouble = true;
    }
    
    // For the last game, we don't need a right border as the container has a border.
    if (gameIndex === totalGames) return "";
    
    if (isDouble) return "border-r-4 border-double border-black";
    return "border-r border-black";
};

const FatigueTracker = ({ games }: { games: ScorecardData[] }) => {
    const team1Meta = games[0].awayTeam.meta;
    const team2Meta = games[0].homeTeam.meta;
    const isHypothetical = games[0].meta.isHypothetical;
    
    const team1Name = isHypothetical ? `${team1Meta.year} ${team1Meta.name}` : team1Meta.name;
    const team2Name = isHypothetical ? `${team2Meta.year} ${team2Meta.name}` : team2Meta.name;
    
    // Check if any game in the series has pitchers batting (i.e. isDH is false)
    const anyPitchersBatting = games.some(g => !g.meta.isDH);
    
    // Aggregate unique pitchers from ALL games in the series
    // Added Year check to avoid mixing same-franchise teams in hypothetical matchups
    const team1Pitchers = getAllPitchers(games, team1Meta.id, team1Meta.year);
    const team2Pitchers = getAllPitchers(games, team2Meta.id, team2Meta.year);

    const gameCount = games.length;
    const gameNumbers = Array.from({ length: gameCount }, (_, i) => i + 1);
    
    // Dynamic grid columns: 22rem fixed for Name/Stats + remaining space distributed equally
    const gridStyle = { gridTemplateColumns: `22rem repeat(${gameCount}, 1fr)` };

    // Added 'hasBreak' parameter to conditionally add the page break class
    const renderFatiguePage = (teamName: string, opponentName: string, pitchers: DeadballPlayer[], hasBreak: boolean) => (
        <div className={`w-[816px] h-[1056px] mx-auto bg-white p-[32px] flex flex-col box-border shadow-2xl overflow-hidden print:shadow-none print:m-0 print:border-none ${hasBreak ? 'print:break-after-page' : ''} mb-8 print:mb-0`}>
             <h1 className="text-2xl font-bold mb-2">Pitching Tracker</h1>
             <p className="mb-6 font-semibold text-base border-b-2 border-black pb-2">Team: {teamName} <span className="font-normal text-gray-600 ml-2">vs {opponentName}</span></p>
             
             <div className="mb-4 print:break-inside-avoid w-full flex-1">
                <div className="border-2 border-black w-full">
                     <div className="grid border-b border-black bg-gray-100 text-xs font-bold text-center items-stretch" style={gridStyle}>
                         <div className="px-2 text-left flex items-center h-full pb-2.5 pt-0.5 border-r border-black">Pitcher</div>
                         {gameNumbers.map(g => (
                             <div key={g} className={`flex items-center justify-center h-full pb-2.5 pt-0.5 ${getBorderClass(g, gameCount)}`}>Game {g}</div>
                         ))}
                     </div>
                     {pitchers.map((p, i) => {
                         let traitText = p.traits.join(' ');
                         if (anyPitchersBatting && p.pitcherBatting) {
                             traitText += ` // ${p.pitcherBatting.bats} ${p.pitcherBatting.btObt} ${p.pitcherBatting.traits?.join(' ')}`;
                         }
                         return (
                         <div key={i} className="grid border-b border-black last:border-b-0 text-[10px] text-center h-7 items-center" style={gridStyle}>
                             <div className="px-2 text-left flex items-center h-full text-[10px] overflow-hidden pb-1.5 border-r border-black">
                                 <span className="font-bold mr-1 w-5 flex-shrink-0">{p.role}</span> 
                                 <span className="font-semibold mr-1 flex-shrink-0">{p.name}</span>
                                 <span className="text-gray-600 mr-1 flex-shrink-0">({p.throws})</span>
                                 <span className="font-mono mr-1 flex-shrink-0">{p.pitchDie}</span>
                                 <span className="text-[9px] text-gray-500 whitespace-nowrap leading-tight flex-1">{traitText}</span>
                             </div>
                             {gameNumbers.map(g => (
                                 <div key={g} className={`h-full ${getBorderClass(g, gameCount)}`}></div>
                             ))}
                         </div>
                     )})}
                </div>
            </div>
            {/* Italic notes removed as requested */}
        </div>
    );

    return (
        <>
             {/* First page gets a break, second page (last page) does not */}
             {renderFatiguePage(team1Name, team2Name, team1Pitchers, true)}
             {renderFatiguePage(team2Name, team1Name, team2Pitchers, false)}
        </>
    );
};

export const ScorecardView: React.FC<Props> = ({ data, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-800 min-h-screen p-8 print:p-0 print:bg-white">
      <div className="max-w-[816px] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={onBack}
          className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 flex items-center gap-2 font-medium"
        >
          ← Back to Menu
        </button>
        <button 
          onClick={handlePrint}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold flex items-center gap-2 shadow-lg"
        >
            Print / Save PDF
        </button>
      </div>

      <div className="flex flex-col gap-8 items-center print:block print:gap-0">
        {data.map((game, i) => (
          <React.Fragment key={i}>
             {/* Away Team Page */}
             <div className="print:break-after-page print:h-[1056px] print:w-[816px] mb-8 print:mb-0 print:overflow-hidden">
                <TeamSection 
                    teamMeta={game.awayTeam.meta}
                    isHome={false}
                    batters={game.awayTeam.batters}
                    // Combine pitchers (rotation) and bullpen to find the starter easily
                    opponentPitchers={[...game.homeTeam.pitchers, ...game.homeTeam.bullpen]}
                    bench={game.awayTeam.bench}
                    bullpen={game.awayTeam.bullpen}
                    opponentName={game.meta.isHypothetical ? `${game.homeTeam.meta.year} ${game.homeTeam.meta.name}` : game.homeTeam.meta.name}
                    opponentBatters={game.homeTeam.batters}
                    gameMeta={game.meta}
                />
             </div>
             
             {/* Home Team Page */}
             <div className={`${data.length > 1 ? 'print:break-after-page' : ''} print:h-[1056px] print:w-[816px] mb-8 print:mb-0 print:overflow-hidden`}>
                <TeamSection 
                    teamMeta={game.homeTeam.meta}
                    isHome={true}
                    batters={game.homeTeam.batters}
                    opponentPitchers={[...game.awayTeam.pitchers, ...game.awayTeam.bullpen]}
                    bench={game.homeTeam.bench}
                    bullpen={game.homeTeam.bullpen}
                    opponentName={game.meta.isHypothetical ? `${game.awayTeam.meta.year} ${game.awayTeam.meta.name}` : game.awayTeam.meta.name}
                    opponentBatters={game.awayTeam.batters}
                    gameMeta={game.meta}
                />
             </div>
          </React.Fragment>
        ))}
        
        {data.length > 1 && <FatigueTracker games={data} />}
      </div>
    </div>
  );
};