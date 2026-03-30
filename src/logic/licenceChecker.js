import BOROUGH_DATABASE from '../data/boroughDatabase.js';
import BOROUGH_CONFIDENCE from '../data/boroughConfidence.js';
import COUNCIL_CHECKERS from '../data/councilCheckers.js';
import { getVerifiedResult } from './verificationCache.js';

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
 * Three-tier licence checking.
 * Tier 1: Auto-decide for borough-wide schemes (HIGH confidence)
 * Tier 2: Direct to council checker for ward-specific (VERIFY)
 * Tier 3: Fallback hint with warnings (LOW)
 */
export function checkLicensing(params) {
  const {
    borough,
    ward,
    num_occupants,
    num_households,
    shares_facilities,
    exemptions = [],
    postcode,
  } = params;

  const boroughResult = findBorough(borough);
  const reasoning = [];
  const licences = [];
  const advisoryNotes = [];
  const warnings = [];
  let overallConfidence = 'high';

  if (!boroughResult) {
    return {
      verdict: 'unsupported',
      verdictColor: 'grey',
      verdictText: 'BOROUGH NOT IN DATABASE',
      message: `"${borough}" is not currently in the licensing database.`,
      supportedBoroughs: getSupportedBoroughs(),
      licences: [], advisoryNotes: [], warnings: [],
      reasoning: [`Borough "${borough}" not found in database.`],
      confidence: 'low',
      verificationsNeeded: [],
    };
  }

  const bd = boroughResult.data;
  const conf = BOROUGH_CONFIDENCE[bd.short_name] || {};
  const checker = COUNCIL_CHECKERS[bd.short_name];
  const verificationsNeeded = [];

  reasoning.push(`Property is in ${bd.short_name} (${bd.region}).`);
  if (ward) reasoning.push(`Postcodes.io ward hint: "${ward}" (informational only — not used for decisions).`);
  reasoning.push(`Occupants: ${num_occupants}, Households: ${num_households}, Shared facilities: ${shares_facilities ? 'Yes' : 'No'}.`);

  // Check verification cache
  const cached = postcode ? getVerifiedResult(postcode) : null;
  if (cached) {
    reasoning.push(`Cached verification found for ${postcode} (verified ${cached.verifiedDate}).`);
  }

  // STEP 0: EXEMPTION CHECK
  if (exemptions.length > 0) {
    return {
      verdict: 'exempt', verdictColor: 'exempt',
      verdictText: 'PROPERTY MAY BE EXEMPT',
      borough: bd.short_name, boroughFullName: bd.name, region: bd.region,
      ward, councilUrl: bd.councilUrl,
      licences: [],
      advisoryNotes: [{ type: 'exemption', text: `Exemption reasons: ${exemptions.join(', ')}. Verify with the council.` }],
      warnings: [], reasoning: [...reasoning, 'Property flagged as potentially exempt.'],
      confidence: 'high', verificationsNeeded: [],
    };
  }

  // STEP 1: MANDATORY HMO (National — always AUTO_HIGH)
  if (num_occupants >= 5 && num_households >= 2 && shares_facilities) {
    licences.push({
      type: 'Mandatory HMO',
      status: 'national',
      statusLabel: 'National Legislation',
      description: 'Properties with 5+ persons from 2+ households sharing facilities.',
      scope: 'National',
      confidence: 'high',
    });
    reasoning.push(`✓ MANDATORY HMO REQUIRED (national law) — Confidence: HIGH`);
  } else {
    reasoning.push(`✗ Mandatory HMO: Does not meet threshold.`);
  }

  // STEP 2: ADDITIONAL HMO (Council-specific)
  const isHMOCandidate = num_occupants >= 3 && num_households >= 2 && shares_facilities;
  const hasMandatory = licences.some(l => l.type === 'Mandatory HMO');

  if (isHMOCandidate && !hasMandatory) {
    if (bd.additionalHMO && bd.additionalHMO.active) {
      const hmoConf = conf.additionalHMO || 'VERIFY';

      if (hmoConf === 'AUTO_HIGH') {
        licences.push({
          type: 'Additional HMO',
          status: 'council_scheme',
          statusLabel: `${bd.short_name} — Borough-wide`,
          description: bd.additionalHMO.description,
          scope: 'Borough-wide',
          confidence: 'high',
          fee: bd.additionalHMO.fee,
        });
        reasoning.push(`✓ ADDITIONAL HMO REQUIRED (borough-wide) — Confidence: HIGH`);
      } else if (hmoConf === 'MEDIUM') {
        const excluded = bd.additionalHMO.excludedWards || [];
        licences.push({
          type: 'Additional HMO',
          status: 'council_scheme',
          statusLabel: `${bd.short_name} — Most Wards`,
          description: bd.additionalHMO.description,
          scope: `Most wards (${excluded.length} excluded: ${excluded.join(', ')})`,
          confidence: 'medium',
          fee: bd.additionalHMO.fee,
        });
        overallConfidence = 'medium';
        reasoning.push(`🟡 ADDITIONAL HMO LIKELY REQUIRED — ${excluded.length} wards excluded. Confidence: MEDIUM`);
        if (checker) {
          verificationsNeeded.push({ type: 'Additional HMO', checker, borough: bd.short_name });
        }
      } else {
        // VERIFY
        overallConfidence = 'verify';
        reasoning.push(`🟠 Additional HMO: VERIFICATION REQUIRED — ward-specific scheme.`);
        verificationsNeeded.push({ type: 'Additional HMO', checker, borough: bd.short_name });
      }
    } else if (bd.additionalHMO?.upcoming) {
      warnings.push(`${bd.short_name}'s Additional HMO scheme starts ${bd.additionalHMO.startDate}. Applications open from ${bd.additionalHMO.applicationsOpen || 'TBC'}.`);
      reasoning.push(`— Additional HMO: Upcoming (starts ${bd.additionalHMO.startDate}), not yet active.`);
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
      if (isSelectiveCandidate || (!isHMOCandidate)) {
        licences.push({
          type: 'Selective',
          status: 'council_scheme',
          statusLabel: `${bd.short_name} — Borough-wide`,
          description: bd.selectiveLicensing.description,
          scope: 'Borough-wide',
          confidence: 'high',
          fee: bd.selectiveLicensing.fee,
        });
        reasoning.push(`✓ SELECTIVE LICENCE REQUIRED (borough-wide) — Confidence: HIGH`);
      }
    } else if (selConf === 'AUTO_HIGH_NO') {
      reasoning.push(`✓ No selective licensing in ${bd.short_name} — Confidence: HIGH`);
    } else if (selConf === 'MEDIUM') {
      if (isSelectiveCandidate || (!isHMOCandidate)) {
        const excluded = bd.selectiveLicensing.excludedWards || [];
        licences.push({
          type: 'Selective',
          status: 'council_scheme',
          statusLabel: `${bd.short_name} — Most Wards`,
          description: bd.selectiveLicensing.description,
          scope: `Most wards (${excluded.length} excluded: ${excluded.join(', ')})`,
          confidence: 'medium',
          fee: bd.selectiveLicensing.fee,
        });
        if (overallConfidence === 'high') overallConfidence = 'medium';
        reasoning.push(`🟡 SELECTIVE LICENCE LIKELY REQUIRED — ${excluded.length} wards excluded. Verify with council.`);
        if (checker) {
          verificationsNeeded.push({ type: 'Selective', checker, borough: bd.short_name });
        }
      }
    } else {
      // VERIFY
      if (isSelectiveCandidate || (!isHMOCandidate)) {
        const totalWards = bd.selectiveLicensing.designatedWards?.length || '?';
        overallConfidence = 'verify';
        reasoning.push(`🟠 SELECTIVE: VERIFICATION REQUIRED — ${bd.short_name} has ward-specific selective licensing (${totalWards} wards designated). Cannot reliably determine from postcode alone.`);
        if (ward) {
          reasoning.push(`   Ward hint from Postcodes.io: "${ward}" — this may not match council designation boundaries.`);
        }
        verificationsNeeded.push({ type: 'Selective', checker, borough: bd.short_name });
      }
    }
  } else if (bd.selectiveLicensing?.upcoming) {
    warnings.push(`${bd.short_name}'s Selective licensing starts ${bd.selectiveLicensing.startDate}. Applications open from ${bd.selectiveLicensing.applicationsOpen || 'TBC'}.`);
    reasoning.push(`— Selective: Upcoming (starts ${bd.selectiveLicensing.startDate}), not yet active.`);
  } else if (bd.selectiveLicensing?.pending) {
    warnings.push(`${bd.short_name} has approved selective licensing but it is NOT yet in force. Check with council.`);
  } else {
    reasoning.push(`✗ Selective: No active scheme in ${bd.short_name}.`);
  }

  // STEP 4: PENDING EXPANSION
  if (bd.selectiveLicensing?.pendingExpansionWards) {
    advisoryNotes.push({
      type: 'info',
      text: `${bd.short_name}'s selective licensing is expanding to include: ${bd.selectiveLicensing.pendingExpansionWards.join(', ')}. Start date not confirmed.`
    });
  }

  // STEP 5: BOROUGH NOTES
  if (bd.notes) {
    advisoryNotes.push({ type: 'info', text: bd.notes });
  }
  if (bd.councilUrl) {
    advisoryNotes.push({ type: 'link', text: `${bd.short_name} council licensing page`, url: bd.councilUrl });
  }

  // STEP 6: DETERMINE VERDICT
  let verdict, verdictColor, verdictText;

  if (verificationsNeeded.length > 0 && licences.every(l => l.confidence !== 'high' || l.type === 'Mandatory HMO')) {
    // Has items needing verification
    const confirmedLicences = licences.filter(l => l.confidence === 'high');
    if (confirmedLicences.length > 0 && confirmedLicences.some(l => l.type !== 'Mandatory HMO')) {
      verdict = 'partial';
      verdictColor = 'red';
      verdictText = `${confirmedLicences.map(l => l.type).join(' + ')} REQUIRED — Selective: VERIFY WITH COUNCIL`;
    } else if (confirmedLicences.some(l => l.type === 'Mandatory HMO')) {
      verdict = 'required';
      verdictColor = 'red';
      verdictText = 'MANDATORY HMO REQUIRED — Selective: VERIFY WITH COUNCIL';
    } else {
      verdict = 'verify';
      verdictColor = 'amber';
      verdictText = 'VERIFICATION REQUIRED — Check with council';
    }
  } else if (licences.length === 0) {
    verdict = 'not_required';
    verdictColor = 'grey';
    verdictText = 'NO LICENCE CURRENTLY REQUIRED';
    reasoning.push('→ RESULT: No licensing requirement identified.');
  } else if (licences.length === 1) {
    const l = licences[0];
    verdict = 'required';
    verdictColor = l.confidence === 'medium' ? 'amber' : 'red';
    verdictText = l.confidence === 'medium'
      ? `${l.type} LIKELY REQUIRED — Verify with council`
      : `LICENCE REQUIRED — ${l.type}`;
  } else {
    verdict = 'multiple';
    verdictColor = 'red';
    verdictText = `LICENCES REQUIRED — ${licences.map(l => l.type).join(' + ')}`;
  }

  return {
    verdict, verdictColor, verdictText,
    borough: bd.short_name, boroughFullName: bd.name, region: bd.region,
    ward, councilUrl: bd.councilUrl,
    licences, advisoryNotes, warnings, reasoning,
    confidence: overallConfidence,
    verificationsNeeded,
    councilChecker: checker,
  };
}

export { BOROUGH_DATABASE };
