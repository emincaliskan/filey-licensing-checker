const STATUS_STYLES = {
  green: { bg: 'bg-green-600', text: 'text-white', label: 'LICENSED' },
  red: { bg: 'bg-red-600', text: 'text-white', label: 'LICENCE REQUIRED' },
  grey: { bg: 'bg-gray-400', text: 'text-white', label: 'NOT REQUIRED' },
  amber: { bg: 'bg-amber-500', text: 'text-white', label: 'APPLICATION PENDING' },
  exempt: { bg: 'bg-indigo-500', text: 'text-white', label: 'EXEMPT' },
};

export default function StatusBadge({ verdictColor, verdictText, size = 'large' }) {
  const style = STATUS_STYLES[verdictColor] || STATUS_STYLES.grey;

  if (size === 'small') {
    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {verdictText || style.label}
      </span>
    );
  }

  return (
    <div className={`rounded-xl p-6 text-center shadow-lg ${style.bg} ${style.text}`}>
      <h2 className="text-2xl font-bold">{verdictText || style.label}</h2>
    </div>
  );
}
