import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  icon?: string;
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  className?: string;
}

export default function RadioGroup({ 
  value, 
  onChange, 
  options, 
  label,
  className = ''
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-rose-400 mb-2">
          {label}
        </label>
      )}
      <div className="flex space-x-4">
        {options.map(option => (
          <label key={option.value} className="flex items-center">
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mr-2 text-rose-400 focus:ring-rose-300"
            />
            <span className="text-rose-400">
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
