import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService, HealthCheckResponse } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Platform health and connectivity diagnostic check',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health check diagnostics',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          status: 'ok',
          timestamp: '2026-11-10T12:00:00.000Z',
          uptime: 45.2,
          environment: 'development',
          services: {
            database: 'connected',
            redis: 'connected',
          },
        },
      },
    },
  })
  async getHealth(): Promise<HealthCheckResponse> {
    return this.healthService.check();
  }
}
