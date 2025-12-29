import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware.js";
import { pool } from "../db.js";
import type { Variables } from "../types.js";

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.get('/', async c =>{
    const userId = c.get('userId')
    const incomingId = c.req.header('x-request-id') ||c.req.header('x-correlation-id')
    try{
        const result = await pool.query("SELECT * FROM ledger_entries where user_id=$1;",[userId])
        return c.json({ //transaction history found
            "success": true,
            "data": result.rows}, 200)
    }
    catch (e: any){ // failed to query DB
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 503,
                "code": "DATABASE_UNAVAILABLE",
                "message": "Issue with the database",
                "requestId": incomingId,
                "details": {}}}, 503)
    }
})

export default app