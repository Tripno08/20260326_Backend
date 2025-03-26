#!/bin/bash

# Script para atualizar a aplicação no ambiente de homologação
# Innerview Backend - RTI/MTSS Platform

echo "================================================="
echo "      ATUALIZAÇÃO DO AMBIENTE DE HOMOLOGAÇÃO     "
echo "================================================="
echo ""

# Dados do servidor
SERVER_IP="45.77.116.245"
SERVER_USER="root"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Conectando ao servidor de homologação para atualização...${NC}"
echo ""

# Comandos a serem executados no servidor remoto
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
  cd /opt/innerview-backend
  
  echo "Verificando atualizações do repositório..."
  git fetch origin
  
  # Verifica se há atualizações
  if git status -uno | grep -q "Your branch is behind"; then
    echo "Atualizações disponíveis, baixando alterações..."
    
    # Salvar modificações locais se existirem
    if git status --porcelain | grep -q .; then
      echo "Salvando modificações locais..."
      git stash
    fi
    
    git pull origin main
    
    echo "Instalando dependências..."
    npm install
    
    echo "Gerando cliente Prisma..."
    npx prisma generate
    
    echo "Reconstruindo e reiniciando containers..."
    docker-compose down
    docker-compose build app
    docker-compose up -d
    
    echo "Aguardando inicialização da aplicação..."
    sleep 15
    
    # Testes básicos de saúde
    echo "Verificando status da API..."
    curl -s http://localhost:3000/api/v1/health
    
    echo "Atualização concluída com sucesso!"
  else
    echo "A aplicação já está atualizada com a versão mais recente."
  fi
  
  # Status dos containers
  echo "Status atual dos containers:"
  docker-compose ps
EOF

# Verifica o resultado da execução remota
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}Processo de atualização concluído com sucesso!${NC}"
  echo -e "${GREEN}Verifique o status da aplicação com ./check-homolog.sh${NC}"
else
  echo -e "\n${RED}Erro durante a atualização. Verifique os logs acima.${NC}"
  exit 1
fi 