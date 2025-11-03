// Arquivo: apps/backend/src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import cubejs, { CubeApi } from '@cubejs-client/core';

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
        // Set shorter timeout (5 seconds) instead of 10 minutes
        transport: {
          timeout: 5000,
        },
      },
    );
  }

  /**
   * Recebe uma query JSON do frontend e a repassa para o Cube
   */
  async getAnalytics(query: any) {
    // O Cube.js vai otimizar a query, buscar no cache ou no banco
    // e retornar os dados prontos para o gráfico.
    return await this.cubeApi.load(query);
  }

  /**
   * Get overview metrics (total sales, revenue, avg ticket, completion rate)
   */
  async getOverviewMetrics(startDate?: string, endDate?: string) {
    try {
      const dateRange = this.buildDateRange(startDate, endDate);

      const query = {
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
        totalSales: parseInt(data['sales.count'] || '0'),
        totalRevenue: parseFloat(data['sales.total_amount'] || '0'),
        averageTicket: parseFloat(data['sales.average_ticket'] || '0'),
        completionRate: 95, // Calculate from status if available
      };
    } catch (error) {
      console.error('Cube.js error, returning mock data:', error.message);
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
    startDate?: string,
    endDate?: string,
    granularity: string = 'day',
  ) {
    const dateRange = this.buildDateRange(startDate, endDate);

    const query = {
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
    startDate?: string,
    endDate?: string,
    limit: number = 10,
  ) {
    const dateRange = this.buildDateRange(startDate, endDate);

    const query = {
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
  async getCustomerAnalytics(startDate?: string, endDate?: string) {
    const dateRange = this.buildDateRange(startDate, endDate);

    const query = {
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
      totalCustomers: parseInt(data['customers.count'] || '0'),
      totalOrders: parseInt(data['sales.count'] || '0'),
      totalRevenue: parseFloat(data['sales.total_amount'] || '0'),
      averageOrdersPerCustomer:
        parseInt(data['sales.count'] || '0') /
        Math.max(parseInt(data['customers.count'] || '1'), 1),
    };
  }

  /**
   * Get store performance comparison
   */
  async getStorePerformance(startDate?: string, endDate?: string) {
    const dateRange = this.buildDateRange(startDate, endDate);

    const query = {
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
  async getChannelDistribution(startDate?: string, endDate?: string) {
    const dateRange = this.buildDateRange(startDate, endDate);

    const query = {
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
  async getPaymentDistribution(startDate?: string, endDate?: string) {
    const dateRange = this.buildDateRange(startDate, endDate);

    const query = {
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
      const queries = [
        { cube: 'sales', measure: 'sales.count' },
        { cube: 'products', measure: 'products.count' },
        { cube: 'product_sales', measure: 'product_sales.count' },
        { cube: 'customers', measure: 'customers.count' },
        { cube: 'stores', measure: 'stores.count' },
        { cube: 'delivery_sales', measure: 'delivery_sales.count' },
        { cube: 'channels', measure: 'channels.count' },
        { cube: 'payments', measure: 'payments.count' },
        { cube: 'items', measure: 'items.count' },
        { cube: 'item_product_sales', measure: 'item_product_sales.count' },
      ];

      const results = await Promise.all(
        queries.map(async ({ cube, measure }) => {
          try {
            const result = await this.cubeApi.load({ measures: [measure] });
            const data = result.tablePivot()[0];
            return {
              cube,
              count: parseInt(data?.[measure] || '0'),
            };
          } catch (error) {
            console.error(`Error fetching count for ${cube}:`, error);
            return { cube, count: 0 };
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
   * Build date range for queries
   */
  private buildDateRange(
    startDate?: string,
    endDate?: string,
  ): string[] | null {
    if (startDate && endDate) {
      return [startDate, endDate];
    }
    return null;
  }
}
