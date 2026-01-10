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

export function RadioGroup({ value, onChange, options, label, className = '' }: RadioGroupProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-totoro-gray mb-2">{label}</label>}
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center min-w-fit">
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mr-2 text-totoro-blue focus:ring-totoro-blue"
            />
            <span className="text-totoro-gray">
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
