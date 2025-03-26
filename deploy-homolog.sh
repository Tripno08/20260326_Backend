#!/bin/bash

# Script de implantação para ambiente de homologação
# Innerview Backend - RTI/MTSS Platform

echo "================================================="
echo "     DEPLOY DO BACKEND INNERVIEW - HOMOLOGAÇÃO   "
echo "================================================="
echo ""

# Dados do servidor
SERVER_IP="45.77.116.245"
SERVER_USER="root"
SERVER_DIR="/opt/innerview-backend"
GITHUB_REPO="https://github.com/Tripno08/20260326_Backend.git"
BRANCH="main"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Conectando ao servidor de homologação...${NC}"
echo ""

# Comandos a serem executados no servidor remoto
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
  # Atualizar o sistema
  echo "Atualizando sistema..."
  apt update && apt upgrade -y
  
  # Instalar dependências
  echo "Instalando dependências..."
  apt install -y git curl nodejs npm docker.io docker-compose build-essential
  
  # Instalar Node.js 18 LTS
  echo "Instalando Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt install -y nodejs
  
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
  
  # Criar arquivo .env
  echo "Configurando variáveis de ambiente..."
  cat > .env << 'ENVFILE'
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/innerview?schema=public"
JWT_SECRET="homolog-secret-key-replace-in-production"
JWT_EXPIRES_IN="1d"
PORT=3000
NODE_ENV="production"
REDIS_HOST="redis"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_TTL=3600
ENVFILE
  
  # Instalar dependências do projeto
  echo "Instalando dependências do projeto..."
  npm install
  
  # Gerar cliente Prisma
  echo "Gerando cliente Prisma..."
  npx prisma generate
  
  # Configurar Docker Compose
  echo "Configurando Docker Compose..."
  cat > docker-compose.yml << 'DOCKERCOMPOSE'
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: innerview-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: innerview
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:alpine
    container_name: innerview-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: innerview-backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/innerview?schema=public
      - NODE_ENV=production
      - PORT=3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data:
  redis_data:
DOCKERCOMPOSE

  # Verificar e ajustar o Dockerfile se necessário
  echo "Verificando Dockerfile..."
  if [ ! -f "Dockerfile" ]; then
    echo "Criando Dockerfile..."
    cat > Dockerfile << 'DOCKERFILE'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
DOCKERFILE
  fi

  # Subir os containers
  echo "Iniciando aplicação com Docker Compose..."
  docker-compose down
  docker-compose build
  docker-compose up -d
  
  # Status final
  echo "Verificando status dos containers..."
  docker-compose ps
  
  # Verificar logs do aplicativo
  echo "Logs da aplicação (últimas 20 linhas):"
  docker-compose logs --tail=20 app
  
  # Verificar se a API está respondendo
  echo "Verificando se a API está respondendo..."
  sleep 10
  curl -s http://localhost:3000/api/v1/health || echo "A API ainda não está respondendo. Verifique os logs."

  # Configurando Nginx como proxy reverso
  echo "Configurando Nginx como proxy reverso..."
  apt install -y nginx

  # Criar configuração do Nginx
  cat > /etc/nginx/sites-available/innerview << 'NGINX'
server {
    listen 80;
    server_name 45.77.116.245;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

  # Ativar o site e reiniciar Nginx
  ln -sf /etc/nginx/sites-available/innerview /etc/nginx/sites-enabled/
  nginx -t
  systemctl restart nginx

  echo "Deploy concluído! A API estará disponível em http://45.77.116.245"
  echo "Documentação Swagger: http://45.77.116.245/api/docs"
EOF

# Verifica o resultado da execução remota
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
  echo -e "${GREEN}API disponível em: http://$SERVER_IP${NC}"
  echo -e "${GREEN}Documentação Swagger: http://$SERVER_IP/api/docs${NC}"
else
  echo -e "${RED}Erro durante o deploy. Verifique os logs acima.${NC}"
  exit 1
fi 