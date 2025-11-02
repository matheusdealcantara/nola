"use client";

import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys: {
    key: string;
    name: string;
    color?: string;
  }[];
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKeys,
  height = 300,
}) => {
  const colors = ["#FD6263", "#8F4444", "#00A3FF", "#6B7280"];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
        <XAxis
          dataKey={xKey}
          stroke="#8F4444"
          style={{ fontSize: "12px", fontWeight: 500 }}
        />
        <YAxis stroke="#8F4444" style={{ fontSize: "12px", fontWeight: 500 }} />
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
          iconType="circle"
        />
        {yKeys.map((yKey, index) => (
          <Line
            key={yKey.key}
            type="monotone"
            dataKey={yKey.key}
            name={yKey.name}
            stroke={yKey.color || colors[index % colors.length]}
            strokeWidth={3}
            dot={{ fill: yKey.color || colors[index % colors.length], r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
