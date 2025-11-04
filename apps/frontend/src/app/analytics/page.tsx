"use client";

import React, { useState, useEffect } from "react";
import { DataSourceCard } from "@/components/analytics/DataSourceCard";
import { TimeFrameSelector } from "@/components/analytics/TimeFrameSelector";
import { MetricCard } from "@/components/analytics/MetricCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  SalesIcon,
  ProductIcon,
  CustomerIcon,
  StoreIcon,
  DeliveryIcon,
  PaymentIcon,
  ChannelIcon,
  ChartIcon,
  SearchIcon,
} from "@/components/ui/Icons";
import {
  fetchOverviewMetrics,
  fetchTableCounts,
  OverviewMetrics,
  DateRangeSelection,
} from "@/lib/api";
import { useRouter } from "next/navigation";

interface DataSource {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  recordCount?: number;
  tags: string[];
}

export default function AnalyticsPage() {
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<DateRangeSelection>("last_30_days");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch overview metrics on mount and when timeframe changes
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Fetching metrics from backend...");
        const data = await fetchOverviewMetrics(selectedTimeFrame);
        console.log("✅ Metrics loaded:", data);
        setMetrics(data);
      } catch (err) {
        console.error("❌ Failed to fetch metrics:", err);
        setError(
          `Failed to load metrics data: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [selectedTimeFrame]);

  // Fetch table counts on mount
  useEffect(() => {
    const loadTableCounts = async () => {
      try {
        setLoadingCounts(true);
        setCountsError(null);
        console.log("🔄 Fetching table counts from backend...");
        const data = await fetchTableCounts();
        console.log("✅ Table counts loaded:", data);
        setTableCounts(data);
      } catch (err) {
        console.error("❌ Failed to fetch table counts:", err);
        setCountsError(
          `Failed to load table counts: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setLoadingCounts(false);
      }
    };

    loadTableCounts();
  }, []);

  const dataSources: DataSource[] = [
    {
      id: "relationships",
      title: "Comparar Métricas",
      description:
        "Construa gráficos correlacionando métricas de diferentes esquemas",
      icon: <ChartIcon size={24} />,
      category: "Exploração",
      tags: ["correlação", "comparação", "multidata", "insight"],
    },
    {
      id: "sales",
      title: "Vendas",
      description:
        "Análise completa de vendas, receitas, tickets médios e tendências",
      icon: <SalesIcon size={24} />,
      category: "Financeiro",
      recordCount: tableCounts.sales || undefined,
      tags: ["receita", "vendas", "faturamento", "ticket médio"],
    },
    {
      id: "products",
      title: "Produtos",
      description: "Performance de produtos, rankings, margens e popularidade",
      icon: <ProductIcon size={24} />,
      category: "Catálogo",
      recordCount: tableCounts.products || undefined,
      tags: ["produtos", "cardápio", "itens", "ranking"],
    },
    {
      id: "product-sales",
      title: "Produtos Vendidos",
      description:
        "Detalhes de produtos em cada venda, quantidades e customizações",
      icon: <ProductIcon size={24} />,
      category: "Vendas",
      recordCount: tableCounts.product_sales || undefined,
      tags: ["produtos", "vendas", "customização"],
    },
    {
      id: "customers",
      title: "Clientes",
      description:
        "Perfil de clientes, frequência de compra, lifetime value e retenção",
      icon: <CustomerIcon size={24} />,
      category: "Clientes",
      recordCount: tableCounts.customers || undefined,
      tags: ["clientes", "frequência", "fidelidade", "retenção"],
    },
    {
      id: "stores",
      title: "Lojas",
      description: "Performance por loja, comparações e análise geográfica",
      icon: <StoreIcon size={24} />,
      category: "Operacional",
      recordCount: tableCounts.stores || undefined,
      tags: ["lojas", "unidades", "performance", "localização"],
    },
    {
      id: "delivery",
      title: "Entregas",
      description:
        "Análise de entregas, tempos, regiões e performance de entregadores",
      icon: <DeliveryIcon size={24} />,
      category: "Operacional",
      recordCount: tableCounts.delivery_sales || undefined,
      tags: ["delivery", "entrega", "tempo", "logística"],
    },
    {
      id: "channels",
      title: "Canais de Venda",
      description: "Performance por canal (presencial, iFood, Rappi, etc)",
      icon: <ChannelIcon size={24} />,
      category: "Vendas",
      recordCount: tableCounts.channels || undefined,
      tags: ["canais", "ifood", "rappi", "delivery", "presencial"],
    },
    {
      id: "payments",
      title: "Pagamentos",
      description: "Mix de pagamentos, métodos preferidos e análise financeira",
      icon: <PaymentIcon size={24} />,
      category: "Financeiro",
      recordCount: tableCounts.payments || undefined,
      tags: ["pagamento", "pix", "cartão", "dinheiro"],
    },
    {
      id: "items",
      title: "Complementos e Adicionais",
      description:
        "Análise de items adicionais, customizações e complementos mais vendidos",
      icon: <ProductIcon size={24} />,
      category: "Catálogo",
      recordCount: tableCounts.items || undefined,
      tags: ["complementos", "adicionais", "customização"],
    },
    {
      id: "item-sales",
      title: "Customizações",
      description:
        "Detalhes de customizações em produtos (adicionar, remover itens)",
      icon: <ChartIcon size={24} />,
      category: "Vendas",
      recordCount: tableCounts.item_product_sales || undefined,
      tags: ["customização", "adicionais", "preferências"],
    },
  ];

  const categories = [
    "all",
    ...Array.from(new Set(dataSources.map((ds) => ds.category))),
  ];

  const filteredDataSources = dataSources.filter((ds) => {
    const matchesSearch =
      searchTerm === "" ||
      ds.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || ds.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDataSourceClick = (sourceId: string) => {
    console.log("Navigating to:", sourceId);
    router.push(`/analytics/${sourceId}`);
  };

  const quickMetrics = metrics
    ? [
        {
          title: "Total de Vendas",
          value: metrics.totalSales,
          subtitle: "Últimos 6 meses",
          trend: { value: 15.3, label: "vs mês anterior" },
          format: "number" as const,
        },
        {
          title: "Faturamento Total",
          value: metrics.totalRevenue,
          subtitle: "Últimos 6 meses",
          trend: { value: 12.8, label: "vs mês anterior" },
          format: "currency" as const,
        },
        {
          title: "Ticket Médio",
          value: metrics.averageTicket,
          subtitle: "Por venda",
          trend: { value: -2.1, label: "vs mês anterior" },
          format: "currency" as const,
        },
        {
          title: "Taxa de Conclusão",
          value: metrics.completionRate,
          subtitle: "Vendas completadas",
          trend: { value: 1.2, label: "vs mês anterior" },
          format: "percentage" as const,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#ECECEC] flex flex-col items-center">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#FD6263] w-full shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#8F4444]">
                Analytics Dashboard
              </h1>
              <p className="text-[#8F4444]/70 mt-2 text-lg">
                Explore seus dados e obtenha insights acionáveis para seu
                restaurante
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Help Section */}
        <section className="mb-12 bg-gradient-to-br from-white to-[#ECECEC] rounded-2xl border-2 border-[#ECECEC] p-8 shadow-lg">
          <h3 className="text-xl font-bold text-[#8F4444] mb-4">
            💡 Como começar?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#8F4444]">
            <div>
              <div className="font-bold text-[#FD6263] mb-2 text-base">
                1. Selecione uma fonte de dados
              </div>
              <p>
                Clique em qualquer card abaixo para explorar os dados
                disponíveis
              </p>
            </div>
            <div>
              <div className="font-bold text-[#FD6263] mb-2 text-base">
                2. Escolha o período
              </div>
              <p>Ajuste o período de análise conforme sua necessidade</p>
            </div>
            <div>
              <div className="font-bold text-[#FD6263] mb-2 text-base">
                3. Crie visualizações
              </div>
              <p>
                Construa gráficos e relatórios personalizados sem programação
              </p>
            </div>
          </div>
        </section>

        {/* Quick Metrics */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#8F4444] mb-6 text-center">
            Visão Geral
          </h2>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-red-500 text-sm mt-1">
                Certifique-se de que o backend está rodando na porta 3000
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-10 border-2 border-[#ECECEC]"
                  >
                    <Skeleton className="h-8 w-24 mb-4" />
                    <Skeleton className="h-12 w-32 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </>
            ) : (
              quickMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))
            )}
          </div>
        </section>

        {/* Time Frame Selector */}
        <section className="mb-8 flex justify-center">
          <div className="w-full max-w-md">
            <TimeFrameSelector
              onSelect={setSelectedTimeFrame}
              defaultValue={
                Array.isArray(selectedTimeFrame) ? "custom" : selectedTimeFrame
              }
            />
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mb-6">
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full max-w-md">
              <div className="relative">
                <SearchIcon
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]"
                />
                <input
                  type="text"
                  placeholder="Buscar dados disponíveis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#ECECEC] rounded-xl text-[#8F4444] placeholder:text-[#8F4444]/50 font-medium focus:outline-none focus:ring-2 focus:ring-[#FD6263] focus:border-[#FD6263] transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "primary" : "secondary"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "Todos" : category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Data Sources Grid */}
        <section className="flex flex-col items-center">
          <div className="flex flex-col items-center justify-center mb-6 gap-3">
            <h2 className="text-2xl font-bold text-[#8F4444] text-center">
              Dados Disponíveis para Análise
            </h2>
            <Badge variant="info">
              {filteredDataSources.length} fonte
              {filteredDataSources.length !== 1 ? "s" : ""} de dados
            </Badge>
            {countsError && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 text-center max-w-2xl">
                <p className="text-yellow-700 text-sm font-medium">
                  ⚠️ Usando dados de fallback - Database não conectado
                </p>
                <p className="text-yellow-600 text-xs mt-1">{countsError}</p>
              </div>
            )}
          </div>

          {loadingCounts ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border-2 border-[#ECECEC]"
                >
                  <Skeleton className="h-8 w-8 mb-4 rounded-full" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filteredDataSources.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <SearchIcon size={48} className="mx-auto text-[#6B7280] mb-4" />
              <h3 className="text-lg font-medium text-[#0F1114] mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-[#6B7280]">
                Tente ajustar seus filtros ou termo de busca
              </p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDataSources.map((source) => (
                <DataSourceCard
                  key={source.id}
                  icon={source.icon}
                  title={source.title}
                  description={source.description}
                  recordCount={source.recordCount}
                  category={source.category}
                  onClick={() => handleDataSourceClick(source.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
