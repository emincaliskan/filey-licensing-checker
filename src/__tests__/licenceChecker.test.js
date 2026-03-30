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
    expect(findBorough('haringey')).not.toBeNull();
  });

  it('finds Waltham Forest', () => {
    expect(findBorough('Waltham Forest')).not.toBeNull();
  });

  it('finds Tower Hamlets', () => {
    expect(findBorough('Tower Hamlets')).not.toBeNull();
  });

  it('finds non-London boroughs', () => {
    expect(findBorough('Broxbourne')).not.toBeNull();
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
    expect(boroughs).toContain('Newham');
    expect(boroughs).toContain('Brent');
    expect(boroughs).toContain('Medway');
  });
});

describe('wardMatcher (normalisation only)', () => {
  it('normalises ward names via aliases', () => {
    expect(normaliseWardName('Bruce castle')).toBe('Bruce Castle');
    expect(normaliseWardName('Noel Paek')).toBe('Noel Park');
    expect(normaliseWardName('Haringay')).toBe('Harringay');
  });

  it('matches wards in list for display purposes', () => {
    expect(isWardInList('Stoke Newington', ['Stoke Newington'])).toBe(true);
    expect(isWardInList('Unknown', ['Stoke Newington'])).toBe(false);
  });
});

describe('Three-Tier Decision Logic', () => {
  // MANDATORY HMO — always auto-decidable, HIGH confidence
  it('Mandatory HMO in any borough (national law)', () => {
    const result = checkLicensing({
      borough: 'Hackney', ward: 'Any', num_occupants: 5,
      num_households: 3, shares_facilities: true, tenancy_type: 'hmo',
    });
    const types = result.licences.map(l => l.type);
    expect(types).toContain('Mandatory HMO');
    expect(result.licences.find(l => l.type === 'Mandatory HMO').confidence).toBe('high');
  });

  // HACKNEY — transitional period (March 2026)
  it('Hackney: no active schemes in transitional period', () => {
    const result = checkLicensing({
      borough: 'Hackney', ward: 'Stoke Newington', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.licences).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('starts'))).toBe(true);
  });

  // HARINGEY — Additional HMO = AUTO_HIGH (borough-wide)
  it('Haringey: Additional HMO AUTO_HIGH (borough-wide)', () => {
    const result = checkLicensing({
      borough: 'Haringey', ward: 'Tottenham Central', num_occupants: 4,
      num_households: 2, shares_facilities: true, tenancy_type: 'hmo',
    });
    const hmo = result.licences.find(l => l.type === 'Additional HMO');
    expect(hmo).toBeDefined();
    expect(hmo.confidence).toBe('high');
  });

  // HARINGEY — Selective = VERIFY (ward-specific, 14/21 wards)
  it('Haringey: Selective requires VERIFICATION', () => {
    const result = checkLicensing({
      borough: 'Haringey', ward: 'Tottenham Central', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.confidence).toBe('verify');
    expect(result.verificationsNeeded.length).toBeGreaterThan(0);
    expect(result.verificationsNeeded[0].type).toBe('Selective');
  });

  // ENFIELD — Selective = VERIFY (ward-specific, 14 wards, pre-2022 boundaries)
  it('Enfield: Selective requires VERIFICATION (cannot auto-decide)', () => {
    const result = checkLicensing({
      borough: 'Enfield', ward: 'Southgate', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.confidence).toBe('verify');
    expect(result.verificationsNeeded.length).toBeGreaterThan(0);
    // NOT automatically saying "licence required" — must verify
    const highConfLicences = result.licences.filter(l => l.confidence === 'high' && l.type === 'Selective');
    expect(highConfLicences).toHaveLength(0);
  });

  // ENFIELD — Additional HMO = AUTO_HIGH
  it('Enfield: Additional HMO AUTO_HIGH (borough-wide)', () => {
    const result = checkLicensing({
      borough: 'Enfield', ward: 'Any', num_occupants: 3,
      num_households: 2, shares_facilities: true, tenancy_type: 'hmo',
    });
    const hmo = result.licences.find(l => l.type === 'Additional HMO');
    expect(hmo).toBeDefined();
    expect(hmo.confidence).toBe('high');
  });

  // BARNET — Additional HMO active, selective NOT in force
  it('Barnet: Additional HMO active, selective not implemented', () => {
    const result = checkLicensing({
      borough: 'Barnet', ward: 'Any', num_occupants: 3,
      num_households: 2, shares_facilities: true, tenancy_type: 'hmo',
    });
    const types = result.licences.map(l => l.type);
    expect(types).toContain('Additional HMO');
    expect(types).not.toContain('Selective');
  });

  it('Barnet: single let = no licence (no selective)', () => {
    const result = checkLicensing({
      borough: 'Barnet', ward: 'Any', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.licences).toHaveLength(0);
    expect(result.verdictColor).toBe('grey');
  });

  // WALTHAM FOREST — Selective = MEDIUM (20/22 wards)
  it('Waltham Forest: Selective MEDIUM confidence', () => {
    const result = checkLicensing({
      borough: 'Waltham Forest', ward: 'Leyton', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    const sel = result.licences.find(l => l.type === 'Selective');
    expect(sel).toBeDefined();
    expect(sel.confidence).toBe('medium');
  });

  // NEWHAM — Selective = MEDIUM (22/24 wards)
  it('Newham: Selective MEDIUM confidence', () => {
    const result = checkLicensing({
      borough: 'Newham', ward: 'West Ham', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    const sel = result.licences.find(l => l.type === 'Selective');
    expect(sel).toBeDefined();
    expect(sel.confidence).toBe('medium');
  });

  // BRENT — Selective = MEDIUM (21/22 wards)
  it('Brent: Selective MEDIUM confidence', () => {
    const result = checkLicensing({
      borough: 'Brent', ward: 'Kilburn', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    const sel = result.licences.find(l => l.type === 'Selective');
    expect(sel).toBeDefined();
    expect(sel.confidence).toBe('medium');
  });

  // BARKING AND DAGENHAM — Selective = AUTO_HIGH (borough-wide from Apr 2025)
  it('Barking & Dagenham: Selective AUTO_HIGH (borough-wide)', () => {
    const result = checkLicensing({
      borough: 'Barking and Dagenham', ward: 'Any', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    const sel = result.licences.find(l => l.type === 'Selective');
    expect(sel).toBeDefined();
    expect(sel.confidence).toBe('high');
  });

  // TOWER HAMLETS — Selective = VERIFY (4 wards)
  it('Tower Hamlets: Selective requires VERIFICATION', () => {
    const result = checkLicensing({
      borough: 'Tower Hamlets', ward: 'Whitechapel', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.confidence).toBe('verify');
    expect(result.verificationsNeeded.length).toBeGreaterThan(0);
  });

  // NON-LONDON — no schemes, AUTO_HIGH_NO
  it('Broxbourne: no schemes (non-London)', () => {
    const result = checkLicensing({
      borough: 'Broxbourne', ward: 'Any', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.licences).toHaveLength(0);
    expect(result.verdictColor).toBe('grey');
    expect(result.confidence).toBe('high');
  });

  // EXEMPTION
  it('Exempt property', () => {
    const result = checkLicensing({
      borough: 'Hackney', ward: 'Any', num_occupants: 1,
      num_households: 1, shares_facilities: false,
      exemptions: ['local_authority'],
    });
    expect(result.verdict).toBe('exempt');
    expect(result.confidence).toBe('high');
  });

  // UNSUPPORTED BOROUGH
  it('Unsupported borough', () => {
    const result = checkLicensing({
      borough: 'Westminster', ward: 'West End', num_occupants: 1,
      num_households: 1, shares_facilities: false,
    });
    expect(result.verdict).toBe('unsupported');
    expect(result.confidence).toBe('low');
  });

  // EVERY RESULT has confidence and verificationsNeeded
  it('All results include confidence and verificationsNeeded', () => {
    const result = checkLicensing({
      borough: 'Islington', ward: 'Hillrise', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.confidence).toBeDefined();
    expect(result.verificationsNeeded).toBeDefined();
    expect(Array.isArray(result.verificationsNeeded)).toBe(true);
  });

  // REASONING is populated
  it('Reasoning trail populated', () => {
    const result = checkLicensing({
      borough: 'Enfield', ward: 'Chase', num_occupants: 1,
      num_households: 1, shares_facilities: false, tenancy_type: 'single_household',
    });
    expect(result.reasoning.length).toBeGreaterThan(0);
  });
});
