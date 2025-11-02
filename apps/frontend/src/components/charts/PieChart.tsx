"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  colors?: string[];
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  height = 300,
  colors = ["#FD6263", "#8F4444", "#00A3FF", "#6B7280", "#ECECEC"],
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(entry) => `${entry[nameKey]}: ${entry[dataKey]}`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
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
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
