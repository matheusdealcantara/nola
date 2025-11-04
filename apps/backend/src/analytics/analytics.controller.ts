// Arquivo: apps/backend/src/analytics/analytics.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import type {
  TimeDimensionGranularity,
  Query as CubeQuery,
} from '@cubejs-client/core';

type DateRange = [string, string];
type DateRangeInput = string | DateRange;

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * O frontend (Next.js) vai enviar suas queries para este endpoint
   */
  @Post()
  loadAnalytics(@Body() query: CubeQuery) {
    return this.analyticsService.getAnalytics(query);
  }

  private getDateRange(
    dateRange?: string,
    startDate?: string,
    endDate?: string,
  ): DateRangeInput {
    if (startDate && endDate) {
      return [startDate, endDate];
    }
    return dateRange || 'last_30_days';
  }

  /**
   * Get quick metrics overview
   */
  @Get('overview')
  async getOverview(
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(dateRange, startDate, endDate);
    return this.analyticsService.getOverviewMetrics(range);
  }

  /**
   * Get sales data with trends
   */
  @Get('sales')
  async getSales(
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('granularity') granularity?: TimeDimensionGranularity,
  ): Promise<unknown> {
    const range = this.getDateRange(dateRange, startDate, endDate);
    return this.analyticsService.getSalesData(range, granularity);
  }

  /**
   * Get product performance
   */
  @Get('products')
  async getProducts(
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    const range = this.getDateRange(dateRange, startDate, endDate);
    return this.analyticsService.getProductPerformance(range, limit);
  }

  /**
   * Get customer analytics
   */
  @Get('customers')
  async getCustomers(
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(dateRange, startDate, endDate);
    return this.analyticsService.getCustomerAnalytics(range);
  }

  /**
   * Get store performance
   */
  @Get('stores')
  async getStores(
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(dateRange, startDate, endDate);
    return this.analyticsService.getStorePerformance(range);
  }

  /**
   * Get channel distribution
   */
  @Get('channels')
  async getChannels(
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(dateRange, startDate, endDate);
    return this.analyticsService.getChannelDistribution(range);
  }

  /**
   * Get payment methods distribution
   */
  @Get('payments')
  async getPayments(
    @Query('dateRange') dateRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(dateRange, startDate, endDate);
    return this.analyticsService.getPaymentDistribution(range);
  }

  /**
   * Get table counts for all data sources
   */
  @Get('table-counts')
  async getTableCounts() {
    return this.analyticsService.getTableCounts();
  }

  /**
   * Get Cube.js metadata
   */
  @Get('meta')
  async getCubeJsMeta() {
    return this.analyticsService.getCubeJsMeta();
  }
}
