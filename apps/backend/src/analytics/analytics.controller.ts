// Arquivo: apps/backend/src/analytics/analytics.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * O frontend (Next.js) vai enviar suas queries para este endpoint
   */
  @Post()
  loadAnalytics(@Body() query: any) {
    return this.analyticsService.getAnalytics(query);
  }

  /**
   * Get quick metrics overview
   */
  @Get('overview')
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOverviewMetrics(startDate, endDate);
  }

  /**
   * Get sales data with trends
   */
  @Get('sales')
  async getSales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('granularity') granularity?: string,
  ) {
    return this.analyticsService.getSalesData(startDate, endDate, granularity);
  }

  /**
   * Get product performance
   */
  @Get('products')
  async getProducts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getProductPerformance(
      startDate,
      endDate,
      limit,
    );
  }

  /**
   * Get customer analytics
   */
  @Get('customers')
  async getCustomers(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getCustomerAnalytics(startDate, endDate);
  }

  /**
   * Get store performance
   */
  @Get('stores')
  async getStores(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getStorePerformance(startDate, endDate);
  }

  /**
   * Get channel distribution
   */
  @Get('channels')
  async getChannels(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getChannelDistribution(startDate, endDate);
  }

  /**
   * Get payment methods distribution
   */
  @Get('payments')
  async getPayments(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getPaymentDistribution(startDate, endDate);
  }
}
