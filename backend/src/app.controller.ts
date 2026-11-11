import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Platform API index' })
  getRoot(): { platform: string; version: string; docs: string } {
    return {
      platform: 'WebSec CTF API',
      version: '1.0.0',
      docs: '/api/v1/docs',
    };
  }
}
