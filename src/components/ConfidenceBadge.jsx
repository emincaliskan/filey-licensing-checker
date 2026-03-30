const BADGE_STYLES = {
  high: { bg: 'bg-green-100 text-green-800 border-green-300', icon: '✓', label: 'Confirmed' },
  medium: { bg: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '~', label: 'Likely' },
  verify: { bg: 'bg-orange-100 text-orange-800 border-orange-300', icon: '?', label: 'Verify with Council' },
  low: { bg: 'bg-red-100 text-red-800 border-red-300', icon: '!', label: 'Unverified Estimate' },
};

export default function ConfidenceBadge({ confidence, size = 'normal' }) {
  const style = BADGE_STYLES[confidence] || BADGE_STYLES.low;

  if (size === 'small') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg}`}>
        {style.icon} {style.label}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${style.bg}`}>
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </div>
  );
}
