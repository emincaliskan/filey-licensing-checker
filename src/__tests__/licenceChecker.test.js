import { describe, it, expect } from 'vitest';
import { checkLicensing, findBorough, getSupportedBoroughs } from '../logic/licenceChecker.js';
import { normaliseWardName, isWardInList } from '../logic/wardMatcher.js';

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

  it('finds Tower Hamlets', () => {
    const result = findBorough('Tower Hamlets');
    expect(result).not.toBeNull();
    expect(result.data.short_name).toBe('Tower Hamlets');
  });

  it('finds Barking and Dagenham', () => {
    const result = findBorough('Barking and Dagenham');
    expect(result).not.toBeNull();
    expect(result.data.short_name).toBe('Barking and Dagenham');
  });

  it('finds non-London boroughs', () => {
    expect(findBorough('Broxbourne')).not.toBeNull();
    expect(findBorough('Harlow')).not.toBeNull();
    expect(findBorough('Medway')).not.toBeNull();
  });

  it('returns null for unsupported borough', () => {
    expect(findBorough('Westminster')).toBeNull();
  });
});

describe('getSupportedBoroughs', () => {
  it('returns all 22 supported boroughs', () => {
    const boroughs = getSupportedBoroughs();
    expect(boroughs.length).toBe(22);
    expect(boroughs).toContain('Hackney');
    expect(boroughs).toContain('Haringey');
    expect(boroughs).toContain('Enfield');
    expect(boroughs).toContain('Waltham Forest');
    expect(boroughs).toContain('Islington');
    expect(boroughs).toContain('Barnet');
    expect(boroughs).toContain('Newham');
    expect(boroughs).toContain('Tower Hamlets');
    expect(boroughs).toContain('Broxbourne');
    expect(boroughs).toContain('Medway');
  });
});

describe('wardMatcher', () => {
  it('normalises ward names via aliases', () => {
    expect(normaliseWardName('Bruce castle')).toBe('Bruce Castle');
    expect(normaliseWardName('Noel Paek')).toBe('Noel Park');
    expect(normaliseWardName('St Anns')).toBe("St Ann's");
    expect(normaliseWardName('De Beouvour')).toBe('De Beauvoir');
    expect(normaliseWardName('Hoggerston')).toBe('Haggerston');
  });

  it('matches wards in list', () => {
    expect(isWardInList('Stoke Newington', ['Stoke Newington', 'Victoria'])).toBe(true);
    expect(isWardInList('Stoke Newington Ward', ['Stoke Newington'])).toBe(true);
    expect(isWardInList('Unknown Ward', ['Stoke Newington'])).toBe(false);
  });

  it('matches wards case-insensitively', () => {
    expect(isWardInList('bruce castle', ['Bruce Castle'])).toBe(true);
    expect(isWardInList('TOTTENHAM HALE', ['Tottenham Hale'])).toBe(true);
  });

  it('matches wards via aliases', () => {
    expect(isWardInList('Noel Paek', ['Noel Park'])).toBe(true);
    expect(isWardInList('Seven sisters', ['Seven Sisters'])).toBe(true);
  });
});

