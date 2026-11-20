import React from 'react';
import { MapPin } from 'lucide-react';

const COMMON_CITIES = [
  'All Cities',
  'Delhi',
  'Jaipur',
  'Mumbai',
  'Bangalore',
  'Lucknow',
  'Pune',
  'Chandigarh',
];

const CityFilterBar = ({
  selectedCity,
  onCitySelect,
  availableCities = [],
  title = 'Filter by City',
}) => {
  // Combine custom available cities with standard list
  const displayCities = [
    'All Cities',
    ...new Set([
      ...COMMON_CITIES.filter((c) => c !== 'All Cities'),
      ...(availableCities || []),
    ]),
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1 flex-shrink-0">
        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
        <span>{title}:</span>
      </div>

      <div className="flex items-center gap-1.5">
        {displayCities.map((city) => {
          const isSelected =
            (city === 'All Cities' && (!selectedCity || selectedCity === 'all')) ||
            selectedCity?.toLowerCase() === city.toLowerCase();

          return (
            <button
              key={city}
              onClick={() => onCitySelect(city === 'All Cities' ? 'all' : city)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {city}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CityFilterBar;
