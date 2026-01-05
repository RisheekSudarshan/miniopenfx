import { pool } from "../database/db";
export async function historyController(c) {
    const userId = c.get('userId');
    const incomingId = c.req.header('x-request-id') || c.req.header('x-correlation-id');
    try {
        const result = await pool.query("SELECT * FROM ledger_entries where user_id=$1;", [userId]);
        return c.json({
            "success": true,
            "data": result.rows
        }, 200);
    }
    catch (e) { // failed to query DB
        return c.json({
            "success": false,
            "error": {
                "httpStatus": 503,
                "code": "DATABASE_UNAVAILABLE",
                "message": "Issue with the database",
                "requestId": incomingId,
                "details": {}
            }
        }, 503);
    }
}
