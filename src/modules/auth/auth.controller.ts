import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MfaValidationDto } from './dto/mfa-validation.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Public } from '../../shared/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Realizar login na plataforma' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            nome: { type: 'string' },
            cargo: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.senha,
    );

    if (!user) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas',
        },
      };
    }

    const result = await this.authService.login(user);
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário na plataforma' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso',
    schema: {
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            nome: { type: 'string' },
            cargo: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Email já cadastrado' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    // Verificar se o email já existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await this.authService.hashPassword(registerDto.senha);

    // Criar usuário
    const newUser = await this.prisma.usuario.create({
      data: {
        email: registerDto.email,
        nome: registerDto.nome,
        cargo: registerDto.cargo,
        senha: hashedPassword,
        credenciais: {
          create: {
            senha: hashedPassword,
            salt: '',  // Salt já está incluído no hash com bcrypt
          },
        },
      },
    });

    // Remover a senha da resposta
    const { senha, ...result } = newUser;

    return {
      message: 'Usuário criado com sucesso',
      user: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const result = await this.authService.refreshToken(
        refreshTokenDto.refreshToken,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token inválido',
        },
      };
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    await this.authService.logout(req.user['sub']);
    return {
      success: true,
      data: { message: 'Logout realizado com sucesso' },
    };
  }

  @Post('mfa/validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateMfa(
    @Req() req: Request,
    @Body() mfaValidationDto: MfaValidationDto,
  ) {
    const isValid = await this.authService.validateMfa(
      req.user['sub'],
      mfaValidationDto.code,
    );

    return {
      success: true,
      data: { isValid },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    return {
      success: true,
      data: {
        id: req.user['sub'],
        email: req.user['email'],
        roles: req.user['roles'],
      },
    };
  }
} 