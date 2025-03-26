#!/bin/bash

echo "Iniciando ambiente de desenvolvimento do Innerview..."

# Parar qualquer container em execução
echo "Parando containers existentes..."
docker compose down

# Iniciar os containers
echo "Iniciando containers..."
docker compose up -d

# Mostrar o status dos containers
echo "Status dos containers:"
docker compose ps

echo "Ambiente de desenvolvimento iniciado com sucesso!"
echo "API disponível em: http://localhost:3000"
echo "Para visualizar os logs, execute: docker compose logs -f app" 