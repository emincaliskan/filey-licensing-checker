import WARD_ALIASES from '../data/wardAliases.js';

export function normaliseWardName(name) {
  if (!name) return '';
  const trimmed = name.trim();
  if (WARD_ALIASES[trimmed]) return WARD_ALIASES[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(WARD_ALIASES)) {
    if (key.toLowerCase() === lower) return value;
  }
  return trimmed.replace(/&/g, 'and').replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
}

// Note: isWardInList is kept for display/normalisation purposes only.
// It is NOT used for licensing decisions (three-tier system handles that).
export function isWardInList(ward, wardList) {
  if (!ward || !wardList || wardList.length === 0) return false;
  const normWard = normaliseWardName(ward).toLowerCase();
  for (const listWard of wardList) {
    const normListWard = normaliseWardName(listWard).toLowerCase();
    if (normWard === normListWard) return true;
    if (normWard.includes(normListWard) || normListWard.includes(normWard)) return true;
  }
  return false;
}
