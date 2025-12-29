import { Hono } from 'hono'
import type { Variables } from '../types.js'
import { authMiddleware } from '../auth/middleware.js'
import { pool } from '../db.js'
import { assert } from 'console'
import { isString } from '../assert.js'

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.get('/', async c => {
  const userId = c.get('userId')
  // const res = await pool.query(
  //   'SELECT currency, amount FROM balances WHERE user_id=$1',
  //   [userId]
  // )
  const incomingId = c.req.header('x-request-id') ||c.req.header('x-correlation-id')
  if (!isString(userId)){
    return c.json({
      "success": false,
      "error": {
        "httpStatus": 401,
        "code": "VALIDATION_FAILED",
        "message": "userId is not valid",
        "requestId": incomingId}}, 401)
  }
  const res = await pool.query(
    'SELECT currency, sum(delta) FROM ledger_entries WHERE user_id=$1 group by currency',
    [userId]
  )

  
  return c.json({
  "success": true,
  "data": res.rows}, 200)
})

export default app
