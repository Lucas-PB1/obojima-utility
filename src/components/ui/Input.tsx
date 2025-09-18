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
        <label className="block text-sm font-medium text-rose-400 mb-2">
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
        className="w-full p-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 hover:border-rose-300"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
      />
    </div>
  );
}
