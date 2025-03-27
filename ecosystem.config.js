module.exports = {
  apps: [{
    name: 'innerview-homolog',
    script: 'dist/src/main.js',
    cwd: '/var/www/innerview-homolog',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'staging',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'staging'
    }
  }]
}; 