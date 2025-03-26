#!/bin/bash

echo "Iniciando deploy do Innerview Backend..."

# Verificar se o Docker está rodando
docker info > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Erro: Docker não está rodando. Por favor, inicie o Docker e tente novamente."
  exit 1
fi

echo "Docker está rodando corretamente."

# Parar containers existentes e remover volumes
echo "Parando containers existentes..."
docker compose down

# Construir e iniciar os containers em modo produçãos
echo "Construindo e iniciando os containers em modo produção..."
NODE_ENV=production docker compose up --build -d

# Verificar o status dos containers
echo "Verificando o status dos containers..."
docker compose ps

echo "Deploy finalizado! A API está disponível em: http://localhost:3000"
echo "Documentação Swagger disponível em: http://localhost:3000/docs"
echo "Para monitorar os logs, execute: docker compose logs -f app" 