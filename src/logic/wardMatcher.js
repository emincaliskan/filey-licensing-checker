import WARD_ALIASES from '../data/wardAliases.js';

/**
 * Normalise a ward/borough name for comparison.
 * Checks aliases first, then normalises.
 */
export function normaliseWardName(name) {
  if (!name) return '';

  const trimmed = name.trim();

  // Check aliases first (exact match)
  if (WARD_ALIASES[trimmed]) return WARD_ALIASES[trimmed];

  // Case-insensitive alias match
  const lower = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(WARD_ALIASES)) {
    if (key.toLowerCase() === lower) return value;
  }

  // Standard normalisation
  return trimmed
    .replace(/&/g, 'and')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a ward name matches any entry in a list of ward names.
 * Uses normalised comparison with substring matching as fallback.
 */
export function isWardInList(ward, wardList) {
  if (!ward || !wardList || wardList.length === 0) return false;

  const normWard = normaliseWardName(ward).toLowerCase();

  for (const listWard of wardList) {
    const normListWard = normaliseWardName(listWard).toLowerCase();

    // Exact match after normalisation
    if (normWard === normListWard) return true;

    // One contains the other
    if (normWard.includes(normListWard) || normListWard.includes(normWard)) return true;
  }

  return false;
}

/**
 * Check if a ward is in the excluded list.
 */
export function isWardExcluded(ward, excludedWards) {
  if (!ward || !excludedWards || excludedWards.length === 0) return false;
  return isWardInList(ward, excludedWards);
}
