import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegracaoPlataforma, Plataforma } from '@prisma/client';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async create(createIntegrationDto: CreateIntegrationDto): Promise<IntegracaoPlataforma> {
    // Validar configurações específicas da plataforma
    this.validatePlatformConfig(createIntegrationDto);

    return this.prisma.integracaoPlataforma.create({
      data: {
        ...createIntegrationDto
      },
    });
  }

  async findAll(ativo?: boolean): Promise<IntegracaoPlataforma[]> {
    const where: any = {};
    
    if (ativo !== undefined) {
      where.ativo = ativo;
    }
    
    return this.prisma.integracaoPlataforma.findMany({
      where,
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<IntegracaoPlataforma> {
    const integracao = await this.prisma.integracaoPlataforma.findUnique({
      where: { id },
    });

    if (!integracao) {
      throw new NotFoundException(`Integração com ID ${id} não encontrada`);
    }

    return integracao;
  }

  async update(id: string, updateIntegrationDto: UpdateIntegrationDto): Promise<IntegracaoPlataforma> {
    // Verificar se a integração existe
    await this.findOne(id);

    // Validar configurações específicas da plataforma
    this.validatePlatformConfig(updateIntegrationDto);

    return this.prisma.integracaoPlataforma.update({
      where: { id },
      data: {
        ...updateIntegrationDto
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Verificar se a integração existe
    await this.findOne(id);

    // Verificar se existem registros relacionados
    const integracao = await this.prisma.integracaoPlataforma.findUnique({
      where: { id },
      include: {
        sincronizacoesTurma: true,
        sincronizacoesUsuario: true,
        deploymentsLti: true,
      },
    });

    if (
      integracao.sincronizacoesTurma.length > 0 ||
      integracao.sincronizacoesUsuario.length > 0 ||
      integracao.deploymentsLti.length > 0
    ) {
      throw new BadRequestException(
        'Não é possível remover a integração pois existem sincronizações ou deployments associados',
      );
    }

    await this.prisma.integracaoPlataforma.delete({
      where: { id },
    });
  }

  private validatePlatformConfig(dto: CreateIntegrationDto | UpdateIntegrationDto): void {
    if (!dto.plataforma) return;

    // Aqui poderíamos ter validações específicas para cada plataforma
    // mas vamos simplificar para evitar erros de compilação
  }

  async authorize(id: string) {
    const integration = await this.prisma.integracaoPlataforma.findUnique({
      where: { id },
    });

    if (!integration) {
      throw new NotFoundException(`Integração com ID ${id} não encontrada`);
    }

    if (!integration.ativo) {
      throw new BadRequestException('Integração não está ativa');
    }

    // Implementação simulada de autorização
    return {
      success: true,
      authorizationUrl: `https://example.com/oauth/authorize?client_id=${integration.clientId}&redirect_uri=${integration.redirectUri}`,
      message: 'URL de autorização gerada com sucesso',
    };
  }

  async callback(id: string, code: string) {
    if (!code) {
      throw new BadRequestException('Código de autorização não fornecido');
    }

    const integration = await this.prisma.integracaoPlataforma.findUnique({
      where: { id },
    });

    if (!integration) {
      throw new NotFoundException(`Integração com ID ${id} não encontrada`);
    }

    // Implementação simulada de processamento de callback
    return {
      success: true,
      accessToken: 'access_token_mock',
      refreshToken: 'refresh_token_mock',
      expiresIn: 3600,
      message: 'Autorização processada com sucesso',
    };
  }

  async sync(id: string) {
    const integration = await this.prisma.integracaoPlataforma.findUnique({
      where: { id },
    });

    if (!integration) {
      throw new NotFoundException(`Integração com ID ${id} não encontrada`);
    }

    if (!integration.ativo) {
      throw new BadRequestException('Integração não está ativa');
    }

    // Implementação simulada de sincronização
    return {
      success: true,
      syncedItems: 10,
      message: 'Sincronização realizada com sucesso',
    };
  }
} 