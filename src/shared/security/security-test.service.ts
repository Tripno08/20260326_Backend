import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityTestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async testPasswordStrength(password: string): Promise<{
    isStrong: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    if (password.length < 8) {
      issues.push('Senha deve ter pelo menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('Senha deve conter pelo menos uma letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      issues.push('Senha deve conter pelo menos um número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isStrong: issues.length === 0,
      issues,
    };
  }

  async testSqlInjectionVulnerability(query: string): Promise<boolean> {
    const sqlInjectionPatterns = [
      /' OR '1'='1/i,
      /' OR 1=1/i,
      /' UNION SELECT/i,
      /' DROP TABLE/i,
      /' DELETE FROM/i,
      /' UPDATE SET/i,
      /' INSERT INTO/i,
      /' ALTER TABLE/i,
      /' TRUNCATE TABLE/i,
      /' EXEC/i,
      /' EXECUTE/i,
      /' DECLARE/i,
      /' WAITFOR/i,
      /' SHUTDOWN/i,
      /' BACKUP/i,
      /' RESTORE/i,
    ];

    return sqlInjectionPatterns.some(pattern => pattern.test(query));
  }

  async testXssVulnerability(input: string): Promise<boolean> {
    const xssPatterns = [
      /<script>/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /onclick=/i,
      /onmouseover=/i,
      /onmouseout=/i,
      /onkeypress=/i,
      /onkeydown=/i,
      /onkeyup=/i,
      /onblur=/i,
      /onfocus=/i,
      /onchange=/i,
      /onsubmit=/i,
      /onreset=/i,
      /onselect=/i,
      /onunload=/i,
      /onresize=/i,
      /onmove=/i,
      /onabort=/i,
      /onbeforeunload=/i,
      /onbeforeprint=/i,
      /onafterprint=/i,
      /oncanplay=/i,
      /oncanplaythrough=/i,
      /oncuechange=/i,
      /ondurationchange=/i,
      /onemptied=/i,
      /onended=/i,
      /onformchange=/i,
      /onforminput=/i,
      /onhashchange=/i,
      /oninput=/i,
      /oninvalid=/i,
      /onoffline=/i,
      /ononline=/i,
      /onpagehide=/i,
      /onpageshow=/i,
      /onpause=/i,
      /onplay=/i,
      /onplaying=/i,
      /onpopstate=/i,
      /onprogress=/i,
      /onratechange=/i,
      /onreadystatechange=/i,
      /onredo=/i,
      /onreset=/i,
      /onresize=/i,
      /onscroll=/i,
      /onseeked=/i,
      /onseeking=/i,
      /onselect=/i,
      /onshow=/i,
      /onstalled=/i,
      /onstorage=/i,
      /onsubmit=/i,
      /onsuspend=/i,
      /ontimeupdate=/i,
      /onundo=/i,
      /onunload=/i,
      /onvolumechange=/i,
      /onwaiting=/i,
      /onwheel=/i,
      /onzoom=/i,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  async testCsrfVulnerability(token: string): Promise<boolean> {
    try {
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      const { timestamp, signature } = JSON.parse(decodedToken);
      const currentTime = Date.now();
      const tokenAge = currentTime - timestamp;

      // Verifica se o token não expirou (30 minutos)
      if (tokenAge > 30 * 60 * 1000) {
        return true;
      }

      // Verifica se a assinatura é válida
      const expectedSignature = await bcrypt.hash(
        `${timestamp}${this.config.get('JWT_SECRET')}`,
        10,
      );

      return signature !== expectedSignature;
    } catch (error) {
      return true;
    }
  }

  async testRateLimitVulnerability(ip: string): Promise<boolean> {
    const requests = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM rate_limits
      WHERE ip = ${ip}
      AND timestamp > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    `;

    return requests[0].count > 100; // Mais de 100 requisições por minuto
  }

  async testFileUploadVulnerability(filename: string): Promise<boolean> {
    const dangerousExtensions = [
      '.php',
      '.asp',
      '.aspx',
      '.jsp',
      '.jspx',
      '.cgi',
      '.pl',
      '.py',
      '.rb',
      '.exe',
      '.dll',
      '.so',
      '.sh',
      '.bat',
      '.cmd',
      '.vbs',
      '.js',
      '.html',
      '.htm',
      '.xml',
      '.svg',
      '.swf',
      '.fla',
      '.jar',
      '.war',
      '.ear',
      '.zip',
      '.rar',
      '.7z',
      '.tar',
      '.gz',
    ];

    return dangerousExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  async testAuthenticationVulnerability(token: string): Promise<boolean> {
    try {
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      const { exp, iat } = JSON.parse(decodedToken);

      // Verifica se o token não expirou
      if (exp < Date.now() / 1000) {
        return true;
      }

      // Verifica se o token não foi emitido no futuro
      if (iat > Date.now() / 1000) {
        return true;
      }

      // Verifica se o token não é muito antigo (mais de 24 horas)
      if (Date.now() / 1000 - iat > 24 * 60 * 60) {
        return true;
      }

      return false;
    } catch (error) {
      return true;
    }
  }

  async getSecurityReport(): Promise<{
    vulnerabilities: {
      sqlInjection: boolean;
      xss: boolean;
      csrf: boolean;
      rateLimit: boolean;
      fileUpload: boolean;
      authentication: boolean;
    };
    recommendations: string[];
  }> {
    const vulnerabilities = {
      sqlInjection: await this.testSqlInjectionVulnerability("' OR '1'='1"),
      xss: await this.testXssVulnerability('<script>alert(1)</script>'),
      csrf: await this.testCsrfVulnerability('invalid-token'),
      rateLimit: await this.testRateLimitVulnerability('127.0.0.1'),
      fileUpload: await this.testFileUploadVulnerability('test.php'),
      authentication: await this.testAuthenticationVulnerability('invalid-token'),
    };

    const recommendations: string[] = [];

    if (vulnerabilities.sqlInjection) {
      recommendations.push('Implementar prepared statements para todas as queries SQL');
    }
    if (vulnerabilities.xss) {
      recommendations.push('Implementar sanitização de entrada e escape de saída HTML');
    }
    if (vulnerabilities.csrf) {
      recommendations.push('Implementar tokens CSRF para todas as requisições POST');
    }
    if (vulnerabilities.rateLimit) {
      recommendations.push('Implementar rate limiting mais rigoroso');
    }
    if (vulnerabilities.fileUpload) {
      recommendations.push('Implementar validação mais rigorosa de tipos de arquivo');
    }
    if (vulnerabilities.authentication) {
      recommendations.push('Implementar validação mais rigorosa de tokens JWT');
    }

    return {
      vulnerabilities,
      recommendations,
    };
  }
} 