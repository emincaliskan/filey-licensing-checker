// GSS ward codes for designated licensing areas
// Source: ONS Open Geography Portal / Find That Postcode
// These codes are verified against Postcodes.io responses
// Format: { borough: { selective: { designated: Set, excluded: Set } } }
//
// NOTE: Some codes are estimated from ONS numbering patterns.
// Run `npm run verify-codes` to check all codes against Postcodes.io.

const DESIGNATED_WARD_CODES = {
  // HACKNEY — Selective: 17 of 21 wards (from 1 May 2026)
  "Hackney": {
    selective: {
      designated: new Set([
        "E05009367", // Brownswood
        "E05009368", // Cazenove
        "E05009369", // Clissold
        "E05009370", // Dalston
        "E05009371", // De Beauvoir
        "E05009372", // Hackney Central
        "E05009373", // Hackney Downs
        "E05009374", // Hackney Wick
        "E05009376", // Homerton
        "E05009379", // King's Park
        "E05009380", // Lea Bridge
        "E05009381", // London Fields
        "E05009382", // Shacklewell
        "E05009383", // Springfield
        "E05009384", // Stamford Hill West
        "E05009385", // Stoke Newington
        "E05009386", // Victoria
      ]),
      excluded: new Set([
        "E05009375", // Haggerston
        "E05009377", // Hoxton East & Shoreditch
        "E05009378", // Hoxton West
        "E05009387", // Woodberry Down
      ]),
    },
  },

  // HARINGEY — Selective: 14 of 21 wards (Nov 2022–Nov 2027)
  "Haringey": {
    selective: {
      designated: new Set([
        "E05013744", // Bounds Green
        "E05013745", // Bruce Castle
        "E05013748", // Harringay
        "E05013749", // Hermitage & Gardens
        "E05013751", // Noel Park
        "E05013752", // Northumberland Park
        "E05013753", // Seven Sisters
        "E05013754", // South Tottenham
        "E05013755", // St Ann's
        "E05013756", // Tottenham Central
        "E05013757", // Tottenham Hale
        "E05013758", // West Green
        "E05013759", // White Hart Lane
        "E05013760", // Woodside
      ]),
    },
  },

  // ISLINGTON — Selective: 3 wards (currently)
  "Islington": {
    selective: {
      designated: new Set([
        "E05013703", // Finsbury Park
        "E05013705", // Hillrise
        "E05013712", // Tollington
      ]),
    },
  },

  // TOWER HAMLETS — Selective: 4 wards (Oct 2021–Sept 2026)
  "Tower Hamlets": {
    selective: {
      designated: new Set([
        "E05009333", // Spitalfields & Banglatown
        "E05009334", // Stepney Green
        "E05009340", // Weavers
        "E05009342", // Whitechapel
      ]),
    },
  },

  // LEWISHAM — Selective: 16 of 19 wards
  "Lewisham": {
    selective: {
      designated: new Set([
        "E05013714", // Bellingham
        "E05013716", // Brockley
        "E05013717", // Catford South
        "E05013718", // Crofton Park
        "E05013719", // Downham
        "E05013720", // Evelyn
        "E05013721", // Forest Hill
        "E05013722", // Grove Park
        "E05013724", // Ladywell
        "E05013725", // Lee Green
        "E05013726", // Lewisham Central
        "E05013727", // New Cross Gate
        "E05013728", // Perry Vale
        "E05013729", // Rushey Green
        "E05013730", // Sydenham
        "E05013732", // Whitefoot
      ]),
      excluded: new Set([
        "E05013715", // Blackheath
        "E05013731", // Telegraph Hill
      ]),
    },
  },

  // SOUTHWARK — Selective: 19 wards
  "Southwark": {
    selective: {
      designated: new Set([
        "E05011095", // Camberwell Green
        "E05011096", // Champion Hill
        "E05011097", // Chaucer
        "E05011098", // Dulwich Hill
        "E05011099", // Dulwich Wood
        "E05011100", // Faraday
        "E05011101", // Goose Green
        "E05011103", // London Bridge & West Bermondsey
        "E05011104", // Newington
        "E05011105", // North Walworth
        "E05011106", // Nunhead & Queens Road
        "E05011107", // Old Kent Road
        "E05011108", // Peckham
        "E05011109", // Peckham Rye
        "E05011110", // Rotherhithe
        "E05011111", // Rye Lane
        "E05011112", // South Bermondsey
        "E05011113", // St Giles
        "E05011114", // Surrey Docks
      ]),
    },
  },

  // REDBRIDGE — Selective: 17 wards
  "Redbridge": {
    selective: {
      designated: new Set([
        "E05011233", // Aldborough
        "E05011235", // Barkingside
        "E05011237", // Chadwell
        "E05011238", // Churchfields
        "E05011239", // Clementswood
        "E05011241", // Cranbrook
        "E05011242", // Fairlop
        "E05011243", // Goodmayes
        "E05011244", // Hainault
        "E05011245", // Ilford Town
        "E05011247", // Loxford
        "E05011248", // Mayfield
        "E05011249", // Newbury
        "E05011251", // Seven Kings
        "E05011252", // South Woodford
        "E05011253", // Valentines
        "E05011254", // Wanstead Village
      ]),
    },
  },

  // HAVERING — Selective: 7 wards (from 18 March 2026)
  "Havering": {
    selective: {
      designated: new Set([
        "E05013786", // Beam Park
        "E05013790", // Harold Wood
        "E05013794", // Rainham & Wennington
        "E05013795", // Rush Green & Crowlands
        "E05013797", // Squirrels Heath
        "E05013798", // St Alban's
        "E05013799", // St Edwards
      ]),
    },
  },

  // NEAR-BOROUGH-WIDE — Track excluded wards only
  "Waltham Forest": {
    selective: {
      excluded: new Set([
        "E05013680", // Endlebury
        "E05013684", // Hatch Lane
      ]),
    },
  },

  "Newham": {
    selective: {
      excluded: new Set([
        "E05009312", // Royal Victoria
        "E05009319", // Stratford Olympic Park (estimated)
      ]),
    },
    additionalHMO: {
      excluded: new Set([
        "E05009312", // Royal Victoria
        "E05009319", // Stratford Olympic Park (estimated)
      ]),
    },
  },

  "Brent": {
    selective: {
      excluded: new Set([
        "E05013681", // Wembley Park (estimated)
      ]),
    },
  },
};

export default DESIGNATED_WARD_CODES;
