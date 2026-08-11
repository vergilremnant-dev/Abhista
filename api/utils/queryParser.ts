export interface ParsedQuery {
  search?: string;
  categoryId?: number;
  city?: string;
  experience?: number;
  rating?: number;
  maxBudget?: number;
  verifiedOnly?: boolean;
}

/**
 * Parses natural language search queries into structured database filters.
 * Ex: "Need an architect for a villa in Hyderabad" -> { search: "villa", city: "Hyderabad", categoryKey: "architect" }
 */
export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const parsed: ParsedQuery = {};
  const lowerQuery = query.toLowerCase();

  // 1. Extract Locations (City / Neighborhoods)
  const cities = ['hyderabad', 'bangalore', 'chennai', 'mumbai', 'delhi', 'pune', 'kolkata'];
  const locations = ['gachibowli', 'madhapur', 'jubilee hills', 'banjara hills', 'kondapur', 'hitech city', 'whitefield', 'koramangala', 'indiranagar'];

  for (const city of cities) {
    if (lowerQuery.includes(city)) {
      parsed.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // If no city found, check common neighborhood matches
  if (!parsed.city) {
    for (const loc of locations) {
      if (lowerQuery.includes(loc)) {
        parsed.city = 'Hyderabad'; // Neighborhoods default to parent city
        parsed.search = loc.charAt(0).toUpperCase() + loc.slice(1);
        break;
      }
    }
  }

  // 2. Extract Experience constraints
  const expMatch = lowerQuery.match(/(\d+)\+?\s*years?/);
  if (expMatch && expMatch[1]) {
    parsed.experience = parseInt(expMatch[1], 10);
  }

  // 3. Extract Budget constraints (e.g. "under 10 lakh", "under 500000")
  if (lowerQuery.includes('under') || lowerQuery.includes('below') || lowerQuery.includes('<')) {
    const lakhMatch = lowerQuery.match(/(?:under|below|less than)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lacs|l)/);
    if (lakhMatch && lakhMatch[1]) {
      parsed.maxBudget = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const numberMatch = lowerQuery.match(/(?:under|below|less than)\s*(?:rs\.?|₹)?\s*(\d+)/);
      if (numberMatch && numberMatch[1]) {
        parsed.maxBudget = parseInt(numberMatch[1], 10);
      }
    }
  }

  // 4. Extract verification status
  if (lowerQuery.includes('verified') || lowerQuery.includes('certified') || lowerQuery.includes('approved')) {
    parsed.verifiedOnly = true;
  }

  // 5. Extract general keyword search (fallback)
  // Strip out location/number phrases to find the core category term
  let cleanedSearch = query
    .replace(/(in|near|at|under|below|lakh|lacs|years|experience|verified|certified|approved|need|for|a)/gi, '')
    .replace(/\d+/g, '')
    .replace(/\+/g, '')
    .trim();

  // Clean double spaces
  cleanedSearch = cleanedSearch.replace(/\s+/g, ' ');

  if (cleanedSearch && cleanedSearch.length > 2) {
    parsed.search = cleanedSearch;
  }

  return parsed;
}
