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
        ...createIntegrationDto,
        configuracaoLti: createIntegrationDto.configuracaoLti ? JSON.stringify(createIntegrationDto.configuracaoLti) : null,
        configuracaoOAuth: createIntegrationDto.configuracaoOAuth ? JSON.stringify(createIntegrationDto.configuracaoOAuth) : null,
        configuracaoAdicional: createIntegrationDto.configuracaoAdicional ? JSON.stringify(createIntegrationDto.configuracaoAdicional) : null,
      },
    });
  }

  async findAll(ativo?: boolean): Promise<IntegracaoPlataforma[]> {
    return this.prisma.integracaoPlataforma.findMany({
      where: ativo !== undefined ? { ativo } : undefined,
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
        ...updateIntegrationDto,
        configuracaoLti: updateIntegrationDto.configuracaoLti ? JSON.stringify(updateIntegrationDto.configuracaoLti) : undefined,
        configuracaoOAuth: updateIntegrationDto.configuracaoOAuth ? JSON.stringify(updateIntegrationDto.configuracaoOAuth) : undefined,
        configuracaoAdicional: updateIntegrationDto.configuracaoAdicional ? JSON.stringify(updateIntegrationDto.configuracaoAdicional) : undefined,
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

    switch (dto.plataforma) {
      case Plataforma.LTI:
        if (!dto.configuracaoLti) {
          throw new BadRequestException('Configurações LTI são obrigatórias para integrações LTI');
        }
        break;

      case Plataforma.GOOGLE_CLASSROOM:
      case Plataforma.MICROSOFT_TEAMS:
        if (!dto.configuracaoOAuth) {
          throw new BadRequestException('Configurações OAuth são obrigatórias para integrações com Google ou Microsoft');
        }
        break;

      case Plataforma.PERSONALIZADO:
        if (!dto.configuracaoAdicional) {
          throw new BadRequestException('Configurações adicionais são obrigatórias para integrações personalizadas');
        }
        break;
    }
  }
} 