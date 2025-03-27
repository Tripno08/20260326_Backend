#!/bin/bash

echo "Gerando schema Prisma para o projeto Innerview..."

# Verificar se o Docker está em execução
if ! docker info > /dev/null 2>&1; then
  echo "Erro: Docker não está em execução. Por favor, inicie o Docker e tente novamente."
  exit 1
fi

# Verifica se o container MySQL está saudável
if ! docker compose ps mysql | grep -q "healthy"; then
  echo "Iniciando container MySQL..."
  docker compose up -d mysql
fi

# Aguarda o MySQL estar pronto
echo "Aguardando MySQL estar pronto..."
while ! docker compose exec mysql mysqladmin ping -h localhost -u root -proot --silent; do
  sleep 1
done

# Gera o cliente Prisma
echo "Gerando cliente Prisma..."
npx prisma generate

# Executa as migrações
echo "Executando migrações..."
npx prisma migrate dev

echo "Schema Prisma gerado com sucesso!" 