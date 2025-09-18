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
        <label className="block text-sm font-medium text-rose-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 pr-10 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-white text-gray-900 shadow-sm transition-all duration-200 hover:border-rose-300 appearance-none cursor-pointer"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none'
          }}
        >
          {placeholder && (
            <option value="">
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-rose-400"
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
