/**
 * Normalise a ward name for comparison.
 * Strips common suffixes like "Ward", handles "&" vs "and",
 * lowercases, and removes extra whitespace.
 */
export function normaliseWardName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\bward\b/gi, '')
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

  // Handle the special ALL_EXCEPT_EXCLUDED marker
  if (wardList.includes('ALL_EXCEPT_EXCLUDED')) return true;

  const normWard = normaliseWardName(ward);

  for (const listWard of wardList) {
    const normListWard = normaliseWardName(listWard);

    // Exact match after normalisation
    if (normWard === normListWard) return true;

    // One contains the other (handles cases like "Stoke Newington" matching "Stoke Newington Ward")
    if (normWard.includes(normListWard) || normListWard.includes(normWard)) return true;
  }

  return false;
}

/**
 * Check if a ward is in the excluded list for a borough's selective licensing.
 */
export function isWardExcluded(ward, excludedWards) {
  if (!ward || !excludedWards || excludedWards.length === 0) return false;

  const normWard = normaliseWardName(ward);

  for (const excluded of excludedWards) {
    const normExcluded = normaliseWardName(excluded);
    if (normWard === normExcluded) return true;
    if (normWard.includes(normExcluded) || normExcluded.includes(normWard)) return true;
  }

  return false;
}
