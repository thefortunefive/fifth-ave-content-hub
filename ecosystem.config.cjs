module.exports = {
  apps: [
    {
      name: 'fifth-ave-dashboard',
      script: 'node',
      args: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NOCODB_BASE_URL: 'http://31.220.49.162:8080',
        NOCODB_TOKEN: 'htjKEaVOkCm8QoJgzxYQ4iA1SL8SX_ZRQbVSSi_7',
        PERPLEXITY_API_KEY: '',
        OPENAI_API_KEY: '',
        FAL_API_KEY: '',
        BLOTATO_API_KEY: 'blt_nf7ggzb6K1BzK0mc2j+UfvqNrBOon2O7s2UpSPTBqD0='
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
