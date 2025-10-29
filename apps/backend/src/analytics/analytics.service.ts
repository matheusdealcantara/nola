// Arquivo: apps/backend/src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import cubejs, { CubeApi } from '@cubejs-client/core';

@Injectable()
export class AnalyticsService {
  private cubeApi: CubeApi;

  constructor() {
    this.cubeApi = cubejs(
      // O token é o CUBEJS_API_SECRET que você definiu no .env
      process.env.CUBEJS_API_SECRET,
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
}
