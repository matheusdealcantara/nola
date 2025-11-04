"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchCubeJsMeta,
  fetchAnalyticsQuery,
  CubeJsMeta,
  DateRangeSelection,
  resolveDateRange,
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TimeFrameSelector } from "@/components/analytics/TimeFrameSelector";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { ArrowLeftIcon, LoaderIcon } from "@/components/ui/Icons";

type ChartData = {
  [key: string]: string | number;
}[];

export default function DataSourcePage() {
  const router = useRouter();
  const params = useParams();
  const dataSourceId = params.dataSourceId as string;

  const [meta, setMeta] = useState<CubeJsMeta | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [chartType, setChartType] = useState("line");
  const [selectedMeasure, setSelectedMeasure] = useState<string>("");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<DateRangeSelection>("last_30_days");

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const metaData = await fetchCubeJsMeta();
        setMeta(metaData);
        const cube = metaData.cubes.find((c) => c.name === dataSourceId);
        if (cube) {
          setSelectedMeasure(cube.measures[0]?.name || "");
          const timeDimension = cube.dimensions.find((d) => d.type === "time");
          setSelectedDimension(
            timeDimension?.name || cube.dimensions[0]?.name || ""
          );
        }
      } catch (err) {
        setLoadingError("Failed to load data source metadata.");
        console.error(err);
      }
    };
    loadMeta();
  }, [dataSourceId]);

  const loadChartData = useCallback(async () => {
    if (!selectedMeasure || !selectedDimension || !meta) {
      return;
    }

    setLoading(true);
    setLoadingError(null);

    try {
      const currentCubeMeta = meta.cubes.find((c) => c.name === dataSourceId);
      const dimensionMeta = currentCubeMeta?.dimensions.find(
        (d) => d.name === selectedDimension
      );
      const isTimeDimension = dimensionMeta?.type === "time";
      const fallbackTimeDimension = currentCubeMeta?.dimensions.find(
        (d) => d.type === "time"
      );
      const granularity = "day";

      const resolvedDateRange = resolveDateRange(selectedTimeFrame);

      const timeDimensions: Record<string, unknown>[] = [];

      if (isTimeDimension) {
        const timeConfig: Record<string, unknown> = {
          dimension: selectedDimension,
          granularity,
        };
        if (resolvedDateRange) {
          timeConfig.dateRange = resolvedDateRange;
        } else if (typeof selectedTimeFrame === "string") {
          timeConfig.dateRange = selectedTimeFrame;
        }
        timeDimensions.push(timeConfig);
      } else if (fallbackTimeDimension) {
        const filterConfig: Record<string, unknown> = {
          dimension: fallbackTimeDimension.name,
        };
        if (resolvedDateRange) {
          filterConfig.dateRange = resolvedDateRange;
        } else if (typeof selectedTimeFrame === "string") {
          filterConfig.dateRange = selectedTimeFrame;
        }
        timeDimensions.push(filterConfig);
      }

      const query: Record<string, unknown> = {
        measures: [selectedMeasure],
      };

      if (timeDimensions.length > 0) {
        query.timeDimensions = timeDimensions;
      }

      if (isTimeDimension) {
        query.order = {
          [selectedDimension]: "asc",
        };
      } else {
        query.dimensions = [selectedDimension];
        query.order = {
          [selectedMeasure]: "desc",
        };
      }

      const { data } = await fetchAnalyticsQuery(query);

      const dimensionKey =
        isTimeDimension && granularity
          ? `${selectedDimension}.${granularity}`
          : selectedDimension;

      const transformedData = data
        .map((row, index) => {
          const formattedRow: Record<string, string | number> = {};

          const rawMeasure = row[selectedMeasure];
          const numericMeasure =
            typeof rawMeasure === "number" ? rawMeasure : Number(rawMeasure);
          formattedRow[selectedMeasure] = Number.isNaN(numericMeasure)
            ? 0
            : numericMeasure;

          const rawDimension = row[dimensionKey] ?? row[selectedDimension];
          if (isTimeDimension && typeof rawDimension === "string") {
            const dateValue = new Date(rawDimension);
            if (!Number.isNaN(dateValue.getTime())) {
              formattedRow[selectedDimension] = dateValue.toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              );
              formattedRow.__timestamp = dateValue.getTime();
            } else {
              formattedRow[selectedDimension] = rawDimension;
            }
          } else {
            formattedRow[selectedDimension] = String(
              rawDimension ?? `Unlabeled ${index + 1}`
            );
          }

          return formattedRow;
        })
        .sort((a, b) => {
          if (!isTimeDimension) {
            return 0;
          }
          const aTime = typeof a.__timestamp === "number" ? a.__timestamp : 0;
          const bTime = typeof b.__timestamp === "number" ? b.__timestamp : 0;
          return aTime - bTime;
        })
        .map((row) => {
          if (isTimeDimension) {
            const copy = { ...row } as Record<string, string | number> & {
              __timestamp?: number;
            };
            delete copy.__timestamp;
            return copy;
          }
          return row;
        });

      setChartData(transformedData);
    } catch (err) {
      setLoadingError("Failed to load chart data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    meta,
    dataSourceId,
    selectedMeasure,
    selectedDimension,
    selectedTimeFrame,
  ]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const currentCube = meta?.cubes.find((c) => c.name === dataSourceId);
  const measureTitle =
    currentCube?.measures.find((m) => m.name === selectedMeasure)?.title ||
    selectedMeasure;

  return (
    <div className="min-h-screen bg-[#ECECEC] p-8">
      <main className="w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/analytics")}>
            <ArrowLeftIcon size={16} className="mr-2" />
            Back to Analytics
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#8F4444]">
              {currentCube?.title || "Loading..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-[#8F4444]">
                    Chart Type
                  </span>
                  <p className="text-xs text-[#8F4444]/70">
                    Choose how the data is visualized (line for trends, bar for
                    comparisons).
                  </p>
                </div>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-full bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                    <SelectValue placeholder="Chart Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-[#8F4444]">
                    Measure
                  </span>
                  <p className="text-xs text-[#8F4444]/70">
                    Select the metric plotted on the Y axis.
                  </p>
                </div>
                <Select
                  value={selectedMeasure}
                  onValueChange={setSelectedMeasure}
                >
                  <SelectTrigger className="w-full bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                    <SelectValue placeholder="Select a Measure" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCube?.measures.map((m) => (
                      <SelectItem key={m.name} value={m.name}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-[#8F4444]">
                    Dimension
                  </span>
                  <p className="text-xs text-[#8F4444]/70">
                    Pick the field for the X axis. Time dimensions support trend
                    analysis.
                  </p>
                </div>
                <Select
                  value={selectedDimension}
                  onValueChange={setSelectedDimension}
                >
                  <SelectTrigger className="w-full bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                    <SelectValue placeholder="Select a Dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCube?.dimensions.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-[#8F4444]">
                    Time Frame
                  </span>
                  <p className="text-xs text-[#8F4444]/70">
                    Filter the dataset to a specific period or custom range.
                  </p>
                </div>
                <TimeFrameSelector
                  onSelect={setSelectedTimeFrame}
                  defaultValue={
                    Array.isArray(selectedTimeFrame)
                      ? "custom"
                      : selectedTimeFrame
                  }
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {loading && (
              <div className="flex justify-center items-center h-96">
                <LoaderIcon className="animate-spin text-[#FD6263]" size={48} />
              </div>
            )}
            {loadingError && (
              <div className="text-center text-red-500 h-96 flex justify-center items-center">
                <p>{loadingError}</p>
              </div>
            )}
            {!loading && !loadingError && chartData && (
              <div className="h-96">
                {chartType === "line" ? (
                  <LineChart
                    data={chartData}
                    xKey={selectedDimension}
                    yKeys={[{ key: selectedMeasure, name: measureTitle }]}
                  />
                ) : (
                  <BarChart
                    data={chartData}
                    xKey={selectedDimension}
                    yKeys={[{ key: selectedMeasure, name: measureTitle }]}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
