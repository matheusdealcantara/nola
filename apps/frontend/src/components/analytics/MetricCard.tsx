"use client";

import React from "react";
import { Card, CardTitle, CardDescription } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  format?: "currency" | "number" | "percentage";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  format = "number",
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === "string") return val;

    switch (format) {
      case "currency":
        return val.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "number":
      default:
        return val.toLocaleString("pt-BR");
    }
  };

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return "success";
    if (trendValue < 0) return "error";
    return "default";
  };

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {/* Title Section */}
        <div className="pb-4 border-b-2 border-[#ECECEC]">
          <CardDescription className="text-[#8F4444] font-semibold text-sm uppercase tracking-wide">
            {title}
          </CardDescription>
        </div>

        {/* Value Section */}
        <div className="py-2">
          <CardTitle className="text-5xl font-extrabold text-[#FD6263] text-center">
            {formatValue(value)}
          </CardTitle>
        </div>

        {/* Subtitle Section */}
        {subtitle && (
          <div className="text-center">
            <p className="text-sm text-[#8F4444]/70 font-medium">{subtitle}</p>
          </div>
        )}

        {/* Trend Section */}
        {trend && (
          <div className="pt-4 border-t-2 border-[#ECECEC] flex justify-center">
            <Badge variant={getTrendColor(trend.value)}>
              {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"}{" "}
              {Math.abs(trend.value).toFixed(1)}% {trend.label}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};
