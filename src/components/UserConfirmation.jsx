import { useState } from 'react';
import { saveVerifiedResult } from '../logic/verificationCache.js';

export default function UserConfirmation({ postcode, borough, verificationType, onConfirm }) {
  const [confirmed, setConfirmed] = useState(null);
  const [notes, setNotes] = useState('');

  const handleConfirm = (required) => {
    const result = {
      borough,
      [`${verificationType.toLowerCase().replace(/\s/g, '_')}Required`]: required,
      verifiedBy: 'User (council tool)',
      notes,
    };
    saveVerifiedResult(postcode, result);
    setConfirmed(required);
    if (onConfirm) onConfirm(required);
  };

  if (confirmed !== null) {
    return (
      <div className={`p-3 rounded-lg text-sm ${confirmed ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
        Confirmed: {verificationType} {confirmed ? 'IS required' : 'is NOT required'} for {postcode}.
        {notes && <span className="block text-xs mt-1">Notes: {notes}</span>}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
      <p className="text-sm font-medium text-charcoal">
        After checking the council website, does this property require a {verificationType} licence?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handleConfirm(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Yes, licence required
        </button>
        <button
          onClick={() => handleConfirm(false)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          No, not required
        </button>
        <button
          onClick={() => handleConfirm(null)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
        >
          Still unsure
        </button>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-filey-green focus:border-filey-green"
      />
    </div>
  );
}
