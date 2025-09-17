import React from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password';
  value: string | number | '';
  onChange: (value: string | number | '') => void;
  placeholder?: string;
  label?: string;
  className?: string;
  min?: number;
  max?: number;
}

export default function Input({ 
  type = 'text',
  value, 
  onChange, 
  placeholder = '', 
  label,
  className = '',
  min,
  max
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-emerald-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (type === 'number') {
            const value = e.target.value;
            if (value === '') {
              onChange('');
            } else {
              const numValue = parseInt(value);
              onChange(isNaN(numValue) ? 0 : numValue);
            }
          } else {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 shadow-sm transition-all duration-200 hover:border-emerald-400"
        style={{
          color: '#111827', // text-gray-900
          backgroundColor: '#ffffff', // bg-white
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
      />
    </div>
  );
}
