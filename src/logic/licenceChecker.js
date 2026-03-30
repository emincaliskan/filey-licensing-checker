import BOROUGH_DATABASE from '../data/boroughDatabase.js';
import BOROUGH_CONFIDENCE from '../data/boroughConfidence.js';
import COUNCIL_CHECKERS from '../data/councilCheckers.js';
import DESIGNATED_WARD_CODES from '../data/designatedWardCodes.js';
import ENFIELD_DESIGNATED_AREA from '../data/enfieldDesignatedAreas.js';
import { getVerifiedResult } from './verificationCache.js';

let turfPointInPolygon = null;
let turfPoint = null;

// Lazy-load Turf.js to avoid blocking initial render
async function loadTurf() {
  if (!turfPointInPolygon) {
    try {
      const [pip, helpers] = await Promise.all([
        import('@turf/boolean-point-in-polygon'),
        import('@turf/helpers'),
      ]);
      turfPointInPolygon = pip.default || pip.booleanPointInPolygon;
      turfPoint = helpers.point;
    } catch {
      // Turf not available — will fall back to VERIFY
    }
  }
}

// Pre-load Turf on module init
loadTurf();

export function findBorough(boroughName) {
  if (!boroughName) return null;
  const normalised = boroughName.toLowerCase().trim();
  if (BOROUGH_DATABASE[normalised]) {
    return { key: normalised, data: BOROUGH_DATABASE[normalised] };
  }
  for (const [key, data] of Object.entries(BOROUGH_DATABASE)) {
    if (key === 'metadata') continue;
    const shortLower = (data.short_name || '').toLowerCase();
    const nameLower = (data.name || '').toLowerCase();
    if (shortLower === normalised || nameLower === normalised ||
        nameLower.includes(normalised) || normalised.includes(shortLower)) {
      return { key, data };
    }
  }
  return null;
}

export function getSupportedBoroughs() {
  return Object.entries(BOROUGH_DATABASE)
    .filter(([key]) => key !== 'metadata')
    .map(([, data]) => data.short_name);
}

/**
 * Check GSS ward code against designated/excluded sets.
 * Returns { inArea: boolean|null, confidence: 'high'|'verify' }
 */
function checkWardCode(boroughName, schemeType, gssCode) {
  const boroughCodes = DESIGNATED_WARD_CODES[boroughName];
  if (!boroughCodes) return { inArea: null, confidence: 'verify' };

  const scheme = boroughCodes[schemeType];
  if (!scheme) return { inArea: null, confidence: 'verify' };

  // Check designated set (ward IS in licensing area)
  if (scheme.designated && scheme.designated instanceof Set) {
    if (scheme.designated.has(gssCode)) return { inArea: true, confidence: 'high' };
  }

  // Check excluded set (ward is NOT in licensing area)
  if (scheme.excluded && scheme.excluded instanceof Set) {
    if (scheme.excluded.has(gssCode)) return { inArea: false, confidence: 'high' };
    // If not in excluded list for near-borough-wide → it IS in the area
    if (!scheme.designated) return { inArea: true, confidence: 'high' };
  }

  // If designated set exists but code not found in either set
  if (scheme.designated && scheme.designated instanceof Set) {
    if (scheme.excluded && scheme.excluded instanceof Set && scheme.excluded.has(gssCode)) {
      return { inArea: false, confidence: 'high' };
    }
    return { inArea: false, confidence: 'high' };
  }

  return { inArea: null, confidence: 'verify' };
}

/**
 * Check Enfield point-in-polygon against pre-2022 boundaries.
 */
function checkEnfieldSelective(lat, lng) {
  if (!turfPointInPolygon || !turfPoint || !ENFIELD_DESIGNATED_AREA) {
    return { inArea: null, confidence: 'verify' };
  }
  try {
    const pt = turfPoint([lng, lat]);
    for (const feature of ENFIELD_DESIGNATED_AREA.features) {
      if (turfPointInPolygon(pt, feature)) {
        return { inArea: true, confidence: 'high', wardName: feature.properties.name };
      }
    }
    return { inArea: false, confidence: 'high' };
  } catch {
    return { inArea: null, confidence: 'verify' };
  }
}

/**
 * Three-tier licence checking with V4 automated ward verification.
 */
