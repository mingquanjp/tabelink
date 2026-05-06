import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn().mockResolvedValue([{ result: 1 }]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('returns backend health status', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
      });
    });
  });

  describe('getDbHealth', () => {
    it('checks database connectivity', async () => {
      await expect(appController.getDbHealth()).resolves.toEqual({
        database: 'connected',
      });
      expect(dataSource.query).toHaveBeenCalledWith('select 1');
    });
  });
});
