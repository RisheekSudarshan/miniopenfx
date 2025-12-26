import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { pool } from '../db.js'

const app = new Hono()

app.post('/signup', async c => {
  const { email, password } = await c.req.json()
  const hash = await bcrypt.hash(password, 10)

  await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1,$2)',
    [email, hash]
  )

  return c.json({ message: 'User created' })
})

app.post('/login', async c => {
  const { email, password } = await c.req.json()

  const res = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  )
  if (res.rowCount === 0) return c.json({ error: 'Invalid' }, 401)

  const user = res.rows[0]
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return c.json({ error: 'Invalid' }, 401)

  const sessionId = uuid()
  await pool.query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1,$2, now()+interval \'1 day\')',
    [sessionId, user.id]
  )

  const token = jwt.sign(
    { userId: user.id, sessionId },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  )

  return c.json({ token })
})

export default app
