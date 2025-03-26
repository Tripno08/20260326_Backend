import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { MfaService } from './mfa.service';

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(private readonly mfaService: MfaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    const isEnabled = await this.mfaService.isEnabled(user.id);
    if (!isEnabled) {
      return true;
    }

    const token = request.headers['x-mfa-token'];
    if (!token) {
      throw new HttpException(
        {
          error: 'MFA Required',
          message: 'Autenticação multi-fator é necessária',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const isValid = await this.mfaService.verifyToken(user.id, token);
    if (!isValid) {
      throw new HttpException(
        {
          error: 'Invalid MFA Token',
          message: 'Token de autenticação multi-fator inválido',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
} 