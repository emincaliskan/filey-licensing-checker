import boroughsData from '../data/boroughs.json';
import { isWardInList, isWardExcluded } from './wardMatcher.js';
import { calculateFee } from './feeCalculator.js';

/**
 * Find a borough in the data by name (case-insensitive, partial match).
 */
export function findBorough(boroughName) {
  if (!boroughName) return null;
  const normalised = boroughName.toLowerCase();

  // Direct key match
  if (boroughsData[normalised]) return { key: normalised, data: boroughsData[normalised] };

  // Match by short_name or full name
  for (const [key, data] of Object.entries(boroughsData)) {
    if (key === 'metadata') continue;
    if (
      data.short_name?.toLowerCase() === normalised ||
      data.name?.toLowerCase() === normalised ||
      data.name?.toLowerCase().includes(normalised) ||
      normalised.includes(data.short_name?.toLowerCase())
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
  return Object.entries(boroughsData)
    .filter(([key]) => key !== 'metadata')
    .map(([, data]) => data.short_name || data.name);
}

/**
 * Main licence checking function.
 *
 * @param {object} params
 * @param {string} params.borough - Borough name
 * @param {string} params.ward - Ward name
 * @param {number} params.num_occupants - Number of occupants
 * @param {number} params.num_households - Number of households
 * @param {boolean} params.shares_facilities - Whether occupants share facilities
 * @param {string} params.property_type - Property type
 * @param {string} params.tenancy_type - Tenancy type
 * @param {boolean} params.is_section_257 - Section 257 HMO flag
 * @param {boolean} params.is_three_storeys - 3+ storeys flag
 * @param {boolean} params.pre_1991_conversion - Pre-1991 conversion flag
 * @param {boolean} params.managed_by_agent - Managed by letting agent flag
 * @param {boolean} params.accredited_landlord - Accredited landlord flag
 * @param {boolean} params.epc_abc - EPC A/B/C flag
 * @returns {object} Licensing check results
 */
export function checkLicensing(params) {
  const {
    borough,
    ward,
    num_occupants,
    num_households,
    shares_facilities,
    tenancy_type,
    is_section_257,
    accredited_landlord,
    epc_abc,
  } = params;

  const boroughResult = findBorough(borough);
  if (!boroughResult) {
    return {
      verdict: 'unsupported',
      verdictColor: 'grey',
      verdictText: 'BOROUGH NOT SUPPORTED',
      message: `"${borough}" is not yet covered by this tool.`,
      supportedBoroughs: getSupportedBoroughs(),
      licences: [],
      advisoryNotes: [],
      upcomingChanges: [],
    };
  }

  const boroughData = boroughResult.data;
  const licences = [];
  const advisoryNotes = [];
  const flags = { accredited_landlord, epc_abc };

  // STEP 1: Check Mandatory HMO
  if (num_occupants >= 5 && num_households >= 2) {
    const mandatory = boroughData.mandatory_hmo;
    if (mandatory && mandatory.active) {
      const feeResult = calculateFee(mandatory.fee, mandatory.discounts, flags);
      licences.push({
        type: 'Mandatory HMO',
        status: 'active',
        statusLabel: 'Active — Ongoing',
        scope: mandatory.scope,
        description: mandatory.description,
        start_date: mandatory.start_date,
        end_date: mandatory.end_date,
        fee: feeResult,
        application_url: mandatory.application_url,
        conditions_summary: mandatory.conditions_summary,
        fee_notes: mandatory.fee_notes,
      });
    }
  }

  // STEP 2: Check Additional HMO
  if (num_occupants >= 3 && num_households >= 2 && shares_facilities) {
    // Additional licensing typically covers those NOT in mandatory scope (3-4 occupants)
    // But we flag it for 5+ too if the borough data indicates
    const additional = boroughData.additional_hmo;
    if (additional && additional.active) {
      // Check Section 257 exemption
      if (is_section_257 && additional.section_257_exempt) {
        advisoryNotes.push({
          type: 'exemption',
          text: `Section 257 HMOs are EXEMPT from additional licensing in ${boroughData.short_name}. However, other licence types may still apply.`,
        });
      } else {
        const statusLabel = additional.status === 'coming_into_force'
          ? `Coming into force ${formatDate(additional.start_date)}`
          : `Active (${formatDate(additional.start_date)} – ${formatDate(additional.end_date)})`;

        const feeResult = calculateFee(additional.fee, additional.discounts, flags);
        licences.push({
          type: 'Additional HMO',
          status: additional.status,
          statusLabel,
          scope: additional.scope,
          description: additional.description,
          start_date: additional.start_date,
          end_date: additional.end_date,
          applications_open: additional.applications_open,
          fee: feeResult,
          application_url: additional.application_url,
          conditions_summary: additional.conditions_summary,
          fee_notes: additional.fee_notes,
        });
      }
    }
  }

  // STEP 3: Check Selective Licensing
  const isSelectiveCandidate =
    num_occupants <= 2 ||
    tenancy_type === 'single_household' ||
    tenancy_type === 'professional_sharers';

  if (isSelectiveCandidate) {
    const selective = boroughData.selective;
    if (selective && selective.active) {
      // Check if ward is covered
      let wardCovered = false;
      let wardStatus = 'unknown';

      if (selective.covered_wards && selective.covered_wards.includes('ALL_EXCEPT_EXCLUDED')) {
        // Borough covers all wards except excluded ones
        if (selective.excluded_wards && isWardExcluded(ward, selective.excluded_wards)) {
          wardCovered = false;
          wardStatus = 'excluded';
        } else {
          wardCovered = true;
          wardStatus = 'covered';
        }
      } else if (selective.covered_wards && selective.covered_wards.length > 0) {
        wardCovered = isWardInList(ward, selective.covered_wards);
        wardStatus = wardCovered ? 'covered' : 'not_covered';
      }

      if (wardCovered) {
        const statusLabel = selective.status === 'coming_into_force'
          ? `Coming into force ${formatDate(selective.start_date)}`
          : selective.start_date
            ? `Active (${formatDate(selective.start_date)} – ${formatDate(selective.end_date)})`
            : 'Start date TBC';

        const feeResult = calculateFee(selective.fee, selective.discounts, flags);
        licences.push({
          type: 'Selective',
          status: selective.status,
          statusLabel,
          scope: selective.scope,
          description: selective.description,
          start_date: selective.start_date,
          end_date: selective.end_date,
          applications_open: selective.applications_open,
          fee: feeResult,
          application_url: selective.application_url,
          conditions_summary: selective.conditions_summary,
          fee_notes: selective.fee_notes,
          wardStatus,
        });
      } else if (wardStatus === 'not_covered') {
        advisoryNotes.push({
          type: 'info',
          text: `${ward} ward is NOT in ${boroughData.short_name}'s selective licensing area. No selective licence currently required for this ward.`,
        });
      } else if (wardStatus === 'excluded') {
        advisoryNotes.push({
          type: 'info',
          text: `${ward} ward is specifically excluded from ${boroughData.short_name}'s selective licensing scheme.`,
        });
      }
    } else if (selective && !selective.active) {
      advisoryNotes.push({
        type: 'info',
        text: `No selective licensing scheme is currently in force in ${boroughData.short_name}. ${selective.description || ''}`,
      });
    }
  }

  // STEP 5: Upcoming changes
  const upcomingChanges = boroughData.upcoming_changes || [];

  // STEP 6: Special case advisory notes
  advisoryNotes.push({
    type: 'warning',
    text: `Maximum penalties for non-compliance in ${boroughData.short_name}: ${boroughData.penalties?.description || 'Contact council for details.'}`,
  });

  if (params.tenancy_type === 'company_let') {
    advisoryNotes.push({
      type: 'info',
      text: 'Company lets may have different licensing requirements. Check with the council directly.',
    });
  }

  // Determine verdict
  let verdict, verdictColor, verdictText;

  if (licences.length === 0) {
    verdict = 'green';
    verdictColor = 'green';
    verdictText = 'NO LICENCE CURRENTLY REQUIRED';
  } else if (licences.length === 1) {
    verdict = 'red';
    verdictColor = 'red';
    verdictText = `LICENCE REQUIRED — ${licences[0].type}`;
  } else {
    verdict = 'blue';
    verdictColor = 'blue';
    verdictText = 'MULTIPLE LICENCES MAY APPLY';
  }

  // Check for "coming into force" — show amber if all licences are future
  const allFuture = licences.length > 0 && licences.every((l) => l.status === 'coming_into_force');
  if (allFuture) {
    verdict = 'amber';
    verdictColor = 'amber';
    verdictText = `LICENCE REQUIRED FROM ${formatDate(licences[0].start_date)} — ${licences.map((l) => l.type).join(' + ')}`;
  }

  return {
    verdict,
    verdictColor,
    verdictText,
    borough: boroughData.short_name,
    boroughFullName: boroughData.name,
    ward,
    council_url: boroughData.council_url,
    licences,
    advisoryNotes,
    upcomingChanges,
    penalties: boroughData.penalties,
  };
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBC';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export { boroughsData };
