import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AddressSearch from './components/AddressSearch.jsx';
import PropertyConfig from './components/PropertyConfig.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import BoroughSummary from './components/BoroughSummary.jsx';
import RecentChecks from './components/RecentChecks.jsx';
import BulkCheck from './components/BulkCheck.jsx';
import { checkLicensing } from './logic/licenceChecker.js';
import boroughsData from './data/boroughs.json';

function App() {
  const [addressData, setAddressData] = useState(null);
  const [results, setResults] = useState(null);
  const [propertyConfig, setPropertyConfig] = useState(null);
  const location = useLocation();

  const handleAddressResolved = (data) => {
    setAddressData(data);
    setResults(null);
    setPropertyConfig(null);
  };

  const handleCheckLicensing = (config) => {
    setPropertyConfig(config);
    const result = checkLicensing({
      borough: addressData.borough,
      ward: addressData.ward,
      ...config,
    });
    setResults(result);
    saveToHistory(addressData, config, result);
  };

  const handleReset = () => {
    setAddressData(null);
    setResults(null);
    setPropertyConfig(null);
  };

  const saveToHistory = (address, config, result) => {
    try {
      const history = JSON.parse(localStorage.getItem('filey_checks') || '[]');
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        postcode: address.postcode,
        borough: address.borough,
        ward: address.ward,
        verdict: result.verdictText,
        verdictColor: result.verdictColor,
        config,
      };
      history.unshift(entry);
      localStorage.setItem('filey_checks', JSON.stringify(history.slice(0, 20)));
    } catch {
      // localStorage unavailable
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-t-4 border-filey-green shadow-sm no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={handleReset}>
            <div className="w-10 h-10 bg-filey-green rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-7 h-7">
                <path d="M16 7L6 15h3v10h5v-6h4v6h5V15h3L16 7z" fill="white"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl text-charcoal">
                <span className="font-bold">Filey</span>
                <span className="font-light">Properties</span>
              </h1>
              <p className="text-gray-400 text-xs tracking-wide uppercase">Licensing Checker</p>
            </div>
          </Link>
          <nav className="flex gap-1 text-sm font-medium uppercase tracking-wide">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded transition-colors ${location.pathname === '/' ? 'text-filey-green' : 'text-charcoal hover:text-filey-green'}`}
            >
              Check Property
            </Link>
            <Link
              to="/boroughs"
              className={`px-3 py-1.5 rounded transition-colors ${location.pathname === '/boroughs' ? 'text-filey-green' : 'text-charcoal hover:text-filey-green'}`}
            >
              Boroughs
            </Link>
            <Link
              to="/bulk"
              className={`px-3 py-1.5 rounded transition-colors ${location.pathname === '/bulk' ? 'text-filey-green' : 'text-charcoal hover:text-filey-green'}`}
            >
              Bulk Check
            </Link>
            <Link
              to="/history"
              className={`px-3 py-1.5 rounded transition-colors ${location.pathname === '/history' ? 'text-filey-green' : 'text-charcoal hover:text-filey-green'}`}
            >
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route
            path="/"
            element={
              <div className="space-y-6">
                <AddressSearch onAddressResolved={handleAddressResolved} />
                {addressData && !results && (
                  <PropertyConfig onSubmit={handleCheckLicensing} />
                )}
                {results && (
                  <ResultsPanel
                    results={results}
                    addressData={addressData}
                    propertyConfig={propertyConfig}
                    onReset={handleReset}
                  />
                )}
              </div>
            }
          />
          <Route path="/boroughs" element={<BoroughSummary />} />
          <Route path="/bulk" element={<BulkCheck />} />
          <Route path="/history" element={<RecentChecks />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-gray-300 text-xs mt-12 no-print">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-2">
          <p>
            <strong className="text-white">Disclaimer:</strong> This tool provides guidance based on publicly available
            council licensing data. It does not constitute legal advice. Licensing schemes change
            frequently — always verify requirements directly with the relevant council before making
            decisions.
          </p>
          <p>
            Data last updated: {boroughsData.metadata?.last_updated || 'Unknown'}. This tool covers
            selected London boroughs only.
          </p>
          <p className="text-filey-green-light">
            © {new Date().getFullYear()} Filey Properties — Agent 1-L (Licensing Compliance)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
