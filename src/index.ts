import 'dotenv/config'
import { Hono } from 'hono'
import {serve} from '@hono/node-server'

import authRoutes from './auth/routes.js'
import quoteRoutes from './quotes/routes.js'
import tradeRoutes from './trades/routes.js'
import balanceRoutes from './balances/routes.js'
import devRoutes from './dev/routes.js'
import historyRoutes from './history/routes.js'
import { pool } from './db.js'

const app = new Hono()


app.get('/health', c => c.json({ ok: true }))

app.route('/auth', authRoutes)
app.route('/quotes', quoteRoutes)
app.route('/trades', tradeRoutes)
app.route('/balances', balanceRoutes)
app.route('/dev', devRoutes)
app.route('/history', historyRoutes)



export default app
