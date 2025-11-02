"use client";

import React, { useState } from "react";
import { Card, CardTitle } from "../ui/Card";
import { Select } from "../ui/Select";

interface TimeFrameSelectorProps {
  onSelect: (timeFrame: string) => void;
  defaultValue?: string;
}

export const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  onSelect,
  defaultValue = "last_30_days",
}) => {
  const [selected, setSelected] = useState(defaultValue);

  const timeFrameOptions = [
    { value: "today", label: "Hoje" },
    { value: "yesterday", label: "Ontem" },
    { value: "last_7_days", label: "Últimos 7 dias" },
    { value: "last_30_days", label: "Últimos 30 dias" },
    { value: "this_month", label: "Este mês" },
    { value: "last_month", label: "Mês passado" },
    { value: "this_quarter", label: "Este trimestre" },
    { value: "this_year", label: "Este ano" },
    { value: "custom", label: "Personalizado" },
  ];

  const handleChange = (value: string) => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <Card className="bg-gradient-to-br from-[#ECECEC] to-white">
      <div className="flex flex-col gap-6">
        <div className="text-center pb-4 border-b-2 border-[#8F4444]/20">
          <CardTitle className="text-xl">Período de Análise</CardTitle>
        </div>
        <div>
          <Select
            options={timeFrameOptions}
            value={selected}
            onChange={handleChange}
            placeholder="Selecione o período"
          />
        </div>
      </div>
    </Card>
  );
};
