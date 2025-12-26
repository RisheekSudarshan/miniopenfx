import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

import authRoutes from './auth/routes.js'
import quoteRoutes from './quotes/routes.js'
import tradeRoutes from './trades/routes.js'
import balanceRoutes from './balances/routes.js'

const app = new Hono()

app.get('/health', c => c.json({ ok: true }))

app.route('/auth', authRoutes)
app.route('/quotes', quoteRoutes)
app.route('/trades', tradeRoutes)
app.route('/balances', balanceRoutes)

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('🔥 MiniOpenFX running on http://localhost:3000')
