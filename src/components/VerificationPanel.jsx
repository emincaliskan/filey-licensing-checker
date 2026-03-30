export default function VerificationPanel({ verificationsNeeded, wardHint }) {
  if (!verificationsNeeded || verificationsNeeded.length === 0) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-5 space-y-4">
      <div>
        <h3 className="font-bold text-amber-800 text-lg">Verification Required</h3>
        <p className="text-amber-700 text-sm mt-1">
          This borough has ward-specific licensing. We cannot reliably determine from a postcode
          alone whether this property is in the designated area, due to the 2022 ward boundary changes.
        </p>
      </div>

      {wardHint && (
        <p className="text-xs text-amber-600 bg-amber-100 rounded px-3 py-2">
          Postcodes.io suggests ward "<strong>{wardHint}</strong>" — but this may not match the
          council's designation boundaries.
        </p>
      )}

      {verificationsNeeded.map((v, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border border-amber-200">
          <p className="text-sm font-semibold text-charcoal mb-2">
            {v.type} Licensing — {v.borough}
          </p>
          {v.checker && (
            <>
              <a
                href={v.checker.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Check on {v.borough} Council Website →
              </a>
              <p className="text-xs text-gray-500 mt-2">{v.checker.instructions}</p>
              {v.checker.email && (
                <p className="text-xs text-gray-400 mt-1">Or email: {v.checker.email}</p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
