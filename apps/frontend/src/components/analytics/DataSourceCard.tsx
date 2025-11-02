"use client";

import React from "react";
import { Card, CardTitle, CardDescription } from "../ui/Card";

interface DataSourceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  recordCount?: number;
  onClick: () => void;
  category: string;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({
  icon,
  title,
  description,
  recordCount,
  onClick,
  category,
}) => {
  return (
    <Card hover onClick={onClick}>
      <div className="flex flex-col h-full">
        {/* Icon Section - closer to title, further from top */}
        <div className="flex items-center justify-center pt-8 pb-3">
          <div className="p-3 bg-[#ECECEC] rounded-2xl text-[#FD6263]">
            {icon}
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="inline-block px-3 py-1 bg-[#FD6263]/10 rounded-full">
            <span className="text-xs text-[#FD6263] font-bold uppercase tracking-wide">
              {category}
            </span>
          </div>
        </div>

        {/* Description Section - grows to fill space */}
        <div className="text-center px-2 mt-6 flex-grow">
          <CardDescription className="text-[#8F4444] leading-relaxed">
            {description}
          </CardDescription>
        </div>

        {/* Record Count Section - always at bottom */}
        {recordCount !== undefined && (
          <div className="flex items-center justify-center gap-3 pt-4 mt-6 border-t-2 border-[#ECECEC]">
            <span className="text-sm text-[#8F4444] font-medium">
              Registros:
            </span>
            <span className="text-lg font-bold text-[#FD6263]">
              {recordCount.toLocaleString("pt-BR")}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
