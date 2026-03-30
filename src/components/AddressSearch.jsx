import { useState } from 'react';
import { lookupPostcode } from '../logic/postcodeApi.js';
import { findBorough, getSupportedBoroughs } from '../logic/licenceChecker.js';

export default function AddressSearch({ onAddressResolved }) {
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResolvedAddress(null);

    try {
      // Extract postcode from input
      const postcodeMatch = postcode.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
      const pc = postcodeMatch ? postcodeMatch[0] : postcode.trim();

      const data = await lookupPostcode(pc);

      const borough = findBorough(data.borough);
      if (!borough) {
        const supported = getSupportedBoroughs();
        setError(
          `This borough (${data.borough}) is not yet covered. Supported boroughs: ${supported.join(', ')}`
        );
        setLoading(false);
        return;
      }

      const resolved = {
        ...data,
        fullAddress: address || `${pc}, ${data.borough}`,
      };
      setResolvedAddress(resolved);
      onAddressResolved(resolved);
    } catch (err) {
      setError(err.message || 'Postcode not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-charcoal mb-1">Step 1: Enter Property Details</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter the property postcode. The borough will be identified automatically.
      </p>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Postcode (required)</label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. N16 8JN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green outline-none text-lg font-mono"
              autoFocus
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !postcode.trim()}
              className="px-6 py-3 bg-filey-green text-white rounded-lg font-medium hover:bg-filey-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Looking up...
                </span>
              ) : (
                'Look Up'
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Full address (optional — for records)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 10 Example Road, London"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green outline-none text-sm"
          />
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {resolvedAddress && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Postcode</span>
              <span className="font-semibold text-charcoal">{resolvedAddress.postcode}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Borough</span>
              <span className="font-semibold text-charcoal">{resolvedAddress.borough}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Ward (hint only)</span>
              <span className="font-semibold text-charcoal text-xs">{resolvedAddress.ward}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Coordinates</span>
              <span className="font-semibold text-charcoal text-xs">
                {resolvedAddress.latitude?.toFixed(4)}, {resolvedAddress.longitude?.toFixed(4)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Ward name is from Postcodes.io and shown for reference only. It is not used for licensing decisions due to 2022 boundary changes.
          </p>
        </div>
      )}
    </div>
  );
}
