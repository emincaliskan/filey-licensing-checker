const CACHE_KEY = 'filey_verified_postcodes';
const CACHE_MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 months

export function getVerifiedResult(postcode) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const entry = cache[postcode?.toUpperCase()?.replace(/\s/g, '')];
    if (!entry) return null;
    const age = Date.now() - new Date(entry.verifiedDate).getTime();
    if (age > CACHE_MAX_AGE_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

export function saveVerifiedResult(postcode, result) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[postcode?.toUpperCase()?.replace(/\s/g, '')] = {
      ...result,
      verifiedDate: new Date().toISOString(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable
  }
}

export function clearVerificationCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // noop
  }
}
