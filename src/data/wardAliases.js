const WARD_ALIASES = {
  // Haringey
  "Bruce castle": "Bruce Castle",
  "bruce castle": "Bruce Castle",
  "Noel park": "Noel Park",
  "Noel Paek": "Noel Park",
  "Seven sisters": "Seven Sisters",
  "seven sisters": "Seven Sisters",
  "South tottenham": "South Tottenham",
  "south tottenham": "South Tottenham",
  "Northumberland park": "Northumberland Park",
  "Tottenham hale": "Tottenham Hale",
  "West green": "West Green",
  "Tottenhham Central": "Tottenham Central",
  "Tottenham Centrral": "Tottenham Central",
  "Woodgreen": "Wood Green",
  "St Anns": "St Ann's",
  "Saint Ann's": "St Ann's",
  "St. Ann's": "St Ann's",
  "Hermitage and Gardens": "Hermitage & Gardens",
  "Haringay": "Harringay",  // ward is "Harringay" not "Haringey"

  // Hackney
  "De Beouvour": "De Beauvoir",
  "De beauvoir": "De Beauvoir",
  "Hoggerston": "Haggerston",
  "Lead Bridge": "Lea Bridge",
  "Kings Park": "King's Park",
  "Hoxton East and Shoreditch": "Hoxton East & Shoreditch",

  // General
  "Romford town": "Romford Town",
  "Woodberry down": "Woodberry Down",

  // Borough name typos
  "Barking & Dagenham": "Barking and Dagenham",
  "Tower hamlets": "Tower Hamlets",
  "Waltham forest": "Waltham Forest",
  "East hertfordshire": "East Hertfordshire",
  "West suffolk": "West Suffolk",
  "Epping forest": "Epping Forest",
};

// Enfield: Pre-May 2022 → Post-May 2022 ward boundary mapping
// The selective licensing scheme uses pre-2022 boundaries
// Postcodes.io returns post-2022 ward names
const ENFIELD_WARD_MAPPING = {
  "Bowes Park": { inDesignation: true, oldWard: "Bowes" },
  "Southgate": { inDesignation: true, oldWard: "Southgate Green" },
  "Palmers Green": { inDesignation: true, oldWard: "Palmers Green" },
  "Edmonton Green": { inDesignation: true, oldWard: "Edmonton Green" },
  "Lower Edmonton": { inDesignation: true, oldWard: "Lower Edmonton" },
  "Upper Edmonton": { inDesignation: true, oldWard: "Upper Edmonton" },
  "Enfield Highway": { inDesignation: true, oldWard: "Enfield Highway" },
  "Enfield Lock": { inDesignation: true, oldWard: "Enfield Lock" },
  "Turkey Street": { inDesignation: true, oldWard: "Turkey Street" },
  "Ponders End": { inDesignation: true, oldWard: "Ponders End" },
  "Jubilee": { inDesignation: true, oldWard: "Jubilee" },
  "Haselbury": { inDesignation: true, oldWard: "Haselbury" },
  "Southbury": { inDesignation: true, oldWard: "Southbury" },
  "Chase": { inDesignation: true, oldWard: "Chase" },
  "Cockfosters": { inDesignation: false },
  "Enfield Town": { inDesignation: false },
  "Grange Park": { inDesignation: false },
  "Highlands": { inDesignation: false },
  "Town": { inDesignation: false },
  "Winchmore Hill": { inDesignation: false },
  "Whitewebbs": { inDesignation: false },
  "Arnos Grove": { inDesignation: false },
  "Bush Hill Park": { inDesignation: false },
  "Carterhatch": { inDesignation: false },
  "Bullsmoor": { inDesignation: false },
  "Ridgeway": { inDesignation: false },
};

export default WARD_ALIASES;
export { ENFIELD_WARD_MAPPING };
