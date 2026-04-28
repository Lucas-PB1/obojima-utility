import React from 'react';
import { ChevronDown } from 'lucide-react';

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

export function Select({
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
        <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 pr-10 border border-transparent rounded-lg bg-[var(--input-bg)] text-foreground shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-soft)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.28),var(--shadow-soft)] focus:outline-none focus:ring-4 focus:ring-totoro-blue/15 focus:shadow-[inset_0_0_0_1px_var(--totoro-blue),var(--shadow-soft)] appearance-none cursor-pointer"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none'
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-totoro-blue" />
        </div>
      </div>
    </div>
  );
}
