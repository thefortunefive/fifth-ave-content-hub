module.exports = {
  apps: [
    {
      name: 'fifth-ave-dashboard',
      script: 'node',
      args: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
        // All secrets must be set via .env file or shell environment.
        // Do NOT hardcode API keys here.
        // Required env vars:
        //   NOCODB_BASE_URL
        //   NOCODB_TOKEN
        //   OPENAI_API_KEY
        //   KIEAI_API_KEY
        //   FAL_API_KEY (optional)
        //   BLOTATO_API_KEY
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
