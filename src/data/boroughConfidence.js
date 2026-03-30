// Confidence levels for auto-deciding licensing requirements
// AUTO_HIGH: Borough-wide scheme, auto-decide with HIGH confidence
// AUTO_HIGH_NO: No scheme exists, auto-decide (no licence needed)
// WARD_CHECK: Uses GSS code matching — auto-decides at HIGH confidence
// GEOJSON_CHECK: Uses point-in-polygon (Enfield only) — auto-decides at HIGH confidence
// MEDIUM: Near-borough-wide, uses excluded ward GSS codes — auto-decides at HIGH confidence
// VERIFY: Fallback if GSS/GeoJSON checks fail — manual council check needed

const BOROUGH_CONFIDENCE = {
  // AUTO_HIGH — Borough-wide or no scheme
  "Haringey":              { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Barnet":                { additionalHMO: "AUTO_HIGH",    selective: "AUTO_HIGH_NO" },
  "Tower Hamlets":         { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Barking and Dagenham":  { additionalHMO: "AUTO_HIGH",    selective: "AUTO_HIGH" },

  // WARD_CHECK — GSS code matching (HIGH confidence after check)
  "Hackney":               { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Islington":             { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Southwark":             { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Redbridge":             { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Lewisham":              { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Havering":              { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Waltham Forest":        { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },
  "Newham":                { additionalHMO: "WARD_CHECK",   selective: "WARD_CHECK" },
  "Brent":                 { additionalHMO: "AUTO_HIGH",    selective: "WARD_CHECK" },

  // GEOJSON_CHECK — Point-in-polygon (Enfield pre-2022 boundaries)
  "Enfield":               { additionalHMO: "AUTO_HIGH",    selective: "GEOJSON_CHECK" },

  // Non-London boroughs — no schemes
  "Broxbourne":            { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Epping Forest":         { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Harlow":                { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "East Hertfordshire":    { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Hertsmere":             { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Luton":                 { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "West Suffolk":          { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Medway":                { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
};

export default BOROUGH_CONFIDENCE;
