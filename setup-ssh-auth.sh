#!/bin/bash

# Script para configurar autenticação SSH por chave
# Innerview Backend - Deploy

echo "================================================="
echo "      CONFIGURAÇÃO DE AUTENTICAÇÃO SSH           "
echo "================================================="
echo ""

# Dados do servidor
SERVER_IP="45.77.116.245"
SERVER_USER="root"
SERVER_PASS="Lh7+KPKVTyXwSVLZ"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se já existe uma chave SSH
if [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}Gerando nova chave SSH...${NC}"
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -q
    echo -e "${GREEN}Chave SSH gerada com sucesso!${NC}"
else
    echo -e "${YELLOW}Chave SSH já existe.${NC}"
fi

# Criar arquivo temporário com script para inserir a senha
TMP_SCRIPT=$(mktemp)
echo '#!/usr/bin/expect -f
spawn ssh-copy-id -o StrictHostKeyChecking=no '$SERVER_USER'@'$SERVER_IP'
expect "password:"
send "'$SERVER_PASS'\r"
expect eof' > $TMP_SCRIPT
chmod +x $TMP_SCRIPT

# Verificar se expect está instalado
if ! command -v expect &> /dev/null; then
    echo -e "${RED}O programa 'expect' não está instalado.${NC}"
    echo -e "${YELLOW}Por favor, instale com: brew install expect${NC}"
    rm $TMP_SCRIPT
    exit 1
fi

# Instalar chave pública no servidor
echo -e "${YELLOW}Copiando chave pública para o servidor...${NC}"
$TMP_SCRIPT
rm $TMP_SCRIPT

# Testar conexão
echo -e "${YELLOW}Testando conexão SSH...${NC}"
if ssh -o StrictHostKeyChecking=no -o BatchMode=yes $SERVER_USER@$SERVER_IP "echo 'Conexão SSH estabelecida!'"; then
    echo -e "${GREEN}Configuração de SSH concluída com sucesso!${NC}"
    echo -e "${GREEN}Agora você pode executar o script de deploy sem informar senha.${NC}"
else
    echo -e "${RED}Erro ao testar conexão SSH. Verifique as credenciais.${NC}"
    exit 1
fi 