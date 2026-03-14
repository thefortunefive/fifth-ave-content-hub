import { serve } from '@hono/node-server'
import app from './index'

const port = Number(process.env.PORT) || 3000

console.log(`5th Ave Content Hub starting on http://0.0.0.0:${port}`)

serve({
  fetch: app.fetch,
  hostname: '0.0.0.0',
  port,
})
