## Visão Geral

O backend do Innerview será a espinha dorsal da plataforma, responsável por gerenciar dados educacionais complexos, processar intervenções RTI/MTSS, fornecer análises preditivas e garantir integrações perfeitas com sistemas educacionais externos. O sistema deve ser robusto, escalável e seguir uma arquitetura orientada a serviços que facilite a expansão e manutenção futura.

## Objetivos Principais

1. Criar uma API RESTful completa baseada no schema Prisma
2. Implementar um sistema de autenticação e autorização de múltiplos níveis
3. Desenvolver engines de análise de dados e insights educacionais
4. Garantir performance mesmo com volume alto de dados educacionais
5. Facilitar integrações com sistemas educacionais externos

## Tecnologias e Stack

- **Servidor:** Node.js 20.x com TypeScript
- **Framework:** NestJS 10.x
- **ORM:** Prisma (conforme schema já definido)
- **Banco de Dados:** MySQL 8.x
- **Cache:** Redis
- **Autenticação:** JWT, OAuth2 para provedores externos
- **Documentação API:** Swagger/OpenAPI
- **Testing:** Jest, Supertest
- **CI/CD:** GitHub Actions
- **Monitoramento:** Prometheus, Grafana
- **Logging:** Winston, Elastic Stack
- **Mensageria:** Bull para filas e jobs

## Arquitetura

O backend será estruturado seguindo uma arquitetura limpa com separação clara de responsabilidades:

```
src/
├── modules/                    # Módulos do sistema organizados por domínio
│   ├── auth/                   # Autenticação e autorização
│   ├── users/                  # Gestão de usuários
│   ├── students/               # Gestão de estudantes
│   ├── interventions/          # Framework RTI/MTSS e intervenções
│   ├── assessments/            # Rastreios e avaliações
│   ├── teams/                  # Gestão de equipes e reuniões
│   ├── insights/               # Análises preditivas e insights
│   ├── integrations/           # Integrações com sistemas externos
│   └── reports/                # Geração de relatórios
├── shared/                     # Recursos compartilhados entre módulos
│   ├── guards/                 # Guards de autenticação/autorização
│   ├── decorators/             # Decorators customizados
│   ├── pipes/                  # Pipes de validação e transformação
│   ├── filters/                # Filters para tratamento de exceções
│   ├── interceptors/           # Interceptors para logging, cache, etc.
│   └── utils/                  # Utilitários gerais
├── config/                     # Configurações do sistema
├── types/                      # Tipagens TypeScript
├── events/                     # Sistema de eventos
├── jobs/                       # Workers e processamento assíncrono
└── main.ts                     # Ponto de entrada da aplicação
```

## Módulos e Funcionalidades Específicas

### 1. Autenticação e Autorização

#### 1.1 Funcionalidades de Autenticação
- Implementar login com múltiplos provedores (email/senha, Google, Microsoft)
- Desenvolver autenticação federada para instituições
- Criar sistema de recuperação de senha e verificação de email
- Implementar autenticação multi-fator para perfis administrativos
- Desenvolver API para gerenciamento de sessões ativas

#### 1.2 Controle de Acesso
- Implementar RBAC (Role-Based Access Control) granular
- Desenvolver sistema de permissões baseadas em contexto (escola, turma, equipe)
- Criar logs de auditoria para ações e acessos
- Implementar filtros de visualização baseados no perfil de acesso
- Desenvolver APIs para compartilhamento seguro de recursos

### 2. API para Dashboard e Visualização de Dados

#### 2.1 API para Dashboard Multinível
- Criar endpoints para dashboards adaptativos por perfil de usuário
- Implementar API para visualização drill-down (rede → escola → turma → aluno)
- Desenvolver endpoints para KPIs educacionais personalizáveis
- Criar sistema de persistência para filtros contextuais
- Implementar APIs para comparativos entre períodos e grupos

