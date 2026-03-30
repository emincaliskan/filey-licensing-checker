import ConfidenceBadge from './ConfidenceBadge.jsx';

export default function LicenceCard({ licence }) {
  const statusColors = {
    national: 'bg-red-100 text-red-800',
    council_scheme: 'bg-filey-green/10 text-charcoal',
    active: 'bg-green-100 text-green-800',
    coming_into_force: 'bg-yellow-100 text-yellow-800',
    not_active: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-charcoal text-lg">{licence.type} Licence</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[licence.status] || statusColors.active}`}
        >
          {licence.statusLabel}
        </span>
      </div>
      <div className="px-5 py-4 space-y-3 text-sm">
        <div>
          <span className="text-gray-500">Scope: </span>
          <span className="font-medium">{licence.scope}</span>
        </div>
        <div>
          <span className="text-gray-500">Description: </span>
          <span>{licence.description}</span>
        </div>
        {licence.fee && (
          <div>
            <span className="text-gray-500">Fee: </span>
            <span className="font-medium">£{licence.fee.toLocaleString()}</span>
          </div>
        )}
        {licence.confidence && (
          <div className="pt-1">
            <ConfidenceBadge confidence={licence.confidence} size="small" />
          </div>
        )}
      </div>
    </div>
  );
}
