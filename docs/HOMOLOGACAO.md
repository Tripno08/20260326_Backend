# Guia de Configuração do Ambiente de Homologação

Este documento descreve o processo de configuração e manutenção do ambiente de homologação do Innerview Backend.

## Visão Geral

O ambiente de homologação é uma réplica do ambiente de produção, utilizada para testar novas funcionalidades e correções antes de serem implantadas em produção.

## Infraestrutura

1. **Servidor**: VPS com Ubuntu 22.04 LTS
2. **Banco de Dados MySQL**: Armazena todos os dados da aplicação
3. **Redis**: Cache e gerenciamento de sessões
4. **Nginx**: Proxy reverso e SSL
5. **Docker**: Containerização da aplicação
6. **PM2**: Gerenciamento de processos Node.js

## Configuração do Ambiente

### 1. Requisitos do Servidor

- Ubuntu 22.04 LTS
- Docker 24.0+
- Docker Compose 2.0+
- Node.js 18+
- Nginx
- Certbot

### 2. Configuração do Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Configuração do Nginx

```nginx
server {
    listen 80;
    server_name homolog.innerview.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Configuração SSL

```bash
sudo certbot --nginx -d homolog.innerview.com.br
```

## Deploy

### 1. Preparação

```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/innerview-homolog
sudo chown -R $USER:$USER /var/www/innerview-homolog

# Clonar repositório
git clone https://github.com/seu-usuario/innerview-backend.git /var/www/innerview-homolog
cd /var/www/innerview-homolog

# Instalar dependências
npm install
```

### 2. Configuração do Ambiente

```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Editar variáveis
nano .env
```

```env
# Configurações do Ambiente
NODE_ENV=homolog
PORT=3000

# Configurações do Banco de Dados
DATABASE_URL="mysql://root:Innerview@2024#Homolog@mysql:3306/innerview"

# Configurações de Autenticação
JWT_SECRET=Innerview@2024#JWT#Secret#Homolog
JWT_EXPIRATION=24h

# Configurações do Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=Innerview@2024#Redis#Homolog
```

### 3. Inicialização

```bash
# Iniciar containers
docker compose up -d

# Executar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

## Monitoramento

### 1. Logs

```bash
# Logs da aplicação
pm2 logs innerview-homolog

# Logs do MySQL
docker compose logs mysql

# Logs do Redis
docker compose logs redis
```

### 2. Status dos Serviços

```bash
# Status da aplicação
pm2 status

# Status do MySQL
ssh root@45.77.116.245 'cd /opt/innerview-backend && docker compose exec mysql mysqladmin ping -h localhost -u root -pInnerview@2024#Homolog'

# Status do Redis
ssh root@45.77.116.245 'cd /opt/innerview-backend && docker compose exec redis redis-cli ping'
```

## Backup

### 1. Banco de Dados

```bash
# Criar diretório de backup
mkdir -p /var/backups/innerview-homolog

# Script de backup
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/innerview-homolog"

# Backup do MySQL
docker compose exec -T mysql mysqldump -u root -pInnerview@2024#Homolog innerview > $BACKUP_DIR/innerview-$TIMESTAMP.sql

# Compactar backup
gzip $BACKUP_DIR/innerview-$TIMESTAMP.sql

# Manter apenas os últimos 7 backups
ls -t $BACKUP_DIR/innerview-*.sql.gz | tail -n +8 | xargs -r rm
```

### 2. Arquivos da Aplicação

```bash
# Backup dos arquivos
tar -czf /var/backups/innerview-homolog/app-$TIMESTAMP.tar.gz /var/www/innerview-homolog
```

## Manutenção

### 1. Atualização

```bash
# Atualizar código
cd /var/www/innerview-homolog
git pull origin main

# Reconstruir containers
docker compose down
docker compose build --no-cache
docker compose up -d

# Executar migrações
npx prisma migrate deploy

# Reiniciar aplicação
pm2 restart innerview-homolog
```

### 2. Limpeza

```bash
# Limpar logs antigos
find /var/log/innerview-homolog -type f -name "*.log" -mtime +30 -delete

# Limpar backups antigos
find /var/backups/innerview-homolog -type f -mtime +30 -delete
```

## Troubleshooting

### 1. Problemas Comuns

- **Aplicação não inicia**: Verificar logs do PM2
- **Erro de conexão com banco**: Verificar status do MySQL
- **Erro de cache**: Verificar status do Redis
- **Erro 502**: Verificar status do Nginx

### 2. Comandos Úteis

```bash
# Reiniciar todos os serviços
pm2 restart all
docker compose restart

# Verificar uso de recursos
docker stats
pm2 monit

# Verificar logs em tempo real
pm2 logs
docker compose logs -f
```

## Segurança

O ambiente de homologação inclui:

1. Firewall configurado com UFW
2. Comunicação SSL/TLS
3. Senhas fortes para todos os serviços
4. Atualizações automáticas de segurança
5. Headers de segurança configurados no Nginx

## Integrações

Para testar integrações com serviços externos no ambiente de homologação:

1. Atualize os valores das variáveis de ambiente correspondentes em `.env.homolog`
2. Execute novamente o script de deploy

## Considerações Finais

O ambiente de homologação deve ser utilizado para testes antes de qualquer implantação em produção. Garanta que todos os testes sejam executados neste ambiente antes do lançamento. 