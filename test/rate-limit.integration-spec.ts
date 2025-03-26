import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RedisService } from '../src/shared/cache/redis.service';

describe('Rate Limiting', () => {
  let app: INestApplication;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisService = moduleFixture.get<RedisService>(RedisService);
    await app.init();
  });

  afterAll(async () => {
    await redisService.flushAll();
    await app.close();
  });

  beforeEach(async () => {
    await redisService.flushAll();
  });

  it('deve limitar tentativas de login', async () => {
    // Tentar login 6 vezes (limite é 5)
    for (let i = 0; i < 6; i++) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'wrong_password',
        });

      if (i < 5) {
        expect(response.status).toBe(401);
      } else {
        expect(response.status).toBe(429);
        expect(response.body.message).toBe('Você excedeu o limite de requisições permitido');
        expect(response.body.retryAfter).toBeDefined();
      }
    }
  });

  it('deve limitar requisições para endpoint de estudantes', async () => {
    // Fazer 101 requisições (limite é 100)
    for (let i = 0; i < 101; i++) {
      const response = await request(app.getHttpServer())
        .get('/estudantes');

      if (i < 100) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
        expect(response.body.message).toBe('Você excedeu o limite de requisições permitido');
        expect(response.body.retryAfter).toBeDefined();
      }
    }
  });

  it('deve resetar contador após o período de janela', async () => {
    // Fazer 5 requisições (limite é 5)
    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'wrong_password',
        });
      expect(response.status).toBe(401);
    }

    // Esperar 61 segundos (janela é 60 segundos)
    await new Promise(resolve => setTimeout(resolve, 61000));

    // Tentar novamente
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        senha: 'wrong_password',
      });
    expect(response.status).toBe(401);
  });

  it('deve usar limites diferentes para diferentes endpoints', async () => {
    // Fazer 51 requisições para /avaliacoes (limite é 50)
    for (let i = 0; i < 51; i++) {
      const response = await request(app.getHttpServer())
        .get('/avaliacoes');

      if (i < 50) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }

    // Fazer 101 requisições para /estudantes (limite é 100)
    for (let i = 0; i < 101; i++) {
      const response = await request(app.getHttpServer())
        .get('/estudantes');

      if (i < 100) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
}); 