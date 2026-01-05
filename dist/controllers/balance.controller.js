import { pool } from "../database/db";
import { success } from "../utilities/response";
export async function creditBalanceController(c) {
    const userId = c.get("userId");
    const incomingId = c.req.header('x-request-id') || c.req.header('x-correlation-id');
    const res = await pool.query('SELECT currency, sum(delta) FROM ledger_entries WHERE user_id=$1 GROUP BY currency', [userId]);
    return success(c, { balances: res.rows }, 200);
}
