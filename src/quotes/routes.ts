import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware.js'
import { pool } from '../db.js'
import { priceCache, isFresh } from '../pricing/cache.js'
import { refreshPrice } from '../pricing/price.js'
import type { Variables } from '../types.js'

const app = new Hono<{ Variables: Variables }>()
app.use('*', authMiddleware)

app.post('/', async c => {
  const userId = c.get('userId')
  const { pair, side } = await c.req.json()

  if (!isFresh(pair)) await refreshPrice(pair)

  const market = priceCache[pair].rate
  const rate = side === 'BUY' ? market * 1.002 : market * 0.998

  const res = await pool.query(
    `INSERT INTO quotes
     (user_id, pair, side, rate, expires_at, status)
     VALUES ($1,$2,$3,$4, now()+interval '50 seconds','ACTIVE')
     RETURNING id, rate, expires_at`,
    [userId, pair, side, rate]
  )

  return c.json({
  "success": true,
  "data": res.rows[0]}, 201)
})

export default app
