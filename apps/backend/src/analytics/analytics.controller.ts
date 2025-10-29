// Arquivo: apps/backend/src/analytics/analytics.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
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
}
