import { useState, useRef, useEffect } from 'react';
import { searchAddress, reverseGeocode, lookupPostcode } from '../logic/postcodeApi.js';
import { findBorough, getSupportedBoroughs } from '../logic/licenceChecker.js';

export default function AddressSearch({ onAddressResolved }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setHighlightIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await searchAddress(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = async (suggestion) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setInput(suggestion.display_name);
    setError(null);
    setLoading(true);
    setResolvedAddress(null);

    try {
      // Use reverse geocode via postcodes.io to get accurate borough/ward
      const data = await reverseGeocode(suggestion.latitude, suggestion.longitude);

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
        fullAddress: suggestion.display_name,
      };
      setResolvedAddress(resolved);
      onAddressResolved(resolved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResolvedAddress(null);
    setShowSuggestions(false);

    try {
      // Try to extract a postcode from the input as fallback
      const postcodeMatch = input.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
      const postcode = postcodeMatch ? postcodeMatch[0] : input.trim();

      const data = await lookupPostcode(postcode);

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
      setError('Address not found. Try selecting from the suggestions or enter a valid UK postcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-navy mb-1">Step 1: Enter Property Address</h2>
      <p className="text-sm text-gray-500 mb-4">
        Start typing an address to see suggestions, or enter a postcode directly.
      </p>

      <div ref={wrapperRef} className="relative">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="e.g. 10 Amhurst Road, London or N16 8JN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-blue focus:border-filey-blue outline-none text-lg"
              autoFocus
              autoComplete="off"
            />
            {showSuggestions && (
              <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setHighlightIndex(i)}
                    className={`px-4 py-3 cursor-pointer text-sm border-b border-gray-50 last:border-0 ${
                      i === highlightIndex ? 'bg-blue-50 text-navy' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-800 truncate">{s.display_name}</div>
                    {s.postcode && (
                      <span className="text-xs text-gray-400 mt-0.5 block">{s.postcode}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {resolvedAddress && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {resolvedAddress.fullAddress && (
            <p className="text-sm text-navy font-medium mb-3 truncate">
              {resolvedAddress.fullAddress}
            </p>
          )}
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
