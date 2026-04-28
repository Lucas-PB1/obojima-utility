import React from 'react';
import { motion } from 'motion/react';

interface RadioOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
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
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative flex items-center min-w-fit">
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            {value === option.value && (
              <motion.span
                layoutId={`radio-active-${label || 'group'}`}
                className="absolute inset-0 rounded-lg bg-totoro-blue shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 inline-flex min-h-10 items-center rounded-lg border border-transparent px-3 py-2 text-sm font-bold transition-all ${
                value === option.value
                  ? 'text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]'
                  : 'text-totoro-gray shadow-[inset_0_0_0_1px_var(--hairline)] hover:text-totoro-blue hover:shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.3)]'
              }`}
            >
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
