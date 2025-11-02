import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
}) => {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary:
      "bg-[#FD6263] text-white hover:bg-[#8F4444] focus:ring-[#FD6263] disabled:bg-gray-300 shadow-md hover:shadow-lg",
    secondary:
      "bg-[#ECECEC] text-[#8F4444] hover:bg-gray-300 focus:ring-[#FD6263] disabled:bg-gray-100 border border-[#ECECEC]",
    outline:
      "bg-transparent border-2 border-[#FD6263] text-[#FD6263] hover:bg-[#FD6263] hover:text-white focus:ring-[#FD6263] disabled:border-gray-300 disabled:text-gray-300",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