#### 2.2 Processamento para Visualizações Avançadas
- Desenvolver serviços para análise de tendências em dados de progresso
- Implementar algoritmos para geração de mapas de calor
- Criar endpoints para dados de fluxo entre níveis RTI (para Diagramas Sankey)
- Desenvolver processamento para gráficos radar de perfil multidimensional
- Criar APIs para visualizações comparativas com benchmarks

#### 2.3 API para Componentes Interativos
- Desenvolver endpoints para scorecards interativos
- Implementar serviços para análise histórica de métricas
- Criar APIs para indicadores de progresso
- Desenvolver endpoints para filtros e controles
- Implementar sistema de preferência de layout para widgets reposicionáveis

### 3. Gestão de Estudantes

#### 3.1 API para Cadastro e Perfil
- Desenvolver CRUD completo para informações acadêmicas e pessoais
- Criar endpoints para histórico educacional e de intervenções
- Implementar serviços para visualização de progresso longitudinal
- Desenvolver API para upload e gestão de documentos
- Criar sistema de associação com responsáveis e contatos

#### 3.2 Serviços para Análise de Desempenho
- Implementar APIs para dashboard individual de desempenho
- Desenvolver endpoints para gráficos de progresso por área
- Criar serviços para comparação com benchmarks e objetivos
- Implementar APIs para histórico de avaliações e rastreios
- Desenvolver algoritmos para indicadores de risco acadêmico

#### 3.3 API para Gestão de Casos
- Criar endpoints para atribuição a equipes e especialistas
- Implementar serviços para registro de observações e notas
- Desenvolver APIs para comunicação com responsáveis
- Criar sistema de encaminhamentos e referências
- Implementar APIs para planos de intervenção personalizados

### 4. Framework RTI/MTSS

#### 4.1 API para Níveis de Intervenção
- Desenvolver endpoints para visualização da pirâmide RTI/MTSS
- Criar serviços para classificação e gestão por nível (Tier 1, 2, 3)
- Implementar lógica para critérios de movimento entre níveis
- Desenvolver API para monitoramento de proporção de estudantes por nível
- Criar algoritmos para análise de eficácia por nível de intervenção

#### 4.2 API para Planejamento de Intervenções
- Desenvolver endpoints para biblioteca de intervenções baseadas em evidências
- Criar serviços para recomendações personalizadas por perfil
- Implementar APIs para planejamento com objetivos, duração e recursos
- Desenvolver endpoints para monitoramento de fidelidade de implementação
- Criar serviços para ajustes baseados em resposta
- Implementar persistência para planos criados via drag and drop
- Desenvolver APIs para fluxogramas de intervenção
- Criar endpoints para sequenciamento de atividades
- Implementar serviços para biblioteca de componentes de intervenção
- Desenvolver endpoints para cronogramas visuais

#### 4.3 API para Monitoramento de Progresso
- Criar endpoints para ferramentas de monitoramento específicas por nível
- Implementar serviços para definição de metas e objetivos
- Desenvolver APIs para gráficos de progresso com linhas de tendência
- Criar sistema de alertas para falta de resposta adequada
- Implementar endpoints para decisões baseadas em dados de resposta

### 5. Rastreios e Avaliações

#### 5.1 API para Instrumentos de Rastreio
- Desenvolver endpoints para catálogo de instrumentos por área e idade
- Criar serviços para aplicação individual ou em grupo
- Implementar sistema de pontuação e interpretação automática
- Desenvolver APIs para visualização de resultados com códigos de cor
- Criar algoritmos para comparação com pontos de corte normativos

#### 5.2 API para Avaliações Formais
- Desenvolver endpoints para registro de resultados de avaliações padronizadas
- Criar serviços para importação de dados de sistemas externos
- Implementar APIs para análise de tendências em múltiplas avaliações
- Desenvolver algoritmos para comparação com normas e benchmarks
- Criar sistema de recomendações baseadas em resultados

