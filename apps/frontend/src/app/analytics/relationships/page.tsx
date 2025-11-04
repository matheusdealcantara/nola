"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchCubeJsMeta,
  fetchAnalyticsQuery,
  resolveDateRange,
  CubeJsMeta,
  DateRangeSelection,
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
import { ArrowLeftIcon, LoaderIcon } from "@/components/ui/Icons";

type Granularity = "day" | "week" | "month";

interface IntermediateRow {
  label: string;
  order: number;
  measures: Record<string, number | null>;
}

type ChartRow = { label: string } & Record<string, string | number | null>;

const granularityOptions: { value: Granularity; label: string }[] = [
  { value: "day", label: "Diário" },
  { value: "week", label: "Semanal" },
  { value: "month", label: "Mensal" },
];

const formatDateLabel = (
  raw: string,
  fallbackIndex: number
): {
  label: string;
  order: number;
  mapKey: string;
} => {
  const dateValue = new Date(raw);

  if (!Number.isNaN(dateValue.getTime())) {
    return {
      label: dateValue.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
      order: dateValue.getTime(),
      mapKey: dateValue.toISOString(),
    };
  }

  return {
    label: raw,
    order: fallbackIndex,
    mapKey: `${raw}-${fallbackIndex}`,
  };
};

const parseMeasure = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const describeCorrelation = (value: number | null): string => {
  if (value === null) {
    return "Correlação insuficiente";
  }

  const abs = Math.abs(value);
  let strength = "muito fraca";

  if (abs >= 0.8) {
    strength = "muito forte";
  } else if (abs >= 0.6) {
    strength = "forte";
  } else if (abs >= 0.4) {
    strength = "moderada";
  } else if (abs >= 0.2) {
    strength = "fraca";
  }

  const direction = value > 0 ? "positiva" : "negativa";
  return `${strength} e ${direction}`;
};

const getCubeByName = (meta: CubeJsMeta | null, name: string) =>
  meta?.cubes.find((cube) => cube.name === name) || null;

