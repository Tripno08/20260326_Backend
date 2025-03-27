#!/bin/bash

# Script simples para verificar status do ambiente de homologação
# Innerview Backend - RTI/MTSS Platform

echo "================================================="
echo "       VERIFICAÇÃO DE STATUS - HOMOLOGAÇÃO       "
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

echo -e "${YELLOW}Verificando conectividade com o servidor...${NC}"
ping -c 1 $SERVER_IP > /dev/null

if [ $? -ne 0 ]; then
  echo -e "${RED}Erro: Não foi possível conectar ao servidor $SERVER_IP.${NC}"
  exit 1
fi

# Criar script temporário para verificação
CHECK_SCRIPT=$(mktemp)

cat > $CHECK_SCRIPT << 'EOFSCRIPT'
#!/bin/bash

echo -e "\n\033[1;34m=== INFORMAÇÕES DO SISTEMA ===\033[0m"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Data/Hora: $(date)"
echo -e "\nUso de CPU e memória:"
free -h | head -n 2
echo -e "\nEspaço em disco:"
df -h / | grep -v "Filesystem"

echo -e "\n\033[1;34m=== STATUS DOS SERVIÇOS ===\033[0m"
echo "Status do Docker:"
systemctl status docker --no-pager | head -n 3

echo -e "\nStatus do Nginx:"
systemctl status nginx --no-pager | head -n 3

echo -e "\n\033[1;34m=== CONTAINERS DOCKER ===\033[0m"
if [ -d "/opt/innerview-backend" ]; then
  cd /opt/innerview-backend
  docker-compose ps
else
  echo "Diretório da aplicação não encontrado."
fi

echo -e "\n\033[1;34m=== VERIFICAÇÃO DE ENDPOINTS ===\033[0m"
echo "Health Check API:"
curl -s http://localhost:3000/api/v1/health || echo "API não está respondendo na porta 3000"

echo -e "\nNginx Health Check:"
curl -s http://localhost/api/v1/health || echo "API não está respondendo via Nginx"

echo -e "\n\033[1;34m=== LOGS DA APLICAÇÃO ===\033[0m"
if [ -d "/opt/innerview-backend" ]; then
  cd /opt/innerview-backend
  echo "Últimas linhas do log:"
  docker-compose logs --tail=10 app
else
  echo "Diretório da aplicação não encontrado."
fi
EOFSCRIPT

# Transferir e executar o script
echo -e "${YELLOW}Verificando status do servidor...${NC}"
cat $CHECK_SCRIPT | ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cat > /tmp/check.sh && chmod +x /tmp/check.sh && /tmp/check.sh"

# Verificar resultado
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}Verificação concluída com sucesso!${NC}"
  
  # Verificar acesso externo
  echo -e "\n${YELLOW}Verificando acesso externo à API...${NC}"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/api/v1/health)
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}API está acessível externamente! (HTTP $HTTP_STATUS)${NC}"
    echo -e "${GREEN}Documentação Swagger: http://$SERVER_IP/api/docs${NC}"
  else
    echo -e "${RED}API não está acessível externamente. Status HTTP: $HTTP_STATUS${NC}"
  fi
else
  echo -e "\n${RED}Erro ao verificar status do servidor.${NC}"
  exit 1
fi

# Limpar arquivos temporários
rm -f $CHECK_SCRIPT 