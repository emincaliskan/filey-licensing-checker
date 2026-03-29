import { useState } from 'react';
import { lookupMultiplePostcodes } from '../logic/postcodeApi.js';
import { checkLicensing, findBorough } from '../logic/licenceChecker.js';

const VERDICT_COLORS = {
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  grey: 'bg-gray-100 text-gray-700',
};

export default function BulkCheck() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    setError(null);
    setResults(null);

    const postcodes = input
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (postcodes.length === 0) {
      setError('Please enter at least one postcode.');
      return;
    }

    if (postcodes.length > 50) {
      setError('Maximum 50 postcodes per batch.');
      return;
    }

    setLoading(true);
    try {
      const lookups = await lookupMultiplePostcodes(postcodes);

      const bulkResults = lookups.map((lookup) => {
        if (lookup.error) {
          return { postcode: lookup.postcode, error: lookup.error };
        }

        const borough = findBorough(lookup.borough);
        if (!borough) {
          return {
            postcode: lookup.postcode,
            borough: lookup.borough,
            ward: lookup.ward,
            error: 'Borough not supported',
          };
        }

        // Default config for bulk — single household, 1 occupant
        const result = checkLicensing({
          borough: lookup.borough,
          ward: lookup.ward,
          num_occupants: 1,
          num_households: 1,
          shares_facilities: false,
          tenancy_type: 'single_household',
          is_section_257: false,
          accredited_landlord: false,
          epc_abc: false,
        });

        return {
          postcode: lookup.postcode,
          borough: lookup.borough,
          ward: lookup.ward,
          verdict: result.verdictText,
          verdictColor: result.verdictColor,
          licences: result.licences.map((l) => l.type).join(', ') || 'None',
        };
      });

      setResults(bulkResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Bulk Postcode Check</h2>
        <p className="text-sm text-gray-500 mt-1">
          Paste up to 50 postcodes (one per line) to get a quick summary. Uses default
          configuration: single household, 1 occupant.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={'N16 8JN\nN15 4QR\nEN1 3PL\nE17 4PP\nN1 2XL'}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green outline-none font-mono text-sm"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !input.trim()}
          className="mt-3 px-6 py-2.5 bg-filey-green text-white rounded-lg font-medium hover:bg-filey-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Checking...' : 'Check All Postcodes'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-charcoal text-white">
              <tr>
                <th className="px-4 py-3 text-sm font-medium">Postcode</th>
                <th className="px-4 py-3 text-sm font-medium">Borough</th>
                <th className="px-4 py-3 text-sm font-medium">Ward</th>
                <th className="px-4 py-3 text-sm font-medium">Verdict</th>
                <th className="px-4 py-3 text-sm font-medium">Licences</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium font-mono">{r.postcode}</td>
                  <td className="px-4 py-3 text-sm">{r.borough || '—'}</td>
                  <td className="px-4 py-3 text-sm">{r.ward || '—'}</td>
                  <td className="px-4 py-3">
                    {r.error ? (
                      <span className="text-red-600 text-xs">{r.error}</span>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${VERDICT_COLORS[r.verdictColor] || ''}`}
                      >
                        {r.verdict}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.licences || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
