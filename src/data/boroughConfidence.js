// Confidence levels for auto-deciding licensing requirements
// AUTO_HIGH: Borough-wide scheme, can auto-decide with high confidence
// AUTO_HIGH_NO: No scheme exists, can auto-decide (no licence needed)
// MEDIUM: Near-borough-wide (most wards, few exclusions), likely but verify
// VERIFY: Ward-specific, cannot reliably decide from postcode, must verify with council

const BOROUGH_CONFIDENCE = {
  "Hackney": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Haringey": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Enfield": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Waltham Forest": { additionalHMO: "AUTO_HIGH", selective: "MEDIUM" },
  "Islington": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Barnet": { additionalHMO: "AUTO_HIGH", selective: "AUTO_HIGH_NO" },
  "Newham": { additionalHMO: "MEDIUM", selective: "MEDIUM" },
  "Tower Hamlets": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Barking and Dagenham": { additionalHMO: "AUTO_HIGH", selective: "AUTO_HIGH" },
  "Havering": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Brent": { additionalHMO: "AUTO_HIGH", selective: "MEDIUM" },
  "Redbridge": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Lewisham": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  "Southwark": { additionalHMO: "AUTO_HIGH", selective: "VERIFY" },
  // Non-London boroughs — no schemes
  "Broxbourne": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Epping Forest": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Harlow": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "East Hertfordshire": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Hertsmere": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Luton": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "West Suffolk": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
  "Medway": { additionalHMO: "AUTO_HIGH_NO", selective: "AUTO_HIGH_NO" },
};

export default BOROUGH_CONFIDENCE;
