import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return platform meta', () => {
      expect(appController.getRoot()).toEqual({
        platform: 'WebSec CTF API',
        version: '1.0.0',
        docs: '/api/v1/docs',
      });
    });
  });
});
