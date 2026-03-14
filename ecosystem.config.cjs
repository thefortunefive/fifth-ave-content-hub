module.exports = {
  apps: [
    {
      name: 'fifth-ave-dashboard',
      script: 'node',
      args: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NOCODB_BASE_URL: 'http://localhost:8080',
        NOCODB_TOKEN: 'htjKEaVOkCm8QoJgzxYQ4iA1SL8SX_ZRQbVSSi_7',
        PERPLEXITY_API_KEY: '',
        OPENAI_API_KEY: '',
        FAL_API_KEY: ''
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