#### 5.3 API para Planejamento de Ciclos de Avaliação
- Desenvolver endpoints para calendário de rastreios e avaliações
- Criar serviços para agendamento automatizado com lembretes
- Implementar APIs para monitoramento de completude de ciclos
- Desenvolver algoritmos para análise de cobertura de avaliação
- Criar endpoints para relatórios de resultados por ciclo

### 6. Gestão de Equipes e Reuniões

#### 6.1 API para Formação e Gestão de Equipes
- Desenvolver endpoints para criação de equipes multidisciplinares
- Criar serviços para atribuição de papéis e responsabilidades
- Implementar APIs para distribuição de casos e carga de trabalho
- Desenvolver algoritmos para métricas de desempenho de equipe
- Criar endpoints para comunicação intra-equipe

#### 6.2 API para Reuniões e Colaboração
- Desenvolver endpoints para agendamento de reuniões com integração de calendário
- Criar serviços para preparação automática de pauta
- Implementar APIs para registro de presença e decisões
- Desenvolver endpoints para notas colaborativas e atas
- Criar sistema para acompanhamento de encaminhamentos

#### 6.3 API para Encaminhamentos
- Desenvolver endpoints para criação e atribuição de encaminhamentos
- Criar serviços para gestão de prazos e priorização
- Implementar sistema de notificações e lembretes
- Desenvolver APIs para histórico e rastreamento
- Criar endpoints para métricas de resolução

### 7. Gestão Hierárquica Educacional

#### 7.1 API para Redes e Distritos
- Desenvolver endpoints para cadastro e gestão de redes/distritos
- Criar serviços para dashboard de visão consolidada
- Implementar APIs para comparativos entre escolas
- Desenvolver endpoints para configurações em nível de rede
- Criar serviços para relatórios agregados

#### 7.2 API para Escolas e Unidades
- Desenvolver endpoints para cadastro completo de escolas
- Criar serviços para perfil detalhado com métricas
- Implementar APIs para gestão de equipes e recursos
- Desenvolver endpoints para dashboard específico por escola
- Criar sistema para configurações escolares

#### 7.3 API para Classes e Turmas
- Desenvolver endpoints para gestão de turmas e períodos
- Criar serviços para atribuição de estudantes e professores
- Implementar APIs para visualização de composição
- Desenvolver endpoints para dashboard de turma para professores
- Criar algoritmos para análise de desempenho por turma

### 8. Integrações Educacionais

#### 8.1 Implementação de Learning Tools Interoperability (LTI)
- Desenvolver provider LTI 1.1 e 1.3 completo
- Criar endpoints para configuração visual com validação
- Implementar serviços para diagnóstico de conexão
- Desenvolver APIs para dashboard de uso de ferramentas
- Criar sistema de deep linking com plataformas LMS

#### 8.2 Integração com Microsoft Education e Graph API
- Implementar autenticação e autorização Microsoft
- Desenvolver serviços para sincronização com Teams e Classes
- Criar APIs para importação de perfis educacionais
- Implementar endpoints para integração com calendário e atribuições
- Desenvolver sistema de mapeamento de recursos e entidades

#### 8.3 Integração com Google Classroom
- Implementar autenticação OAuth com Google
- Desenvolver serviços para importação de classes e estudantes
- Criar APIs para sincronização de atribuições
- Implementar endpoints para relatórios de atividade
- Desenvolver sistema de mapeamento entre sistemas

#### 8.4 Implementação de REST API
- Desenvolver documentação interativa (Swagger/OpenAPI)
- Criar playground para desenvolvedores
- Implementar sistema de gerenciamento de tokens e acessos
- Desenvolver endpoints para monitoramento de uso
- Criar sistema de webhooks para eventos

### 9. Recursos de IA e Análise Preditiva

#### 9.1 API para Recomendações Personalizadas
- Desenvolver serviços para recomendações de intervenções baseadas em perfil
- Criar algoritmos para sugestões de agrupamento por necessidades similares
- Implementar APIs para recursos educacionais personalizados
- Desenvolver sistema de alertas preventivos baseados em padrões
- Criar endpoints para explicabilidade de recomendações

