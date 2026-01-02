import React from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
}

export interface Filter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}
