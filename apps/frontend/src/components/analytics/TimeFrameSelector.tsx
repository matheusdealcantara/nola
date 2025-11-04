"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "../ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Calendar } from "../ui/Calendar";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { DateRangeSelection } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TimeFrameSelectorProps {
  onSelect: (timeFrame: DateRangeSelection) => void;
  defaultValue?: string;
  className?: string;
}

export const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  onSelect,
  defaultValue = "last_30_days",
  className,
}) => {
  const [selected, setSelected] = useState(defaultValue);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const timeFrameOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "this_month", label: "This month" },
    { value: "last_month", label: "Last month" },
    { value: "this_quarter", label: "This quarter" },
    { value: "this_year", label: "This year" },
    { value: "custom", label: "Custom Range" },
  ];

  const handleChange = (value: string) => {
    setSelected(value);
    if (value !== "custom") {
      onSelect(value);
    }
  };

  const handleCustomDateApply = () => {
    if (date?.from && date?.to) {
      const formattedRange: [string, string] = [
        format(date.from, "yyyy-MM-dd"),
        format(date.to, "yyyy-MM-dd"),
      ];
      onSelect(formattedRange);
      setSelected("custom");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger
          className={cn(
            "bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]",
            className
          )}
        >
          <SelectValue placeholder="Select a time frame" />
        </SelectTrigger>
        <SelectContent>
          {timeFrameOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white border-2 border-[#FD6263] text-[#8F4444] hover:bg-[#FD6263]/5"
            >
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
            <div className="p-2 border-t">
              <Button
                onClick={handleCustomDateApply}
                size="sm"
                className="w-full bg-white border-2 border-[#FD6263] text-[#8F4444] hover:bg-[#FD6263]/5"
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
