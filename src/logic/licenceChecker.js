import BOROUGH_DATABASE from '../data/boroughDatabase.js';
import { isWardInList, isWardExcluded, normaliseWardName } from './wardMatcher.js';
import { checkEnfieldWardBoundary } from './wardMatcher.js';

/**
 * Find a borough in the database by name (case-insensitive, fuzzy match).
 */
export function findBorough(boroughName) {
  if (!boroughName) return null;
  const normalised = boroughName.toLowerCase().trim();

  // Direct key match
  if (BOROUGH_DATABASE[normalised]) {
    return { key: normalised, data: BOROUGH_DATABASE[normalised] };
  }

  // Match by short_name or full name
  for (const [key, data] of Object.entries(BOROUGH_DATABASE)) {
    if (key === 'metadata') continue;
    const shortLower = (data.short_name || '').toLowerCase();
    const nameLower = (data.name || '').toLowerCase();
    if (
      shortLower === normalised ||
      nameLower === normalised ||
      nameLower.includes(normalised) ||
      normalised.includes(shortLower)
    ) {
      return { key, data };
    }
  }

  return null;
}

/**
 * Get list of supported borough names.
 */
export function getSupportedBoroughs() {
  return Object.entries(BOROUGH_DATABASE)
    .filter(([key]) => key !== 'metadata')
    .map(([, data]) => data.short_name);
}

/**
 * Main licence checking function — 5-step cascading decision logic.
 *
 * @param {object} params
 * @param {string} params.borough
 * @param {string} params.ward
 * @param {number} params.num_occupants
 * @param {number} params.num_households
 * @param {boolean} params.shares_facilities
 * @param {string} params.tenancy_type
 * @param {string[]} params.exemptions - array of exemption IDs
 * @returns {object}
 */
