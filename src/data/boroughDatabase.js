const BOROUGH_DATABASE = {
  metadata: {
    last_updated: "2026-03-30",
    version: "3.0.0",
    notes: "Council-website-verified borough licensing data, March 2026."
  },

  // HACKNEY - TRANSITIONAL PERIOD
  hackney: {
    name: "London Borough of Hackney",
    short_name: "Hackney",
    region: "London",
    councilUrl: "https://hackney.gov.uk/property-licensing/",
    postcodeChecker: "https://hackney.gov.uk/property-licensing/",
    mandatoryHMO: true,
    additionalHMO: {
      active: false,
      upcoming: true,
      startDate: "2026-05-01",
      endDate: "2031-04-30",
      applicationsOpen: "2026-03-01",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 1400,
      description: "New borough-wide Additional HMO scheme starts 1 May 2026. Applications open from 1 March 2026. Old scheme ended 30 September 2023."
    },
    selectiveLicensing: {
      active: false,
      upcoming: true,
      startDate: "2026-05-01",
      endDate: "2031-04-30",
      applicationsOpen: "2026-03-01",
      coverage: "near-borough-wide",
      designatedWards: [
        "Brownswood", "Cazenove", "Clissold", "Dalston", "De Beauvoir",
        "Hackney Central", "Hackney Downs", "Hackney Wick", "Homerton",
        "King's Park", "Lea Bridge", "London Fields", "Mildmay",
        "Shacklewell", "Springfield", "Stamford Hill West", "Stoke Newington"
      ],
      excludedWards: ["Haggerston", "Hoxton East and Shoreditch", "Hoxton West", "Woodberry Down"],
      fee: 925,
      description: "New selective scheme (17 of 21 wards) starts 1 May 2026. Excludes Haggerston, Hoxton East & Shoreditch, Hoxton West, Woodberry Down. Old scheme ended 30 September 2023."
    },
    notes: "TRANSITIONAL PERIOD: Old schemes ended 30 Sep 2023. New schemes start 1 May 2026. Currently only Mandatory HMO applies."
  },

  // HARINGEY
  haringey: {
    name: "London Borough of Haringey",
    short_name: "Haringey",
    region: "London",
    councilUrl: "https://haringey.gov.uk/housing/private-sector-renting/property-licensing",
    postcodeChecker: "https://haringey.gov.uk/housing/private-sector-renting/property-licensing/selective-property-licensing/do-i-need-a-selective-licence",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2024-06-17",
      endDate: "2029-06-16",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 1360,
      discounts: { accredited_landlord: 50, epc_abc: 50 },
      description: "Borough-wide Additional HMO licensing started 17 June 2024."
    },
    selectiveLicensing: {
      active: true,
      startDate: "2022-11-17",
      endDate: "2027-11-16",
      coverage: "ward-specific",
      designatedWards: [
        "Bounds Green", "Bruce Castle", "Harringay", "Hermitage & Gardens",
        "Noel Park", "Northumberland Park", "Seven Sisters", "South Tottenham",
        "St Ann's", "Tottenham Central", "Tottenham Hale", "West Green",
        "White Hart Lane", "Woodside"
      ],
      excludedWards: [],
      fee: 680,
      discounts: { accredited_landlord: 50, epc_abc: 50 },
      description: "Selective licensing in 14 designated wards in the eastern part of the borough."
    },
    notes: ""
  },

  // ENFIELD - WARD-SPECIFIC, NOT BOROUGH-WIDE
  enfield: {
    name: "London Borough of Enfield",
    short_name: "Enfield",
    region: "London",
    councilUrl: "https://www.enfield.gov.uk/services/housing/selective-licensing-scheme",
    postcodeChecker: "https://enfield.metastreet.co.uk",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      description: "Borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      startDate: "2021-09-01",
      endDate: "2026-08-31",
      coverage: "ward-specific",
      usesPreMay2022Boundaries: true,
      designatedWards: [
        "Bowes", "Chase", "Edmonton Green", "Enfield Highway", "Enfield Lock",
        "Haselbury", "Jubilee", "Lower Edmonton", "Palmers Green", "Ponders End",
        "Southbury", "Southgate Green", "Turkey Street", "Upper Edmonton"
      ],
      excludedWards: [],
      fee: 735,
      description: "Selective licensing in 14 specific wards (pre-May 2022 boundaries). NOT borough-wide."
    },
    notes: "Uses pre-May 2022 ward boundaries. New scheme proposed from Sep 2026 covering 17 wards."
  },

  // WALTHAM FOREST
  "waltham forest": {
    name: "London Borough of Waltham Forest",
    short_name: "Waltham Forest",
    region: "London",
    councilUrl: "https://www.walthamforest.gov.uk/housing/private-sector-housing/private-rented-property-licensing-prpl/selective-licensing-scheme",
    postcodeChecker: "https://www.walthamforest.gov.uk/housing/private-sector-housing/private-rented-property-licensing-prpl",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2025-04-01",
      endDate: "2030-03-31",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 1200,
      description: "Borough-wide Additional HMO licensing. Section 257 HMOs excluded."
    },
    selectiveLicensing: {
      active: true,
      startDate: "2025-05-01",
      endDate: "2030-04-30",
      coverage: "near-borough-wide",
      designatedWards: [],
      excludedWards: ["Hatch Lane", "Highams Park North", "Endlebury"],
      fee: 895,
      description: "Selective licensing in 20 of 22 wards. Excludes Hatch Lane/Highams Park North and Endlebury."
    },
    notes: ""
  },

  // ISLINGTON
  islington: {
    name: "London Borough of Islington",
    short_name: "Islington",
    region: "London",
    councilUrl: "https://www.islington.gov.uk/housing/private-sector-housing/landlords/houses-in-multiple-occupation-hmos",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2026-02-01",
      endDate: "2031-01-31",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      description: "Borough-wide Additional HMO licensing renewed 1 February 2026. Includes Section 257 HMOs."
    },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: ["Finsbury Park", "Hillrise", "Tollington"],
      pendingExpansionWards: ["Barnsbury", "Caledonian", "Tufnell Park", "Mildmay", "Highbury", "Junction", "Laycock"],
      excludedWards: [],
      fee: 850,
      discounts: { accredited_landlord: 75, epc_abc: 50 },
      description: "Currently 3 wards. Expansion to 10 wards approved but start date not confirmed."
    },
    notes: ""
  },

  // BARNET - HAS Additional HMO (was incorrectly marked as none)
  barnet: {
    name: "London Borough of Barnet",
    short_name: "Barnet",
    region: "London",
    councilUrl: "https://www.barnet.gov.uk/HMOlicensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2022-10-27",
      endDate: "2027-10-27",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 1560,
      description: "Borough-wide Additional HMO licensing (Oct 2022 - Oct 2027). 10% discount for accredited landlords/charities."
    },
    selectiveLicensing: {
      active: false,
      pending: true,
      coverage: "none",
      designatedWards: [],
      excludedWards: [],
      description: "Two phases approved (Phase 1: Burnt Oak, Colindale North, Colindale South; Phase 2: 10 additional wards) but NEITHER implemented due to software/resourcing delays."
    },
    notes: "Additional HMO is active borough-wide. Selective licensing approved but NOT yet in force."
  },

  // NEWHAM - 22 of 24 wards
  newham: {
    name: "London Borough of Newham",
    short_name: "Newham",
    region: "London",
    councilUrl: "https://www.newham.gov.uk/housing-homes-homelessness/property-licensing-consultation",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2023-01-01",
      endDate: "2028-01-01",
      coverage: "near-borough-wide",
      designatedWards: [],
      excludedWards: ["Royal Victoria", "Stratford Olympic Park"],
      fee: 1400,
      description: "Additional HMO licensing in 22 of 24 wards. Excludes Royal Victoria and Stratford Olympic Park."
    },
    selectiveLicensing: {
      active: true,
      startDate: "2023-06-01",
      endDate: "2028-06-01",
      coverage: "near-borough-wide",
      designatedWards: [],
      excludedWards: ["Royal Victoria", "Stratford Olympic Park"],
      fee: 750,
      description: "Selective licensing in 22 of 24 wards. Excludes Royal Victoria and Stratford Olympic Park. Newham's 3rd consecutive 5-year term."
    },
    notes: ""
  },

  // TOWER HAMLETS
  "tower hamlets": {
    name: "London Borough of Tower Hamlets",
    short_name: "Tower Hamlets",
    region: "London",
    councilUrl: "https://www.towerhamlets.gov.uk/lgnl/housing/Private-tenants-landlords-and-homeowners/Private-Landlords/Additional_Licensing_Scheme.aspx",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2024-04-01",
      endDate: "2029-04-01",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 756,
      description: "Borough-wide Additional HMO licensing from 1 April 2024. Includes Section 257 HMOs. £54.50 per habitable room."
    },
    selectiveLicensing: {
      active: false,
      coverage: "none",
      designatedWards: [],
      excludedWards: [],
      description: "Previous selective scheme has ended. Replaced by borough-wide Additional HMO."
    },
    notes: ""
  },

  // BARKING AND DAGENHAM
  "barking and dagenham": {
    name: "London Borough of Barking and Dagenham",
    short_name: "Barking and Dagenham",
    region: "London",
    councilUrl: "https://www.lbbd.gov.uk/private-sector-housing/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2025-01-09",
      endDate: "2030-01-09",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 1400,
      description: "Borough-wide Additional HMO from 9 January 2025. Section 257 HMOs excluded. Up to £250 discount for satisfactory compliance."
    },
    selectiveLicensing: {
      active: true,
      startDate: "2025-04-06",
      coverage: "ward-specific",
      designatedWards: [],
      excludedWards: [],
      fee: 950,
      description: "Selective licensing from 6 April 2025. Multi-designation approach — check council website for exact ward coverage."
    },
    notes: "Both schemes now active. Check council website for selective licensing ward designations."
  },

  // HAVERING - TRANSITIONAL
  havering: {
    name: "London Borough of Havering",
    short_name: "Havering",
    region: "London",
    councilUrl: "https://www.havering.gov.uk/information-landlords/private-rented-property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2026-03-18",
      endDate: "2031-03-17",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 1400,
      description: "New borough-wide Additional HMO licensing from 18 March 2026."
    },
    selectiveLicensing: {
      active: true,
      startDate: "2026-03-18",
      endDate: "2031-03-17",
      coverage: "ward-specific",
      designatedWards: [
        "Beam Park", "Harold Wood", "Rainham & Wennington",
        "Rush Green & Crowlands", "Squirrels Heath", "St Alban's", "St Edwards"
      ],
      excludedWards: [],
      fee: 950,
      discounts: { epc_c_plus: 75, accredited_landlord: 100 },
      description: "Selective licensing in 7 wards from 18 March 2026. Old scheme (Brooklands/Romford Town) ended January 2026."
    },
    notes: "New schemes started 18 March 2026, replacing the old Brooklands/Romford Town scheme."
  },

  // BRENT - 21 of 22 wards
  brent: {
    name: "London Borough of Brent",
    short_name: "Brent",
    region: "London",
    councilUrl: "https://www.brent.gov.uk/housing/landlords/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      description: "Borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      coverage: "near-borough-wide",
      designatedWards: [],
      excludedWards: ["Wembley Park"],
      fee: 640,
      description: "Selective licensing in 21 of 22 wards across 2 designations. Only Wembley Park is excluded."
    },
    notes: ""
  },

  // REDBRIDGE - 17 wards
  redbridge: {
    name: "London Borough of Redbridge",
    short_name: "Redbridge",
    region: "London",
    councilUrl: "https://www.redbridge.gov.uk/housing/private-rentals/selective-licensing/",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      description: "Borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: [
        "Ilford Town", "Valentines",
        "Aldborough", "Barkingside", "Chadwell", "Churchfields", "Clementswood",
        "Cranbrook", "Fairlop", "Goodmayes", "Hainault", "Loxford",
        "Mayfield", "Newbury", "Seven Kings", "South Woodford", "Wanstead Village"
      ],
      excludedWards: [],
      fee: 860,
      discounts: { accredited_landlord: 35 },
      description: "Selective licensing across 17 wards in 2 designations."
    },
    notes: ""
  },

  // LEWISHAM - 16 wards
  lewisham: {
    name: "London Borough of Lewisham",
    short_name: "Lewisham",
    region: "London",
    councilUrl: "https://lewisham.gov.uk/selectivelicensing",
    postcodeChecker: "https://lewisham.gov.uk/selectivelicensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      description: "Borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      startDate: "2024-07-01",
      endDate: "2029-07-01",
      coverage: "ward-specific",
      usesPreMay2022Boundaries: true,
      designatedWards: [
        "Brockley", "Catford South", "Lewisham Central", "New Cross", "Perry Vale", "Rushey Green",
        "Crofton Park", "Evelyn", "Ladywell", "Lee Green", "Sydenham",
        "Bellingham", "Downham", "Forest Hill", "Grove Park", "Whitefoot"
      ],
      excludedWards: ["Telegraph Hill", "Blackheath"],
      fee: 640,
      description: "Selective licensing across 16 wards in 3 designations. Uses pre-May 2022 boundaries."
    },
    notes: ""
  },

  // SOUTHWARK
  southwark: {
    name: "London Borough of Southwark",
    short_name: "Southwark",
    region: "London",
    councilUrl: "https://www.southwark.gov.uk/housing/private-tenants-and-landlords/private-rented-property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      startDate: "2022-03-01",
      endDate: "2027-02-28",
      coverage: "borough-wide",
      designatedWards: [],
      excludedWards: [],
      fee: 1365,
      description: "Borough-wide Additional HMO licensing (March 2022 - February 2027). Includes Section 257 HMOs (no charge)."
    },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: [
        "Newington", "Champion Hill", "Faraday", "St Giles", "Goose Green",
        "North Walworth", "Nunhead & Queens Road", "Old Kent Road", "Peckham",
        "Camberwell Green", "Chaucer", "Dulwich Hill", "Dulwich Wood",
        "London Bridge & West Bermondsey", "Peckham Rye", "Rotherhithe",
        "Rye Lane", "South Bermondsey", "Surrey Docks"
      ],
      excludedWards: [],
      fee: 945,
      description: "Selective licensing across 19 wards in 2 designations."
    },
    notes: ""
  },

  // NON-LONDON (all the same structure, just mandatoryHMO: true, everything else false/none)
  broxbourne: {
    name: "Borough of Broxbourne", short_name: "Broxbourne", region: "Non-London",
    councilUrl: "https://www.broxbourne.gov.uk/housing", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London. No additional or selective schemes."
  },
  "epping forest": {
    name: "Epping Forest District", short_name: "Epping Forest", region: "Non-London",
    councilUrl: "", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London."
  },
  harlow: {
    name: "Harlow District", short_name: "Harlow", region: "Non-London",
    councilUrl: "", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London."
  },
  "east hertfordshire": {
    name: "East Hertfordshire District", short_name: "East Hertfordshire", region: "Non-London",
    councilUrl: "", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London."
  },
  hertsmere: {
    name: "Hertsmere Borough", short_name: "Hertsmere", region: "Non-London",
    councilUrl: "", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London."
  },
  luton: {
    name: "Luton Borough", short_name: "Luton", region: "Non-London",
    councilUrl: "", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London. May have selective licensing — check with council."
  },
  "west suffolk": {
    name: "West Suffolk District", short_name: "West Suffolk", region: "Non-London",
    councilUrl: "", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London."
  },
  medway: {
    name: "Medway Council", short_name: "Medway", region: "Non-London",
    councilUrl: "", mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], excludedWards: [], description: "" },
    notes: "Non-London."
  }
};

export default BOROUGH_DATABASE;
