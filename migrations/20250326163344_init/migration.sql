-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cargo` ENUM('ADMIN', 'PROFESSOR', 'ESPECIALISTA', 'COORDENADOR', 'DIRETOR', 'ADMINISTRADOR') NOT NULL DEFAULT 'PROFESSOR',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `avatar` VARCHAR(191) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    INDEX `usuarios_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credenciais` (
    `id` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `salt` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `credenciais_usuarioId_key`(`usuarioId`),
    INDEX `credenciais_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estudantes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `serie` VARCHAR(191) NOT NULL,
    `dataNascimento` DATETIME(3) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `instituicaoId` VARCHAR(191) NULL,

    INDEX `estudantes_usuarioId_idx`(`usuarioId`),
    INDEX `estudantes_instituicaoId_fkey`(`instituicaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacoes` (
    `id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `pontuacao` DOUBLE NOT NULL,
    `observacoes` TEXT NULL,
    `metadados` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,

    INDEX `avaliacoes_estudanteId_idx`(`estudanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `intervencoes` (
    `id` VARCHAR(191) NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `status` ENUM('PENDENTE', 'AGENDADO', 'ATIVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'ATIVO',
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `intervencaoBaseId` VARCHAR(191) NULL,

    INDEX `intervencoes_estudanteId_idx`(`estudanteId`),
    INDEX `intervencoes_intervencaoBaseId_idx`(`intervencaoBaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `integracoes_plataforma` (
    `id` VARCHAR(191) NOT NULL,
    `plataforma` ENUM('GOOGLE_CLASSROOM', 'MICROSOFT_TEAMS', 'LTI', 'PERSONALIZADO') NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `clientSecret` TEXT NOT NULL,
    `tenantId` VARCHAR(191) NULL,
    `redirectUri` VARCHAR(191) NOT NULL,
    `escopos` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sincronizacoes_turma` (
    `id` VARCHAR(191) NOT NULL,
    `turmaExternaId` VARCHAR(191) NOT NULL,
    `nomeTurma` VARCHAR(191) NOT NULL,
    `ultimaSincronizacao` DATETIME(3) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `integracaoId` VARCHAR(191) NOT NULL,

    INDEX `sincronizacoes_turma_integracaoId_idx`(`integracaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sincronizacoes_usuario` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioExternoId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `ultimaSincronizacao` DATETIME(3) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NULL,
    `integracaoId` VARCHAR(191) NOT NULL,
    `sincronizacaoTurmaId` VARCHAR(191) NULL,

    INDEX `sincronizacoes_usuario_usuarioId_idx`(`usuarioId`),
    INDEX `sincronizacoes_usuario_integracaoId_idx`(`integracaoId`),
    INDEX `sincronizacoes_usuario_sincronizacaoTurmaId_idx`(`sincronizacaoTurmaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhooks` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `segredo` VARCHAR(191) NOT NULL,
    `eventos` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `integracaoId` VARCHAR(191) NOT NULL,

    INDEX `webhooks_integracaoId_idx`(`integracaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deployments_lti` (
    `id` VARCHAR(191) NOT NULL,
    `deploymentId` VARCHAR(191) NOT NULL,
    `emissor` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `urlLoginAuth` VARCHAR(191) NOT NULL,
    `urlTokenAuth` VARCHAR(191) NOT NULL,
    `urlKeySet` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `integracaoId` VARCHAR(191) NOT NULL,

    INDEX `deployments_lti_integracaoId_idx`(`integracaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membros_equipe` (
    `id` VARCHAR(191) NOT NULL,
    `cargo` ENUM('COORDENADOR', 'ESPECIALISTA', 'PROFESSOR', 'CONSELHEIRO', 'PSICOLOGO', 'OUTRO') NOT NULL,
    `dataEntrada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataSaida` DATETIME(3) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `equipeId` VARCHAR(191) NOT NULL,

    INDEX `membros_equipe_usuarioId_idx`(`usuarioId`),
    INDEX `membros_equipe_equipeId_idx`(`equipeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estudantes_equipe` (
    `id` VARCHAR(191) NOT NULL,
    `dataAtribuicao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataRemocao` DATETIME(3) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `equipeId` VARCHAR(191) NOT NULL,

    INDEX `estudantes_equipe_estudanteId_idx`(`estudanteId`),
    INDEX `estudantes_equipe_equipeId_idx`(`equipeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reunioes` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `local` VARCHAR(191) NULL,
    `status` ENUM('PENDENTE', 'AGENDADO', 'ATIVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'AGENDADO',
    `observacoes` TEXT NULL,
    `resumo` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `equipeId` VARCHAR(191) NOT NULL,
    `pauta` TEXT NULL,

    INDEX `reunioes_equipeId_idx`(`equipeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participantes_reuniao` (
    `id` VARCHAR(191) NOT NULL,
    `presente` BOOLEAN NOT NULL DEFAULT false,
    `cargo` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `reuniaoId` VARCHAR(191) NOT NULL,
    `confirmado` BOOLEAN NOT NULL DEFAULT false,

    INDEX `participantes_reuniao_usuarioId_idx`(`usuarioId`),
    INDEX `participantes_reuniao_reuniaoId_idx`(`reuniaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comunicacoes_tutor` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('EMAIL', 'TELEFONE', 'PRESENCIAL', 'CARTA', 'OUTRO') NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `assunto` VARCHAR(191) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `infoContato` VARCHAR(191) NULL,
    `nomeContato` VARCHAR(191) NULL,
    `status` ENUM('RASCUNHO', 'ENVIADO', 'ENTREGUE', 'LIDO', 'RESPONDIDO', 'FALHA') NOT NULL DEFAULT 'ENVIADO',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `comunicacoes_tutor_estudanteId_idx`(`estudanteId`),
    INDEX `comunicacoes_tutor_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mensagens` (
    `id` VARCHAR(191) NOT NULL,
    `assunto` VARCHAR(191) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `remetenteId` VARCHAR(191) NOT NULL,
    `destinatarioId` VARCHAR(191) NOT NULL,
    `estudanteId` VARCHAR(191) NULL,

    INDEX `mensagens_remetenteId_idx`(`remetenteId`),
    INDEX `mensagens_destinatarioId_idx`(`destinatarioId`),
    INDEX `mensagens_estudanteId_idx`(`estudanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encaminhamentos` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `dataPrazo` DATETIME(3) NULL,
    `status` ENUM('PENDENTE', 'AGENDADO', 'ATIVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    `prioridade` ENUM('BAIXA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `dataConclusao` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `atribuidoPara` VARCHAR(191) NOT NULL,
    `criadoPor` VARCHAR(191) NOT NULL,
    `equipeId` VARCHAR(191) NULL,
    `reuniaoId` VARCHAR(191) NULL,

    INDEX `encaminhamentos_estudanteId_idx`(`estudanteId`),
    INDEX `encaminhamentos_atribuidoPara_idx`(`atribuidoPara`),
    INDEX `encaminhamentos_criadoPor_idx`(`criadoPor`),
    INDEX `encaminhamentos_equipeId_idx`(`equipeId`),
    INDEX `encaminhamentos_reuniaoId_idx`(`reuniaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('REUNIAO_AGENDADA', 'LEMBRETE_REUNIAO', 'ENCAMINHAMENTO_ATRIBUIDO', 'PRAZO_PROXIMO', 'PRAZO_VENCIDO', 'MENSAGEM_RECEBIDA', 'ESTUDANTE_ATUALIZADO', 'AVALIACAO_ADICIONADA', 'INTERVENCAO_ATUALIZADA', 'CONVITE_EQUIPE') NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `notificacoes_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dificuldades_aprendizagem` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `sintomas` TEXT NOT NULL,
    `categoria` ENUM('LEITURA', 'ESCRITA', 'MATEMATICA', 'ATENCAO', 'COMPORTAMENTO', 'COMUNICACAO', 'COORDENACAO_MOTORA', 'MEMORIA', 'ORGANIZACAO', 'OUTRO') NOT NULL,
    `status` ENUM('PENDENTE', 'AGENDADO', 'ATIVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'ATIVO',
    `metadados` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estudante_dificuldades` (
    `id` VARCHAR(191) NOT NULL,
    `nivel` ENUM('BAIXO', 'MODERADO', 'ALTO', 'MUITO_ALTO') NOT NULL,
    `dataIdentificacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `dificuldadeId` VARCHAR(191) NOT NULL,

    INDEX `estudante_dificuldades_estudanteId_idx`(`estudanteId`),
    INDEX `estudante_dificuldades_dificuldadeId_idx`(`dificuldadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instrumentos_rastreio` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `categoria` ENUM('ACADEMICO', 'COMPORTAMENTAL', 'SOCIOEMOCIONAL', 'COGNITIVO', 'LINGUAGEM', 'MOTOR', 'ATENCAO', 'OUTRO') NOT NULL,
    `faixaEtaria` VARCHAR(191) NOT NULL,
    `tempoAplicacao` INTEGER NOT NULL,
    `instrucoes` TEXT NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indicadores_rastreio` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo` ENUM('ESCALA_LIKERT', 'SIM_NAO', 'NUMERICO', 'MULTIPLA_ESCOLHA', 'TEXTO_LIVRE') NOT NULL,
    `valorMinimo` DOUBLE NOT NULL,
    `valorMaximo` DOUBLE NOT NULL,
    `pontoCorte` DOUBLE NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `instrumentoId` VARCHAR(191) NOT NULL,

    INDEX `indicadores_rastreio_instrumentoId_idx`(`instrumentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rastreios` (
    `id` VARCHAR(191) NOT NULL,
    `dataAplicacao` DATETIME(3) NOT NULL,
    `observacoes` TEXT NULL,
    `status` ENUM('PENDENTE', 'AGENDADO', 'ATIVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'EM_ANDAMENTO',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `aplicadorId` VARCHAR(191) NOT NULL,
    `instrumentoId` VARCHAR(191) NOT NULL,

    INDEX `rastreios_estudanteId_idx`(`estudanteId`),
    INDEX `rastreios_aplicadorId_idx`(`aplicadorId`),
    INDEX `rastreios_instrumentoId_idx`(`instrumentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resultados_rastreio` (
    `id` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `nivelRisco` ENUM('BAIXO', 'MODERADO', 'ALTO', 'MUITO_ALTO') NULL,
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `rastreioId` VARCHAR(191) NOT NULL,
    `indicadorId` VARCHAR(191) NOT NULL,

    INDEX `resultados_rastreio_rastreioId_idx`(`rastreioId`),
    INDEX `resultados_rastreio_indicadorId_idx`(`indicadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `intervencoes_base` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `objetivo` TEXT NOT NULL,
    `nivel` ENUM('UNIVERSAL', 'SELETIVO', 'INTENSIVO') NOT NULL,
    `area` ENUM('LEITURA', 'ESCRITA', 'MATEMATICA', 'COMPORTAMENTO', 'ATENCAO', 'SOCIOEMOCIONAL', 'LINGUAGEM', 'OUTRO') NOT NULL,
    `tempoEstimado` INTEGER NOT NULL,
    `frequencia` ENUM('DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'PERSONALIZADA') NOT NULL,
    `materiaisNecessarios` TEXT NULL,
    `evidenciaCientifica` TEXT NULL,
    `fonteEvidencia` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `protocolos_intervencao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `duracaoEstimada` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `intervencaoBaseId` VARCHAR(191) NOT NULL,

    INDEX `protocolos_intervencao_intervencaoBaseId_idx`(`intervencaoBaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etapas_protocolo` (
    `id` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tempoEstimado` INTEGER NOT NULL,
    `materiaisNecessarios` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `protocoloId` VARCHAR(191) NOT NULL,

    INDEX `etapas_protocolo_protocoloId_idx`(`protocoloId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpis_intervencao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `unidadeMedida` VARCHAR(191) NOT NULL,
    `valorMinimo` DOUBLE NULL,
    `valorMaximo` DOUBLE NULL,
    `valorAlvo` DOUBLE NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `intervencaoBaseId` VARCHAR(191) NOT NULL,

    INDEX `kpis_intervencao_intervencaoBaseId_idx`(`intervencaoBaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progressos_intervencao` (
    `id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `observacoes` TEXT NULL,
    `valorKpi` DOUBLE NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `intervencaoId` VARCHAR(191) NOT NULL,
    `kpiId` VARCHAR(191) NULL,

    INDEX `progressos_intervencao_intervencaoId_idx`(`intervencaoId`),
    INDEX `progressos_intervencao_kpiId_idx`(`kpiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessoes_intervencao` (
    `id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `duracao` INTEGER NOT NULL,
    `status` ENUM('PENDENTE', 'AGENDADO', 'ATIVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'AGENDADO',
    `observacoes` TEXT NULL,
    `materiaisUtilizados` TEXT NULL,
    `desafiosEncontrados` TEXT NULL,
    `proximosPassos` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `intervencaoId` VARCHAR(191) NOT NULL,
    `aplicadorId` VARCHAR(191) NOT NULL,

    INDEX `sessoes_intervencao_intervencaoId_idx`(`intervencaoId`),
    INDEX `sessoes_intervencao_aplicadorId_idx`(`aplicadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resultados_kpi` (
    `id` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `sessaoId` VARCHAR(191) NOT NULL,
    `kpiId` VARCHAR(191) NOT NULL,

    INDEX `resultados_kpi_sessaoId_idx`(`sessaoId`),
    INDEX `resultados_kpi_kpiId_idx`(`kpiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metas` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo` ENUM('ACADEMICA', 'COMPORTAMENTAL', 'SOCIOEMOCIONAL', 'COGNITIVA', 'LINGUAGEM', 'MOTORA', 'ATENCAO', 'OUTRA') NOT NULL,
    `especifico` VARCHAR(191) NOT NULL,
    `mensuravel` VARCHAR(191) NOT NULL,
    `atingivel` VARCHAR(191) NOT NULL,
    `relevante` VARCHAR(191) NOT NULL,
    `temporal` VARCHAR(191) NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `status` ENUM('NAO_INICIADA', 'EM_ANDAMENTO', 'ATINGIDA', 'NAO_ATINGIDA', 'CANCELADA') NOT NULL DEFAULT 'NAO_INICIADA',
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `intervencaoId` VARCHAR(191) NOT NULL,

    INDEX `metas_intervencaoId_idx`(`intervencaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dificuldade_intervencoes` (
    `id` VARCHAR(191) NOT NULL,
    `eficacia` INTEGER NOT NULL,
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `dificuldadeId` VARCHAR(191) NOT NULL,
    `intervencaoId` VARCHAR(191) NOT NULL,

    INDEX `dificuldade_intervencoes_dificuldadeId_idx`(`dificuldadeId`),
    INDEX `dificuldade_intervencoes_intervencaoId_idx`(`intervencaoId`),
    UNIQUE INDEX `dificuldade_intervencoes_dificuldadeId_intervencaoId_key`(`dificuldadeId`, `intervencaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `previsoes_estudante` (
    `id` VARCHAR(191) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `tipoPrevisao` VARCHAR(191) NOT NULL,
    `probabilidade` DOUBLE NOT NULL,
    `recomendacoes` TEXT NULL,
    `dataAnalise` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `previsoes_estudante_estudanteId_idx`(`estudanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_dados` (
    `id` VARCHAR(191) NOT NULL,
    `estudanteId` VARCHAR(191) NOT NULL,
    `tipoMedicao` VARCHAR(191) NOT NULL,
    `valorNumerico` DOUBLE NULL,
    `valorTexto` VARCHAR(191) NULL,
    `data` DATETIME(3) NOT NULL,
    `fonte` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `historico_dados_estudanteId_idx`(`estudanteId`),
    INDEX `historico_dados_tipoMedicao_data_idx`(`tipoMedicao`, `data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracoes_dashboard` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `layout` TEXT NOT NULL,
    `filtrosPadrao` TEXT NULL,
    `compartilhado` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `configuracoes_dashboard_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paineis_dashboard` (
    `id` VARCHAR(191) NOT NULL,
    `configuracaoDashboardId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `configuracao` TEXT NOT NULL,
    `ordem` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `paineis_dashboard_configuracaoDashboardId_idx`(`configuracaoDashboardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedbacks` (
    `id` VARCHAR(191) NOT NULL,
    `intervencaoId` VARCHAR(191) NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `classificacao` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `visibilidade` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `feedbacks_intervencaoId_idx`(`intervencaoId`),
    INDEX `feedbacks_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recursos_pedagogicos` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `urlRecurso` VARCHAR(191) NULL,
    `arquivoPath` VARCHAR(191) NULL,
    `categoriasTag` VARCHAR(191) NOT NULL,
    `nivelSerie` VARCHAR(191) NULL,
    `licenca` VARCHAR(191) NULL,
    `criadoPorId` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `recursos_pedagogicos_criadoPorId_idx`(`criadoPorId`),
    INDEX `recursos_pedagogicos_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recursos_intervencao` (
    `id` VARCHAR(191) NOT NULL,
    `recursoPedagogicoId` VARCHAR(191) NOT NULL,
    `intervencaoBaseId` VARCHAR(191) NOT NULL,

    INDEX `recursos_intervencao_recursoPedagogicoId_idx`(`recursoPedagogicoId`),
    INDEX `recursos_intervencao_intervencaoBaseId_idx`(`intervencaoBaseId`),
    UNIQUE INDEX `recursos_intervencao_recursoPedagogicoId_intervencaoBaseId_key`(`recursoPedagogicoId`, `intervencaoBaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modelos_relatorio` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `tipoRelatorio` VARCHAR(191) NOT NULL,
    `estrutura` TEXT NOT NULL,
    `criadoPorId` VARCHAR(191) NOT NULL,
    `compartilhado` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `modelos_relatorio_criadoPorId_idx`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relatorios_gerados` (
    `id` VARCHAR(191) NOT NULL,
    `modeloRelatorioId` VARCHAR(191) NOT NULL,
    `parametros` TEXT NULL,
    `arquivoPath` VARCHAR(191) NOT NULL,
    `geradoPorId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `relatorios_gerados_modeloRelatorioId_idx`(`modeloRelatorioId`),
    INDEX `relatorios_gerados_geradoPorId_idx`(`geradoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instituicoes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `configuracoes` TEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `instituicoes_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios_instituicao` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `instituicaoId` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `usuarios_instituicao_usuarioId_idx`(`usuarioId`),
    INDEX `usuarios_instituicao_instituicaoId_idx`(`instituicaoId`),
    UNIQUE INDEX `usuarios_instituicao_usuarioId_instituicaoId_key`(`usuarioId`, `instituicaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `credenciais` ADD CONSTRAINT `credenciais_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudantes` ADD CONSTRAINT `estudantes_instituicaoId_fkey` FOREIGN KEY (`instituicaoId`) REFERENCES `instituicoes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudantes` ADD CONSTRAINT `estudantes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervencoes` ADD CONSTRAINT `intervencoes_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervencoes` ADD CONSTRAINT `intervencoes_intervencaoBaseId_fkey` FOREIGN KEY (`intervencaoBaseId`) REFERENCES `intervencoes_base`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sincronizacoes_turma` ADD CONSTRAINT `sincronizacoes_turma_integracaoId_fkey` FOREIGN KEY (`integracaoId`) REFERENCES `integracoes_plataforma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sincronizacoes_usuario` ADD CONSTRAINT `sincronizacoes_usuario_integracaoId_fkey` FOREIGN KEY (`integracaoId`) REFERENCES `integracoes_plataforma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sincronizacoes_usuario` ADD CONSTRAINT `sincronizacoes_usuario_sincronizacaoTurmaId_fkey` FOREIGN KEY (`sincronizacaoTurmaId`) REFERENCES `sincronizacoes_turma`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sincronizacoes_usuario` ADD CONSTRAINT `sincronizacoes_usuario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhooks` ADD CONSTRAINT `webhooks_integracaoId_fkey` FOREIGN KEY (`integracaoId`) REFERENCES `integracoes_plataforma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deployments_lti` ADD CONSTRAINT `deployments_lti_integracaoId_fkey` FOREIGN KEY (`integracaoId`) REFERENCES `integracoes_plataforma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membros_equipe` ADD CONSTRAINT `membros_equipe_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membros_equipe` ADD CONSTRAINT `membros_equipe_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudantes_equipe` ADD CONSTRAINT `estudantes_equipe_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudantes_equipe` ADD CONSTRAINT `estudantes_equipe_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reunioes` ADD CONSTRAINT `reunioes_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participantes_reuniao` ADD CONSTRAINT `participantes_reuniao_reuniaoId_fkey` FOREIGN KEY (`reuniaoId`) REFERENCES `reunioes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participantes_reuniao` ADD CONSTRAINT `participantes_reuniao_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comunicacoes_tutor` ADD CONSTRAINT `comunicacoes_tutor_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comunicacoes_tutor` ADD CONSTRAINT `comunicacoes_tutor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensagens` ADD CONSTRAINT `mensagens_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensagens` ADD CONSTRAINT `mensagens_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensagens` ADD CONSTRAINT `mensagens_remetenteId_fkey` FOREIGN KEY (`remetenteId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encaminhamentos` ADD CONSTRAINT `encaminhamentos_atribuidoPara_fkey` FOREIGN KEY (`atribuidoPara`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encaminhamentos` ADD CONSTRAINT `encaminhamentos_criadoPor_fkey` FOREIGN KEY (`criadoPor`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encaminhamentos` ADD CONSTRAINT `encaminhamentos_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encaminhamentos` ADD CONSTRAINT `encaminhamentos_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encaminhamentos` ADD CONSTRAINT `encaminhamentos_reuniaoId_fkey` FOREIGN KEY (`reuniaoId`) REFERENCES `reunioes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudante_dificuldades` ADD CONSTRAINT `estudante_dificuldades_dificuldadeId_fkey` FOREIGN KEY (`dificuldadeId`) REFERENCES `dificuldades_aprendizagem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudante_dificuldades` ADD CONSTRAINT `estudante_dificuldades_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `indicadores_rastreio` ADD CONSTRAINT `indicadores_rastreio_instrumentoId_fkey` FOREIGN KEY (`instrumentoId`) REFERENCES `instrumentos_rastreio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rastreios` ADD CONSTRAINT `rastreios_aplicadorId_fkey` FOREIGN KEY (`aplicadorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rastreios` ADD CONSTRAINT `rastreios_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rastreios` ADD CONSTRAINT `rastreios_instrumentoId_fkey` FOREIGN KEY (`instrumentoId`) REFERENCES `instrumentos_rastreio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_rastreio` ADD CONSTRAINT `resultados_rastreio_indicadorId_fkey` FOREIGN KEY (`indicadorId`) REFERENCES `indicadores_rastreio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_rastreio` ADD CONSTRAINT `resultados_rastreio_rastreioId_fkey` FOREIGN KEY (`rastreioId`) REFERENCES `rastreios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolos_intervencao` ADD CONSTRAINT `protocolos_intervencao_intervencaoBaseId_fkey` FOREIGN KEY (`intervencaoBaseId`) REFERENCES `intervencoes_base`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etapas_protocolo` ADD CONSTRAINT `etapas_protocolo_protocoloId_fkey` FOREIGN KEY (`protocoloId`) REFERENCES `protocolos_intervencao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpis_intervencao` ADD CONSTRAINT `kpis_intervencao_intervencaoBaseId_fkey` FOREIGN KEY (`intervencaoBaseId`) REFERENCES `intervencoes_base`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressos_intervencao` ADD CONSTRAINT `progressos_intervencao_intervencaoId_fkey` FOREIGN KEY (`intervencaoId`) REFERENCES `intervencoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressos_intervencao` ADD CONSTRAINT `progressos_intervencao_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `kpis_intervencao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessoes_intervencao` ADD CONSTRAINT `sessoes_intervencao_aplicadorId_fkey` FOREIGN KEY (`aplicadorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessoes_intervencao` ADD CONSTRAINT `sessoes_intervencao_intervencaoId_fkey` FOREIGN KEY (`intervencaoId`) REFERENCES `intervencoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_kpi` ADD CONSTRAINT `resultados_kpi_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `kpis_intervencao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_kpi` ADD CONSTRAINT `resultados_kpi_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `sessoes_intervencao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `metas` ADD CONSTRAINT `metas_intervencaoId_fkey` FOREIGN KEY (`intervencaoId`) REFERENCES `intervencoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dificuldade_intervencoes` ADD CONSTRAINT `dificuldade_intervencoes_dificuldadeId_fkey` FOREIGN KEY (`dificuldadeId`) REFERENCES `dificuldades_aprendizagem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dificuldade_intervencoes` ADD CONSTRAINT `dificuldade_intervencoes_intervencaoId_fkey` FOREIGN KEY (`intervencaoId`) REFERENCES `intervencoes_base`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `previsoes_estudante` ADD CONSTRAINT `previsoes_estudante_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_dados` ADD CONSTRAINT `historico_dados_estudanteId_fkey` FOREIGN KEY (`estudanteId`) REFERENCES `estudantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configuracoes_dashboard` ADD CONSTRAINT `configuracoes_dashboard_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paineis_dashboard` ADD CONSTRAINT `paineis_dashboard_configuracaoDashboardId_fkey` FOREIGN KEY (`configuracaoDashboardId`) REFERENCES `configuracoes_dashboard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_intervencaoId_fkey` FOREIGN KEY (`intervencaoId`) REFERENCES `intervencoes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recursos_pedagogicos` ADD CONSTRAINT `recursos_pedagogicos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recursos_intervencao` ADD CONSTRAINT `recursos_intervencao_intervencaoBaseId_fkey` FOREIGN KEY (`intervencaoBaseId`) REFERENCES `intervencoes_base`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recursos_intervencao` ADD CONSTRAINT `recursos_intervencao_recursoPedagogicoId_fkey` FOREIGN KEY (`recursoPedagogicoId`) REFERENCES `recursos_pedagogicos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modelos_relatorio` ADD CONSTRAINT `modelos_relatorio_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relatorios_gerados` ADD CONSTRAINT `relatorios_gerados_geradoPorId_fkey` FOREIGN KEY (`geradoPorId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relatorios_gerados` ADD CONSTRAINT `relatorios_gerados_modeloRelatorioId_fkey` FOREIGN KEY (`modeloRelatorioId`) REFERENCES `modelos_relatorio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios_instituicao` ADD CONSTRAINT `usuarios_instituicao_instituicaoId_fkey` FOREIGN KEY (`instituicaoId`) REFERENCES `instituicoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios_instituicao` ADD CONSTRAINT `usuarios_instituicao_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
