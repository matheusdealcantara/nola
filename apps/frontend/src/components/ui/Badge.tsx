import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-[#ECECEC] text-[#8F4444] border-[#ECECEC]",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-[#FD6263]/10 text-[#FD6263] border-[#FD6263]/30",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
