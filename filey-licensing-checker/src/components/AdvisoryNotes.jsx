export default function AdvisoryNotes({ notes, upcomingChanges, penalties }) {
  return (
    <div className="space-y-4">
      {/* Upcoming Changes */}
      {upcomingChanges && upcomingChanges.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Upcoming Changes</h4>
          <ul className="space-y-2 text-sm text-yellow-700">
            {upcomingChanges.map((change, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-500 mt-0.5">&#9679;</span>
                <span>{change.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Advisory Notes */}
      {notes && notes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Advisory Notes</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            {notes.map((note, i) => (
              <li key={i} className="flex gap-2">
                <span
                  className={`mt-0.5 ${note.type === 'warning' ? 'text-red-500' : note.type === 'exemption' ? 'text-green-500' : 'text-blue-500'}`}
                >
                  {note.type === 'warning' ? '!' : note.type === 'exemption' ? '\u2713' : '\u2139'}
                </span>
                <span>{note.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Penalties */}
      {penalties && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Penalties for Non-Compliance</h4>
          <p className="text-sm text-red-700">{penalties.description}</p>
          {penalties.other && penalties.other.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-red-600">
              {penalties.other.map((p, i) => (
                <li key={i}>&#8226; {p}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
