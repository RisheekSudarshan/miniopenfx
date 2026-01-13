import { createLedgerEntry } from "../models/ledger_entries.model";
import { getUserById } from "../models/users.model";
import { db } from "../database/client.js";
import { upsertBalance } from "../models/balances.model";
import { ErrorCode } from "../errors/error_codes";
export async function devAddMoneyService(reciverId, currency, amount, userId) {
    const user = await getUserById(userId);
    if (user.role != "admin") {
        throw new Error(ErrorCode.NO_PERMISSION);
    }
    const reason = "Credit";
    await createLedgerEntry({
        userId: userId,
        currency: currency,
        delta: amount,
        reason: reason,
        receiverId: reciverId,
    });
    await db.transaction(async (tx) => {
        await upsertBalance(tx, reciverId, currency, amount);
    });
    return "Credited!";
}
