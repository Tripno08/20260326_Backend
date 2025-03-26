#!/bin/bash

# Script para verificar o status do ambiente de homologação
# Innerview Backend - RTI/MTSS Platform

echo "================================================="
echo "    VERIFICAÇÃO DO AMBIENTE DE HOMOLOGAÇÃO       "
echo "================================================="
echo ""

# Dados do servidor
SERVER_IP="45.77.116.245"
SERVER_USER="root"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Conectando ao servidor de homologação...${NC}"
echo ""

# Comandos a serem executados no servidor remoto
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
  echo -e "\n\033[1;34m=== INFORMAÇÕES DO SISTEMA ===\033[0m"
  echo "Uptime:"
  uptime
  echo -e "\nUso de CPU e memória:"
  top -bn1 | head -n 5
  echo -e "\nEspaço em disco:"
  df -h /
  
  echo -e "\n\033[1;34m=== STATUS DOS CONTAINERS ===\033[0m"
  cd /opt/innerview-backend
  docker-compose ps
  
  echo -e "\n\033[1;34m=== VERIFICAÇÃO DE ENDPOINTS ===\033[0m"
  echo "Health Check:"
  curl -s http://localhost:3000/api/v1/health || echo "API não está respondendo"
  
  echo -e "\n\033[1;34m=== ÚLTIMOS LOGS DA APLICAÇÃO ===\033[0m"
  docker-compose logs --tail=15 app
  
  echo -e "\n\033[1;34m=== STATUS NGINX ===\033[0m"
  systemctl status nginx --no-pager | head -n 10
EOF

# Verifica o resultado da execução remota
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}Verificação concluída com sucesso!${NC}"
else
  echo -e "\n${RED}Erro durante a verificação. Verifique os logs acima.${NC}"
  exit 1
fi

# Verifica se a API está acessível publicamente
echo -e "\n${YELLOW}Verificando acesso externo à API...${NC}"
curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/api/v1/health

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}API acessível externamente!${NC}"
  echo -e "${GREEN}Documentação Swagger: http://$SERVER_IP/api/docs${NC}"
else
  echo -e "\n${RED}API não está acessível externamente.${NC}"
fi 