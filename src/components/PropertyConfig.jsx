import { useState } from 'react';

const PROPERTY_TYPES = [
  { value: 'house', label: 'House (whole dwelling)' },
  { value: 'flat_purpose_built', label: 'Flat (in a purpose-built block)' },
  { value: 'flat_converted', label: 'Flat (in a converted house)' },
  { value: 'bedsit', label: 'Bedsit / room in shared house' },
  { value: 'commercial_residential', label: 'Commercial with residential above' },
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
    property_type: '',
    num_occupants: '',
    num_households: '',
    shares_facilities: '',
    tenancy_type: '',
    is_section_257: false,
    is_three_storeys: false,
    pre_1991_conversion: false,
    managed_by_agent: false,
    accredited_landlord: false,
    epc_abc: false,
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
    config.property_type && config.num_occupants && config.num_households && config.tenancy_type;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-navy mb-1">Step 2: Property Configuration</h2>
      <p className="text-sm text-gray-500 mb-4">
        Tell us about the property and how it will be occupied.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Type */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Property Type</legend>
          <div className="space-y-2">
            {PROPERTY_TYPES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="property_type"
                  value={value}
                  checked={config.property_type === value}
                  onChange={(e) => handleChange('property_type', e.target.value)}
                  className="text-filey-blue focus:ring-filey-blue"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Occupancy Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of occupants
            </label>
            <select
              value={config.num_occupants}
              onChange={(e) => handleChange('num_occupants', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-blue focus:border-filey-blue"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-blue focus:border-filey-blue"
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
              Share facilities (kitchen/bathroom)?
            </label>
            <select
              value={config.shares_facilities}
              onChange={(e) => handleChange('shares_facilities', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-filey-blue focus:border-filey-blue"
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
                  className="text-filey-blue focus:ring-filey-blue"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Additional Flags */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Additional Flags</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { field: 'is_section_257', label: 'Property has been converted into self-contained flats (Section 257 HMO)' },
              { field: 'is_three_storeys', label: 'Property is 3+ storeys' },
              { field: 'pre_1991_conversion', label: 'Converted before 1991, does not meet Building Regulations' },
              { field: 'managed_by_agent', label: 'Managed by a letting agent (not self-managed by landlord)' },
              { field: 'accredited_landlord', label: 'Landlord is a member of an accreditation scheme (NRLA, LLAS, etc.)' },
              { field: 'epc_abc', label: 'Property has EPC rating of A, B, or C' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config[field]}
                  onChange={(e) => handleChange(field, e.target.checked)}
                  className="mt-0.5 text-filey-blue focus:ring-filey-blue rounded"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
        >
          Check Licensing Requirements
        </button>
      </form>
    </div>
  );
}
