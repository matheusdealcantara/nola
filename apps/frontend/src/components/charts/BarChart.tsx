"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: any[];
  xKey: string;
  yKeys: {
    key: string;
    name: string;
    color?: string;
  }[];
  height?: number;
  layout?: "horizontal" | "vertical";
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKeys,
  height = 300,
  layout = "horizontal",
}) => {
  const colors = ["#FD6263", "#8F4444", "#00A3FF", "#6B7280"];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout === "vertical" ? "vertical" : "horizontal"}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
        {layout === "horizontal" ? (
          <>
            <XAxis
              dataKey={xKey}
              stroke="#8F4444"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <YAxis
              stroke="#8F4444"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              stroke="#8F4444"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <YAxis
              dataKey={xKey}
              type="category"
              stroke="#8F4444"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "2px solid #ECECEC",
            borderRadius: "12px",
            padding: "12px",
          }}
          labelStyle={{ color: "#8F4444", fontWeight: "bold" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "14px", fontWeight: 500 }}
          iconType="rect"
        />
        {yKeys.map((yKey, index) => (
          <Bar
            key={yKey.key}
            dataKey={yKey.key}
            name={yKey.name}
            fill={yKey.color || colors[index % colors.length]}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
