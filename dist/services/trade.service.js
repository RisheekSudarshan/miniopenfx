import { pool } from "../database/db.js";
import { TradeResult } from "../types/trades.js";
export async function trade(senderId, receiverId, idempotencyKey, quoteId, amount) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const dup = await client.query("SELECT 1 FROM trades WHERE idempotency_key=$1", [idempotencyKey]);
        if (dup.rowCount === null) {
            throw new Error("DUPLICATED");
        }
        if (dup.rowCount > 0) {
            await client.query("COMMIT");
            return TradeResult.DUPLICATED;
        }
        const q = await client.query("SELECT * FROM quotes WHERE id=$1 FOR UPDATE", [quoteId]);
        if (q.rowCount === 0 || q.rows[0].status !== "ACTIVE") {
            throw new Error("INVALID_QUOTE");
        }
        if (new Date(q.rows[0].expires_at) < new Date()) {
            throw new Error("QUOTE_EXPIRED");
        }
        const quote = q.rows[0];
        const base = quote.pair.slice(0, 3);
        const quoteCur = quote.pair.slice(3);
        const quoteAmt = amount * quote.rate;
        const res = await client.query("SELECT currency, sum(delta) FROM ledger_entries WHERE user_id=$1 GROUP BY currency", [senderId]);
        for (const row of res.rows) {
            if (row.currency === base && Number(row.sum) < amount) {
                await client.query("ROLLBACK");
                return TradeResult.REJECTED;
            }
        }
        await client.query("INSERT INTO ledger_entries (user_id,currency,delta,reason,receiver_id) VALUES ($1,$2,$3,'FX_TRADE',$4)", [senderId, base, -amount, receiverId]);
        await client.query("INSERT INTO ledger_entries (user_id,currency,delta,reason,receiver_id) VALUES ($1,$2,$3,'FX_TRADE',$4)", [receiverId, quoteCur, quoteAmt, senderId]);
        await client.query("UPDATE balances SET amount=amount+$1 WHERE user_id=$2 AND currency=$3", [-amount, senderId, base]);
        await client.query("UPDATE balances SET amount=amount+$1 WHERE user_id=$2 AND currency=$3", [quoteAmt, receiverId, quoteCur]);
        await client.query("INSERT INTO trades (quote_id,user_id,idempotency_key) VALUES ($1,$2,$3)", [quoteId, senderId, idempotencyKey]);
        await client.query("UPDATE quotes SET status='USED' WHERE id=$1", [quoteId]);
        await client.query("COMMIT");
        return TradeResult.EXECUTED;
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
}
