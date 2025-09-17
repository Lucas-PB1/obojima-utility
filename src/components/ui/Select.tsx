import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function Select({ 
  value, 
  onChange, 
  options, 
  placeholder = '', 
  className = '',
  label 
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 pr-10 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 shadow-sm transition-all duration-200 hover:border-emerald-400 appearance-none cursor-pointer"
          style={{
            color: '#111827', // text-gray-900
            backgroundColor: '#ffffff', // bg-white
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none'
          }}
        >
          {placeholder && (
            <option value="" style={{ color: '#6b7280', backgroundColor: '#ffffff' }}>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              style={{ 
                color: '#111827', 
                backgroundColor: '#ffffff',
                padding: '8px'
              }}
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
