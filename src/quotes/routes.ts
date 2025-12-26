import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware.js'
import { pool } from '../db.js'
import { priceCache, isFresh } from '../pricing/cache.js'
import { refreshPrice } from '../pricing/binance.js'
import type { Variables } from '../types.js'

const app = new Hono<{ Variables: Variables }>()
app.use('*', authMiddleware)

app.post('/', async c => {
  const userId = c.get('userId')
  const { pair, side, amount } = await c.req.json()

  if (!isFresh(pair)) await refreshPrice(pair)

  const market = priceCache[pair].rate
  const rate = side === 'BUY' ? market * 1.002 : market * 0.998

  const res = await pool.query(
    `INSERT INTO quotes
     (user_id, base_currency, quote_currency, side, rate, expires_at, status)
     VALUES ($1,$2,$3,$4,$5, now()+interval '5 seconds','ACTIVE')
     RETURNING id, rate, expires_at`,
    [userId, pair.split('/')[0], pair.split('/')[1], side, rate]
  )

  return c.json(res.rows[0])
})

export default app
