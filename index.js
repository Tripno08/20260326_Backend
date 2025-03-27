const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    environment: 'homologation', 
    timestamp: new Date(),
    server: 'Innerview Backend'
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Innerview API',
    version: '1.0',
    environment: 'homologation',
    endpoints: [
      { path: '/api/v1/health', description: 'Verificar saúde da API' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de homologação rodando na porta ${PORT}`);
}); 