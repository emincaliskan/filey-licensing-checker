import { describe, it, expect } from 'vitest';
import { checkLicensing, findBorough, getSupportedBoroughs } from '../logic/licenceChecker.js';
import { normaliseWardName, isWardInList } from '../logic/wardMatcher.js';
import { calculateFee } from '../logic/feeCalculator.js';

describe('findBorough', () => {
  it('finds Hackney by name', () => {
    const result = findBorough('Hackney');
    expect(result).not.toBeNull();
    expect(result.data.short_name).toBe('Hackney');
  });

  it('finds Haringey case-insensitively', () => {
    const result = findBorough('haringey');
    expect(result).not.toBeNull();
    expect(result.data.short_name).toBe('Haringey');
  });

  it('finds Waltham Forest', () => {
    const result = findBorough('Waltham Forest');
    expect(result).not.toBeNull();
    expect(result.data.short_name).toBe('Waltham Forest');
  });

  it('returns null for unsupported borough', () => {
    expect(findBorough('Westminster')).toBeNull();
  });
});

describe('getSupportedBoroughs', () => {
  it('returns all supported boroughs', () => {
    const boroughs = getSupportedBoroughs();
    expect(boroughs).toContain('Hackney');
    expect(boroughs).toContain('Haringey');
    expect(boroughs).toContain('Enfield');
    expect(boroughs).toContain('Waltham Forest');
    expect(boroughs).toContain('Islington');
    expect(boroughs).toContain('Barnet');
  });
});

describe('wardMatcher', () => {
  it('normalises ward names', () => {
    expect(normaliseWardName('Stoke Newington Ward')).toBe('stoke newington');
    expect(normaliseWardName('Hoxton East & Shoreditch')).toBe('hoxton east and shoreditch');
  });

  it('matches wards in list', () => {
    expect(isWardInList('Stoke Newington', ['Stoke Newington', 'Victoria'])).toBe(true);
    expect(isWardInList('Stoke Newington Ward', ['Stoke Newington'])).toBe(true);
    expect(isWardInList('Unknown Ward', ['Stoke Newington'])).toBe(false);
  });

  it('handles ALL_EXCEPT_EXCLUDED marker', () => {
    expect(isWardInList('Any Ward', ['ALL_EXCEPT_EXCLUDED'])).toBe(true);
  });
});

describe('feeCalculator', () => {
  it('returns fee with no discounts', () => {
    const result = calculateFee(1400, {}, {});
    expect(result.baseFee).toBe(1400);
    expect(result.finalFee).toBe(1400);
    expect(result.appliedDiscounts).toHaveLength(0);
  });

  it('applies accredited landlord discount', () => {
    const result = calculateFee(1400, { accredited_landlord: 100 }, { accredited_landlord: true });
    expect(result.finalFee).toBe(1300);
    expect(result.appliedDiscounts).toHaveLength(1);
    expect(result.appliedDiscounts[0].reason).toBe('Accredited landlord');
  });

  it('applies EPC ABC discount', () => {
    const result = calculateFee(1360, { epc_abc: 50 }, { epc_abc: true });
    expect(result.finalFee).toBe(1310);
  });

  it('applies multiple discounts', () => {
    const result = calculateFee(
      1400,
      { accredited_landlord: 100, epc_b: 100 },
      { accredited_landlord: true, epc_abc: true }
    );
    expect(result.finalFee).toBe(1200);
    expect(result.appliedDiscounts).toHaveLength(2);
  });

  it('handles null fee', () => {
    const result = calculateFee(null, {}, {});
    expect(result.baseFee).toBeNull();
    expect(result.finalFee).toBeNull();
    expect(result.feeNote).toBe('Contact council for current fee');
  });
});