#### 9.2 Implementação de Análise Preditiva
- Desenvolver modelos de risco acadêmico
- Criar algoritmos para previsão de resposta a intervenções
- Implementar serviços para identificação precoce de dificuldades
- Desenvolver APIs para análise de tendências com projeções
- Criar sistema de reconhecimento de padrões em dados educacionais

#### 9.3 API para Insights Acionáveis
- Desenvolver endpoints para dashboard de insights prioritários
- Criar serviços para alertas preventivos baseados em padrões
- Implementar APIs para sugestões específicas para cada perfil
- Desenvolver algoritmos para insights comparativos com evidências
- Criar endpoints para impacto potencial de decisões

### 10. Relatórios e Comunicação

#### 10.1 API para Geração de Relatórios
- Desenvolver sistema para modelos personalizáveis por instituição
- Criar serviços para relatórios para diferentes stakeholders
- Implementar APIs para exportação em múltiplos formatos
- Desenvolver endpoints para programação automática de relatórios
- Criar serviços para visualizações incorporadas

#### 10.2 API para Comunicação com Famílias
- Desenvolver endpoints para registro de comunicações
- Criar serviços para modelos de comunicação por situação
- Implementar APIs para histórico de interações
- Desenvolver sistema para agendamento de reuniões
- Criar endpoints para portal de famílias

#### 10.3 API para Colaboração e Documentação
- Desenvolver endpoints para notas colaborativas
- Criar serviços para documentação de casos
- Implementar APIs para biblioteca de recursos e materiais
- Desenvolver endpoints para histórico de decisões e justificativas
- Criar sistema para compartilhamento seguro de informações

### 11. Suporte para Experiência Mobile e de Campo

#### 11.1 API para Suporte ao Design Responsivo
- Otimizar endpoints para diferentes tamanhos de payload
- Implementar APIs com suporte a paginação adaptativa
- Desenvolver serviços otimizados para dispositivos móveis
- Criar endpoints para suporte a diferentes resoluções e densidades de tela
- Implementar sistema de compressão de respostas para redes limitadas

#### 11.2 Implementação de Funcionalidades Offline
- Desenvolver APIs para sincronização com armazenamento local
- Criar serviços para reconciliação de dados offline
- Implementar endpoints para status de sincronização
- Desenvolver algoritmos para resolução automática de conflitos
- Criar sistema de priorização para sincronização

#### 11.3 API para Ferramentas de Campo
- Desenvolver endpoints para geração e leitura de códigos QR
- Criar serviços otimizados para formulários de entrada rápida
- Implementar APIs para captura e sincronização de observações em tempo real
- Desenvolver endpoints para dashboards compactos
- Criar sistema de notificações para dispositivos móveis

## Requisitos Técnicos Específicos

### 1. Autenticação e Segurança

- Implementar sistema de autenticação multi-fator
- Gerenciar sessões ativas com controle granular
- Aplicar RBAC (Role-Based Access Control) contextual baseado em instituições e equipes
- Implementar rate limiting para prevenção de ataques
- Garantir conformidade com LGPD/GDPR para dados educacionais sensíveis
- Auditar todas as ações relevantes do sistema
- Implementar sistemas de detecção de acessos suspeitos
- Criar mecanismos de backup e recuperação de credenciais
- Desenvolver sistema de logging seguro para ações sensíveis
- Implementar proteção contra ataques de força bruta

### 2. API e Performance

- Desenvolver endpoints RESTful seguindo convenções de nomenclatura consistentes
- Implementar paginação, filtragem e ordenação eficientes em todos os endpoints de listagem
- Aplicar estratégias de cache para recursos frequentemente acessados
- Otimizar consultas ao banco de dados com índices apropriados
- Implementar validações robustas usando class-validator e Zod
- Estabelecer rate limiting e circuit breakers para endpoints críticos
- Criar sistema de data loaders para minimizar N+1 queries
- Implementar compressão de resposta para redução de payload
- Desenvolver sistema de pooling de conexões para o banco de dados
- Criar endpoints otimizados para bulk operations

