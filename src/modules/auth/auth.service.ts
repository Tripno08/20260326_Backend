import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { credenciais: true },
    });

    if (user && user.credenciais) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.credenciais.senha,
      );

      if (isPasswordValid) {
        const { credenciais, ...result } = user;
        return result;
      }
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      cargo: user.cargo,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', 7 * 24 * 60 * 60),
      }),
    ]);

    // Armazenar refresh token no Redis
    await this.redis.set(
      `refresh_token:${user.id}`,
      refreshToken,
      this.config.get('JWT_REFRESH_EXPIRATION', 7 * 24 * 60 * 60),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cargo: user.cargo,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const newPayload = {
        email: user.email,
        sub: user.id,
        cargo: user.cargo,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh_token:${userId}`);
    return { message: 'Logout realizado com sucesso' };
  }

  async validateMfa(userId: string, mfaCode: string): Promise<boolean> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { credenciais: true },
    });

    if (!user?.credenciais) {
      throw new UnauthorizedException('Credenciais não encontradas');
    }

    // Implementar validação do código MFA
    // TODO: Implementar validação do código MFA usando biblioteca específica
    return true;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
} 