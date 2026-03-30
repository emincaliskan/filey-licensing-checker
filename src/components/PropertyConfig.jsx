import { useState } from 'react';

const BRANCHES = [
  { value: 'hackney', label: 'Hackney' },
  { value: 'lancaster', label: 'Lancaster' },
  { value: 'enfield', label: 'Enfield' },
  { value: 'edmonton', label: 'Edmonton' },
  { value: 'southgate', label: 'Southgate' },
];

const SERVICE_TYPES = [
  { value: 'guaranteed_rent', label: 'Guaranteed Rent' },
  { value: 'management', label: 'Management' },
  { value: 'other', label: 'Other' },
];

const TENANCY_TYPES = [
  { value: 'single_household', label: 'Single household / family let' },
  { value: 'professional_sharers', label: 'Professional sharers (2 unrelated individuals)' },
  { value: 'hmo', label: 'HMO (3+ unrelated individuals sharing)' },
  { value: 'student_let', label: 'Student let' },
  { value: 'company_let', label: 'Company let' },
];

export default function PropertyConfig({ onSubmit }) {
  const [config, setConfig] = useState({
    branch: '',
    service_type: '',
    num_occupants: '',
    num_households: '',
    shares_facilities: '',
    tenancy_type: '',
  });

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...config,
      num_occupants: parseInt(config.num_occupants) || 1,
      num_households: parseInt(config.num_households) || 1,
      shares_facilities: config.shares_facilities === 'yes',
    });
  };

  const isValid =
    config.num_occupants && config.num_households && config.tenancy_type && config.shares_facilities;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-charcoal mb-1">Step 2: Property Configuration</h2>
      <p className="text-sm text-gray-500 mb-4">
        Tell us about the property and how it will be occupied.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch & Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch (optional)</label>
            <select
              value={config.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green"
            >
              <option value="">Select branch...</option>
              {BRANCHES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type (optional)</label>
            <select
              value={config.service_type}
              onChange={(e) => handleChange('service_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green"
            >
              <option value="">Select service...</option>
              {SERVICE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Occupancy Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of occupants
            </label>
            <select
              value={config.num_occupants}
              onChange={(e) => handleChange('num_occupants', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green"
            >
              <option value="">Select...</option>
              {[1, 2, 3, 4, 5, 6, 7, '8+'].map((n) => (
                <option key={n} value={n === '8+' ? 8 : n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of households
            </label>
            <select
              value={config.num_households}
              onChange={(e) => handleChange('num_households', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green"
            >
              <option value="">Select...</option>
              {[1, 2, 3, 4, '5+'].map((n) => (
                <option key={n} value={n === '5+' ? 5 : n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share facilities?
              <span className="block text-xs text-gray-400 font-normal">bathroom, kitchen, or toilet shared between tenants from different households</span>
            </label>
            <select
              value={config.shares_facilities}
              onChange={(e) => handleChange('shares_facilities', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-green focus:border-filey-green"
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Tenancy Type */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Tenancy Type</legend>
          <div className="space-y-2">
            {TENANCY_TYPES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tenancy_type"
                  value={value}
                  checked={config.tenancy_type === value}
                  onChange={(e) => handleChange('tenancy_type', e.target.value)}
                  className="text-filey-green focus:ring-filey-green"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3 bg-filey-green text-white rounded-lg font-medium hover:bg-filey-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
        >
          Check Licensing Requirements
        </button>
      </form>
    </div>
  );
}
