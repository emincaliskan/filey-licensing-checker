import Papa from 'papaparse';
import XLSX from 'xlsx-js-style';

// Column name mapping — flexible header matching
const COLUMN_MAP = {
  address: ['Property Address', 'Address', 'address', 'property_address'],
  postcode: ['Post Code', 'Postcode', 'postcode', 'PostCode', 'post_code'],
  occupants: ['Number of Tenants', 'Tenants', 'Occupants', 'occupants', 'num_tenants', 'Number of Occupants'],
  households: ['Number of Households', 'Households', 'households', 'num_households'],
  shared: ['Sharing Facilities', 'Shared', 'shared_facilities', 'Shared Facilities'],
  borough: ['Borough', 'borough', 'Local Authority'],
  ward: ['Ward', 'ward'],
  licenceType: ['Licence Type', 'License Type', 'licence_type'],
  licenceApplied: ['Licence Applied', 'License Applied'],
  licenceExpiry: ['Licence Expiry', 'License Expiry', 'Expiry'],
  licenceRequired: ['Licence Required', 'License Required'],
  branch: ['Branch', 'branch'],
  notes: ['Notes', 'notes'],
  service: ['Service', 'service'],
};

function findColumn(headers, aliases) {
  for (const alias of aliases) {
    const found = headers.find(h => h.trim().toLowerCase() === alias.toLowerCase());
    if (found) return found;
  }
  return null;
}

function mapRow(row, headerMap) {
  const mapped = {};
  for (const [key, headerName] of Object.entries(headerMap)) {
    if (headerName && row[headerName] !== undefined) {
      mapped[key] = String(row[headerName]).trim();
    } else {
      mapped[key] = '';
    }
  }
  // Parse boolean shared field
  if (mapped.shared) {
    const v = mapped.shared.toLowerCase();
    mapped.shared = v === 'yes' || v === 'true' || v === '1';
  } else {
    mapped.shared = false;
  }
  // Parse numeric fields
  mapped.occupants = parseInt(mapped.occupants) || 0;
  mapped.households = parseInt(mapped.households) || 0;
  return mapped;
}

function detectFileyFormat(headers) {
  const fileyHeaders = ['Property Address', 'Post Code', 'Service', 'Number of Tenants', 'Borough', 'Licence Required', 'Licence Type'];
  const matched = fileyHeaders.filter(fh => headers.some(h => h.trim() === fh));
  return matched.length >= 4;
}

export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in CSV file.'));
            return;
          }
          const headers = results.meta.fields || [];
          const isFiley = detectFileyFormat(headers);
          const headerMap = {};
          for (const [key, aliases] of Object.entries(COLUMN_MAP)) {
            headerMap[key] = findColumn(headers, aliases);
          }
          const rows = results.data.map(row => mapRow(row, headerMap));
          resolve({ rows, headers, isFileyFormat: isFiley, totalRows: rows.length });
        },
        error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          if (!data || data.length === 0) {
            reject(new Error('No data found in spreadsheet.'));
            return;
          }
          const headers = Object.keys(data[0]);
          const isFiley = detectFileyFormat(headers);
          const headerMap = {};
          for (const [key, aliases] of Object.entries(COLUMN_MAP)) {
            headerMap[key] = findColumn(headers, aliases);
          }
          const rows = data.map(row => mapRow(row, headerMap));
          resolve({ rows, headers, isFileyFormat: isFiley, totalRows: rows.length });
        } catch (err) {
          reject(new Error(`Spreadsheet parse error: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file type. Please upload .csv, .xlsx, or .xls'));
    }
  });
}

export function exportToCSV(results) {
  const headers = ['Address', 'Postcode', 'Borough', 'Ward', 'Occupants', 'Households', 'Shared', 'Licence Required', 'Licence Type', 'Confidence', 'Status', 'Notes'];
  const rows = results.map(r => [
    r.address || '', r.postcode || '', r.borough || '', r.ward || '',
    r.occupants || '', r.households || '', r.shared ? 'Yes' : 'No',
    r.licenceRequired || '', r.licenceTypes || '', r.confidence || '',
    r.status || '', r.notes || ''
  ]);
  const csv = Papa.unparse({ fields: headers, data: rows });
  return csv;
}

export function generateTemplate() {
  return Papa.unparse({
    fields: ['Property Address', 'Post Code', 'Number of Tenants', 'Number of Households', 'Sharing Facilities', 'Branch', 'Notes'],
    data: [
      ['10 Example Road, London', 'N16 8SR', '3', '2', 'Yes', 'Hackney', ''],
      ['42 Test Street, London', 'N14 4RU', '1', '1', 'No', 'Enfield', ''],
    ]
  });
}