### 3. Integração e Interoperabilidade

- Desenvolver conectores LTI para integração com plataformas LMS
- Implementar autenticação OAuth2 para Microsoft e Google
- Criar sistema de webhooks para notificações em tempo real
- Estabelecer endpoints de importação/exportação para dados educacionais
- Implementar sistema de sincronização com APIs externas
- Desenvolver adaptadores para diferentes formatos de dados educacionais
- Criar sistema de mapeamento flexível entre entidades externas e internas
- Implementar filas para processamento assíncrono de integrações
- Desenvolver sistema de retry para falhas de integração
- Criar logs detalhados de operações de integração

### 4. Processamento de Dados e Análise

- Desenvolver sistema de geração de relatórios assíncrono
- Implementar processamento em batch para operações pesadas
- Criar pipeline de análise preditiva para identificação de riscos acadêmicos
- Desenvolver engine de recomendação de intervenções baseada em perfis
- Implementar sistema de alertas baseado em padrões de dados
- Criar serviços de agregação para dashboards multinível
- Desenvolver algoritmos para detecção de anomalias em dados educacionais
- Implementar sistema de cache para resultados de análises complexas
- Criar jobs agendados para atualização periódica de métricas
- Desenvolver mecanismos para exportação de grandes volumes de dados

### 5. Infraestrutura e Operação

- Deploy no servidor Ubuntu 24.04 (IP: 45.77.116.245)
- Configurar Nginx como proxy reverso
- Implementar backup automático do banco de dados
- Configurar monitoramento com Prometheus e Grafana
- Implementar logging centralizado e rastreável
- Configurar sistema de CI/CD via GitHub Actions
- Estabelecer ambiente de staging para testes pré-produção
- Criar scripts de migração para atualizações do schema
- Implementar health checks para monitoramento de serviços
- Configurar sistema de alerta para falhas de infraestrutura
- Desenvolver estratégia de escalabilidade horizontal
- Criar documentação detalhada de infraestrutura como código

## Cronograma de Desenvolvimento

1. **Fase 1 (2 semanas):** Configuração da infraestrutura, setup do projeto e implementação da autenticação
   - Configuração do servidor e ambiente de desenvolvimento
   - Implementação da estrutura base do projeto NestJS
   - Desenvolvimento do sistema de autenticação e autorização
   - Configuração inicial do Prisma e banco de dados

2. **Fase 2 (3 semanas):** Desenvolvimento dos módulos core (usuários, estudantes, intervenções)
   - Implementação das APIs de gestão de usuários
   - Desenvolvimento dos endpoints de gestão de estudantes
   - Criação das APIs para framework RTI/MTSS e intervenções
   - Configuração de testes unitários e de integração

3. **Fase 3 (2 semanas):** Implementação dos módulos de avaliação e equipes
   - Desenvolvimento das APIs de rastreios e avaliações
   - Implementação dos endpoints de gestão de equipes e reuniões
   - Criação dos serviços para encaminhamentos
   - Testes e validação dos módulos

4. **Fase 4 (2 semanas):** Desenvolvimento das integrações externas
   - Implementação da integração LTI
   - Desenvolvimento das APIs para Microsoft Education
   - Criação da integração com Google Classroom
   - Configuração de webhooks e notificações

5. **Fase 5 (3 semanas):** Implementação dos insights e análises preditivas
   - Desenvolvimento dos algoritmos de análise preditiva
   - Implementação das APIs de recomendações
   - Criação dos serviços de insights acionáveis
   - Testes e ajustes dos modelos

6. **Fase 6 (2 semanas):** Otimização, testes e documentação
   - Otimização de performance e consultas
   - Finalização da documentação da API (Swagger)
   - Testes de carga e estabilidade
   - Preparação para lançamento

## Contrato API com Frontend

