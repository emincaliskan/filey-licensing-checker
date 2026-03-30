export default function AdvisoryNotes({ notes }) {
  if (!notes || notes.length === 0) return null;

  const typeStyles = {
    warning: 'bg-red-50 border-red-200 text-red-700',
    exemption: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    info: 'bg-gray-50 border-gray-200 text-gray-700',
    link: 'bg-green-50 border-green-200 text-green-700',
  };

  const typeIcons = {
    warning: '!',
    exemption: '\u2713',
    info: '\u2139',
    link: '\u2192',
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-charcoal text-sm">Advisory Notes</h4>
      {notes.map((note, i) => (
        <div
          key={i}
          className={`p-3 border rounded-lg text-sm flex gap-2 ${typeStyles[note.type] || typeStyles.info}`}
        >
          <span className="font-bold">{typeIcons[note.type] || '\u2139'}</span>
          <span>
            {note.type === 'link' && note.url ? (
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                {note.text}
              </a>
            ) : (
              note.text
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
