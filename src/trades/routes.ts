import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware.js'
import { pool } from '../db.js'
import type { Variables } from '../types.js'

const app = new Hono<{ Variables: Variables }>()
app.use('*', authMiddleware)

app.post('/', async c => {
  const userId = c.get('userId')
  const idempotencyKey = c.req.header('Idempotency-Key')
  const { quoteId, amount } = await c.req.json()

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const dup = await client.query(
      'SELECT * FROM trades WHERE idempotency_key=$1',
      [idempotencyKey]
    )
    if (dup.rows.length > 0) {
      await client.query('COMMIT')
      return c.json(dup.rows[0])
    }

    const q = await client.query(
      'SELECT * FROM quotes WHERE id=$1 FOR UPDATE',
      [quoteId]
    )
    if (q.rowCount === 0 || q.rows[0].status !== 'ACTIVE')
      throw new Error('Invalid quote')

    if (new Date(q.rows[0].expires_at) < new Date())
      throw new Error('Quote expired')

    const quote = q.rows[0]
    const base = quote.base_currency
    const quoteCur = quote.quote_currency
    const quoteAmt = amount * quote.rate

    await client.query(
      'INSERT INTO ledger_entries (user_id,currency,delta,reason) VALUES ($1,$2,$3,$4)',
      [userId, base, -amount, 'FX_TRADE']
    )
    await client.query(
      'INSERT INTO ledger_entries (user_id,currency,delta,reason) VALUES ($1,$2,$3,$4)',
      [userId, quoteCur, quoteAmt, 'FX_TRADE']
    )

    await client.query(
      `UPDATE balances SET amount=amount+$1 WHERE user_id=$2 AND currency=$3`,
      [-amount, userId, base]
    )
    await client.query(
      `UPDATE balances SET amount=amount+$1 WHERE user_id=$2 AND currency=$3`,
      [quoteAmt, userId, quoteCur]
    )

    await client.query(
      `INSERT INTO trades (quote_id,user_id,idempotency_key,base_amount,quote_amount)
       VALUES ($1,$2,$3,$4,$5)`,
      [quoteId, userId, idempotencyKey, amount, quoteAmt]
    )

    await client.query(
      `UPDATE quotes SET status='USED' WHERE id=$1`,
      [quoteId]
    )

    await client.query('COMMIT')
    return c.json({ status: 'EXECUTED' })
  } catch (e: any) {
    await client.query('ROLLBACK')
    return c.json({ error: e.message }, 400)
  } finally {
    client.release()
  }
})

export default app
