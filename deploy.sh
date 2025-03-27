#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando processo de deploy...${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.${NC}"
    exit 1
fi

# Parar containers existentes
echo -e "${YELLOW}Parando containers existentes...${NC}"
docker-compose down

# Construir imagens
echo -e "${YELLOW}Construindo imagens Docker...${NC}"
docker-compose build --no-cache

# Iniciar containers
echo -e "${YELLOW}Iniciando containers...${NC}"
docker-compose up -d

# Verificar status dos containers
echo -e "${YELLOW}Verificando status dos containers...${NC}"
docker-compose ps

# Executar migrações do banco de dados
echo -e "${YELLOW}Executando migrações do banco de dados...${NC}"
docker-compose exec app npx prisma migrate deploy

# Verificar logs
echo -e "${YELLOW}Verificando logs da aplicação...${NC}"
docker-compose logs -f app

echo -e "${GREEN}Deploy concluído com sucesso!${NC}" 