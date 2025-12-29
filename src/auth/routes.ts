import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { pool } from '../db.js'

const app = new Hono()

app.post('/signup', async c => {
  const { email, password } = await c.req.json()
  const hash = await bcrypt.hash(password, 10)
  const incomingId = c.req.header('x-request-id') ||c.req.header('x-correlation-id')



  const users = await pool.query('SELECT email FROM users')
  for (const user of users.rows){
    if(user === email){
      return c.json(
        {"success": false, 
          "error": {
            "httpStatus": 409,
            "code": "RESOURCE_ALREADY_EXISTS",
            "message": "User already exists",
            "requestId": incomingId,
            "details": {}}}, 409)
    }
  }

  await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1,$2)',
    [email, hash]
  )

  return c.json({ // User Created
    "sucess":true,  
    "data":{ 
      "message": 'User created'}}, 201)
})

app.post('/login', async c => {
  const { email, password } = await c.req.json()
  const incomingId = c.req.header('x-request-id') ||c.req.header('x-correlation-id')

  const res = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  )
  if (res.rowCount === 0) return c.json({    // Username is not in DB
    "success": false,  
    "error": {
      "message": 'Invalid username',
      "code": "UNAUTHERIZED", 
      "requestId": incomingId}}, 401)

  const user = res.rows[0]
  const ok = await bcrypt.compare(password, user.password_hash)

  if (!ok) return c.json({  //username doesnt match password
    "success": false,   
    "error": {
      "message": 'Invalid username or password' ,
      "code": "UNAUTHERIZED", requestId: incomingId}}, 401)

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

  return c.json({ // logged in
    "sucess": true,   
    "data": token}, 200)
  })

export default app
