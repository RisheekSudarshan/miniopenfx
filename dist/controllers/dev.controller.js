import { pool } from "../database/db";
import { isString, isNumber } from "../utilities/assert.js";
export async function devAddMoneyController(c) {
    const userId = c.get('userId');
    const role = c.get('userRole');
    const incomingId = c.req.header('x-request-id') || c.req.header('x-correlation-id');
    console.log(role);
    if (role != 'admin') {
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 403,
                "code": "AUTH_FORBIDDEN",
                "message": "No permission",
                "requestId": incomingId,
                "details": {}
            }
        }, 403);
    }
    const { currency, amount, reciverId } = await c.req.json();
    if (!isString(reciverId)) {
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 401,
                "code": "VALIDATION_FAILED",
                "message": "userId is not valid",
                "requestId": incomingId
            }
        }, 401);
    }
    if (!isString(currency)) {
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 401,
                "code": "VALIDATION_FAILED",
                "message": "userId is not valid",
                "requestId": incomingId
            }
        }, 401);
    }
    if (!isNumber(amount)) {
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 401,
                "code": "VALIDATION_FAILED",
                "message": "userId is not valid",
                "requestId": incomingId
            }
        }, 401);
    }
    const client = await pool.connect();
    try {
        const reason = "Credit";
        await client.query('INSERT INTO ledger_entries (user_id, currency, delta, reason, receiver_id) VALUES ($1,$2,$3,$4,$5)', [reciverId, currency, amount, reason, userId]);
        await client.query('COMMIT');
        return c.json({
            "success": true,
            "data": "Credited!"
        }, 201);
    }
    catch (e) {
        await client.query('ROLLBACK');
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 500,
                "code": "TRANSATION_ROLLBACK",
                "message": e.message,
                "requestId": "req-8f92a",
                "details": {}
            }
        }, 500);
    }
    finally {
        client.release();
    }
}
