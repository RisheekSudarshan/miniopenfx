import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware.js";
import { pool } from "../db.js";
import type { Variables } from "../types.js";
import { isString, isNumber } from "../assert.js";

const app = new Hono<{ Variables: Variables}>()
app.use('*', authMiddleware)
app.post('/addMoney', async c => {
    const userId = c.get('userId')
    const role = c.get('userRole')
    const incomingId = c.req.header('x-request-id') ||c.req.header('x-correlation-id')
    console.log(role)
    if(role != 'admin'){
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 403,
                "code": "AUTH_FORBIDDEN",
                "message": "No permission",
                "requestId": incomingId,
                "details": {}}}, 403)
    }
    const { currency, amount, reciverId } = await c.req.json()
    if (!isString(reciverId)){
    return c.json({
        "success": false,
        "error": {
        "httpStatus": 401,
        "code": "VALIDATION_FAILED",
        "message": "userId is not valid",
        "requestId": incomingId}}, 401)
    }
    if (!isString(currency)){
        return c.json({
        "success": false,
        "error": {
            "httpStatus": 401,
            "code": "VALIDATION_FAILED",
            "message": "userId is not valid",
            "requestId": incomingId}}, 401)
    }
    if (!isNumber(amount)){
        return c.json({
        "success": false,
        "error": {
            "httpStatus": 401,
            "code": "VALIDATION_FAILED",
            "message": "userId is not valid",
            "requestId": incomingId}}, 401)
    }

    const client = await pool.connect()    
    try{
        const reason: string = "Credit"        
        await client.query('INSERT INTO ledger_entries (user_id, currency, delta, reason, receiver_id) VALUES ($1,$2,$3,$4,$5)',
            [reciverId, currency, amount, reason, userId]
        )
        await client.query('COMMIT')
        return c.json({
        "success": true,
        "data": "Credited!"}, 201)
    }
    catch(e: any){
        await client.query('ROLLBACK')
        return c.json({
        "success": false,
        "error": {
            "httpStatus": 500,
            "code": "TRANSATION_ROLLBACK",
            "message": e.message,
            "requestId": "req-8f92a",
            "details": {}}}, 500)
    }
    finally{
        client.release()
    }

})


export default app