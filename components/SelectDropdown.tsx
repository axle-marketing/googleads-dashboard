'use client';

import { useEffect, useState } from 'react';

interface Option {
  id: string;
  name: string;
}

interface SelectDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function SelectDropdown({
  label,
  value,
  onChange,
  options,
  isLoading = false,
  placeholder = 'Selecione uma opção',
  disabled = false,
}: SelectDropdownProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading || disabled}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-600"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {isLoading && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Carregando...
        </span>
      )}
    </div>
  );
}