export function checkLicensing(params) {
  const {
    borough,
    ward,
    num_occupants,
    num_households,
    shares_facilities,
    exemptions = [],
  } = params;

  const boroughResult = findBorough(borough);
  const reasoning = [];
  const licences = [];
  const advisoryNotes = [];
  const warnings = [];
  let confidence = 'high';

  if (!boroughResult) {
    return {
      verdict: 'unsupported',
      verdictColor: 'grey',
      verdictText: 'BOROUGH NOT IN DATABASE',
      message: `"${borough}" is not currently in the licensing database. Check with the local council directly.`,
      supportedBoroughs: getSupportedBoroughs(),
      licences: [],
      advisoryNotes: [],
      warnings: [],
      reasoning: [`Borough "${borough}" not found in database.`],
      confidence: 'low',
    };
  }

  const bd = boroughResult.data;
  reasoning.push(`Property is in ${bd.short_name} (${bd.region}).`);
  reasoning.push(`Ward: ${ward || 'Unknown'}.`);
  reasoning.push(`Occupants: ${num_occupants}, Households: ${num_households}, Shared facilities: ${shares_facilities ? 'Yes' : 'No'}.`);

  // STEP 0: EXEMPTION CHECK
  if (exemptions.length > 0) {
    return {
      verdict: 'exempt',
      verdictColor: 'exempt',
      verdictText: 'PROPERTY MAY BE EXEMPT',
      borough: bd.short_name,
      boroughFullName: bd.name,
      region: bd.region,
      ward,
      councilUrl: bd.councilUrl,
      licences: [],
      advisoryNotes: [{
        type: 'exemption',
        text: `This property may be exempt from licensing. Exemption reasons: ${exemptions.join(', ')}. Verify with the council.`
      }],
      warnings: [],
      reasoning: [...reasoning, 'Property flagged as potentially exempt from licensing.'],
      confidence: 'medium',
    };
  }

  // STEP 1: MANDATORY HMO CHECK (National — applies EVERYWHERE)
  if (num_occupants >= 5 && num_households >= 2 && shares_facilities) {
    licences.push({
      type: 'Mandatory HMO',
      status: 'national',
      statusLabel: 'National Legislation — Applies Everywhere',
      description: 'Properties occupied by 5+ persons forming 2+ households who share facilities require a Mandatory HMO licence under national legislation.',
      scope: 'National (all of England)',
    });
    reasoning.push(`✓ MANDATORY HMO: ${num_occupants} occupants ≥ 5, ${num_households} households ≥ 2, facilities shared → Mandatory HMO licence required (national law).`);
  } else {
    reasoning.push(`✗ Mandatory HMO: Does not meet threshold (needs 5+ occupants, 2+ households, shared facilities).`);
  }

  // STEP 2: ADDITIONAL HMO CHECK (Council-specific)
  const isAdditionalHMOCandidate = num_occupants >= 3 && num_households >= 2 && shares_facilities;
  const hasMandatory = licences.some(l => l.type === 'Mandatory HMO');

  if (isAdditionalHMOCandidate && !hasMandatory) {
    if (bd.additionalHMO && bd.additionalHMO.active) {
      const covered = bd.additionalHMO.coverage === 'borough-wide' ||
        (bd.additionalHMO.designatedWards.length > 0 && isWardInList(ward, bd.additionalHMO.designatedWards));

      if (covered) {
        licences.push({
          type: 'Additional HMO',
          status: 'council_scheme',
          statusLabel: `${bd.short_name} Council Scheme`,
          description: bd.additionalHMO.description,
          scope: bd.additionalHMO.coverage === 'borough-wide' ? 'Borough-wide' : 'Designated wards',
        });
        reasoning.push(`✓ ADDITIONAL HMO: ${num_occupants} occupants ≥ 3, ${num_households} households ≥ 2, facilities shared. ${bd.short_name} has an active Additional HMO scheme (${bd.additionalHMO.coverage}).`);
      } else {
        reasoning.push(`✗ Additional HMO: ${bd.short_name} has a scheme but this ward is not in the designated area.`);
      }
    } else {
      reasoning.push(`✗ Additional HMO: ${bd.short_name} does not have an active Additional HMO scheme.`);
    }
  } else if (hasMandatory) {
    reasoning.push(`— Additional HMO: Not applicable (property already requires Mandatory HMO licence).`);
  } else {
    reasoning.push(`✗ Additional HMO: Does not meet threshold (needs 3+ occupants, 2+ households, shared facilities).`);
  }

  // STEP 3: SELECTIVE LICENSING CHECK
  if (bd.selectiveLicensing && bd.selectiveLicensing.active) {
    let wardCovered = false;
    let wardStatus = 'unknown';

    if (bd.selectiveLicensing.coverage === 'borough-wide') {
      wardCovered = true;
      wardStatus = 'borough-wide';
      reasoning.push(`${bd.short_name} has BOROUGH-WIDE selective licensing.`);
    } else if (bd.selectiveLicensing.coverage === 'near-borough-wide') {
      // Most wards covered — check if this ward is excluded
      if (bd.selectiveLicensing.excludedWards && isWardExcluded(ward, bd.selectiveLicensing.excludedWards)) {
        wardCovered = false;
        wardStatus = 'excluded';
        reasoning.push(`✗ Ward "${ward}" is EXCLUDED from ${bd.short_name}'s selective licensing.`);
      } else {
        wardCovered = true;
        wardStatus = 'covered';
        reasoning.push(`✓ ${bd.short_name} has near-borough-wide selective licensing. Ward "${ward}" is not in the excluded list.`);
      }
    } else if (bd.selectiveLicensing.coverage === 'ward-specific') {
      // Check Enfield boundary mapping
      if (boroughResult.key === 'enfield' && bd.selectiveLicensing.usesPreMay2022Boundaries) {
        const enfieldCheck = checkEnfieldWardBoundary(ward);
        wardCovered = enfieldCheck.inDesignation;
        confidence = enfieldCheck.confidence;
        wardStatus = wardCovered ? 'covered' : 'not_covered';
        if (enfieldCheck.oldWard) {
          reasoning.push(`Ward "${ward}" maps to pre-2022 ward "${enfieldCheck.oldWard}" — ${wardCovered ? 'IN' : 'NOT in'} designation (confidence: ${confidence}).`);
        } else {
          reasoning.push(`Ward "${ward}" boundary check: ${wardCovered ? 'IN' : 'NOT in'} designation (confidence: ${confidence}).`);
        }
      } else if (bd.selectiveLicensing.designatedWards.length > 0) {
        wardCovered = isWardInList(ward, bd.selectiveLicensing.designatedWards);
        wardStatus = wardCovered ? 'covered' : 'not_covered';
        reasoning.push(wardCovered
          ? `✓ Ward "${ward}" IS in ${bd.short_name}'s selective licensing designated wards.`
          : `✗ Ward "${ward}" is NOT in ${bd.short_name}'s selective licensing designated wards.`);
      } else {
        wardCovered = true;
        wardStatus = 'check_council';
        confidence = 'low';
        reasoning.push(`${bd.short_name} has selective licensing but specific wards not listed. Check with council.`);
      }
    } else if (bd.selectiveLicensing.designatedWards && bd.selectiveLicensing.designatedWards.length > 0) {
      wardCovered = isWardInList(ward, bd.selectiveLicensing.designatedWards);
      wardStatus = wardCovered ? 'covered' : 'not_covered';
      if (wardCovered) {
        reasoning.push(`✓ Ward "${ward}" IS in ${bd.short_name}'s selective licensing designated wards.`);
      } else {
        reasoning.push(`✗ Ward "${ward}" is NOT in ${bd.short_name}'s selective licensing designated wards: ${bd.selectiveLicensing.designatedWards.join(', ')}.`);
      }
    } else {
      // Has selective but no specific wards listed — flag to check council
      wardCovered = true;
      wardStatus = 'check_council';
      confidence = 'low';
      reasoning.push(`${bd.short_name} has selective licensing in designated areas but specific wards are not listed. Check with the council.`);
    }

    if (wardCovered) {
      // For single lets / non-HMO properties, selective applies
      // For HMO properties, they may need BOTH additional HMO AND selective
      const alreadyHasHMO = licences.some(l => l.type === 'Mandatory HMO' || l.type === 'Additional HMO');

      if (!alreadyHasHMO) {
        licences.push({
          type: 'Selective',
          status: 'council_scheme',
          statusLabel: `${bd.short_name} Council Scheme`,
          description: bd.selectiveLicensing.description,
          scope: wardStatus === 'borough-wide' ? 'Borough-wide' : 'Designated wards',
          wardStatus,
        });
        reasoning.push(`✓ SELECTIVE: Property does not meet HMO criteria and is in a selective licensing area → Selective licence required.`);
      } else {
        // Property already has HMO licence — check if dual licensing applies
        advisoryNotes.push({
          type: 'info',
          text: `This property is in a selective licensing area. As it already requires an HMO licence, the selective licence may not apply separately. Check with ${bd.short_name} council.`
        });
        reasoning.push(`— Selective: Property is in selective area but already requires HMO licence. Dual licensing may apply — check with council.`);
      }
    } else if (wardStatus === 'not_covered' || wardStatus === 'excluded') {
      advisoryNotes.push({
        type: 'info',
        text: `${ward} ward is NOT in ${bd.short_name}'s selective licensing designated area. No selective licence required for this ward.`
      });
    }
  } else {
    reasoning.push(`✗ Selective: ${bd.short_name} does not have an active Selective licensing scheme.`);
  }

  // STEP 4: TRANSITIONAL/UPCOMING SCHEMES
  if (bd.additionalHMO?.upcoming && !bd.additionalHMO.active) {
    warnings.push(`${bd.short_name}'s Additional HMO scheme starts ${bd.additionalHMO.startDate}. Applications open from ${bd.additionalHMO.applicationsOpen || 'TBC'}.`);
  }
  if (bd.selectiveLicensing?.upcoming && !bd.selectiveLicensing.active) {
    warnings.push(`${bd.short_name}'s Selective licensing scheme starts ${bd.selectiveLicensing.startDate}. Applications open from ${bd.selectiveLicensing.applicationsOpen || 'TBC'}.`);
  }
  if (bd.selectiveLicensing?.pending) {
    warnings.push(`${bd.short_name} has approved selective licensing but it is NOT yet in force. Check with council for latest status.`);
  }
  if (bd.selectiveLicensing?.pendingExpansionWards) {
    advisoryNotes.push({
      type: 'info',
      text: `${bd.short_name}'s selective licensing is approved for expansion to include: ${bd.selectiveLicensing.pendingExpansionWards.join(', ')}. Start date not yet confirmed.`
    });
  }
  if (bd.selectiveLicensing?.usesPreMay2022Boundaries || bd.selectiveLicensing?.usesPreMay2022Boundaries) {
    advisoryNotes.push({
      type: 'warning',
      text: `This borough's scheme uses pre-May 2022 ward boundaries. Ward names from postcode lookup may differ. ${bd.postcodeChecker ? 'Verify at: ' + bd.postcodeChecker : 'Check with the council.'}`
    });
  }

  // STEP 5: WARNINGS
  // Barking and Dagenham warning
  if (boroughResult.key === 'barking and dagenham') {
    warnings.push("Barking and Dagenham's Additional HMO scheme status is uncertain (was pending early 2025). Please verify current status with the council before confirming requirements.");
  }

  // Borough notes
  if (bd.notes) {
    advisoryNotes.push({ type: 'info', text: bd.notes });
  }

  // Council URL
  if (bd.councilUrl) {
    advisoryNotes.push({
      type: 'link',
      text: `Check ${bd.short_name} council's licensing page for the latest information.`,
      url: bd.councilUrl,
    });
  }

  // STEP 6: DETERMINE VERDICT
  let verdict, verdictColor, verdictText;

  if (licences.length === 0) {
    verdict = 'not_required';
    verdictColor = 'grey';
    verdictText = 'NO LICENCE CURRENTLY REQUIRED';
    reasoning.push('→ RESULT: No licensing requirement identified for this property configuration.');
  } else if (licences.length === 1) {
    verdict = 'required';
    verdictColor = 'red';
    verdictText = `LICENCE REQUIRED — ${licences[0].type}`;
    reasoning.push(`→ RESULT: ${licences[0].type} licence required.`);
  } else {
    verdict = 'multiple';
    verdictColor = 'red';
    verdictText = `MULTIPLE LICENCES MAY APPLY — ${licences.map(l => l.type).join(' + ')}`;
    reasoning.push(`→ RESULT: Multiple licences may apply: ${licences.map(l => l.type).join(', ')}.`);
  }

  return {
    verdict,
    verdictColor,
    verdictText,
    borough: bd.short_name,
    boroughFullName: bd.name,
    region: bd.region,
    ward,
    councilUrl: bd.councilUrl,
    licences,
    advisoryNotes,
    warnings,
    reasoning,
    confidence,
  };
}

export { BOROUGH_DATABASE };
