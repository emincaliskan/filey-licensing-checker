import { useState } from 'react';

export default function ReasoningPanel({ reasoning, warnings }) {
  const [expanded, setExpanded] = useState(false);

  if (!reasoning || reasoning.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-charcoal">Decision Reasoning</h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-100">
          {warnings && warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium">
                  ⚠ {w}
                </div>
              ))}
            </div>
          )}
          <ol className="mt-3 space-y-2 text-sm text-gray-700">
            {reasoning.map((step, i) => (
              <li key={i} className={`py-1.5 px-3 rounded ${
                step.startsWith('✓') ? 'bg-green-50 text-green-800' :
                step.startsWith('✗') ? 'bg-gray-50 text-gray-500' :
                step.startsWith('→') ? 'bg-filey-green/10 text-charcoal font-semibold' :
                step.startsWith('—') ? 'bg-gray-50 text-gray-500' :
                ''
              }`}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
