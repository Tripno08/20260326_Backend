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
if [ -f .env.homolog ]; then
    echo "Carregando variáveis de ambiente de homologação..."
    source .env.homolog
else
    echo -e "${RED}Erro: Arquivo .env.homolog não encontrado${NC}"
    exit 1
fi

# Verificar variáveis obrigatórias
if [ -z "$JWT_SECRET" ] || [ -z "$REDIS_PASSWORD" ]; then
    echo -e "${RED}Erro: Variáveis de ambiente obrigatórias não estão definidas${NC}"
    exit 1
fi

# Definir DB_PASSWORD explicitamente
DB_PASSWORD="Innerview@2024#Homolog"

echo -e "${YELLOW}Conectando ao servidor de homologação...${NC}"
echo ""

# Comandos a serem executados no servidor remoto
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
  # Verificar e aguardar qualquer processo de atualização em andamento
  echo "Verificando processos de atualização em andamento..."
  for i in {1..60}; do
    if pgrep -f "apt|dpkg" > /dev/null; then
      echo "Processo de apt/dpkg em andamento. Aguardando finalização... (\$i/60)"
      sleep 10
    else
      echo "Nenhum processo de apt/dpkg em execução. Continuando..."
      break
    fi
    
    # Se chegou ao final do loop, forçar remoção de locks
    if [ \$i -eq 60 ]; then
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
  apt-get install -y git curl nodejs npm docker.io docker-compose build-essential nginx certbot python3-certbot-nginx
  
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
  nginx -v
  
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
    git clone $GITHUB_REPO .
  fi
  
  # Criar estrutura de diretórios para Nginx
  echo "Configurando diretórios para Nginx..."
  mkdir -p /opt/innerview-backend/nginx/ssl
  mkdir -p /opt/innerview-backend/nginx/logs
  
  # Criar arquivo .env
  echo "Configurando variáveis de ambiente..."
  cat > .env << ENVFILE
# Configuração do banco de dados
DATABASE_URL="mysql://root:${DB_PASSWORD}@mysql:3306/innerview"

# Configuração JWT 
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="1d"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# Configuração da API
PORT=3000
NODE_ENV="staging"

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
SWAGGER_TITLE="Innerview API - Homologação"
SWAGGER_DESCRIPTION="API da plataforma Innerview - Ambiente de Homologação"
SWAGGER_VERSION="1.0"
SWAGGER_PATH="api"

# Logging
LOG_LEVEL="info"

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# Security
CORS_ORIGIN="*"
ENABLE_SWAGGER=true
ENVFILE
  
  # Instalar dependências do projeto
  echo "Instalando dependências do projeto..."
  npm ci
  
  # Gerar cliente Prisma
  echo "Gerando cliente Prisma..."
  npx prisma generate
  
  # Configurar Docker Compose
  echo "Configurando Docker Compose..."
  cat > docker-compose.yml << DOCKERCOMPOSE
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=staging
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
DOCKERCOMPOSE

  # Verificar e ajustar o Dockerfile se necessário
  echo "Verificando Dockerfile..."
  if [ ! -f "Dockerfile" ]; then
    echo "Criando Dockerfile..."
    cat > Dockerfile << DOCKERFILE
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
DOCKERFILE
  fi
  
  # Configurar Nginx
  echo "Configurando Nginx..."
  cat > nginx/homolog.conf << NGINXCONF
server {
    listen 80;
    server_name homolog.innerview.com.br;
    
    # Redirecionamento para HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name homolog.innerview.com.br;

    # Certificados SSL
    ssl_certificate /etc/nginx/ssl/homolog.innerview.com.br.crt;
    ssl_certificate_key /etc/nginx/ssl/homolog.innerview.com.br.key;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    # Diretório para arquivos de log
    access_log /var/log/nginx/homolog-access.log;
    error_log /var/log/nginx/homolog-error.log;

    # Configuração para servir arquivos estáticos
    location /static/ {
        alias /app/static/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Proxy para a API
    location /api/ {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    # Documentação Swagger
    location /api-docs/ {
        proxy_pass http://app:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://app:3000/api/v1/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Status
    location /status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
    }

    # Página principal 
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXCONF

  # Gerar certificado SSL auto-assinado para homologação
  echo "Gerando certificado SSL auto-assinado..."
  mkdir -p nginx/ssl
  if [ ! -f "nginx/ssl/homolog.innerview.com.br.key" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/ssl/homolog.innerview.com.br.key \
      -out nginx/ssl/homolog.innerview.com.br.crt \
      -subj "/C=BR/ST=Estado/L=Cidade/O=Innerview/OU=TI/CN=homolog.innerview.com.br"
  fi

  # Instalar dependências do sistema necessárias para o docker
  echo "Configurando Docker..."
  systemctl enable docker
  systemctl start docker
  
  # Parar containers existentes se houver
  docker-compose down 2>/dev/null || true
  
  # Limpar imagens antigas para evitar problemas de espaço
  echo "Limpando imagens Docker não utilizadas..."
  docker system prune -af --volumes 2>/dev/null || true
  
  # Subir os containers
  echo "Iniciando aplicação com Docker Compose..."
  docker-compose build --no-cache
  docker-compose up -d
  
  # Status final
  echo "Verificando status dos containers..."
  docker-compose ps
  
  # Verificar logs do aplicativo
  echo "Logs da aplicação (últimas 20 linhas):"
  sleep 15
  docker-compose logs --tail=20 app
  
  # Verificar se a API está respondendo
  echo "Verificando se a API está respondendo..."
  sleep 10
  curl -s http://localhost:3000/api/v1/health || echo "A API ainda não está respondendo. Verifique os logs."

  # Configurar firewall
  echo "Configurando firewall..."
  ufw allow ssh
  ufw allow http
  ufw allow https
  ufw --force enable
  
  # Criar cron job para backup diário do banco de dados
  echo "Configurando backup diário do banco de dados..."
  cat > /etc/cron.daily/backup-innerview-homolog << 'BACKUP'
#!/bin/bash
TIMESTAMP=\$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/opt/innerview-backups/homolog"
mkdir -p \$BACKUP_DIR

# Backup do banco de dados
cd /opt/innerview-backend
docker-compose exec -T mysql mysqldump -u root -p${DB_PASSWORD} innerview > \$BACKUP_DIR/innerview-\$TIMESTAMP.sql

# Manter apenas os últimos 7 backups
ls -tp \$BACKUP_DIR/*.sql | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}
BACKUP

  chmod +x /etc/cron.daily/backup-innerview-homolog
  
  # Criar diretório para backups
  mkdir -p /opt/innerview-backups/homolog
  
  echo -e "${GREEN}Deploy de homologação concluído com sucesso!${NC}"
EOF

echo -e "${GREEN}Processo de deploy de homologação finalizado!${NC}"

# Instruções adicionais
echo -e "${YELLOW}Para acessar o ambiente de homologação:${NC}"
echo -e "- API: https://homolog.innerview.com.br/api"
echo -e "- Documentação: https://homolog.innerview.com.br/api-docs"
echo -e "- Status: https://homolog.innerview.com.br/health"
echo ""
echo -e "${YELLOW}Para verificar os logs:${NC}"
echo -e "ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_DIR && docker-compose logs --tail=100 app'"
echo ""
echo -e "${YELLOW}Para reiniciar os serviços:${NC}"
echo -e "ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_DIR && docker-compose restart'" 