O desenvolvimento seguirá estritamente o schema Prisma como contrato entre backend e frontend. Qualquer modificação no schema deve ser comunicada e coordenada com a equipe de frontend. Os endpoints seguirão a especificação OpenAPI e serão documentados via Swagger.

A estrutura de API seguirá o padrão:

```
/api/v1/{recurso}                    # Operações de listagem e criação
/api/v1/{recurso}/{id}               # Operações em um recurso específico
/api/v1/{recurso}/{id}/{subrecurso}  # Operações em subrecursos
```

Todos os endpoints retornarão respostas padronizadas:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "totalCount": 100, "page": 1, "perPage": 20 },
  "error": null
}
```

Em caso de erro:

```json
{
  "success": false,
  "data": null,
  "meta": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição amigável do erro",
    "details": { ... }
  }
}
```

## Métricas de Sucesso

1. 100% dos endpoints necessários implementados e documentados
2. Tempo de resposta médio abaixo de 300ms para operações regulares
3. Cobertura de testes acima de 80%
4. Zero vulnerabilidades críticas em scans de segurança
5. Escalabilidade para suportar até 5000 usuários simultâneos
6. Disponibilidade da API acima de 99.9%
7. Taxa de erro abaixo de 0.1% para todas as operações
8. Todas as integrações externas funcionando com taxa de sucesso > 98%
9. Banco de dados com performance otimizada (consultas < 100ms)
10. Sistema de backup e recuperação com RTO < 1 hora

## Notas Adicionais

- Priorizar desempenho em consultas complexas de dados educacionais
- Implementar estratégias eficientes para lidar com dados históricos
- Garantir que o sistema seja facilmente extensível para novos tipos de intervenções e avaliações
- Focar em segurança, especialmente considerando a natureza sensível dos dados educacionais
- Desenvolver sistema de auditoria abrangente para todas as operações críticas
- Criar documentação técnica detalhada para todos os módulos e APIs
- Implementar monitoramento proativo para detectar problemas antes que afetem usuários
- Estabelecer estratégia de mitigação de riscos para dependências externas
- Garantir conformidade com padrões educacionais relevantes (IMS Global, Ed-Fi, etc.)
- Desenvolver estratégia para lidar com picos de uso (início do ano letivo, períodos de avaliação, etc.)

## Formatos para uso com Cursor.ai e Claude Sonnet 3.7 Max

Este documento está formatado para uso direto com Claude Sonnet 3.7 Max no Cursor.ai. Para referência rápida durante o desenvolvimento:

1. Use blocos de código com três backticks para inserir exemplos:

```typescript
// Exemplo de controller NestJS com TypeScript
@Controller('interventions')
export class InterventionsController {
  constructor(private interventionsService: InterventionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query() query: FindAllInterventionsDto): Promise<InterventionResponseDto[]> {
    return this.interventionsService.findAll(query);
  }
}
```

2. Para obter ajuda específica com implementações, forneça contexto detalhado:

"Preciso implementar um sistema de cache para os dados de dashboard que invalida automaticamente quando os dados subjacentes são modificados. Estou usando Redis com NestJS."

3. Para solicitar revisões de código, inclua o código atual e especifique o que deseja melhorar:

"Pode revisar este serviço para otimizar as consultas ao banco de dados? Estou tendo problemas de performance com consultas aninhadas."

4. Para debugging, forneça o erro completo e o contexto:

"Estou recebendo este erro ao implementar o sistema de autenticação: 'Error: JwtStrategy requires a secret or key'. Aqui está minha configuração atual."

# Briefing Final de Desenvolvimento Backend - Projeto Innerview

Backend Innerview:
- Projeto NestJS com TypeScript para plataforma educacional
- Arquitetura modular com separação clara de responsabilidades
- ORM Prisma com schema extenso definido
- Autenticação JWT com controle de acesso baseado em papéis
- Estrutura RESTful com endpoints documentados
- Módulos implementados: Autenticação, Usuários

Status: Configuração inicial completa, desenvolvimento em andamento (15%)
