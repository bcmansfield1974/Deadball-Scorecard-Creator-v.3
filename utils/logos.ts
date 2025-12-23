
// A dictionary of historical team names to logo URLs.
// Using Wikimedia commons for historical accuracy where available.
// If the team name matches a modern franchise name, the API ID lookup will handle it.
// These are primarily for defunct names or historical variants not handled by current IDs.

const LOGO_MAP: Record<string, string> = {
    "Brooklyn Dodgers": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Brooklyn_Dodgers_logo.svg/1200px-Brooklyn_Dodgers_logo.svg.png",
    "New York Giants": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/New_York_Giants_cap_insignia.svg/1024px-New_York_Giants_cap_insignia.svg.png",
    "Washington Senators": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Washington_Senators_logo.svg/800px-Washington_Senators_logo.svg.png",
    "St. Louis Browns": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/St._Louis_Browns_logo.svg/800px-St._Louis_Browns_logo.svg.png",
    "Philadelphia Athletics": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Philadelphia_Athletics_Logo.svg/1024px-Philadelphia_Athletics_Logo.svg.png",
    "Montreal Expos": "https://upload.wikimedia.org/wikipedia/en/thumb/6/64/Montreal_Expos_Logo.svg/1200px-Montreal_Expos_Logo.svg.png",
    "Boston Braves": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Boston_Braves_Logo.svg/1200px-Boston_Braves_Logo.svg.png",
    "Milwaukee Braves": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Milwaukee_Braves_logo.svg/1200px-Milwaukee_Braves_logo.svg.png",
    "Kansas City Athletics": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Kansas_City_Athletics_Logo.svg/1200px-Kansas_City_Athletics_Logo.svg.png",
    "Seattle Pilots": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Seattle_Pilots_Logo.svg/1200px-Seattle_Pilots_Logo.svg.png",
    "Houston Colt .45s": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Houston_Colt_45s_logo.svg/1200px-Houston_Colt_45s_logo.svg.png",
    "California Angels": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/California_Angels_Logo.svg/1200px-California_Angels_Logo.svg.png",
    "Anaheim Angels": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Anaheim_Angels_Logo.svg/1200px-Anaheim_Angels_Logo.svg.png",
    "Florida Marlins": "https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Florida_Marlins_Logo_%281993%E2%80%932011%29.svg/500px-Florida_Marlins_Logo_%281993%E2%80%932011%29.svg.png",
    "Miami Marlins": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Miami_Marlins_logo.svg/500px-Miami_Marlins_logo.svg.png",
    "Tampa Bay Devil Rays": "https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Tampa_Bay_Devil_Rays_Logo.svg/1200px-Tampa_Bay_Devil_Rays_Logo.svg.png",
    "New York Highlanders": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/New_York_Highlanders_logo.svg/1024px-New_York_Highlanders_logo.svg.png"
};

export const getHistoricalLogo = (teamName: string): string | undefined => {
    // Normalization
    const cleanName = teamName.trim();
    if (LOGO_MAP[cleanName]) return LOGO_MAP[cleanName];
    
    // Fuzzy/Partial match fallback
    const keys = Object.keys(LOGO_MAP);
    for (const k of keys) {
        if (cleanName === k) return LOGO_MAP[k];
    }
    
    return undefined;
};