import React from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password';
  value: string | number;
  onChange: (value: string | number) => void;
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
          const newValue = type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
          onChange(newValue);
        }}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all duration-200 hover:border-emerald-400"
      />
    </div>
  );
}
