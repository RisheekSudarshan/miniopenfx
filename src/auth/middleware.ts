import type { Context } from 'hono'
import type { Variables } from '../types.js'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

export async function authMiddleware(
  c: Context<{ Variables: Variables }>,
  next: () => Promise<void>
) {
  const auth = c.req.header('Authorization')
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)

  const token = auth.replace('Bearer ', '')
  const payload: any = jwt.verify(token, process.env.JWT_SECRET!)

  const res = await pool.query(
    'SELECT 1 FROM sessions WHERE id=$1 AND expires_at > now()',
    [payload.sessionId]
  )

  if (res.rowCount === 0) return c.json({ error: 'Session expired' }, 401)

  // ✅ now TypeScript knows this is valid
  c.set('userId', payload.userId)

  await next()
}
