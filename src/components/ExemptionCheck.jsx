import EXEMPTIONS from '../data/exemptions.js';

export default function ExemptionCheck({ selectedExemptions, onExemptionsChange }) {
  const hasAny = selectedExemptions.length > 0;

  const toggleExemption = (id) => {
    if (selectedExemptions.includes(id)) {
      onExemptionsChange(selectedExemptions.filter(e => e !== id));
    } else {
      onExemptionsChange([...selectedExemptions, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-charcoal mb-1">Exemption Screening</h2>
      <p className="text-sm text-gray-500 mb-4">
        Check any that apply. Exempt properties may not need a licence.
      </p>

      <div className="space-y-3">
        {EXEMPTIONS.map((ex) => (
          <label key={ex.id} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedExemptions.includes(ex.id)}
              onChange={() => toggleExemption(ex.id)}
              className="mt-0.5 text-filey-green focus:ring-filey-green rounded"
            />
            <div>
              <span className="text-sm font-medium text-charcoal">{ex.label}</span>
              <span className="block text-xs text-gray-400">{ex.description}</span>
            </div>
          </label>
        ))}
      </div>

      {hasAny && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 text-sm">
          This property may be exempt from licensing. The check will flag it as potentially exempt — verify with the council.
        </div>
      )}
    </div>
  );
}
