#!/bin/bash

# Script de implantação para ambiente de produção
# Innerview Backend - RTI/MTSS Platform

echo "================================================="
echo "     DEPLOY DO BACKEND INNERVIEW - PRODUÇÃO      "
echo "================================================="
echo ""

# Dados do servidor
SERVER_IP="45.77.116.245"
SERVER_USER="root"
SERVER_PASS="Lh7+KPKVTyXwSVLZ"
SERVER_DIR="/opt/innerview-backend"
GITHUB_REPO="https://github.com/Tripno08/20260326_Backend.git"
BRANCH="main"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Carregar variáveis de ambiente
if [ -f .env.production ]; then
    echo "Carregando variáveis de ambiente de produção..."
    source .env.production
else
    echo -e "${RED}Erro: Arquivo .env.production não encontrado${NC}"
    exit 1
fi

# Verificar variáveis obrigatórias
if [ -z "$DB_PASSWORD" ] || [ -z "$JWT_SECRET" ] || [ -z "$REDIS_PASSWORD" ]; then
    echo -e "${RED}Erro: Variáveis de ambiente obrigatórias não estão definidas${NC}"
    exit 1
fi

echo -e "${YELLOW}Conectando ao servidor de produção...${NC}"
echo ""

# Comandos a serem executados no servidor remoto
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
  # Verificar e aguardar qualquer processo de atualização em andamento
  echo "Verificando processos de atualização em andamento..."
  for i in {1..60}; do
    if pgrep -f "apt|dpkg" > /dev/null; then
      echo "Processo de apt/dpkg em andamento. Aguardando finalização... ($i/60)"
      sleep 10
    else
      echo "Nenhum processo de apt/dpkg em execução. Continuando..."
      break
    fi
    
    if [ $i -eq 60 ]; then
      echo "Tempo esgotado. Tentando limpar locks manualmente..."
      killall apt apt-get 2>/dev/null || true
      rm -f /var/lib/apt/lists/lock
      rm -f /var/lib/dpkg/lock
      rm -f /var/lib/dpkg/lock-frontend
      rm -f /var/cache/apt/archives/lock
    fi
  done
  
  # Atualizar o sistema
  echo "Atualizando sistema..."
  apt-get update
  apt-get upgrade -y
  
  # Instalar dependências
  echo "Instalando dependências..."
  apt-get install -y git curl nodejs npm docker.io docker-compose build-essential sshpass
  
  # Instalar Node.js 18 LTS
  echo "Instalando Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
  
  # Verificar versões
  echo "Versões instaladas:"
  node -v
  npm -v
  docker --version
  docker-compose --version
  
  # Criar diretório do projeto
  echo "Preparando diretório do projeto..."
  mkdir -p /opt/innerview-backend
  cd /opt/innerview-backend
  
  # Clonar ou atualizar o repositório
  if [ -d ".git" ]; then
    echo "Repositório já existe, atualizando..."
    git pull
  else
    echo "Clonando repositório..."
    git clone https://github.com/Tripno08/20260326_Backend.git .
  fi
  
  # Criar arquivo .env com configurações de produção
  echo "Configurando variáveis de ambiente..."
  cat > .env << 'ENVFILE'
# Configuração do banco de dados
DATABASE_URL="mysql://root:${DB_PASSWORD}@mysql:3306/innerview"

# Configuração JWT (usar valores seguros em produção)
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="1d"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# Configuração da API
PORT=3000
NODE_ENV="production"

# Configuração de integração
MICROSOFT_CLIENT_ID="${MICROSOFT_CLIENT_ID}"
MICROSOFT_CLIENT_SECRET="${MICROSOFT_CLIENT_SECRET}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"

# Redis (para cache)
REDIS_HOST="redis"
REDIS_PORT=6379
REDIS_PASSWORD="${REDIS_PASSWORD}"
REDIS_TTL=3600

# Email
SMTP_HOST="${SMTP_HOST}"
SMTP_PORT="${SMTP_PORT}"
SMTP_USER="${SMTP_USER}"
SMTP_PASS="${SMTP_PASS}"

# Swagger
SWAGGER_TITLE="Innerview API"
SWAGGER_DESCRIPTION="API da plataforma Innerview"
SWAGGER_VERSION="1.0"
SWAGGER_PATH="api"

# Logging
LOG_LEVEL="info"

# Rate Limiting
RATE_LIMIT_TTL=60
ENVFILE

  # Configurar Docker Compose para produção
  echo "Configurando Docker Compose para produção..."
  cat > docker-compose.prod.yml << 'DOCKERFILE'
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:${DB_PASSWORD}@mysql:3306/innerview
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run start:prod

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
      - MYSQL_DATABASE=innerview
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
DOCKERFILE

  # Parar containers existentes
  echo "Parando containers existentes..."
  docker-compose -f docker-compose.prod.yml down

  # Remover volumes antigos (opcional, descomente se necessário)
  # echo "Removendo volumes antigos..."
  # docker volume rm innerview-backend_postgres_data innerview-backend_redis_data

  # Construir imagens
  echo "Construindo imagens Docker..."
  docker-compose -f docker-compose.prod.yml build --no-cache

  # Iniciar containers
  echo "Iniciar containers..."
  docker-compose -f docker-compose.prod.yml up -d

  # Aguardar containers estarem saudáveis
  echo "Aguardando containers estarem saudáveis..."
  sleep 30

  # Verificar status dos containers
  echo "Verificando status dos containers..."
  docker-compose -f docker-compose.prod.yml ps

  # Executar migrações do banco de dados
  echo "Executando migrações do banco de dados..."
  docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

  # Verificar logs
  echo "Verificando logs da aplicação..."
  docker-compose -f docker-compose.prod.yml logs -f app

  echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
EOF

echo -e "${GREEN}Processo de deploy finalizado!${NC}" 