import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { randomBytes } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  // Double-submit cookie CSRF protection:
  // set a random secret on every request if not present.
  // The frontend must read this cookie and echo it back in the X-CSRF-Token header.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies || !req.cookies['csrf-secret']) {
      const secret = randomBytes(32).toString('hex');
      res.cookie('csrf-secret', secret, {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24h
      });
      req.cookies = req.cookies || {};
      req.cookies['csrf-secret'] = secret;
    }
    next();
  });

  // Enable CORS for the frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();