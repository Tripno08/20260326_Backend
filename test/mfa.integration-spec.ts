import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MfaService } from '../src/shared/auth/mfa.service';
import { RedisService } from '../src/shared/redis/redis.service';
import { authenticator } from 'otplib';

describe('Autenticação Multi-Fator', () => {
  let app: INestApplication;
  let mfaService: MfaService;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mfaService = moduleFixture.get<MfaService>(MfaService);
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

  it('deve gerar secret e QR code', async () => {
    const userId = 'test-user-id';
    const email = 'test@example.com';

    const secret = await mfaService.generateSecret(userId);
    const qrCode = mfaService.generateQRCode(secret, email);

    expect(secret).toBeDefined();
    expect(qrCode).toBeDefined();
    expect(qrCode).toContain(email);
  });

  it('deve habilitar MFA após verificação', async () => {
    const userId = 'test-user-id';
    const secret = await mfaService.generateSecret(userId);
    const token = authenticator.generate(secret);

    const result = await mfaService.verifyAndEnable(userId, token);
    expect(result).toBe(true);

    const isEnabled = await mfaService.isEnabled(userId);
    expect(isEnabled).toBe(true);
  });

  it('deve rejeitar token inválido', async () => {
    const userId = 'test-user-id';
    const secret = await mfaService.generateSecret(userId);
    const token = '000000'; // Token inválido

    const result = await mfaService.verifyAndEnable(userId, token);
    expect(result).toBe(false);

    const isEnabled = await mfaService.isEnabled(userId);
    expect(isEnabled).toBe(false);
  });

  it('deve verificar token MFA', async () => {
    const userId = 'test-user-id';
    const secret = await mfaService.generateSecret(userId);
    const token = authenticator.generate(secret);

    await mfaService.verifyAndEnable(userId, token);
    const isValid = await mfaService.verifyToken(userId, token);
    expect(isValid).toBe(true);
  });

  it('deve desabilitar MFA', async () => {
    const userId = 'test-user-id';
    const secret = await mfaService.generateSecret(userId);
    const token = authenticator.generate(secret);

    await mfaService.verifyAndEnable(userId, token);
    await mfaService.disable(userId);

    const isEnabled = await mfaService.isEnabled(userId);
    expect(isEnabled).toBe(false);
  });

  it('deve expirar secret não utilizado', async () => {
    const userId = 'test-user-id';
    await mfaService.generateSecret(userId);

    // Esperar 6 minutos (TTL é 5 minutos)
    await new Promise(resolve => setTimeout(resolve, 360000));

    const result = await mfaService.verifyAndEnable(userId, '000000');
    expect(result).toBe(false);
  });
}); 