import React from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password';
  value: string | number | '';
  onChange: (value: string | number | '') => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
}

export function Input({
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  label,
  className = '',
  inputClassName = '',
  min,
  max,
  disabled = false,
  readOnly = false,
  autoComplete
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
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
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        className={`w-full p-3 border border-transparent rounded-lg bg-[--input-bg] text-foreground placeholder-foreground/30 shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-soft)] transition-all duration-200 hover:bg-[--surface-hover] hover:shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.28),var(--shadow-soft)] focus:outline-none focus:ring-4 focus:ring-totoro-blue/15 focus:shadow-[inset_0_0_0_1px_var(--totoro-blue),var(--shadow-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[--input-bg] disabled:hover:shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-soft)] read-only:text-foreground/60 read-only:hover:bg-[--input-bg] ${inputClassName}`}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
      />
    </div>
  );
}
