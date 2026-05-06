import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppController } from './../src/app.controller';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn().mockResolvedValue([{ result: 1 }]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
      });
  });

  it('/db-health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/db-health')
      .expect(200)
      .expect({
        database: 'connected',
      });

    expect(dataSource.query).toHaveBeenCalledWith('select 1');
  });

  afterEach(async () => {
    await app.close();
  });
});
