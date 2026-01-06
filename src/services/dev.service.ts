import { createLedgerEntry } from "../models/ledger_entries.model";
import { getUserById } from "../models/users.model";
import { db } from "../database/client.js";
import { upsertBalance } from "../models/balances.model";
import { deflate } from "zlib";

export async function devAddMoneyService(
  reciverId: string,
  currency: string,
  amount: number,
  userId: string
): Promise<string> {
  const user = await getUserById(userId);
  if (user.role != "admin") {
    throw new Error("NO_PERMISSION");
  }
  const reason: string = "Credit";
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