export default function RelationshipsPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<CubeJsMeta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<DateRangeSelection>("last_30_days");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const [primaryCube, setPrimaryCube] = useState<string>("");
  const [primaryMeasure, setPrimaryMeasure] = useState<string>("");
  const [primaryDimension, setPrimaryDimension] = useState<string>("");

  const [secondaryCube, setSecondaryCube] = useState<string>("");
  const [secondaryMeasure, setSecondaryMeasure] = useState<string>("");
  const [secondaryDimension, setSecondaryDimension] = useState<string>("");

  const [chartData, setChartData] = useState<ChartRow[]>([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setLoadingMeta(true);
        setMetaError(null);
        const metaData = await fetchCubeJsMeta();
        setMeta(metaData);
      } catch (err) {
        console.error(err);
        setMetaError("Não foi possível carregar o catálogo de dados.");
      } finally {
        setLoadingMeta(false);
      }
    };

    loadMeta();
  }, []);

  const availableCubes = useMemo(
    () =>
      meta?.cubes.filter(
        (cube) =>
          cube.measures.length > 0 &&
          cube.dimensions.some((dimension) => dimension.type === "time")
      ) ?? [],
    [meta]
  );

  const primaryCubeMeta = useMemo(
    () => getCubeByName(meta, primaryCube),
    [meta, primaryCube]
  );

  const secondaryCubeMeta = useMemo(
    () => getCubeByName(meta, secondaryCube),
    [meta, secondaryCube]
  );

  const primaryMeasureOptions = useMemo(
    () => primaryCubeMeta?.measures ?? [],
    [primaryCubeMeta]
  );

  const primaryTimeDimensions = useMemo(
    () =>
      primaryCubeMeta?.dimensions.filter(
        (dimension) => dimension.type === "time"
      ) ?? [],
    [primaryCubeMeta]
  );

  const secondaryMeasureOptions = useMemo(
    () => secondaryCubeMeta?.measures ?? [],
    [secondaryCubeMeta]
  );

  const secondaryTimeDimensions = useMemo(
    () =>
      secondaryCubeMeta?.dimensions.filter(
        (dimension) => dimension.type === "time"
      ) ?? [],
    [secondaryCubeMeta]
  );

  useEffect(() => {
    if (!availableCubes.length) {
      return;
    }

    setPrimaryCube((current) =>
      current && availableCubes.some((cube) => cube.name === current)
        ? current
        : availableCubes[0].name
    );

    setSecondaryCube((current) => {
      if (current && availableCubes.some((cube) => cube.name === current)) {
        return current;
      }
      return availableCubes[1]?.name ?? availableCubes[0].name;
    });
  }, [availableCubes]);

  useEffect(() => {
    if (!primaryMeasureOptions.length) {
      return;
    }

    if (
      !primaryMeasureOptions.some((measure) => measure.name === primaryMeasure)
    ) {
      setPrimaryMeasure(primaryMeasureOptions[0].name);
    }
  }, [primaryMeasureOptions, primaryMeasure]);

  useEffect(() => {
    if (!primaryTimeDimensions.length) {
      return;
    }

    if (
      !primaryTimeDimensions.some(
        (dimension) => dimension.name === primaryDimension
      )
    ) {
      setPrimaryDimension(primaryTimeDimensions[0].name);
    }
  }, [primaryTimeDimensions, primaryDimension]);

  useEffect(() => {
    if (!secondaryMeasureOptions.length) {
      return;
    }

    if (
      !secondaryMeasureOptions.some(
        (measure) => measure.name === secondaryMeasure
      )
    ) {
      setSecondaryMeasure(secondaryMeasureOptions[0].name);
    }
  }, [secondaryMeasureOptions, secondaryMeasure]);

  useEffect(() => {
    if (!secondaryTimeDimensions.length) {
      return;
    }

    if (
      !secondaryTimeDimensions.some(
        (dimension) => dimension.name === secondaryDimension
      )
    ) {
      setSecondaryDimension(secondaryTimeDimensions[0].name);
    }
  }, [secondaryTimeDimensions, secondaryDimension]);

  const primaryMeasureTitle = useMemo(() => {
    const match = primaryMeasureOptions.find(
      (measure) => measure.name === primaryMeasure
    );
    return match?.title ?? primaryMeasure;
  }, [primaryMeasureOptions, primaryMeasure]);

  const secondaryMeasureTitle = useMemo(() => {
    const match = secondaryMeasureOptions.find(
      (measure) => measure.name === secondaryMeasure
    );
    return match?.title ?? secondaryMeasure;
  }, [secondaryMeasureOptions, secondaryMeasure]);

  const correlation = useMemo(() => {
    if (!chartData.length || !primaryMeasure || !secondaryMeasure) {
      return null;
    }

    const paired = chartData
      .map((row) => {
        const first = row[primaryMeasure];
        const second = row[secondaryMeasure];
        if (typeof first === "number" && typeof second === "number") {
          return { first, second };
        }
        return null;
      })
      .filter(
        (value): value is { first: number; second: number } => value !== null
      );

    if (paired.length < 2) {
      return null;
    }

    const meanFirst =
      paired.reduce((accumulator, value) => accumulator + value.first, 0) /
      paired.length;
    const meanSecond =
      paired.reduce((accumulator, value) => accumulator + value.second, 0) /
      paired.length;

    const numerator = paired.reduce(
      (accumulator, value) =>
        accumulator + (value.first - meanFirst) * (value.second - meanSecond),
      0
    );

    const denominatorFirst = Math.sqrt(
      paired.reduce(
        (accumulator, value) => accumulator + (value.first - meanFirst) ** 2,
        0
      )
    );
    const denominatorSecond = Math.sqrt(
      paired.reduce(
        (accumulator, value) => accumulator + (value.second - meanSecond) ** 2,
        0
      )
    );

    if (denominatorFirst === 0 || denominatorSecond === 0) {
      return null;
    }

    return numerator / (denominatorFirst * denominatorSecond);
  }, [chartData, primaryMeasure, secondaryMeasure]);

  const loadCombinedData = useCallback(async () => {
    if (
      !meta ||
      !primaryMeasure ||
      !primaryDimension ||
      !secondaryMeasure ||
      !secondaryDimension
    ) {
      setChartData([]);
      return;
    }

    setLoadingData(true);
    setDataError(null);

    try {
      const resolvedRange = resolveDateRange(selectedTimeFrame);

      const buildQuery = (measure: string, dimension: string) => {
        const timeConfig: Record<string, unknown> = {
          dimension,
          granularity,
        };

        if (resolvedRange) {
          timeConfig.dateRange = resolvedRange;
        } else if (typeof selectedTimeFrame === "string") {
          timeConfig.dateRange = selectedTimeFrame;
        }

        return {
          measures: [measure],
          timeDimensions: [timeConfig],
          order: {
            [dimension]: "asc",
          },
          limit: 5000,
        };
      };

      const [primaryResponse, secondaryResponse] = await Promise.all([
        fetchAnalyticsQuery(buildQuery(primaryMeasure, primaryDimension)),
        fetchAnalyticsQuery(buildQuery(secondaryMeasure, secondaryDimension)),
      ]);

      const timeKey = (dimension: string) => `${dimension}.${granularity}`;

      const accumulation = new Map<string, IntermediateRow>();

      const mergeRows = (
        rows: Record<string, string | number>[],
        measureKey: string,
        dimensionKey: string
      ) => {
        rows.forEach((row, index) => {
          const rawDimension =
            (row[dimensionKey] as string | number | undefined) ??
            (row[primaryDimension] as string | number | undefined) ??
            (row[secondaryDimension] as string | number | undefined);

          if (rawDimension === undefined || rawDimension === null) {
            return;
          }

          const rawAsString =
            typeof rawDimension === "string"
              ? rawDimension
              : String(rawDimension);
          const { label, order, mapKey } = formatDateLabel(rawAsString, index);
          const current = accumulation.get(mapKey) ?? {
            label,
            order,
            measures: {},
          };

          current.measures[measureKey] = parseMeasure(row[measureKey]);
          accumulation.set(mapKey, current);
        });
      };

      mergeRows(
        primaryResponse.data,
        primaryMeasure,
        timeKey(primaryDimension)
      );
      mergeRows(
        secondaryResponse.data,
        secondaryMeasure,
        timeKey(secondaryDimension)
      );

      const merged = Array.from(accumulation.values())
        .sort((a, b) => a.order - b.order)
        .map<ChartRow>((item) => ({
          label: item.label,
          [primaryMeasure]: item.measures[primaryMeasure] ?? null,
          [secondaryMeasure]: item.measures[secondaryMeasure] ?? null,
        }));

      setChartData(merged);
    } catch (err) {
      console.error(err);
      setDataError("Falha ao carregar a combinação de métricas.");
      setChartData([]);
    } finally {
      setLoadingData(false);
    }
  }, [
    meta,
    granularity,
    primaryMeasure,
    primaryDimension,
    secondaryMeasure,
    secondaryDimension,
    selectedTimeFrame,
  ]);

  useEffect(() => {
    loadCombinedData();
  }, [loadCombinedData]);

  const ready =
    !loadingMeta &&
    !!primaryMeasure &&
    !!primaryDimension &&
    !!secondaryMeasure &&
    !!secondaryDimension;

  return (
    <div className="min-h-screen bg-[#ECECEC] p-8">
      <main className="w-full max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/analytics")}>
            <ArrowLeftIcon size={16} className="mr-2" />
            Voltar para Analytics
          </Button>
          <h1 className="text-3xl font-bold text-[#8F4444]">
            Comparador de Métricas
          </h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8F4444]">
              Construa correlações entre métricas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-[#8F4444]/80">
            <p>
              Combine métricas de diferentes esquemas Cube.js para visualizar
              como variam ao longo do tempo. Útil para perguntas como
              &quot;promoções elevaram o ticket médio?&quot; ou &quot;o aumento
              de pedidos afeta o tempo de entrega?&quot;.
            </p>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#8F4444]">
                  Métrica principal (eixo Y1)
                </h2>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-[#8F4444]">
                    Fonte de dados
                  </span>
                  <Select
                    value={primaryCube}
                    onValueChange={setPrimaryCube}
                    disabled={loadingMeta || !availableCubes.length}
                  >
                    <SelectTrigger className="bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                      <SelectValue placeholder="Escolha o schema" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCubes.map((cube) => (
                        <SelectItem key={cube.name} value={cube.name}>
                          {cube.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-[#8F4444]">
                    Métrica
                  </span>
                  <Select
                    value={primaryMeasure}
                    onValueChange={setPrimaryMeasure}
                    disabled={!primaryMeasureOptions.length}
                  >
                    <SelectTrigger className="bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                      <SelectValue placeholder="Escolha a métrica" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryMeasureOptions.map((measure) => (
                        <SelectItem key={measure.name} value={measure.name}>
                          {measure.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-[#8F4444]">
                    Dimensão temporal
                  </span>
                  <Select
                    value={primaryDimension}
                    onValueChange={setPrimaryDimension}
                    disabled={!primaryTimeDimensions.length}
                  >
                    <SelectTrigger className="bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                      <SelectValue placeholder="Escolha a dimensão" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryTimeDimensions.map((dimension) => (
                        <SelectItem key={dimension.name} value={dimension.name}>
                          {dimension.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#8F4444]">
                  Métrica secundária (eixo Y2)
                </h2>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-[#8F4444]">
                    Fonte de dados
                  </span>
                  <Select
                    value={secondaryCube}
                    onValueChange={setSecondaryCube}
                    disabled={loadingMeta || !availableCubes.length}
                  >
                    <SelectTrigger className="bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                      <SelectValue placeholder="Escolha o schema" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCubes.map((cube) => (
                        <SelectItem key={cube.name} value={cube.name}>
                          {cube.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-[#8F4444]">
                    Métrica
                  </span>
                  <Select
                    value={secondaryMeasure}
                    onValueChange={setSecondaryMeasure}
                    disabled={!secondaryMeasureOptions.length}
                  >
                    <SelectTrigger className="bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                      <SelectValue placeholder="Escolha a métrica" />
                    </SelectTrigger>
                    <SelectContent>
                      {secondaryMeasureOptions.map((measure) => (
                        <SelectItem key={measure.name} value={measure.name}>
                          {measure.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-[#8F4444]">
                    Dimensão temporal
                  </span>
                  <Select
                    value={secondaryDimension}
                    onValueChange={setSecondaryDimension}
                    disabled={!secondaryTimeDimensions.length}
                  >
                    <SelectTrigger className="bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                      <SelectValue placeholder="Escolha a dimensão" />
                    </SelectTrigger>
                    <SelectContent>
                      {secondaryTimeDimensions.map((dimension) => (
                        <SelectItem key={dimension.name} value={dimension.name}>
                          {dimension.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <span className="text-sm font-medium text-[#8F4444]">
                  Granularidade
                </span>
                <Select
                  value={granularity}
                  onValueChange={(value) =>
                    setGranularity(value as Granularity)
                  }
                >
                  <SelectTrigger className="bg-white border-2 border-[#FD6263] text-[#8F4444] focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263]">
                    <SelectValue placeholder="Escolha" />
                  </SelectTrigger>
                  <SelectContent>
                    {granularityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-[#8F4444]">
                  Intervalo de análise
                </span>
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

        {metaError && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-[#8F1D1D]">
            {metaError}
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            {!ready && (
              <div className="flex h-96 items-center justify-center text-[#8F4444]/70">
                {loadingMeta
                  ? "Carregando catálogos..."
                  : "Selecione métricas válidas"}
              </div>
            )}

            {ready && loadingData && (
              <div className="flex h-96 items-center justify-center">
                <LoaderIcon className="animate-spin text-[#FD6263]" size={48} />
              </div>
            )}

            {ready && !loadingData && dataError && (
              <div className="flex h-96 items-center justify-center text-red-500">
                {dataError}
              </div>
            )}

            {ready && !loadingData && !dataError && chartData.length > 0 && (
              <div className="h-96">
                <LineChart
                  data={chartData}
                  xKey="label"
                  yKeys={[
                    { key: primaryMeasure, name: primaryMeasureTitle },
                    {
                      key: secondaryMeasure,
                      name: secondaryMeasureTitle,
                      color: "#8F4444",
                    },
                  ]}
                />
              </div>
            )}

            {ready && !loadingData && !dataError && chartData.length === 0 && (
              <div className="flex h-96 items-center justify-center text-[#8F4444]/70">
                Ajuste as combinações para gerar dados.
              </div>
            )}
          </CardContent>
        </Card>

        {ready && !loadingData && !dataError && chartData.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#8F4444]">
                  Indicador de correlação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-[#8F4444]/80">
                <p>
                  Coeficiente de Pearson:
                  <span className="ml-1 font-semibold text-[#8F4444]">
                    {correlation !== null ? correlation.toFixed(2) : "--"}
                  </span>
                </p>
                <p>Interpretação: {describeCorrelation(correlation)}</p>
                <p className="text-sm">
                  Use este indicador para avaliar se as métricas caminham
                  juntas, divergem ou permanecem independentes. Ele ajuda a
                  priorizar investigações do time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#8F4444]">
                  Prévia dos dados combinados
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto text-sm text-[#8F4444]/80">
                <table className="min-w-full divide-y divide-[#ECECEC]">
                  <thead className="bg-[#FDF4F5]">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-[#8F4444]">
                        Período
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-[#8F4444]">
                        {primaryMeasureTitle}
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-[#8F4444]">
                        {secondaryMeasureTitle}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.slice(0, 12).map((row, index) => (
                      <tr
                        key={`${row.label}-${index}`}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-[#F9F5F5]"
                        }
                      >
                        <td className="px-4 py-2 font-medium text-[#8F4444]">
                          {row.label}
                        </td>
                        <td className="px-4 py-2">
                          {typeof row[primaryMeasure] === "number"
                            ? row[primaryMeasure]?.toLocaleString("pt-BR")
                            : "--"}
                        </td>
                        <td className="px-4 py-2">
                          {typeof row[secondaryMeasure] === "number"
                            ? row[secondaryMeasure]?.toLocaleString("pt-BR")
                            : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {chartData.length > 12 && (
                  <p className="mt-3 text-xs text-[#8F4444]/60">
                    Exibindo os 12 primeiros pontos. Ajuste o intervalo para
                    investigar períodos específicos.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