describe('Licensing Decision Logic', () => {
  // Test 1: Hackney transitional — no active schemes as of March 2026
  it('Hackney no active selective in transitional period (March 2026)', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    // Schemes not active until May 2026
    expect(result.licences).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  // Test 2: Hackney mandatory HMO — 5+ occupants, 2+ households, shared
  it('Hackney mandatory HMO for 5+ occupants', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 5,
      num_households: 3,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Mandatory HMO');
  });

  // Test 3: Hackney additional HMO — not active in transitional period
  it('Hackney no additional HMO in transitional period', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    // Upcoming scheme, not yet active
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Additional HMO');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  // Test 4: Haringey additional HMO
  it('Haringey additional HMO for 4 occupants', () => {
    const result = checkLicensing({
      borough: 'Haringey',
      ward: 'Tottenham Central',
      num_occupants: 4,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
  });

  // Test 5: Haringey selective — Tottenham Central is designated
  it('Haringey selective in designated ward', () => {
    const result = checkLicensing({
      borough: 'Haringey',
      ward: 'Tottenham Central',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });

  // Test 6: Enfield — ward-specific selective (NOT borough-wide)
  it('Enfield selective in designated ward', () => {
    const result = checkLicensing({
      borough: 'Enfield',
      ward: 'Chase',
      num_occupants: 2,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });

  it('Enfield no selective in non-designated ward', () => {
    const result = checkLicensing({
      borough: 'Enfield',
      ward: 'Enfield Town',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Selective');
  });

  // Test 7: Enfield mandatory HMO
  it('Enfield mandatory HMO for 6 occupants', () => {
    const result = checkLicensing({
      borough: 'Enfield',
      ward: 'Chase',
      num_occupants: 6,
      num_households: 3,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Mandatory HMO');
  });

  // Test 8: Islington additional HMO (borough-wide)
  it('Islington additional HMO', () => {
    const result = checkLicensing({
      borough: 'Islington',
      ward: 'Barnsbury',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
  });

  // Test 9: Waltham Forest — borough-wide selective
  it('Waltham Forest selective licence (borough-wide)', () => {
    const result = checkLicensing({
      borough: 'Waltham Forest',
      ward: 'Leyton',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });

  // Test 10: Barnet — no selective or additional
  it('Barnet no selective or additional licensing', () => {
    const result = checkLicensing({
      borough: 'Barnet',
      ward: 'Finchley Church End',
      num_occupants: 2,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    expect(result.licences).toHaveLength(0);
    expect(result.verdictColor).toBe('grey');
    expect(result.verdictText).toBe('NO LICENCE CURRENTLY REQUIRED');
  });

  // Test 10b: Barnet — Additional HMO now active
  it('Barnet additional HMO is now active', () => {
    const result = checkLicensing({
      borough: 'Barnet',
      ward: 'Finchley Church End',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
  });

  // Test 11: Barnet — mandatory HMO still applies (national law)
  it('Barnet mandatory HMO still applies', () => {
    const result = checkLicensing({
      borough: 'Barnet',
      ward: 'Finchley Church End',
      num_occupants: 5,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Mandatory HMO');
  });

  // Test 12: Newham — near-borough-wide selective (excludes 2 wards)
  it('Newham selective in covered ward', () => {
    const result = checkLicensing({
      borough: 'Newham',
      ward: 'Plaistow North',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });

  it('Newham no selective in excluded ward (Royal Victoria)', () => {
    const result = checkLicensing({
      borough: 'Newham',
      ward: 'Royal Victoria',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Selective');
  });

  // Test 13: Tower Hamlets — additional HMO but no selective
  it('Tower Hamlets additional HMO, no selective', () => {
    const result = checkLicensing({
      borough: 'Tower Hamlets',
      ward: 'Whitechapel',
      num_occupants: 3,
      num_households: 2,
      shares_facilities: true,
      tenancy_type: 'hmo',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Additional HMO');
    expect(types).not.toContain('Selective');
  });

  // Test 14: Hackney ward NOT in selective area
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
    expect(result.verdictColor).toBe('grey');
  });

  // Test 15: Islington ward NOT in selective area
  it('Islington ward not in selective area', () => {
    const result = checkLicensing({
      borough: 'Islington',
      ward: 'Highbury',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).not.toContain('Selective');
  });

  // Test 16: Non-London borough — no schemes
  it('Broxbourne no licence needed (non-London)', () => {
    const result = checkLicensing({
      borough: 'Broxbourne',
      ward: 'Any',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    expect(result.licences).toHaveLength(0);
    expect(result.verdictColor).toBe('grey');
  });

  // Test 17: Unsupported borough
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

  // Test 18: Exemption handling
  it('flags property as exempt when exemptions provided', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
      exemptions: ['local_authority'],
    });
    expect(result.verdict).toBe('exempt');
    expect(result.verdictColor).toBe('exempt');
    expect(result.licences).toHaveLength(0);
  });

  // Test 19: Barking and Dagenham shows warning
  it('Barking and Dagenham shows scheme warning', () => {
    const result = checkLicensing({
      borough: 'Barking and Dagenham',
      ward: 'Any',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Barking and Dagenham');
  });

  // Test 20: Reasoning trail is populated
  it('includes reasoning trail in results', () => {
    const result = checkLicensing({
      borough: 'Hackney',
      ward: 'Stoke Newington',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    expect(result.reasoning).toBeDefined();
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(result.reasoning.some(r => r.includes('Hackney'))).toBe(true);
  });

  // Test 21: Haringey selective with ward alias
  it('Haringey selective with ward alias matching', () => {
    const result = checkLicensing({
      borough: 'Haringey',
      ward: 'bruce castle',
      num_occupants: 1,
      num_households: 1,
      shares_facilities: false,
      tenancy_type: 'single_household',
    });
    const types = result.licences.map((l) => l.type);
    expect(types).toContain('Selective');
  });
});
