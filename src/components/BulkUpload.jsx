import { useState, useRef } from 'react';
import { parseFile, exportToCSV, generateTemplate } from '../logic/fileParser.js';
import { lookupMultiplePostcodes } from '../logic/postcodeApi.js';
import { checkLicensing } from '../logic/licenceChecker.js';
import { saveAs } from 'file-saver';

const STATUS_COLORS = {
  red: 'bg-red-100 text-red-800',
  grey: 'bg-gray-100 text-gray-700',
  exempt: 'bg-indigo-100 text-indigo-800',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-800',
  error: 'bg-red-50 text-red-600',
};

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isFileyFormat, setIsFileyFormat] = useState(false);
  const [filter, setFilter] = useState('all');
  const fileRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const downloadTemplate = () => {
    const csv = generateTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'filey-bulk-check-template.csv');
  };

  const processFile = async () => {
    if (!file) return;
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      setProgress({ current: 0, total: 0, stage: 'Parsing file...' });
      const parsed = await parseFile(file);
      setIsFileyFormat(parsed.isFileyFormat);

      if (parsed.totalRows > 5000) {
        setError('Maximum 5,000 rows supported. Please split your file.');
        setLoading(false);
        return;
      }

      // Extract postcodes for bulk lookup
      const postcodes = parsed.rows.map(r => r.postcode).filter(Boolean);
      const uniquePostcodes = [...new Set(postcodes)];

      setProgress({ current: 0, total: uniquePostcodes.length, stage: 'Looking up postcodes...' });

      // Bulk lookup in chunks of 100
      const postcodeResults = {};
      for (let i = 0; i < uniquePostcodes.length; i += 100) {
        const chunk = uniquePostcodes.slice(i, i + 100);
        try {
          const lookups = await lookupMultiplePostcodes(chunk);
          for (const lookup of lookups) {
            postcodeResults[lookup.postcode?.replace(/\s/g, '').toUpperCase()] = lookup;
          }
        } catch {
          // Mark failed postcodes
          for (const pc of chunk) {
            postcodeResults[pc.replace(/\s/g, '').toUpperCase()] = { error: 'Lookup failed' };
          }
        }
        setProgress({ current: Math.min(i + 100, uniquePostcodes.length), total: uniquePostcodes.length, stage: 'Looking up postcodes...' });
      }

      // Run licence checks
      setProgress({ current: 0, total: parsed.totalRows, stage: 'Checking licensing...' });
      const processedResults = parsed.rows.map((row, idx) => {
        const pcKey = (row.postcode || '').replace(/\s/g, '').toUpperCase();
        const lookup = postcodeResults[pcKey];

        if (!row.postcode) {
          return { ...row, status: 'error', licenceRequired: 'INCOMPLETE', licenceTypes: '', notes: 'Missing postcode', confidence: '' };
        }

        if (!lookup || lookup.error) {
          return { ...row, status: 'error', licenceRequired: 'ERROR', licenceTypes: '', notes: lookup?.error || 'Invalid postcode', confidence: '' };
        }

        const borough = row.borough || lookup.borough;
        const ward = row.ward || lookup.ward;

        const result = checkLicensing({
          borough,
          ward,
          num_occupants: row.occupants || 1,
          num_households: row.households || 1,
          shares_facilities: row.shared || false,
          tenancy_type: row.households > 1 ? 'hmo' : 'single_household',
          exemptions: [],
        });

        let status = result.verdictColor;
        let mismatch = '';
        // Compare with existing data if Filey format
        if (row.licenceRequired) {
          const fileRequired = row.licenceRequired.toLowerCase();
          const calcRequired = result.licences.length > 0 ? 'yes' : 'no';
          if ((fileRequired === 'yes' && calcRequired === 'no') || (fileRequired === 'no' && calcRequired === 'yes')) {
            mismatch = `MISMATCH: Spreadsheet says "${row.licenceRequired}", app calculates "${calcRequired === 'yes' ? 'Yes' : 'No'}"`;
          }
        }

        if (idx % 50 === 0) {
          setProgress({ current: idx, total: parsed.totalRows, stage: 'Checking licensing...' });
        }

        return {
          ...row,
          borough,
          ward,
          status,
          licenceRequired: result.licences.length > 0 ? 'Yes' : 'No',
          licenceTypes: result.licences.map(l => l.type).join(', ') || 'None',
          verdictText: result.verdictText,
          confidence: result.confidence || 'high',
          mismatch,
          notes: [row.notes, mismatch, ...(result.warnings || [])].filter(Boolean).join('; '),
        };
      });

      setResults(processedResults);
      setProgress({ current: parsed.totalRows, total: parsed.totalRows, stage: 'Complete!' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    const csv = exportToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `filey-licensing-check-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredResults = results ? (
    filter === 'all' ? results :
    filter === 'issues' ? results.filter(r => r.mismatch || r.status === 'error') :
    results.filter(r => r.status === filter)
  ) : [];

  const summary = results ? {
    total: results.length,
    required: results.filter(r => r.licenceRequired === 'Yes').length,
    notRequired: results.filter(r => r.licenceRequired === 'No').length,
    errors: results.filter(r => r.status === 'error').length,
    mismatches: results.filter(r => r.mismatch).length,
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Bulk File Upload</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CSV or XLSX file with property data. Max 5,000 rows.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="bg-white rounded-xl shadow-md p-8 border-2 border-dashed border-gray-300 hover:border-filey-green cursor-pointer transition-colors text-center"
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        {file ? (
          <p className="text-charcoal font-medium">{file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span></p>
        ) : (
          <p className="text-gray-500">Drop a CSV or XLSX file here, or click to browse</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={processFile}
          disabled={!file || loading}
          className="px-6 py-2.5 bg-filey-green text-white rounded-lg font-medium hover:bg-filey-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Process File'}
        </button>
        <button
          onClick={downloadTemplate}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Download Template
        </button>
        {results && (
          <button
            onClick={exportResults}
            className="px-6 py-2.5 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors"
          >
            Export Results as CSV
          </button>
        )}
      </div>

      {/* Progress */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{progress.stage}</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-filey-green h-2 rounded-full transition-all"
              style={{ width: `${progress.total ? (progress.current / progress.total * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {isFileyFormat && results && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          Filey format detected — comparing calculated results against existing spreadsheet data.
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">{summary.total}</div>
            <div className="text-xs text-gray-500 uppercase">Total</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.required}</div>
            <div className="text-xs text-gray-500 uppercase">Licence Required</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{summary.notRequired}</div>
            <div className="text-xs text-gray-500 uppercase">Not Required</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
            <div className="text-xs text-gray-500 uppercase">Errors</div>
          </div>
          <div className="bg-amber-50 rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{summary.mismatches}</div>
            <div className="text-xs text-gray-500 uppercase">Mismatches</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {results && (
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'red', label: 'Required' },
            { key: 'grey', label: 'Not Required' },
            { key: 'error', label: 'Errors' },
            { key: 'issues', label: 'Issues Only' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key ? 'bg-filey-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Results Table */}
      {filteredResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal text-white">
              <tr>
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">Address</th>
                <th className="px-3 py-3 font-medium">Postcode</th>
                <th className="px-3 py-3 font-medium">Borough</th>
                <th className="px-3 py-3 font-medium">Ward</th>
                <th className="px-3 py-3 font-medium">Occ.</th>
                <th className="px-3 py-3 font-medium">HH</th>
                <th className="px-3 py-3 font-medium">Required?</th>
                <th className="px-3 py-3 font-medium">Licence Type</th>
                <th className="px-3 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.slice(0, 200).map((r, i) => (
                <tr key={i} className={`hover:bg-gray-50 ${r.mismatch ? 'bg-amber-50' : ''}`}>
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 max-w-xs truncate">{r.address || '—'}</td>
                  <td className="px-3 py-2 font-mono">{r.postcode || '—'}</td>
                  <td className="px-3 py-2">{r.borough || '—'}</td>
                  <td className="px-3 py-2">{r.ward || '—'}</td>
                  <td className="px-3 py-2 text-center">{r.occupants || '—'}</td>
                  <td className="px-3 py-2 text-center">{r.households || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || ''}`}>
                      {r.licenceRequired}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.licenceTypes || '—'}</td>
                  <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResults.length > 200 && (
            <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
              Showing first 200 of {filteredResults.length} results. Export to CSV for full data.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
