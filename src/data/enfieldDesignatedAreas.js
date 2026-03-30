// Simplified designated area polygon for Enfield selective licensing
// Based on pre-May 2022 ward boundaries
//
// The 14 designated wards cover roughly the eastern 2/3 of the borough.
// Non-designated wards are in the western part (Cockfosters, Winchmore Hill,
// Grange Park, Highlands, Southgate, Town, Bush Hill Park).
//
// This is an APPROXIMATION. For edge cases near boundaries,
// always verify with the council's tool at:
// https://www.enfield.gov.uk/services/housing/selective-licensing-scheme
//
// If Turf.js is available, this is used for point-in-polygon checks.
// Otherwise, fall back to VERIFY with council.

const ENFIELD_DESIGNATED_AREA = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Enfield Selective Licensing Area (pre-2022 wards)", designation: "selective" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          // Approximate polygon covering the 14 designated wards
          // Moving clockwise from NW corner
          [-0.0750, 51.6580],  // N boundary near M25/Turkey Street
          [-0.0350, 51.6580],  // NE boundary near Enfield Lock
          [-0.0200, 51.6500],  // E boundary
          [-0.0100, 51.6350],  // E boundary near Ponders End
          [-0.0200, 51.6100],  // SE boundary near Edmonton
          [-0.0500, 51.5900],  // S boundary near Lower Edmonton
          [-0.0700, 51.5850],  // S boundary near Upper Edmonton
          [-0.0900, 51.5800],  // SW boundary near Bowes
          [-0.1100, 51.5900],  // W boundary (Palmers Green area)
          [-0.1150, 51.6000],  // W boundary
          [-0.1200, 51.6100],  // NW boundary (Southgate Green area)
          [-0.1100, 51.6200],  // W boundary (Southbury area)
          [-0.1000, 51.6350],  // W boundary (Chase area)
          [-0.0900, 51.6500],  // NW corner heading to Jubilee
          [-0.0750, 51.6580],  // Back to start
        ]]
      }
    }
  ]
};

export default ENFIELD_DESIGNATED_AREA;
