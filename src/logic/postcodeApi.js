const POSTCODES_IO_BASE = 'https://api.postcodes.io/postcodes';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

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

export async function searchAddress(query) {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    countrycodes: 'gb',
    limit: '6',
    viewbox: '-0.51,51.28,0.33,51.69',
    bounded: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { 'User-Agent': 'FileyLicensingChecker/1.0' },
  });

  if (!response.ok) return [];

  const results = await response.json();

  return results
    .filter((r) => r.address && r.address.postcode)
    .map((r) => ({
      display_name: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      postcode: r.address.postcode,
      address: r.address,
    }));
}

export async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `${POSTCODES_IO_BASE}?lon=${longitude}&lat=${latitude}&limit=1`
  );

  if (!response.ok) {
    throw new Error('Failed to resolve location. Please try again.');
  }

  const data = await response.json();

  if (data.status !== 200 || !data.result || data.result.length === 0) {
    throw new Error('Could not find postcode for this location.');
  }

  const nearest = data.result[0];
  return {
    postcode: nearest.postcode,
    borough: nearest.admin_district,
    ward: nearest.admin_ward,
    latitude: nearest.latitude,
    longitude: nearest.longitude,
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
