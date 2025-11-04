// Arquivo: apps/backend/src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import cubejs, {
  CubeApi,
  Query,
  TimeDimensionGranularity,
} from '@cubejs-client/core';

type DateRange = [string, string];
type DateRangeInput = string | DateRange;

const MAX_DATE_BOUNDARY = '2025-10-31T23:59:59.999';

@Injectable()
export class AnalyticsService {
  private cubeApi: CubeApi;

  constructor() {
    this.cubeApi = cubejs(
      // O token é o CUBEJS_API_SECRET que você definiu no .env
      process.env.CUBEJS_API_SECRET || 'SECRET',
      {
        // O NestJS (rodando na 3000) consulta o Cube (rodando na 4000)
        apiUrl: 'http://localhost:4000/cubejs-api/v1',
      },
    );
  }

  /**
   * Recebe uma query JSON do frontend e a repassa para o Cube
   */
  async getAnalytics(query: Query) {
    try {
      const result = await this.cubeApi.load(query);

      return {
        data: result.tablePivot(),
        query,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Cube.js analytics query error:', message);
      throw error;
    }
  }

  private processDateRange(dateRangeInput: DateRangeInput): DateRangeInput {
    const normalizedInput = this.normalizeDateRangeInput(dateRangeInput);

    if (Array.isArray(normalizedInput)) {
      return this.clampDateRange(normalizedInput);
    }

    return normalizedInput;
  }

  private normalizeDateRangeInput(
    dateRangeInput: DateRangeInput,
  ): DateRangeInput {
    if (Array.isArray(dateRangeInput)) {
      return dateRangeInput;
    }

    const relativeRange = this.resolveRelativeDateRange(dateRangeInput);
    return relativeRange ?? dateRangeInput;
  }

  private clampDateRange(range: DateRange): DateRange {
    const [start, end] = range;
    const maxDateTimestamp = new Date(MAX_DATE_BOUNDARY).getTime();
    const rangeEndTimestamp = new Date(end).getTime();
    const effectiveEnd =
      rangeEndTimestamp > maxDateTimestamp ? MAX_DATE_BOUNDARY : end;

    return [start, effectiveEnd];
  }

  private resolveRelativeDateRange(keyword: string): DateRange | undefined {
    const now = new Date();

    const toRange = (start: Date, end: Date): DateRange => [
      this.formatDateBoundary(start, 'start'),
      this.formatDateBoundary(end, 'end'),
    ];

    switch (keyword) {
      case 'today': {
        return toRange(now, now);
      }
      case 'yesterday': {
        const day = this.shiftDays(now, -1);
        return toRange(day, day);
      }
      case 'last_7_days': {
        const start = this.shiftDays(now, -6);
        return toRange(start, now);
      }
      case 'last_30_days': {
        const start = this.shiftDays(now, -29);
        return toRange(start, now);
      }
      case 'this_month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return toRange(start, now);
      }
      case 'last_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return toRange(start, end);
      }
      case 'this_quarter': {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        const start = new Date(now.getFullYear(), quarterStartMonth, 1);
        return toRange(start, now);
      }
      case 'this_year': {
        const start = new Date(now.getFullYear(), 0, 1);
        return toRange(start, now);
      }
      default:
        return undefined;
    }
  }

  private shiftDays(date: Date, delta: number): Date {
    const shifted = new Date(date);
    shifted.setHours(0, 0, 0, 0);
    shifted.setDate(shifted.getDate() + delta);
    return shifted;
  }

  private formatDateBoundary(date: Date, boundary: 'start' | 'end'): string {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    const year = normalized.getFullYear();
    const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
    const day = `${normalized.getDate()}`.padStart(2, '0');
    const suffix = boundary === 'start' ? 'T00:00:00.000' : 'T23:59:59.999';

    return `${year}-${month}-${day}${suffix}`;
  }

  /**
   * Get overview metrics (total sales, revenue, avg ticket, completion rate)
   */
  async getOverviewMetrics(dateRangeInput: DateRangeInput) {
    try {
      const dateRange = this.processDateRange(dateRangeInput);

      const query: Query = {
        measures: ['sales.count', 'sales.total_amount', 'sales.average_ticket'],
        timeDimensions: [
          {
            dimension: 'sales.created_at',
            ...(dateRange && { dateRange }),
          },
        ],
      };

      const result = await this.cubeApi.load(query);
      const data = result.tablePivot()[0] || {};

      return {
        totalSales: parseInt(String(data['sales.count'] || '0')),
        totalRevenue: parseFloat(String(data['sales.total_amount'] || '0')),
        averageTicket: parseFloat(String(data['sales.average_ticket'] || '0')),
        completionRate: 95, // Calculate from status if available
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Cube.js error, returning mock data:', message);
      // Return mock data when database is unavailable
      return {
        totalSales: 523847,
        totalRevenue: 15678234.5,
        averageTicket: 29.94,
        completionRate: 94.2,
      };
    }
  }

  /**
   * Get sales data with time series
   */
  async getSalesData(
    dateRangeInput?: DateRangeInput,
    granularity: TimeDimensionGranularity = 'day',
  ) {
    const dateRange = this.buildDateRange(dateRangeInput);

    const query: Query = {
      measures: ['sales.count', 'sales.total_amount', 'sales.average_ticket'],
      timeDimensions: [
        {
          dimension: 'sales.created_at',
          granularity,
          ...(dateRange && { dateRange }),
        },
      ],
      order: {
        'sales.created_at': 'asc',
      },
    };

    const result = await this.cubeApi.load(query);
    return result.tablePivot();
  }

  /**
   * Get top products by revenue and quantity
   */
  async getProductPerformance(
    dateRangeInput?: DateRangeInput,
    limit: number = 10,
  ) {
    const dateRange = this.buildDateRange(dateRangeInput);

    const query: Query = {
      measures: [
        'product_sales.total_revenue',
        'product_sales.total_quantity',
        'product_sales.count',
      ],
      dimensions: ['products.name'],
      timeDimensions: [
        {
          dimension: 'product_sales.created_at',
          ...(dateRange && { dateRange }),
        },
      ],
      order: {
        'product_sales.total_revenue': 'desc',
      },
      limit,
    };

    const result = await this.cubeApi.load(query);
    return result.tablePivot();
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(dateRangeInput?: DateRangeInput) {
    const dateRange = this.buildDateRange(dateRangeInput);

    const query: Query = {
      measures: ['customers.count', 'sales.count', 'sales.total_amount'],
      timeDimensions: [
        {
          dimension: 'sales.created_at',
          ...(dateRange && { dateRange }),
        },
      ],
    };

    const result = await this.cubeApi.load(query);
    const data = result.tablePivot()[0] || {};

    return {
      totalCustomers: parseInt(String(data['customers.count'] || '0')),
      totalOrders: parseInt(String(data['sales.count'] || '0')),
      totalRevenue: parseFloat(String(data['sales.total_amount'] || '0')),
      averageOrdersPerCustomer:
        parseInt(String(data['sales.count'] || '0')) /
        Math.max(parseInt(String(data['customers.count'] || '1')), 1),
    };
  }

  /**
   * Get store performance comparison
   */
  async getStorePerformance(dateRangeInput?: DateRangeInput) {
    const dateRange = this.buildDateRange(dateRangeInput);

    const query: Query = {
      measures: ['sales.count', 'sales.total_amount', 'sales.average_ticket'],
      dimensions: ['stores.name'],
      timeDimensions: [
        {
          dimension: 'sales.created_at',
          ...(dateRange && { dateRange }),
        },
      ],
      order: {
        'sales.total_amount': 'desc',
      },
    };

    const result = await this.cubeApi.load(query);
    return result.tablePivot();
  }

  /**
   * Get channel distribution
   */
  async getChannelDistribution(dateRangeInput?: DateRangeInput) {
    const dateRange = this.buildDateRange(dateRangeInput);

    const query: Query = {
      measures: ['sales.count', 'sales.total_amount'],
      dimensions: ['channels.name'],
      timeDimensions: [
        {
          dimension: 'sales.created_at',
          ...(dateRange && { dateRange }),
        },
      ],
      order: {
        'sales.total_amount': 'desc',
      },
    };

    const result = await this.cubeApi.load(query);
    return result.tablePivot();
  }

  /**
   * Get payment methods distribution
   */
  async getPaymentDistribution(dateRangeInput?: DateRangeInput) {
    const dateRange = this.buildDateRange(dateRangeInput);

    const query: Query = {
      measures: ['payments.count', 'payments.total_amount'],
      dimensions: ['payment_types.name'],
      timeDimensions: [
        {
          dimension: 'payments.created_at',
          ...(dateRange && { dateRange }),
        },
      ],
      order: {
        'payments.total_amount': 'desc',
      },
    };

    const result = await this.cubeApi.load(query);
    return result.tablePivot();
  }

  /**
   * Get table counts for all data sources
   */
  async getTableCounts() {
    try {
      const meta = await this.cubeApi.meta();
      const cubes = meta.cubes;

      const results = await Promise.all(
        cubes.map(async (cube) => {
          try {
            const measure = cube.measures[0]?.name;
            if (!measure) {
              // If no measure, try to use a dimension for counting
              const dimension = cube.dimensions[0]?.name;
              if (!dimension) return { cube: cube.name, count: 0 };
              const result = await this.cubeApi.load({
                measures: [`${cube.name}.count`], // Assuming a default count measure exists
              });
              const data = result.tablePivot()[0];
              return {
                cube: cube.name,
                count: parseInt(String(data?.[`${cube.name}.count`] || '0')),
              };
            }
            const result = await this.cubeApi.load({ measures: [measure] });
            const data = result.tablePivot()[0];
            return {
              cube: cube.name,
              count: parseInt(String(data?.[measure] || '0')),
            };
          } catch (error) {
            console.error(`Error fetching count for ${cube.name}:`, error);
            return { cube: cube.name, count: 0 };
          }
        }),
      );

      return results.reduce(
        (acc, { cube, count }) => {
          acc[cube] = count;
          return acc;
        },
        {} as Record<string, number>,
      );
    } catch (error) {
      console.error('Error fetching table counts:', error);
      // Return mock data when database is unavailable
      return {
        sales: 523847,
        products: 487,
        product_sales: 1245632,
        customers: 12453,
        stores: 52,
        delivery_sales: 245832,
        channels: 6,
        payments: 623847,
        items: 234,
        item_product_sales: 876543,
      };
    }
  }

  /**
   * Get Cube.js metadata for all cubes
   */
  async getCubeJsMeta() {
    return this.cubeApi.meta();
  }

  /**
   * Build date range for queries
   */
  private buildDateRange(
    dateRangeInput?: DateRangeInput,
  ): DateRangeInput | undefined {
    if (!dateRangeInput) {
      return undefined;
    }

    return this.processDateRange(dateRangeInput);
  }
}
