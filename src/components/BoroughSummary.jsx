import BOROUGH_DATABASE from '../data/boroughDatabase.js';

export default function BoroughSummary() {
  const boroughs = Object.entries(BOROUGH_DATABASE)
    .filter(([key]) => key !== 'metadata')
    .map(([, data]) => data)
    .sort((a, b) => {
      if (a.region === 'London' && b.region !== 'London') return -1;
      if (a.region !== 'London' && b.region === 'London') return 1;
      return a.short_name.localeCompare(b.short_name);
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Borough Licensing Summary</h2>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all {boroughs.length} supported boroughs and their current licensing schemes.
          Data last updated: {BOROUGH_DATABASE.metadata?.last_updated || 'Unknown'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-charcoal text-white">
            <tr>
              <th className="px-3 py-3 text-sm font-medium">Borough</th>
              <th className="px-3 py-3 text-sm font-medium">Region</th>
              <th className="px-3 py-3 text-sm font-medium">Mandatory HMO</th>
              <th className="px-3 py-3 text-sm font-medium">Additional HMO</th>
              <th className="px-3 py-3 text-sm font-medium">Selective</th>
              <th className="px-3 py-3 text-sm font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {boroughs.map((borough) => (
              <tr key={borough.short_name} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="font-semibold text-charcoal text-sm">{borough.short_name}</div>
                  {borough.councilUrl && (
                    <a
                      href={borough.councilUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-filey-green hover:underline"
                    >
                      Council website
                    </a>
                  )}
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                    borough.region === 'London' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {borough.region}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700">
                    National
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">
                  {borough.additionalHMO?.active ? (
                    <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700">
                      {borough.additionalHMO.coverage === 'borough-wide' ? 'Borough-wide' : 'Designated'}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500">
                      None
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs">
                  {borough.selectiveLicensing?.active ? (
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700">
                        {borough.selectiveLicensing.coverage === 'borough-wide' ? 'Borough-wide' : 'Ward-specific'}
                      </span>
                      {borough.selectiveLicensing.designatedWards?.length > 0 && (
                        <div className="mt-1 text-gray-400 max-w-xs truncate">
                          {borough.selectiveLicensing.designatedWards.join(', ')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500">
                      None
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-gray-500 max-w-xs">
                  {borough.notes || '\u2014'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
