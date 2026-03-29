import { useState } from 'react';
import LicenceCard from './LicenceCard.jsx';
import DiscountCalculator from './DiscountCalculator.jsx';
import AdvisoryNotes from './AdvisoryNotes.jsx';
import { generatePdfReport, generatePlainTextReport } from './PdfReport.jsx';

const VERDICT_STYLES = {
  red: 'bg-red-600 text-white',
  amber: 'bg-amber-500 text-white',
  green: 'bg-green-600 text-white',
  blue: 'bg-blue-600 text-white',
  grey: 'bg-gray-500 text-white',
};

export default function ResultsPanel({ results, addressData, propertyConfig, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleDownloadPdf = () => {
    generatePdfReport({ results, addressData, propertyConfig });
  };

  const handleCopyToClipboard = async () => {
    const text = generatePlainTextReport({ results, addressData, propertyConfig });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      <div
        className={`rounded-xl p-6 text-center shadow-lg ${VERDICT_STYLES[results.verdictColor] || VERDICT_STYLES.grey}`}
      >
        <h2 className="text-2xl font-bold">{results.verdictText}</h2>
        <p className="mt-1 opacity-90 text-sm">
          {results.borough} &middot; {results.ward} ward
        </p>
      </div>

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

      {/* Discounts */}
      <DiscountCalculator licences={results.licences} />

      {/* Advisory Notes */}
      <AdvisoryNotes
        notes={results.advisoryNotes}
        upcomingChanges={results.upcomingChanges}
        penalties={results.penalties}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          onClick={handleDownloadPdf}
          className="px-5 py-2.5 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors"
        >
          Download Report as PDF
        </button>
        <button
          onClick={handleCopyToClipboard}
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
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
