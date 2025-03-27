import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as compression from 'compression';

describe('Compression (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(compression());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve comprimir resposta grande', async () => {
    // Criar dados de teste que gerem uma resposta grande
    const response = await request(app.getHttpServer())
      .get('/estudantes')
      .set('Accept-Encoding', 'gzip')
      .expect(200);

    // Verificar se a resposta está comprimida
    expect(response.headers['content-encoding']).toBe('gzip');
  });

  it('não deve comprimir resposta pequena', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('Accept-Encoding', 'gzip')
      .expect(200);

    // Verificar se a resposta não está comprimida
    expect(response.headers['content-encoding']).toBeUndefined();
  });

  it('deve lidar com diferentes tipos de conteúdo', async () => {
    const response = await request(app.getHttpServer())
      .get('/estudantes/relatorio')
      .set('Accept-Encoding', 'gzip')
      .expect(200);

    // Verificar se a resposta está comprimida independente do tipo de conteúdo
    expect(response.headers['content-encoding']).toBe('gzip');
  });
}); 