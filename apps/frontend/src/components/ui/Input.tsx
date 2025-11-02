"use client";

import React from "react";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "date" | "search";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  className = "",
  icon,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[#0F1114]">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 bg-white border ${error ? "border-red-500" : "border-gray-300"} rounded-lg text-[#0F1114] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 ${error ? "focus:ring-red-500" : "focus:ring-[#00A3FF]"} focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed transition-all`}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
