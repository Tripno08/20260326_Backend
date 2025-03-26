#!/bin/bash

echo "Gerando schema Prisma para o projeto Innerview..."

# Verificar se o Docker está em execução
if ! docker info > /dev/null 2>&1; then
  echo "Erro: Docker não está em execução. Por favor, inicie o Docker e tente novamente."
  exit 1
fi

# Verificar se o banco de dados está em execução
if ! docker compose ps postgres | grep -q "healthy"; then
  echo "Banco de dados não está em execução, iniciando..."
  docker compose up -d postgres
  echo "Aguardando o banco de dados ficar disponível..."
  sleep 10
fi

# Executar prisma generate dentro do container
echo "Gerando código Prisma..."
docker compose exec app npx prisma generate

echo "Schema Prisma gerado com sucesso!" 