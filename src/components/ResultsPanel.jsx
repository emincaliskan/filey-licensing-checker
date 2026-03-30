import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import LicenceCard from './LicenceCard.jsx';
import ConfidenceBadge from './ConfidenceBadge.jsx';
import VerificationPanel from './VerificationPanel.jsx';
import UserConfirmation from './UserConfirmation.jsx';
import ReasoningPanel from './ReasoningPanel.jsx';
import AdvisoryNotes from './AdvisoryNotes.jsx';

export default function ResultsPanel({ results, addressData, propertyConfig, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    const lines = [
      'FILEY PROPERTIES — LICENSING CHECK REPORT',
      `Date: ${new Date().toLocaleDateString('en-GB')}`,
      '',
      `Address: ${addressData.fullAddress || addressData.postcode}`,
      `Borough: ${results.boroughFullName || results.borough}`,
      `Ward: ${results.ward}`,
      `Region: ${results.region || ''}`,
      `Occupants: ${propertyConfig.num_occupants}`,
      `Households: ${propertyConfig.num_households}`,
      `Shared Facilities: ${propertyConfig.shares_facilities ? 'Yes' : 'No'}`,
      '',
      `VERDICT: ${results.verdictText}`,
      '',
    ];

    if (results.licences.length > 0) {
      lines.push('LICENCE REQUIREMENTS');
      for (const licence of results.licences) {
        lines.push(`  ${licence.type} Licence`);
        lines.push(`    Status: ${licence.statusLabel}`);
        lines.push(`    Scope: ${licence.scope}`);
        lines.push('');
      }
    }

    if (results.reasoning) {
      lines.push('REASONING');
      for (const step of results.reasoning) {
        lines.push(`  ${step}`);
      }
      lines.push('');
    }

    lines.push('Disclaimer: This report provides guidance only. Always verify with the relevant council.');

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      <StatusBadge verdictColor={results.verdictColor} verdictText={results.verdictText} size="large" />

      <div className="text-center text-sm text-gray-500 space-y-2">
        <div>
          {results.borough}
          {results.ward && <span> &middot; Ward hint: {results.ward}</span>}
          {results.region === 'Non-London' && <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">Non-London</span>}
        </div>
        <ConfidenceBadge confidence={results.confidence} />
      </div>

      {/* Verification Panel */}
      <VerificationPanel verificationsNeeded={results.verificationsNeeded} wardHint={results.ward} />

      {/* User Confirmation */}
      {results.verificationsNeeded?.length > 0 && addressData?.postcode && (
        <div className="space-y-3">
          {results.verificationsNeeded.map((v, i) => (
            <UserConfirmation
              key={i}
              postcode={addressData.postcode}
              borough={results.borough}
              verificationType={v.type}
            />
          ))}
        </div>
      )}

      {/* Warnings */}
      {results.warnings && results.warnings.length > 0 && (
        <div className="space-y-2">
          {results.warnings.map((w, i) => (
            <div key={i} className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm font-medium">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}

      {/* Licence Cards */}
      {results.licences.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-charcoal mb-3">Applicable Licences</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {results.licences.map((licence, i) => (
              <LicenceCard key={i} licence={licence} />
            ))}
          </div>
        </div>
      )}

      {/* Reasoning Panel */}
      <ReasoningPanel reasoning={results.reasoning} warnings={results.warnings} />

      {/* Advisory Notes */}
      <AdvisoryNotes notes={results.advisoryNotes} />

      {/* Council Link */}
      {results.councilUrl && (
        <a
          href={results.councilUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm hover:bg-green-100 transition-colors"
        >
          Visit {results.borough} council's licensing page for the latest information →
        </a>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          onClick={handleCopyToClipboard}
          className="px-5 py-2.5 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Report to Clipboard'}
        </button>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Print
        </button>
        <button
          onClick={onReset}
          className="px-5 py-2.5 bg-filey-green text-white rounded-lg font-medium hover:bg-filey-green-dark transition-colors"
        >
          Check Another Property
        </button>
      </div>
    </div>
  );
}
