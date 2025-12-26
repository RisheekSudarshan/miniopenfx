import { Hono } from 'hono'
import type { Variables } from '../types.js'
import { authMiddleware } from '../auth/middleware.js'
import { pool } from '../db.js'

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.get('/', async c => {
  const userId = c.get('userId')
  const res = await pool.query(
    'SELECT currency, amount FROM balances WHERE user_id=$1',
    [userId]
  )
  return c.json(res.rows)
})

export default app
