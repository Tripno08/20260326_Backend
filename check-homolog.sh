#!/bin/bash

# Script para verificar o status do ambiente de homologação
# Innerview Backend - RTI/MTSS Platform

echo "================================================="
echo "     CHECK STATUS INNERVIEW - HOMOLOGAÇÃO        "
echo "================================================="
echo ""

# Dados do servidor
SERVER_IP="45.77.116.245"
SERVER_USER="root"
SERVER_PASS="Lh7+KPKVTyXwSVLZ"
SERVER_DIR="/opt/innerview-backend"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Conectando ao servidor de homologação para verificar status...${NC}"
echo ""

# Comandos a serem executados no servidor remoto
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
  echo "Verificando status do Docker..."
  systemctl status docker --no-pager | grep Active
  
  echo ""
  echo "Verificando status do Nginx..."
  systemctl status nginx --no-pager | grep Active
  
  echo ""
  echo "Verificando status dos containers Docker..."
  cd $SERVER_DIR
  docker-compose ps
  
  echo ""
  echo "Verificando uso de disco..."
  df -h | grep -E '/$|/opt'
  
  echo ""
  echo "Verificando uso de memória..."
  free -h
  
  echo ""
  echo "Verificando carga do sistema..."
  uptime
  
  echo ""
  echo "Verificando uso de CPU dos containers..."
  docker stats --no-stream
  
  echo ""
  echo "Verificando logs recentes do serviço app (últimas 30 linhas)..."
  cd $SERVER_DIR
  docker-compose logs --tail=30 app
  
  echo ""
  echo "Verificando logs de erro do Nginx..."
  tail -n 20 /var/log/nginx/error.log
  
  echo ""
  echo "Verificando conectividade com os serviços..."
  echo "API Health Check:"
  curl -s http://localhost:3000/api/v1/health || echo "Falha ao conectar à API"
  
  echo ""
  echo "Verificando backups..."
  ls -lath /opt/innerview-backups/homolog/ | head -n 5
EOF

echo ""
echo -e "${YELLOW}Verificação de status concluída.${NC}"
echo ""
echo -e "${YELLOW}Ações comuns de manutenção:${NC}"
echo "1. Reiniciar todos os serviços:"
echo "   ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_DIR && docker-compose restart'"
echo ""
echo "2. Reiniciar apenas o serviço app:"
echo "   ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_DIR && docker-compose restart app'"
echo ""
echo "3. Verificar logs em tempo real:"
echo "   ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_DIR && docker-compose logs -f app'"
echo ""
echo "4. Limpar cache do sistema:"
echo "   ssh $SERVER_USER@$SERVER_IP 'sync && echo 3 > /proc/sys/vm/drop_caches'"
echo ""
echo "5. Reiniciar o servidor:"
echo "   ssh $SERVER_USER@$SERVER_IP 'shutdown -r now'" 