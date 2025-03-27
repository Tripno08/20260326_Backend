#!/bin/bash

# Script simplificado de deploy para homologação
# Innerview Backend - RTI/MTSS Platform

echo "================================================="
echo "           DEPLOY SIMPLIFICADO - HOMOLOGAÇÃO     "
echo "================================================="
echo ""

# Dados do servidor
SERVER_IP="45.77.116.245"
SERVER_USER="root"
SERVER_PASS="Lh7+KPKVTyXwSVLZ"
SERVER_DIR="/opt/innerview-backend"
GITHUB_REPO="https://github.com/Tripno08/20260326_Backend.git"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando processo de deploy...${NC}"

# Verificando a conectividade
echo -e "Testando conectividade com o servidor..."
ping -c 1 $SERVER_IP > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Erro: Não foi possível conectar ao servidor $SERVER_IP.${NC}"
  exit 1
fi

# Criar arquivos temporários de instalação
DEPLOY_SCRIPT=$(mktemp)

# Preparar script de deploy
cat > $DEPLOY_SCRIPT << 'EOFSCRIPT'
#!/bin/bash

# Criar diretório de log
mkdir -p /var/log/innerview
LOGFILE="/var/log/innerview/deploy-$(date +%Y%m%d%H%M%S).log"

# Redirecionar saída para o arquivo de log
exec > >(tee -a "$LOGFILE") 2>&1

echo "[$(date)] Iniciando deploy da aplicação Innerview..."

# Esperar qualquer processo apt terminar
echo "Verificando processos apt em execução..."
while pgrep -f apt > /dev/null; do
    echo "  - Aguardando processos apt terminarem..."
    sleep 10
done

# Atualizar sistema
echo "Atualizando sistema..."
apt-get update
apt-get install -y git curl wget gnupg lsb-release ca-certificates

# Instalar Docker se não estiver instalado
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    apt-get install -y docker-compose
fi

# Instalar Node.js
echo "Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Verificar versões
echo "Versões instaladas:"
node -v
npm -v
docker --version
docker-compose --version

# Configurar diretório do projeto
echo "Preparando diretório do projeto..."
mkdir -p /opt/innerview-backend
cd /opt/innerview-backend

# Clonar ou atualizar repositório
if [ -d ".git" ]; then
    echo "Atualizando repositório existente..."
    git fetch
    git reset --hard origin/main
    git pull
else
    echo "Clonando novo repositório..."
    git clone https://github.com/Tripno08/20260326_Backend.git .
fi

# Criar arquivo de ambiente
echo "Configurando variáveis de ambiente..."
cat > .env << EOF
DATABASE_URL="mysql://root:Innerview@2024#Prod@mysql:3306/innerview"
JWT_SECRET="Innerview@2024#JWT#Secret#Prod"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="production"
REDIS_HOST="redis"
REDIS_PORT=6379
REDIS_PASSWORD="Innerview@2024#Redis#Prod"
REDIS_TTL=3600
EOF

# Instalar dependências e gerar cliente Prisma
echo "Instalando dependências..."
npm install

echo "Gerando cliente Prisma..."
npx prisma generate

# Iniciar containers Docker
echo "Iniciando serviços Docker..."
systemctl start docker
systemctl enable docker

# Parar containers existentes se houver
docker-compose down || true

# Iniciar containers
docker-compose up --build -d

# Aguardar inicialização
echo "Aguardando serviços inicializarem..."
sleep 30

# Verificar status
echo "Status dos serviços:"
docker-compose ps

# Configurar Nginx
echo "Configurando Nginx..."
apt-get install -y nginx

# Configurar site
cat > /etc/nginx/sites-available/innerview << EOF
server {
    listen 80;
    server_name 45.77.116.245;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/innerview /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Verificar acesso
echo "Testando acesso à API..."
curl -s http://localhost:3000/api/v1/health || echo "API ainda não está acessível"

echo "[$(date)] Deploy concluído!"
EOFSCRIPT

# Transferir e executar o script
echo -e "${YELLOW}Transferindo script para o servidor...${NC}"
cat $DEPLOY_SCRIPT | ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cat > /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh"

# Verificar resultado
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Script de deploy enviado com sucesso!${NC}"
  
  # Verificar se a API está acessível
  echo -e "${YELLOW}Verificando se a API está acessível...${NC}"
  sleep 5
  if curl -s --head --request GET http://$SERVER_IP/api/v1/health | grep "200" > /dev/null; then
    echo -e "${GREEN}API está acessível e funcionando!${NC}"
    echo -e "${GREEN}Documentação Swagger: http://$SERVER_IP/api/docs${NC}"
  else
    echo -e "${YELLOW}API ainda não está acessível. O deploy pode estar em andamento.${NC}"
    echo -e "${YELLOW}Verifique o status em alguns minutos em: http://$SERVER_IP/api/docs${NC}"
  fi
else
  echo -e "${RED}Erro ao executar o script de deploy.${NC}"
  exit 1
fi

# Limpar arquivos temporários
rm -f $DEPLOY_SCRIPT 