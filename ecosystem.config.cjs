module.exports = {
  apps: [
    {
      name: 'fifth-ave-dashboard',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        FAL_API_KEY: ''
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
