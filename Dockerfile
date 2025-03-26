FROM node:18-alpine

WORKDIR /app

# Instalar pacotes necessários
RUN apk add --no-cache openssl

# Copiar package.json e instalar dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo as de desenvolvimento)
RUN npm install

# Gerar o cliente Prisma
RUN npx prisma generate

# Copiar o resto dos arquivos
COPY . .

# Expor a porta para a aplicação
EXPOSE 3000

# Comando para executar em desenvolvimento
CMD ["npm", "run", "start:dev"] 