import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
    };
  }

  @Get('db-health')
  async getDbHealth() {
    await this.dataSource.query('select 1');

    return {
      database: 'connected',
    };
  }
}