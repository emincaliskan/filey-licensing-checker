import WARD_ALIASES, { ENFIELD_WARD_MAPPING } from '../data/wardAliases.js';

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

export function isWardExcluded(ward, excludedWards) {
  if (!ward || !excludedWards || excludedWards.length === 0) return false;
  return isWardInList(ward, excludedWards);
}

/**
 * Check Enfield ward boundary mapping.
 * Returns { inDesignation: boolean, confidence: 'high'|'medium'|'low', oldWard?: string }
 */
export function checkEnfieldWardBoundary(currentWardName) {
  if (!currentWardName) return { inDesignation: false, confidence: 'low' };

  // Direct match in mapping
  const mapping = ENFIELD_WARD_MAPPING[currentWardName];
  if (mapping) {
    return { inDesignation: mapping.inDesignation, confidence: 'high', oldWard: mapping.oldWard };
  }

  // Try case-insensitive match
  const lower = currentWardName.toLowerCase().trim();
  for (const [key, value] of Object.entries(ENFIELD_WARD_MAPPING)) {
    if (key.toLowerCase() === lower) {
      return { inDesignation: value.inDesignation, confidence: 'high', oldWard: value.oldWard };
    }
  }

  // Try the pre-2022 designated ward list directly
  const pre2022Wards = [
    "Bowes", "Chase", "Edmonton Green", "Enfield Highway", "Enfield Lock",
    "Haselbury", "Jubilee", "Lower Edmonton", "Palmers Green", "Ponders End",
    "Southbury", "Southgate Green", "Turkey Street", "Upper Edmonton"
  ];
  if (isWardInList(currentWardName, pre2022Wards)) {
    return { inDesignation: true, confidence: 'medium' };
  }

  return { inDesignation: false, confidence: 'low' };
}
