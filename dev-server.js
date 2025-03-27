const express = require('express');
const mysql = require('mysql2/promise');
const Redis = require('ioredis');
const { config } = require('dotenv');

config(); // Carrega as variáveis de ambiente do .env

const app = express();
const port = 4001;

// Configuração MySQL
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'innerview',
  database: process.env.DATABASE_NAME || 'innerview',
};

// Configuração Redis
const redisEnabled = process.env.REDIS_ENABLED === 'true';
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || '',
};

let redisClient;
if (redisEnabled) {
  redisClient = new Redis(redisConfig);
  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });
}

// Rota de verificação de saúde
app.get('/health', async (req, res) => {
  const status = {
    status: 'UP',
    timestamp: new Date(),
    services: {
      database: { status: 'UNKNOWN' },
      redis: { status: 'UNKNOWN' },
    }
  };

  // Verificar MySQL
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query('SELECT 1');
    await connection.end();
    status.services.database.status = 'UP';
  } catch (error) {
    console.error('Database error:', error);
    status.services.database.status = 'DOWN';
    status.services.database.error = error.message;
  }

  // Verificar Redis se habilitado
  if (redisEnabled) {
    try {
      const ping = await redisClient.ping();
      status.services.redis.status = ping === 'PONG' ? 'UP' : 'DOWN';
    } catch (error) {
      console.error('Redis error:', error);
      status.services.redis.status = 'DOWN';
      status.services.redis.error = error.message;
    }
  } else {
    status.services.redis.status = 'DISABLED';
  }

  // Status geral da aplicação
  status.status = Object.values(status.services).every(
    service => service.status === 'UP' || service.status === 'DISABLED'
  ) ? 'UP' : 'DOWN';

  res.json(status);
});

// Rota de API Docs simulada
app.get('/api/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI - Teste</title>
      </head>
      <body>
        <h1>Swagger UI (Simulado)</h1>
        <p>Este é um servidor de teste. A API Swagger completa estaria disponível aqui em produção.</p>
        <p>Verificação de saúde: <a href="/health">/health</a></p>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor de teste rodando em http://localhost:${port}`);
  console.log(`Verificação de saúde: http://localhost:${port}/health`);
  console.log(`API Docs simulada: http://localhost:${port}/api/docs`);
}); 