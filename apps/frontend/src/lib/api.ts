import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";

// API utility functions for analytics endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type DateRangeSelection = string | [string, string];

type DateRange = [string, string];

const START_SUFFIX = "T00:00:00.000";
const END_SUFFIX = "T23:59:59.999";

const formatBoundary = (date: Date, boundary: "start" | "end"): string => {
  const base = format(date, "yyyy-MM-dd");
  return `${base}${boundary === "start" ? START_SUFFIX : END_SUFFIX}`;
};

const ensureBoundary = (value: string, boundary: "start" | "end"): string => {
  if (value.includes("T")) {
    return value;
  }
  return `${value}${boundary === "start" ? START_SUFFIX : END_SUFFIX}`;
};

const normalizeExplicitRange = (range: DateRange): DateRange => {
  const [start, end] = range;
  return [ensureBoundary(start, "start"), ensureBoundary(end, "end")];
};

const resolveRelativeRange = (value: string): DateRange | undefined => {
  const now = new Date();

  switch (value) {
    case "today": {
      const start = startOfDay(now);
      const end = endOfDay(now);
      return [formatBoundary(start, "start"), formatBoundary(end, "end")];
    }
    case "yesterday": {
      const day = subDays(now, 1);
      return [
        formatBoundary(startOfDay(day), "start"),
        formatBoundary(endOfDay(day), "end"),
      ];
    }
    case "last_7_days": {
      const start = startOfDay(subDays(now, 6));
      const end = endOfDay(now);
      return [formatBoundary(start, "start"), formatBoundary(end, "end")];
    }
    case "last_30_days": {
      const start = startOfDay(subDays(now, 29));
      const end = endOfDay(now);
      return [formatBoundary(start, "start"), formatBoundary(end, "end")];
    }
    case "this_month": {
      const start = startOfMonth(now);
      const end = endOfDay(now);
      return [formatBoundary(start, "start"), formatBoundary(end, "end")];
    }
    case "last_month": {
      const lastMonthDate = subMonths(now, 1);
      const start = startOfMonth(lastMonthDate);
      const end = endOfMonth(lastMonthDate);
      return [formatBoundary(start, "start"), formatBoundary(end, "end")];
    }
    case "this_quarter": {
      const start = startOfQuarter(now);
      const end = endOfDay(now);
      return [formatBoundary(start, "start"), formatBoundary(end, "end")];
    }
    case "this_year": {
      const start = startOfYear(now);
      const end = endOfDay(now);
      return [formatBoundary(start, "start"), formatBoundary(end, "end")];
    }
    default:
      return undefined;
  }
};

export const resolveDateRange = (
  selection?: DateRangeSelection
): DateRange | undefined => {
  if (!selection) {
    return undefined;
  }

  if (Array.isArray(selection)) {
    return normalizeExplicitRange(selection);
  }

  return resolveRelativeRange(selection);
};

const buildDateParamsFromSelection = (selection?: DateRangeSelection) => {
  const resolved = resolveDateRange(selection);

  if (resolved) {
    const [startDate, endDate] = resolved;
    return { startDate, endDate };
  }

  if (typeof selection === "string") {
    return { dateRange: selection };
  }

  return {};
};

export interface OverviewMetrics {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  completionRate: number;
}

export interface SalesDataPoint {
  "sales.created_at": string;
  "sales.count": string;
  "sales.total_amount": string;
  "sales.average_ticket": string;
}

export interface ProductPerformance {
  "products.name": string;
  "product_sales.total_revenue": string;
  "product_sales.total_quantity": string;
  "product_sales.count": string;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrdersPerCustomer: number;
}

export interface StorePerformance {
  "stores.name": string;
  "sales.count": string;
  "sales.total_amount": string;
  "sales.average_ticket": string;
}

export interface ChannelDistribution {
  "channels.name": string;
  "sales.count": string;
  "sales.total_amount": string;
}

export interface PaymentDistribution {
  "payment_types.name": string;
  "payments.count": string;
  "payments.total_amount": string;
}

export interface CubeJsMeta {
  cubes: {
    name: string;
    title: string;
    measures: {
      name: string;
      title: string;
      type: string;
    }[];
    dimensions: {
      name: string;
      title: string;
      type: string;
    }[];
  }[];
}

/**
 * Build query parameters
 */
type QueryParamValue = string | number | boolean | undefined;

function buildQueryParams(params: Record<string, QueryParamValue>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString();
}