export function checkLicensing(params) {
  const {
    borough, ward, num_occupants, num_households,
    shares_facilities, exemptions = [], postcode,
    latitude, longitude, gssWardCode,
  } = params;

  const boroughResult = findBorough(borough);
  const reasoning = [];
  const licences = [];
  const advisoryNotes = [];
  const warnings = [];
  let overallConfidence = 'high';
  const verificationsNeeded = [];

  if (!boroughResult) {
    return {
      verdict: 'unsupported', verdictColor: 'grey',
      verdictText: 'BOROUGH NOT IN DATABASE',
      message: `"${borough}" is not currently in the licensing database.`,
      supportedBoroughs: getSupportedBoroughs(),
      licences: [], advisoryNotes: [], warnings: [],
      reasoning: [`Borough "${borough}" not found in database.`],
      confidence: 'low', verificationsNeeded: [],
    };
  }

  const bd = boroughResult.data;
  const conf = BOROUGH_CONFIDENCE[bd.short_name] || {};
  const checker = COUNCIL_CHECKERS[bd.short_name];

  reasoning.push(`Property is in ${bd.short_name} (${bd.region}).`);
  if (ward) reasoning.push(`Postcodes.io ward hint: "${ward}" (informational only).`);
  reasoning.push(`Occupants: ${num_occupants}, Households: ${num_households}, Shared: ${shares_facilities ? 'Yes' : 'No'}.`);

  const cached = postcode ? getVerifiedResult(postcode) : null;
  if (cached) reasoning.push(`Cached verification found for ${postcode}.`);

  // STEP 0: EXEMPTION CHECK
  if (exemptions.length > 0) {
    return {
      verdict: 'exempt', verdictColor: 'exempt',
      verdictText: 'PROPERTY MAY BE EXEMPT',
      borough: bd.short_name, boroughFullName: bd.name, region: bd.region,
      ward, councilUrl: bd.councilUrl, licences: [],
      advisoryNotes: [{ type: 'exemption', text: `Exemption reasons: ${exemptions.join(', ')}. Verify with council.` }],
      warnings: [], reasoning: [...reasoning, 'Property flagged as potentially exempt.'],
      confidence: 'high', verificationsNeeded: [],
    };
  }

  // STEP 1: MANDATORY HMO (National — always HIGH)
  if (num_occupants >= 5 && num_households >= 2 && shares_facilities) {
    licences.push({
      type: 'Mandatory HMO', status: 'national', statusLabel: 'National Legislation',
      description: 'Properties with 5+ persons from 2+ households sharing facilities.',
      scope: 'National', confidence: 'high',
    });
    reasoning.push(`✓ MANDATORY HMO REQUIRED (national law) — HIGH`);
  } else {
    reasoning.push(`✗ Mandatory HMO: Does not meet threshold.`);
  }

  // STEP 2: ADDITIONAL HMO
  const isHMOCandidate = num_occupants >= 3 && num_households >= 2 && shares_facilities;
  const hasMandatory = licences.some(l => l.type === 'Mandatory HMO');

  if (isHMOCandidate && !hasMandatory) {
    if (bd.additionalHMO && bd.additionalHMO.active) {
      const hmoConf = conf.additionalHMO || 'VERIFY';

      if (hmoConf === 'AUTO_HIGH') {
        licences.push({
          type: 'Additional HMO', status: 'council_scheme',
          statusLabel: `${bd.short_name} — Borough-wide`,
          description: bd.additionalHMO.description, scope: 'Borough-wide',
          confidence: 'high', fee: bd.additionalHMO.fee,
        });
        reasoning.push(`✓ ADDITIONAL HMO REQUIRED (borough-wide) — HIGH`);
      } else if (hmoConf === 'WARD_CHECK' && gssWardCode) {
        const check = checkWardCode(bd.short_name, 'additionalHMO', gssWardCode);
        if (check.inArea === true) {
          licences.push({
            type: 'Additional HMO', status: 'council_scheme',
            statusLabel: `${bd.short_name} — Ward Verified`,
            description: bd.additionalHMO.description, scope: 'Designated ward',
            confidence: 'high', fee: bd.additionalHMO.fee,
          });
          reasoning.push(`✓ ADDITIONAL HMO REQUIRED (GSS ward code match) — HIGH`);
        } else if (check.inArea === false) {
          reasoning.push(`✓ Additional HMO NOT required (ward not in designated area) — HIGH`);
        } else {
          overallConfidence = 'verify';
          reasoning.push(`🟠 Additional HMO: Ward code not found in data — VERIFY with council.`);
          verificationsNeeded.push({ type: 'Additional HMO', checker, borough: bd.short_name });
        }
      } else if (hmoConf === 'MEDIUM' || hmoConf === 'WARD_CHECK') {
        // WARD_CHECK without gssCode falls through to MEDIUM-style
        const excluded = bd.additionalHMO.excludedWards || [];
        licences.push({
          type: 'Additional HMO', status: 'council_scheme',
          statusLabel: `${bd.short_name} — Most Wards`,
          description: bd.additionalHMO.description,
          scope: `Most wards (${excluded.length} excluded: ${excluded.join(', ')})`,
          confidence: 'medium', fee: bd.additionalHMO.fee,
        });
        if (overallConfidence === 'high') overallConfidence = 'medium';
        reasoning.push(`🟡 ADDITIONAL HMO LIKELY REQUIRED — ${excluded.length} wards excluded. MEDIUM`);
        if (checker) verificationsNeeded.push({ type: 'Additional HMO', checker, borough: bd.short_name });
      } else {
        overallConfidence = 'verify';
        reasoning.push(`🟠 Additional HMO: VERIFICATION REQUIRED.`);
        verificationsNeeded.push({ type: 'Additional HMO', checker, borough: bd.short_name });
      }
    } else if (bd.additionalHMO?.upcoming) {
      warnings.push(`${bd.short_name}'s Additional HMO scheme starts ${bd.additionalHMO.startDate}. Applications from ${bd.additionalHMO.applicationsOpen || 'TBC'}.`);
      reasoning.push(`— Additional HMO: Upcoming (starts ${bd.additionalHMO.startDate}).`);
    } else {
      reasoning.push(`✗ Additional HMO: No active scheme in ${bd.short_name}.`);
    }
  } else if (hasMandatory) {
    reasoning.push(`— Additional HMO: Not applicable (Mandatory HMO applies).`);
  } else {
    reasoning.push(`✗ Additional HMO: Does not meet threshold.`);
  }

  // STEP 3: SELECTIVE LICENSING
  const isSelectiveCandidate = !hasMandatory && !licences.some(l => l.type === 'Additional HMO');

  if (bd.selectiveLicensing && bd.selectiveLicensing.active) {
    const selConf = conf.selective || 'VERIFY';

    if (selConf === 'AUTO_HIGH') {
      if (isSelectiveCandidate || !isHMOCandidate) {
        licences.push({
          type: 'Selective', status: 'council_scheme',
          statusLabel: `${bd.short_name} — Borough-wide`,
          description: bd.selectiveLicensing.description, scope: 'Borough-wide',
          confidence: 'high', fee: bd.selectiveLicensing.fee,
        });
        reasoning.push(`✓ SELECTIVE LICENCE REQUIRED (borough-wide) — HIGH`);
      }
    } else if (selConf === 'AUTO_HIGH_NO') {
      reasoning.push(`✓ No selective licensing in ${bd.short_name} — HIGH`);
    } else if (selConf === 'WARD_CHECK' && gssWardCode) {
      if (isSelectiveCandidate || !isHMOCandidate) {
        const check = checkWardCode(bd.short_name, 'selective', gssWardCode);
        if (check.inArea === true) {
          licences.push({
            type: 'Selective', status: 'council_scheme',
            statusLabel: `${bd.short_name} — Ward Verified`,
            description: bd.selectiveLicensing.description, scope: 'Designated ward',
            confidence: 'high', fee: bd.selectiveLicensing.fee,
          });
          reasoning.push(`✓ SELECTIVE LICENCE REQUIRED (GSS ward code match) — HIGH`);
        } else if (check.inArea === false) {
          reasoning.push(`✓ Selective licence NOT required (ward not designated) — HIGH`);
        } else {
          overallConfidence = 'verify';
          reasoning.push(`🟠 Selective: Ward code not found — VERIFY with council.`);
          verificationsNeeded.push({ type: 'Selective', checker, borough: bd.short_name });
        }
      }
    } else if (selConf === 'GEOJSON_CHECK') {
      if (isSelectiveCandidate || !isHMOCandidate) {
        if (latitude && longitude) {
          const check = checkEnfieldSelective(latitude, longitude);
          if (check.inArea === true) {
            licences.push({
              type: 'Selective', status: 'council_scheme',
              statusLabel: `${bd.short_name} — Geographically Verified`,
              description: bd.selectiveLicensing.description, scope: 'Pre-2022 designated area',
              confidence: 'high', fee: bd.selectiveLicensing.fee,
            });
            reasoning.push(`✓ SELECTIVE LICENCE REQUIRED (point-in-polygon match, pre-2022 boundaries) — HIGH`);
          } else if (check.inArea === false) {
            reasoning.push(`✓ Selective licence NOT required (outside pre-2022 designated area) — HIGH`);
          } else {
            // GeoJSON check failed — fall back to VERIFY
            overallConfidence = 'verify';
            reasoning.push(`🟠 Selective: GeoJSON check unavailable — VERIFY with council.`);
            verificationsNeeded.push({ type: 'Selective', checker, borough: bd.short_name });
          }
        } else {
          // No coordinates — fall back to VERIFY
          overallConfidence = 'verify';
          reasoning.push(`🟠 Selective: No coordinates available for GeoJSON check — VERIFY with council.`);
          verificationsNeeded.push({ type: 'Selective', checker, borough: bd.short_name });
        }
      }
    } else if (selConf === 'WARD_CHECK' && !gssWardCode) {
      // WARD_CHECK without GSS code — fall back to VERIFY with council link
      if (isSelectiveCandidate || !isHMOCandidate) {
        overallConfidence = 'verify';
        const totalWards = bd.selectiveLicensing.designatedWards?.length || '?';
        reasoning.push(`🟠 SELECTIVE: VERIFY — ward-specific (${totalWards} wards), no GSS code available.`);
        if (ward) reasoning.push(`   Ward hint: "${ward}" — may not match designation boundaries.`);
        verificationsNeeded.push({ type: 'Selective', checker, borough: bd.short_name });
      }
    } else {
      if (isSelectiveCandidate || !isHMOCandidate) {
        overallConfidence = 'verify';
        reasoning.push(`🟠 Selective: VERIFICATION REQUIRED.`);
        verificationsNeeded.push({ type: 'Selective', checker, borough: bd.short_name });
      }
    }
  } else if (bd.selectiveLicensing?.upcoming) {
    warnings.push(`${bd.short_name}'s Selective licensing starts ${bd.selectiveLicensing.startDate}. Applications from ${bd.selectiveLicensing.applicationsOpen || 'TBC'}.`);
    reasoning.push(`— Selective: Upcoming (starts ${bd.selectiveLicensing.startDate}).`);
  } else if (bd.selectiveLicensing?.pending) {
    warnings.push(`${bd.short_name} has approved selective licensing but it is NOT yet in force.`);
  } else {
    reasoning.push(`✗ Selective: No active scheme in ${bd.short_name}.`);
  }

  // STEP 4: PENDING EXPANSION
  if (bd.selectiveLicensing?.pendingExpansionWards) {
    advisoryNotes.push({
      type: 'info',
      text: `${bd.short_name}'s selective licensing expanding to: ${bd.selectiveLicensing.pendingExpansionWards.join(', ')}. Start date not confirmed.`
    });
  }

  // STEP 5: NOTES
  if (bd.notes) advisoryNotes.push({ type: 'info', text: bd.notes });
  if (bd.councilUrl) advisoryNotes.push({ type: 'link', text: `${bd.short_name} council licensing page`, url: bd.councilUrl });

  // STEP 6: VERDICT
  let verdict, verdictColor, verdictText;

  if (verificationsNeeded.length > 0 && licences.every(l => l.confidence !== 'high' || l.type === 'Mandatory HMO')) {
    const confirmed = licences.filter(l => l.confidence === 'high');
    if (confirmed.some(l => l.type === 'Mandatory HMO')) {
      verdict = 'required'; verdictColor = 'red';
      verdictText = 'MANDATORY HMO REQUIRED — Selective: VERIFY WITH COUNCIL';
    } else {
      verdict = 'verify'; verdictColor = 'amber';
      verdictText = 'VERIFICATION REQUIRED — Check with council';
    }
  } else if (licences.length === 0) {
    verdict = 'not_required'; verdictColor = 'grey';
    verdictText = 'NO LICENCE CURRENTLY REQUIRED';
  } else if (licences.length === 1) {
    const l = licences[0];
    verdict = 'required';
    verdictColor = l.confidence === 'medium' ? 'amber' : 'red';
    verdictText = l.confidence === 'medium'
      ? `${l.type} LIKELY REQUIRED — Verify with council`
      : `LICENCE REQUIRED — ${l.type}`;
  } else {
    verdict = 'multiple'; verdictColor = 'red';
    verdictText = `LICENCES REQUIRED — ${licences.map(l => l.type).join(' + ')}`;
  }

  return {
    verdict, verdictColor, verdictText,
    borough: bd.short_name, boroughFullName: bd.name, region: bd.region,
    ward, councilUrl: bd.councilUrl, licences, advisoryNotes, warnings, reasoning,
    confidence: overallConfidence, verificationsNeeded, councilChecker: checker,
  };
}

export { BOROUGH_DATABASE };
