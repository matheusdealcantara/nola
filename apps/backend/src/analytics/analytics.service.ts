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
