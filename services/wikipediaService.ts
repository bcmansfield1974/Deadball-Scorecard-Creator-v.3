import { PlayerInfo } from '../types';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// Common surnames that require stricter matching to avoid false positives.
// If a player has one of these names, we require a match on "Firstname Lastname" or "F. Lastname"
// rather than just "Lastname".
const COMMON_NAMES = new Set([
    'smith', 'johnson', 'williams', 'jones', 'brown', 'davis', 'miller', 'wilson', 
    'moore', 'taylor', 'anderson', 'thomas', 'jackson', 'white', 'harris', 'martin', 
    'thompson', 'garcia', 'martinez', 'robinson', 'clark', 'rodriguez', 'lewis', 
    'lee', 'walker', 'hall', 'allen', 'young', 'hernandez', 'king', 'wright', 
    'lopez', 'hill', 'scott', 'green', 'adams', 'baker', 'gonzalez', 'nelson', 
    'carter', 'mitchell', 'perez', 'roberts', 'turner', 'phillips', 'campbell', 
    'parker', 'evans', 'edwards', 'collins', 'stewart', 'sanchez', 'morris', 
    'rogers', 'reed', 'cook', 'morgan', 'bell', 'murphy', 'bailey', 'rivera', 
    'cooper', 'richardson', 'cox', 'howard', 'ward', 'torres', 'peterson', 
    'gray', 'ramirez', 'james', 'watson', 'brooks', 'kelly', 'sanders', 'price', 
    'bennett', 'wood', 'barnes', 'ross', 'henderson', 'cole', 'jenkins', 'perry', 
    'powell', 'long', 'patterson', 'hughes', 'flores', 'washington', 'butler', 
    'simmons', 'foster', 'gonzales', 'bryant', 'alexander', 'russell', 'griffin', 
    'diaz', 'hayes', 'myers', 'ford', 'hamilton', 'graham', 'sullivan', 'wallace',
    'woods', 'coleman', 'west', 'jordan', 'owens', 'reynolds', 'fisher', 'ellis',
    'harrison', 'gibson', 'mcdonald', 'cruz', 'marshall', 'ortiz', 'gomez', 'murray',
    'freeman', 'wells', 'webb', 'simpson', 'stevens', 'tucker', 'porter', 'hunter',
    'hicks', 'crawford', 'henry', 'boyd', 'mason', 'morales', 'kennedy', 'warren',
    'dixon', 'ramos', 'reyes', 'burns', 'gordon', 'shaw', 'holmes', 'rice', 
    'robertson', 'hunt', 'black', 'daniels', 'palmer', 'mills', 'nichols', 'grant',
    'knight', 'ferguson', 'rose', 'stone', 'hawkins', 'dunn', 'perkins', 'hudson',
    'spencer', 'gardner', 'stephens', 'payne', 'pierce', 'berry', 'matthews', 'arnold',
    'wagner', 'willis', 'ray', 'watkins', 'olson', 'carroll', 'duncan', 'snyder'
]);

/**
 * Fetches the raw text content of a Wikipedia page.
 */
const fetchWikiContent = async (title: string): Promise<string | null> => {
    try {
        const params = new URLSearchParams({
            action: 'parse',
            page: title,
            format: 'json',
            origin: '*',
            prop: 'text',
            redirects: '1'
        });

        const res = await fetch(`${WIKI_API}?${params.toString()}`);
        const data = await res.json();
        if (data.error) return null;
        
        // Extract text from HTML structure roughly to allow simple string matching
        const rawHtml = data.parse?.text?.['*'] || "";
        // Simple stripping of tags to get text content for searching
        const textContent = rawHtml.replace(/<[^>]+>/g, ' ').toLowerCase();
        return textContent;
    } catch (e) {
        console.error("Wikipedia fetch error:", e);
        return null;
    }
};

/**
 * Filters a roster list by verifying against a Wikipedia article.
 * Useful for World Series rosters where API data (transactions) might be incomplete for older eras.
 */
export const verifyRosterWithWikipedia = async (
    roster: PlayerInfo[], 
    year: number, 
    seriesLabel: string
): Promise<PlayerInfo[]> => {
    // 1. Construct likely Wikipedia title
    // e.g. "1924 World Series"
    const searchTitle = `${year} ${seriesLabel}`;
    
    console.log(`Verifying roster against Wikipedia: ${searchTitle}`);

    const wikiText = await fetchWikiContent(searchTitle);
    
    // Fail-open: If we can't find the article, return the original roster (don't delete everyone)
    if (!wikiText) {
        console.warn("Could not fetch Wikipedia article, skipping verification.");
        return roster;
    }

    const verifiedRoster: PlayerInfo[] = [];
    const removedNames: string[] = [];

    for (const player of roster) {
        const parts = player.fullName.split(' ');
        const lastName = parts[parts.length - 1].toLowerCase();
        const firstName = parts[0].toLowerCase();
        const firstInitial = firstName.charAt(0);
        
        // Is it a common name?
        const isCommon = COMMON_NAMES.has(lastName);

        let isFound = false;

        if (isCommon) {
            // Stricter Check: Needs "Firstname Lastname" OR "F. Lastname"
            const fullNameSearch = `${firstName} ${lastName}`;
            const initialSearch = `${firstInitial}. ${lastName}`;
            
            if (wikiText.includes(fullNameSearch) || wikiText.includes(initialSearch)) {
                isFound = true;
            }
        } else {
            // Loose Check: Just the surname is usually enough for unique players (e.g. "Wingfield")
            // Also check full name just in case
            if (wikiText.includes(lastName)) {
                isFound = true;
            }
        }

        if (isFound) {
            verifiedRoster.push(player);
        } else {
            removedNames.push(player.fullName);
        }
    }

    if (removedNames.length > 0) {
        console.log(`Wikipedia verification removed ${removedNames.length} players:`, removedNames);
    }

    // Safety valve: If we removed > 50% of the roster, something probably went wrong with the scraping.
    // Return original to be safe.
    if (verifiedRoster.length < roster.length * 0.5) {
        console.warn("Wikipedia verification removed too many players. Aborting filter.", removedNames);
        return roster;
    }

    return verifiedRoster;
};