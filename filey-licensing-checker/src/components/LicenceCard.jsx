export default function LicenceCard({ licence }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    coming_into_force: 'bg-yellow-100 text-yellow-800',
    not_active: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-navy text-lg">{licence.type} Licence</h3>
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

        {licence.start_date && (
          <div className="flex gap-6">
            <div>
              <span className="text-gray-500">Start: </span>
              <span className="font-medium">
                {new Date(licence.start_date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            {licence.end_date && (
              <div>
                <span className="text-gray-500">End: </span>
                <span className="font-medium">
                  {new Date(licence.end_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Fee */}
        <div className="bg-gray-50 rounded-lg p-3">
          {licence.fee.baseFee !== null ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-gray-500">Standard Fee: </span>
                <span className="font-bold text-lg text-navy">
                  £{licence.fee.baseFee.toLocaleString()}
                </span>
              </div>
              {licence.fee.appliedDiscounts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {licence.fee.appliedDiscounts.map((d, i) => (
                    <div key={i} className="text-green-700 text-xs">
                      -{' '}£{d.amount} ({d.reason})
                    </div>
                  ))}
                  <div className="pt-1 border-t border-gray-200 flex items-baseline gap-2">
                    <span className="text-gray-500">Your Fee: </span>
                    <span className="font-bold text-lg text-green-700">
                      £{licence.fee.finalFee.toLocaleString()}
                    </span>
                    <span className="text-xs text-green-600">
                      (saving £{licence.fee.discountAmount})
                    </span>
                  </div>
                </div>
              )}
              {licence.fee_notes && (
                <p className="text-xs text-gray-500 mt-1">{licence.fee_notes}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">{licence.fee.feeNote || 'Contact council for current fee'}</p>
          )}
        </div>

        {licence.conditions_summary && (
          <div>
            <span className="text-gray-500">Key Conditions: </span>
            <span className="text-xs">{licence.conditions_summary}</span>
          </div>
        )}

        {licence.application_url && (
          <a
            href={licence.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 bg-filey-blue text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Apply Now &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
