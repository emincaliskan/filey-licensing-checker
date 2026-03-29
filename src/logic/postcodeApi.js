const POSTCODES_IO_BASE = 'https://api.postcodes.io/postcodes';

export async function lookupPostcode(postcode) {
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  const response = await fetch(`${POSTCODES_IO_BASE}/${encodeURIComponent(cleaned)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Postcode not found. Please check and try again.');
    }
    throw new Error('Failed to look up postcode. Please try again.');
  }

  const data = await response.json();

  if (data.status !== 200 || !data.result) {
    throw new Error('Postcode not found. Please check and try again.');
  }

  const { admin_district, admin_ward, postcode: formattedPostcode, latitude, longitude } = data.result;

  return {
    postcode: formattedPostcode,
    borough: admin_district,
    ward: admin_ward,
    latitude,
    longitude,
  };
}

export async function lookupMultiplePostcodes(postcodes) {
  const cleaned = postcodes.map((pc) => pc.replace(/\s+/g, '').toUpperCase());
  const chunks = [];
  for (let i = 0; i < cleaned.length; i += 100) {
    chunks.push(cleaned.slice(i, i + 100));
  }

  const results = [];
  for (const chunk of chunks) {
    const response = await fetch(POSTCODES_IO_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcodes: chunk }),
    });

    if (!response.ok) {
      throw new Error('Failed to look up postcodes. Please try again.');
    }

    const data = await response.json();
    if (data.result) {
      for (const item of data.result) {
        if (item.result) {
          results.push({
            postcode: item.result.postcode,
            borough: item.result.admin_district,
            ward: item.result.admin_ward,
            latitude: item.result.latitude,
            longitude: item.result.longitude,
          });
        } else {
          results.push({
            postcode: item.query,
            borough: null,
            ward: null,
            error: 'Postcode not found',
          });
        }
      }
    }
  }

  return results;
}
