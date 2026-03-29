import { useState, useEffect } from 'react';

const VERDICT_COLORS = {
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
};

export default function RecentChecks() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('filey_checks') || '[]');
      setHistory(stored);
    } catch {
      setHistory([]);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('filey_checks');
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold text-charcoal mb-2">Recent Checks</h2>
        <p>No checks yet. Use the Check Property tab to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-charcoal">Recent Checks</h2>
        <button
          onClick={clearHistory}
          className="text-sm text-red-600 hover:text-red-800 hover:underline"
        >
          Clear History
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Postcode</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Borough</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ward</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(entry.date).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-charcoal">{entry.postcode}</td>
                <td className="px-4 py-3 text-sm">{entry.borough}</td>
                <td className="px-4 py-3 text-sm">{entry.ward}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${VERDICT_COLORS[entry.verdictColor] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {entry.verdict}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