/**
 * Fetch overview metrics
 */
export async function fetchOverviewMetrics(
  timeFrame?: DateRangeSelection
): Promise<OverviewMetrics> {
  const params = buildQueryParams(buildDateParamsFromSelection(timeFrame));
  const url = `${API_BASE_URL}/analytics/overview${params ? `?${params}` : ""}`;

  console.log("📡 API Request:", url);
  console.log("📡 API_BASE_URL:", API_BASE_URL);

  const response = await fetch(url);
  console.log("📡 Response status:", response.status);

  if (!response.ok) {
    throw new Error(`Failed to fetch overview metrics: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("📡 Response data:", data);
  return data;
}

/**
 * Fetch sales data with time series
 */
export async function fetchSalesData(
  timeFrame?: DateRangeSelection,
  granularity: "day" | "week" | "month" = "day"
): Promise<SalesDataPoint[]> {
  const params = buildQueryParams({
    ...buildDateParamsFromSelection(timeFrame),
    granularity,
  });
  const url = `${API_BASE_URL}/analytics/sales${params ? `?${params}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sales data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch product performance
 */
export async function fetchProductPerformance(
  timeFrame?: DateRangeSelection,
  limit: number = 10
): Promise<ProductPerformance[]> {
  const params = buildQueryParams({
    ...buildDateParamsFromSelection(timeFrame),
    limit,
  });
  const url = `${API_BASE_URL}/analytics/products${params ? `?${params}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch product performance: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch customer analytics
 */
export async function fetchCustomerAnalytics(
  timeFrame?: DateRangeSelection
): Promise<CustomerAnalytics> {
  const params = buildQueryParams(buildDateParamsFromSelection(timeFrame));
  const url = `${API_BASE_URL}/analytics/customers${params ? `?${params}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch customer analytics: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch store performance
 */
export async function fetchStorePerformance(
  timeFrame?: DateRangeSelection
): Promise<StorePerformance[]> {
  const params = buildQueryParams(buildDateParamsFromSelection(timeFrame));
  const url = `${API_BASE_URL}/analytics/stores${params ? `?${params}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch store performance: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch channel distribution
 */
export async function fetchChannelDistribution(
  timeFrame?: DateRangeSelection
): Promise<ChannelDistribution[]> {
  const params = buildQueryParams(buildDateParamsFromSelection(timeFrame));
  const url = `${API_BASE_URL}/analytics/channels${params ? `?${params}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch channel distribution: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch payment distribution
 */
export async function fetchPaymentDistribution(
  timeFrame?: DateRangeSelection
): Promise<PaymentDistribution[]> {
  const params = buildQueryParams(buildDateParamsFromSelection(timeFrame));
  const url = `${API_BASE_URL}/analytics/payments${params ? `?${params}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch payment distribution: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Generic analytics query (for custom queries)
 */
export interface AnalyticsQueryResponse {
  data: Record<string, string | number>[];
  query: Record<string, unknown>;
}

export async function fetchAnalyticsQuery(
  query: Record<string, unknown>
): Promise<AnalyticsQueryResponse> {
  const url = `${API_BASE_URL}/analytics`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  const payload = (await response.json()) as Partial<AnalyticsQueryResponse>;

  if (!payload?.data || !Array.isArray(payload.data)) {
    throw new Error("Analytics response missing data array");
  }

  return {
    data: payload.data,
    query: (payload.query as Record<string, unknown>) ?? {},
  };
}

/**
 * Fetch table counts for all data sources
 */
export async function fetchTableCounts(): Promise<Record<string, number>> {
  const url = `${API_BASE_URL}/analytics/table-counts`;

  console.log("📡 Fetching table counts from:", url);

  const response = await fetch(url);
  console.log("📡 Table counts response status:", response.status);

  if (!response.ok) {
    throw new Error(`Failed to fetch table counts: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("📡 Table counts data:", data);
  return data;
}

/**
 * Fetch Cube.js metadata
 */
export async function fetchCubeJsMeta(): Promise<CubeJsMeta> {
  const url = `${API_BASE_URL}/analytics/meta`;
  console.log("📡 Fetching Cube.js meta from:", url);

  const response = await fetch(url);
  console.log("📡 Cube.js meta response status:", response.status);

  if (!response.ok) {
    throw new Error(`Failed to fetch Cube.js meta: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("📡 Cube.js meta data:", data);
  return data;
}
