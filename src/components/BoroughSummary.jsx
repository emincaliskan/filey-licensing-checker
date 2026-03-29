import boroughsData from '../data/boroughs.json';

function formatDate(dateStr) {
  if (!dateStr) return 'TBC';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SchemeStatus({ scheme, label }) {
  if (!scheme) return <td className="px-3 py-2 text-xs text-gray-400">N/A</td>;

  const statusColors = {
    active: 'text-green-700 bg-green-50',
    coming_into_force: 'text-amber-700 bg-amber-50',
    not_active: 'text-gray-500 bg-gray-50',
  };

  return (
    <td className="px-3 py-2 text-xs">
      <span
        className={`inline-block px-2 py-0.5 rounded-full font-medium ${statusColors[scheme.status] || statusColors.active}`}
      >
        {scheme.active ? (scheme.status === 'coming_into_force' ? 'Coming Soon' : 'Active') : 'Not Active'}
      </span>
      <div className="mt-1 text-gray-500">
        {scheme.fee ? `£${scheme.fee.toLocaleString()}` : 'Contact council'}
      </div>
      {scheme.start_date && (
        <div className="text-gray-400">
          {formatDate(scheme.start_date)} – {formatDate(scheme.end_date)}
        </div>
      )}
    </td>
  );
}

export default function BoroughSummary() {
  const boroughs = Object.entries(boroughsData)
    .filter(([key]) => key !== 'metadata')
    .map(([, data]) => data);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Borough Licensing Summary</h2>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all supported boroughs and their current licensing schemes.
          Data last updated: {boroughsData.metadata?.last_updated || 'Unknown'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-charcoal text-white">
            <tr>
              <th className="px-3 py-3 text-sm font-medium">Borough</th>
              <th className="px-3 py-3 text-sm font-medium">Mandatory HMO</th>
              <th className="px-3 py-3 text-sm font-medium">Additional HMO</th>
              <th className="px-3 py-3 text-sm font-medium">Selective</th>
              <th className="px-3 py-3 text-sm font-medium">Upcoming Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {boroughs.map((borough) => (
              <tr key={borough.short_name} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="font-semibold text-charcoal text-sm">{borough.short_name}</div>
                  <a
                    href={borough.council_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-filey-green hover:underline"
                  >
                    Council website
                  </a>
                </td>
                <SchemeStatus scheme={borough.mandatory_hmo} label="Mandatory" />
                <SchemeStatus scheme={borough.additional_hmo} label="Additional" />
                <SchemeStatus scheme={borough.selective} label="Selective" />
                <td className="px-3 py-2 text-xs text-gray-500 max-w-xs">
                  {borough.upcoming_changes && borough.upcoming_changes.length > 0 ? (
                    <ul className="space-y-1">
                      {borough.upcoming_changes.map((change, i) => (
                        <li key={i}>{change.description}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
