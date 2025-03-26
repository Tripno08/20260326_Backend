import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HealthService } from '../src/shared/health/health.service';

describe('Health Check (e2e)', () => {
  let app: INestApplication;
  let healthService: HealthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    healthService = moduleFixture.get<HealthService>(HealthService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('details');
    expect(response.body.details).toHaveProperty('database');
    expect(response.body.details).toHaveProperty('redis');
    expect(response.body.details).toHaveProperty('diskSpace');
    expect(response.body.details).toHaveProperty('memoryUsage');
    expect(response.body.details).toHaveProperty('systemLoad');
    expect(response.body.details).toHaveProperty('uptime');
  });

  it('deve verificar a saúde do banco de dados', async () => {
    const isHealthy = await healthService.checkDatabase();
    expect(isHealthy).toBe(true);
  });

  it('deve verificar a saúde do Redis', async () => {
    const isHealthy = await healthService.checkRedis();
    expect(isHealthy).toBe(true);
  });

  it('deve verificar o espaço em disco', async () => {
    const diskSpace = await healthService.checkDiskSpace();
    expect(diskSpace).toHaveProperty('free');
    expect(diskSpace).toHaveProperty('total');
    expect(diskSpace.free).toBeLessThanOrEqual(diskSpace.total);
  });

  it('deve verificar o uso de memória', async () => {
    const memoryUsage = await healthService.checkMemoryUsage();
    expect(memoryUsage).toHaveProperty('used');
    expect(memoryUsage).toHaveProperty('total');
    expect(memoryUsage.used).toBeLessThanOrEqual(memoryUsage.total);
  });

  it('deve verificar a carga do sistema', async () => {
    const systemLoad = await healthService.checkSystemLoad();
    expect(Array.isArray(systemLoad)).toBe(true);
    expect(systemLoad.length).toBe(3);
  });

  it('deve verificar o tempo de atividade', async () => {
    const uptime = await healthService.checkUptime();
    expect(typeof uptime).toBe('number');
    expect(uptime).toBeGreaterThan(0);
  });
}); 