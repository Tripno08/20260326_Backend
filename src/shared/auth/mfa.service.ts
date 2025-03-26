import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { RedisService } from '../cache/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MfaService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async generateSecret(userId: string): Promise<string> {
    const secret = authenticator.generateSecret();
    const key = `mfa:secret:${userId}`;
    await this.redisService.set(key, secret, 300); // 5 minutos para configurar
    return secret;
  }

  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    const key = `mfa:secret:${userId}`;
    const secret = await this.redisService.get(key);
    
    if (!secret) {
      return false;
    }

    const isValid = authenticator.verify({
      token,
      secret,
    });

    if (isValid) {
      // Salvar secret permanentemente
      await this.redisService.set(`mfa:enabled:${userId}`, secret);
      await this.redisService.del(key);
      return true;
    }

    return false;
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const key = `mfa:enabled:${userId}`;
    const secret = await this.redisService.get(key);
    
    if (!secret) {
      return false;
    }

    return authenticator.verify({
      token,
      secret,
    });
  }

  async isEnabled(userId: string): Promise<boolean> {
    const key = `mfa:enabled:${userId}`;
    return !!(await this.redisService.get(key));
  }

  async disable(userId: string): Promise<void> {
    const key = `mfa:enabled:${userId}`;
    await this.redisService.del(key);
  }

  generateQRCode(secret: string, email: string): string {
    const appName = this.configService.get<string>('APP_NAME', 'Innerview');
    return authenticator.keyuri(email, appName, secret);
  }
} 