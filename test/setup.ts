import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { config } from 'dotenv';
import { resolve } from 'path';

let app: INestApplication;
let prisma: PrismaService;

// Carrega as variáveis de ambiente do arquivo .env.test
config({ path: resolve(__dirname, 'integrations/test.env') });

// Configura o timezone para UTC
process.env.TZ = 'UTC';

// Configura o nível de log para os testes
process.env.LOG_LEVEL = 'error';

// Configura o ambiente como teste
process.env.NODE_ENV = 'test';

// Configura o timeout global para os testes
jest.setTimeout(10000);

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  prisma = moduleFixture.get<PrismaService>(PrismaService);
  await app.init();
});

afterAll(async () => {
  await prisma.$disconnect();
  await app.close();
});

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Limpa todos os timers após cada teste
afterEach(() => {
  jest.useRealTimers();
});

export { app, prisma }; 