describe('Licensing Decision Logic', () => {
  // Test 1: N16 8JN — Hackney, Stoke Newington, 1 occupant, 1 household
  it('Test 1: Hackney selective licence for single occupant in covered ward', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    expect(result.licences).toHaveLength(1);
    expect(result.licences[0].type).toBe('Selective');
    expect(result.licences[0].status).toBe('coming_into_force');
  });

  // Test 2: N16 8JN — Hackney, Stoke Newington, 5 occupants, 3 households
  it('Test 2: Hackney mandatory HMO for 5+ occupants', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 5,
      num_households: 3,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Mandatory HMO');
  });

  // Test 3: N16 8JN — Hackney, 3 occupants, 2 households, shared facilities
  it('Test 3: Hackney additional HMO for 3-4 occupants sharing', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
  });

  // Test 4: Haringey, 4 occupants, 2 households, shared
  it('Test 4: Haringey additional HMO for 4 occupants', () => {
    const result = checkLicensing({
      borough: 'Haringey',
      ward: 'Tottenham Central',
      num_occupants: 4,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
  });

  // Test 5: Haringey, 1 occupant — selective check
  it('Test 5: Haringey selective check for covered ward', () => {
    const result = checkLicensing({
      borough: 'Haringey',
      ward: 'Tottenham Central',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });

  // Test 6: Enfield, 2 occupants, 1 household — selective check
  it('Test 6: Enfield selective check for covered ward', () => {
    const result = checkLicensing({
      borough: 'Enfield',
      ward: 'Chase',
      num_occupants: 2,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });

  // Test 7: Enfield, 6 occupants, 3 households — mandatory HMO
  it('Test 7: Enfield mandatory HMO for 6 occupants', () => {
    const result = checkLicensing({
      borough: 'Enfield',
      ward: 'Chase',
      num_occupants: 6,
      num_households: 3,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Mandatory HMO');
  });

  // Test 8: Islington, 3 occupants, 2 households — additional HMO
  it('Test 8: Islington additional HMO from Feb 2026', () => {
    const result = checkLicensing({
      borough: 'Islington',
      ward: 'Barnsbury',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
  });

  // Test 9: Waltham Forest, 1 occupant — selective check
  it('Test 9: Waltham Forest selective licence (ward covered)', () => {
    const result = checkLicensing({
      borough: 'Waltham Forest',
      ward: 'Leyton',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    // Waltham Forest covers ALL_EXCEPT_EXCLUDED, Leyton is not excluded
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });

  // Test 10: Barnet, 2 occupants — no selective
  it('Test 10: Barnet no selective licensing', () => {
    const result = checkLicensing({
      borough: 'Barnet',
      ward: 'Finchley Church End',
      num_occupants: 2,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
      is_section_257: false,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Selective');
    // Advisory note about no selective licensing
    const noteTexts = result.advisoryNotes.map((n) => n.text);
    expect(noteTexts.some((t) => t.includes('No selective licensing'))).toBe(true);
  });

  // Test: Unsupported borough
  it('returns unsupported for non-covered borough', () => {
    const result = checkLicensing({
      borough: 'Westminster',
      ward: 'West End',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    expect(result.verdict).toBe('unsupported');
    expect(result.supportedBoroughs).toBeDefined();
  });

  // Test: Section 257 exemption in Hackney (exempt)
  it('Section 257 exempt from additional licensing in Hackney', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 4,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: true,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Additional HMO');
    expect(result.advisoryNotes.some((n) => n.type === 'exemption')).toBe(true);
  });

  // Test: Section 257 NOT exempt in Haringey
  it('Section 257 included in additional licensing in Haringey', () => {
    const result = checkLicensing({
      borough: 'Haringey',
      ward: 'Tottenham Central',
      num_occupants: 4,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: true,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
  });

  // Test: Section 257 exempt in Enfield
  it('Section 257 exempt from additional licensing in Enfield', () => {
    const result = checkLicensing({
      borough: 'Enfield',
      ward: 'Chase',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: true,
      accredited_landlord: false,
      epc_abc: false,
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Additional HMO');
    expect(result.advisoryNotes.some((n) => n.type === 'exemption')).toBe(true);
  });

  // Test: Hackney accredited landlord + EPC discount on additional HMO
  it('applies Hackney discounts correctly', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: false,
      accredited_landlord: true,
      epc_abc: true,
    });
    const additional = result.licences.find((l) => l.type === 'Additional HMO');
    expect(additional).toBeDefined();
    expect(additional.fee.discountAmount).toBeGreaterThan(0);
    expect(additional.fee.finalFee).toBeLessThan(additional.fee.baseFee);
  });

  // Test: Haringey discounts
  it('applies Haringey discounts correctly', () => {
    const result = checkLicensing({
      borough: 'Haringey',
      ward: 'Tottenham Central',
      num_occupants: 4,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
      is_section_257: false,
      accredited_landlord: true,
      epc_abc: true,
    });
    const additional = result.licences.find((l) => l.type === 'Additional HMO');
    expect(additional).toBeDefined();
    // £50 accreditation + £50 EPC = £100 discount
    expect(additional.fee.discountAmount).toBe(100);
    expect(additional.fee.finalFee).toBe(1260);
  });

  // Test: Upcoming changes appear in advisory
  it('returns upcoming changes for Hackney', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    expect(result.upcomingChanges.length).toBeGreaterThan(0);
  });

  // Test: Ward not in Hackney selective area
  it('Hackney ward not in selective area', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Woodberry Down',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Selective');
    expect(result.verdictColor).toBe('green');
  });

  // Test: Waltham Forest excluded ward
  it('Waltham Forest excluded ward has no selective licence', () => {
    const result = checkLicensing({
      borough: 'Waltham Forest',
      ward: 'Hatch Lane',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Selective');
  });
});
