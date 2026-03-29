import { useState } from 'react';
import { lookupPostcode } from '../logic/postcodeApi.js';
import { findBorough, getSupportedBoroughs } from '../logic/licenceChecker.js';

export default function AddressSearch({ onAddressResolved }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResolvedAddress(null);

    try {
      // Extract postcode from input (last part if full address, or entire input)
      const postcodeMatch = input.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
      const postcode = postcodeMatch ? postcodeMatch[0] : input.trim();

      const data = await lookupPostcode(postcode);

      // Check if the borough is supported
      const borough = findBorough(data.borough);
      if (!borough) {
        const supported = getSupportedBoroughs();
        setError(
          `This borough (${data.borough}) is not yet covered. Supported boroughs: ${supported.join(', ')}`
        );
        setLoading(false);
        return;
      }

      setResolvedAddress(data);
      onAddressResolved(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-navy mb-1">Step 1: Enter Property Address</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter a UK postcode (e.g., N16 8JN) or full address to identify the borough and ward.
      </p>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter postcode or address (e.g., N16 8JN)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-blue focus:border-filey-blue outline-none text-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-filey-blue text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Looking up...
            </span>
          ) : (
            'Look Up'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {resolvedAddress && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Postcode</span>
              <span className="font-semibold text-navy">{resolvedAddress.postcode}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Borough</span>
              <span className="font-semibold text-navy">{resolvedAddress.borough}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Ward</span>
              <span className="font-semibold text-navy">{resolvedAddress.ward}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Coordinates</span>
              <span className="font-semibold text-navy text-xs">
                {resolvedAddress.latitude?.toFixed(4)}, {resolvedAddress.longitude?.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
