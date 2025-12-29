import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware.js'
import { pool } from '../db.js'
import type { Variables } from '../types.js'

const app = new Hono<{ Variables: Variables }>()
app.use('*', authMiddleware)

async function trade(senderId: string, receiverId: string, idempotencyKey: string|undefined, quoteId: string, amount: number): Promise<any>{
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const dup = await client.query(
      'SELECT * FROM trades WHERE idempotency_key=$1',
      [idempotencyKey]
    )
    if (dup.rows.length > 0) {
      await client.query('COMMIT')
      return { status: "Duplicated"}
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
    const base = quote.pair.slice(0,3)
    const quoteCur = quote.pair.slice(3)
    const quoteAmt = amount * quote.rate

    const res = await pool.query(
        'SELECT currency, sum(delta) FROM ledger_entries WHERE user_id=$1 group by currency',
        [senderId]
    )

    for (let row of res.rows){
      console.log(row.sum,row.currency)
      if(row.currency === base && row.sum < amount){
          return {status: 'Rejected'}
      }
    }
    await client.query(
      'INSERT INTO ledger_entries (user_id,currency,delta,reason,receiver_id) VALUES ($1,$2,$3,$4,$5)',
      [senderId, base, -amount, 'FX_TRADE',receiverId]
    )
    await client.query(
      'INSERT INTO ledger_entries (user_id,currency,delta,reason,receiver_id) VALUES ($1,$2,$3,$4,$5)',
      [receiverId, quoteCur, quoteAmt, 'FX_TRADE', senderId]
    )

    await client.query(
      `UPDATE balances SET amount=amount+$1 WHERE user_id=$2 AND currency=$3`,
      [-amount, senderId, base]
    )
    await client.query(
      `UPDATE balances SET amount=amount+$1 WHERE user_id=$2 AND currency=$3`,
      [quoteAmt, receiverId, quoteCur]
    )

    await client.query(
      `INSERT INTO trades (quote_id,user_id,idempotency_key)
       VALUES ($1,$2,$3)`,
      [quoteId, senderId, idempotencyKey]
    )

    await client.query(
      `UPDATE quotes SET status='USED' WHERE id=$1`,
      [quoteId]
    )

    await client.query('COMMIT')
    return { status: 'Executed' }
  } catch (e: any) {
    await client.query('ROLLBACK')
    console.log(e.message)
    return { error: e.message }
  } finally {
    client.release()
  }
}

app.post('/self', async c => {
  const userId = c.get('userId')
  const idempotencyKey = c.req.header('Idempotency-Key')
  const { quoteId, amount } = await c.req.json()
  let errorMessage = "Error"
  const res = await trade(userId, userId, idempotencyKey, quoteId, amount)

  switch(res.status){
    case "Duplicated":
      const dup = await pool.query(
        'SELECT * FROM trades WHERE idempotency_key=$1',
        [idempotencyKey]
      )
      return c.json(dup.rows[0], 409)
    case "Rejected":
      return c.json({ status: "REJECTED"})
    case "Executed":
      return c.json({ status: 'EXECUTED' }, 201)
    default:
      return c.json({ error:  res.status}, 400)
  }
})

app.post('/others', async c =>{
  const userId = c.get('userId')
  const idempotencyKey = c.req.header('Idempotency-Key')
  const { quoteId, amount, receiverId } = await c.req.json()
  const res = await trade(userId, receiverId, idempotencyKey, quoteId, amount)

  switch(res.status){
    case "Duplicated":
      const dup = await pool.query(
        'SELECT * FROM trades WHERE idempotency_key=$1',
        [idempotencyKey]
      )
      return c.json(dup.rows[0], 409)
    case "Rejected":
      return c.json({ "success": false,
        "error":{
          "httpStatus": 400,
          "code": "INSUFFICIENT_BALANCE",
          "message": "User doesnt have suffecient balance"
        }
      })
    case "Executed":
      return c.json({ "success": true,
        "data" : "Executed"
      }, 201)
    default:
      return c.json({ error:  res.status}, 400)
  }
})

export default app
