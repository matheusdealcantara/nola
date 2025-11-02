"use client";

import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  label,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <label className="text-sm font-bold text-[#8F4444] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 bg-white border-2 border-[#ECECEC] rounded-xl text-[#8F4444] font-medium focus:outline-none focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263] cursor-pointer transition-all"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
