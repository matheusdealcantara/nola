// API utility functions for analytics endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

/**
 * Build query parameters
 */
function buildQueryParams(params: Record<string, any>): string {
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
  startDate?: string,
  endDate?: string
): Promise<OverviewMetrics> {
  const params = buildQueryParams({ startDate, endDate });
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
  startDate?: string,
  endDate?: string,
  granularity: "day" | "week" | "month" = "day"
): Promise<SalesDataPoint[]> {
  const params = buildQueryParams({ startDate, endDate, granularity });
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
  startDate?: string,
  endDate?: string,
  limit: number = 10
): Promise<ProductPerformance[]> {
  const params = buildQueryParams({ startDate, endDate, limit });
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
  startDate?: string,
  endDate?: string
): Promise<CustomerAnalytics> {
  const params = buildQueryParams({ startDate, endDate });
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
  startDate?: string,
  endDate?: string
): Promise<StorePerformance[]> {
  const params = buildQueryParams({ startDate, endDate });
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
  startDate?: string,
  endDate?: string
): Promise<ChannelDistribution[]> {
  const params = buildQueryParams({ startDate, endDate });
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
  startDate?: string,
  endDate?: string
): Promise<PaymentDistribution[]> {
  const params = buildQueryParams({ startDate, endDate });
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
export async function fetchAnalyticsQuery(query: any): Promise<any> {
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

  return response.json();
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
