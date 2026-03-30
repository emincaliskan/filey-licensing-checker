const BOROUGH_DATABASE = {
  metadata: {
    last_updated: "2026-03-30",
    version: "2.0.0",
    notes: "Corrected borough licensing data from official council guidance and Filey operational records."
  },

  // HACKNEY
  hackney: {
    name: "London Borough of Hackney",
    short_name: "Hackney",
    region: "London",
    councilUrl: "https://hackney.gov.uk/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Borough-wide Additional HMO licensing for properties with 3+ persons from 2+ households sharing facilities."
    },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: ["Brownswood", "Cazenove", "Stoke Newington"],
      description: "Selective licensing applies only in Brownswood, Cazenove, and Stoke Newington wards."
    },
    notes: ""
  },

  // HARINGEY
  haringey: {
    name: "London Borough of Haringey",
    short_name: "Haringey",
    region: "London",
    councilUrl: "https://www.haringey.gov.uk/housing/private-renting/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Haringey has borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: [
        "Bounds Green", "Bruce Castle", "Noel Park", "Northumberland Park",
        "Seven Sisters", "South Tottenham", "St Ann's", "Tottenham Central",
        "Tottenham Hale", "West Green", "White Hart Lane", "Woodside",
        "Hermitage & Gardens"
      ],
      description: "Selective licensing applies in 13 designated wards, primarily in the Tottenham and north Haringey area."
    },
    notes: "Most Filey properties in Haringey fall within selective licensing wards."
  },

  // ENFIELD
  enfield: {
    name: "London Borough of Enfield",
    short_name: "Enfield",
    region: "London",
    councilUrl: "https://www.enfield.gov.uk/services/housing/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Enfield has borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Enfield has BOROUGH-WIDE selective licensing. ALL privately rented properties require a licence."
    },
    notes: "Filey has 612+ properties in Enfield requiring Selective licensing. This is the largest licensing exposure."
  },

  // WALTHAM FOREST
  "waltham forest": {
    name: "London Borough of Waltham Forest",
    short_name: "Waltham Forest",
    region: "London",
    councilUrl: "https://www.walthamforest.gov.uk/housing/private-rented-property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Waltham Forest has borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Waltham Forest has BOROUGH-WIDE selective licensing."
    },
    notes: ""
  },

  // ISLINGTON
  islington: {
    name: "London Borough of Islington",
    short_name: "Islington",
    region: "London",
    councilUrl: "https://www.islington.gov.uk/housing/private-renting/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Islington has borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: ["Finsbury Park", "Hillrise", "Tollington"],
      description: "Selective licensing applies in Finsbury Park, Hillrise, and Tollington wards."
    },
    notes: "Some Filey properties in Finsbury Park/Hillrise show 'Required=Yes' without a licence type — these need manual review."
  },

  // BARNET
  barnet: {
    name: "London Borough of Barnet",
    short_name: "Barnet",
    region: "London",
    councilUrl: "https://www.barnet.gov.uk/housing/private-renting",
    mandatoryHMO: true,
    additionalHMO: {
      active: false,
      coverage: "none",
      designatedWards: [],
      description: "Barnet does NOT currently have an Additional HMO licensing scheme."
    },
    selectiveLicensing: {
      active: false,
      coverage: "none",
      designatedWards: [],
      description: "Barnet does NOT currently have a Selective licensing scheme."
    },
    notes: "Only Mandatory HMO licensing applies in Barnet. No additional or selective schemes currently in force."
  },

  // NEWHAM
  newham: {
    name: "London Borough of Newham",
    short_name: "Newham",
    region: "London",
    councilUrl: "https://www.newham.gov.uk/housing/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Newham has borough-wide Additional HMO licensing."
    },
    selectiveLicensing: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Newham has BOROUGH-WIDE selective licensing — ALL privately rented properties need a licence."
    },
    notes: "Newham pioneered borough-wide licensing in London."
  },

  // TOWER HAMLETS
  "tower hamlets": {
    name: "London Borough of Tower Hamlets",
    short_name: "Tower Hamlets",
    region: "London",
    councilUrl: "https://www.towerhamlets.gov.uk/lgnl/housing/private_housing/Property_licensing.aspx",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Tower Hamlets has Additional HMO licensing."
    },
    selectiveLicensing: {
      active: false,
      coverage: "none",
      designatedWards: [],
      description: "Tower Hamlets does not currently have a Selective licensing scheme."
    },
    notes: ""
  },

  // BARKING AND DAGENHAM
  "barking and dagenham": {
    name: "London Borough of Barking and Dagenham",
    short_name: "Barking and Dagenham",
    region: "London",
    councilUrl: "https://www.lbbd.gov.uk/housing/private-renting/property-licensing",
    mandatoryHMO: true,
    additionalHMO: {
      active: true,
      coverage: "borough-wide",
      designatedWards: [],
      description: "Barking and Dagenham has implemented Additional HMO licensing. This scheme was expected to come into force in early 2025 — verify current status with council."
    },
    selectiveLicensing: {
      active: false,
      coverage: "none",
      designatedWards: [],
      description: "No selective licensing scheme currently confirmed."
    },
    notes: "\u26a0\ufe0f SCHEME STATUS UNCERTAIN — Was pending as of early 2025. Verify current Additional HMO scheme status with the council."
  },

  // HAVERING
  havering: {
    name: "London Borough of Havering",
    short_name: "Havering",
    region: "London",
    councilUrl: "https://www.havering.gov.uk/housing/landlords",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: ["Romford Town"],
      description: "Selective licensing in designated areas including Romford Town."
    },
    notes: "Limited Filey presence. Check council for latest designated wards."
  },

  // LEWISHAM
  lewisham: {
    name: "London Borough of Lewisham",
    short_name: "Lewisham",
    region: "London",
    councilUrl: "https://lewisham.gov.uk/myservices/housing/landlords/property-licensing",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: [],
      description: "Lewisham has selective licensing in designated areas. Check council website for current ward list."
    },
    notes: "Check council for latest designated areas."
  },

  // SOUTHWARK
  southwark: {
    name: "London Borough of Southwark",
    short_name: "Southwark",
    region: "London",
    councilUrl: "https://www.southwark.gov.uk/housing/landlords/property-licensing",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: [],
      description: "Southwark has selective licensing in designated areas."
    },
    notes: ""
  },

  // REDBRIDGE
  redbridge: {
    name: "London Borough of Redbridge",
    short_name: "Redbridge",
    region: "London",
    councilUrl: "https://www.redbridge.gov.uk/housing/private-renting/property-licensing",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: {
      active: true,
      coverage: "ward-specific",
      designatedWards: [],
      description: "Redbridge has selective licensing in designated areas."
    },
    notes: ""
  },

  // BRENT
  brent: {
    name: "London Borough of Brent",
    short_name: "Brent",
    region: "London",
    councilUrl: "https://www.brent.gov.uk/housing/landlords",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "No additional or selective licensing schemes currently in force."
  },

  // NON-LONDON BOROUGHS
  broxbourne: {
    name: "Borough of Broxbourne",
    short_name: "Broxbourne",
    region: "Non-London",
    councilUrl: "https://www.broxbourne.gov.uk/housing",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority. No additional or selective schemes."
  },

  "epping forest": {
    name: "Epping Forest District",
    short_name: "Epping Forest",
    region: "Non-London",
    councilUrl: "",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority."
  },

  harlow: {
    name: "Harlow District",
    short_name: "Harlow",
    region: "Non-London",
    councilUrl: "",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority."
  },

  "east hertfordshire": {
    name: "East Hertfordshire District",
    short_name: "East Hertfordshire",
    region: "Non-London",
    councilUrl: "",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority."
  },

  hertsmere: {
    name: "Hertsmere Borough",
    short_name: "Hertsmere",
    region: "Non-London",
    councilUrl: "",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority."
  },

  luton: {
    name: "Luton Borough",
    short_name: "Luton",
    region: "Non-London",
    councilUrl: "",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority."
  },

  "west suffolk": {
    name: "West Suffolk District",
    short_name: "West Suffolk",
    region: "Non-London",
    councilUrl: "",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority."
  },

  medway: {
    name: "Medway Council",
    short_name: "Medway",
    region: "Non-London",
    councilUrl: "",
    mandatoryHMO: true,
    additionalHMO: { active: false, coverage: "none", designatedWards: [], description: "" },
    selectiveLicensing: { active: false, coverage: "none", designatedWards: [], description: "" },
    notes: "Non-London authority."
  }
};

export default BOROUGH_DATABASE;
