import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Ensure Swagger UI static assets and CDNs load properly
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Parse HttpOnly cookies
  app.use(cookieParser());

  // Global prefix for all REST API endpoints
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS for frontend development
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, etc.)
      if (!origin) return callback(null, true);

      // In development or local network, allow localhost, 127.0.0.1, WSL, and private LAN IPs
      const isDev = process.env.NODE_ENV !== 'production';
      const isLocalOrPrivate =
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.startsWith('http://172.') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.');

      if (isDev || isLocalOrPrivate) {
        return callback(null, true);
      }

      return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe with strict security-minded defaults
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips non-whitelisted properties
      forbidNonWhitelisted: true, // Rejects payload if unknown fields are passed
      transform: true, // Automatically transforms payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global response interceptor and exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger OpenAPI documentation configuration
  const config = new DocumentBuilder()
    .setTitle('WebSec CTF — API Documentation')
    .setDescription(
      'REST API documentation for the WebSec CTF Web Application Penetration Testing Platform. ' +
        'Aligned with OWASP Top 10, WSTG, ASVS, CWE, and CVSS standards.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your Bearer JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'Platform and service health diagnostics')
    .addTag(
      'Auth',
      'Authentication, user registration, and JWT token lifecycle',
    )
    .addTag('Users', 'User profile management')
    .addTag('Categories', 'Challenge vulnerability categories')
    .addTag('Challenges', 'Vulnerability lab challenges and flag submission')
    .addTag('Admin Challenges', 'Administrative challenge management')
    .addTag('Submissions', 'Flag validation logs and submission history')
    .addTag('Leaderboard', 'Global scoreboard and player rankings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.PORT || process.env.BACKEND_PORT || 3000;
  await app.listen(port);

  logger.log(`====================================================`);
  logger.log(` WebSec CTF Backend is running on port: ${port}`);
  logger.log(` REST API Base:      http://localhost:${port}/${apiPrefix}`);
  logger.log(` Swagger Docs:       http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(
    ` Health Endpoint:    http://localhost:${port}/${apiPrefix}/health`,
  );
  logger.log(`====================================================`);
}

bootstrap();
