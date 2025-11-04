import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: Express | null = null;

async function bootstrap(): Promise<Express> {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: ['error', 'warn', 'log'],
      },
    );

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
    cachedApp = expressApp;
  }
  return cachedApp;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await bootstrap();
  return app(req as any, res as any);
};
