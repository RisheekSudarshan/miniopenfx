import { pgTable, decimal, text, uuid } from "drizzle-orm/pg-core";
import { db } from "../database/client.js";
import { eq, sql } from "drizzle-orm";
import { userBalanceType } from "../types/types.js";

export const balances = pgTable("balances", {
  user_id: uuid("user_id").notNull().primaryKey(),
  currency: text("currency").notNull(),
  amount: decimal("amount", {
    precision: 18,
    scale: 8,
    mode: "number",
  }).notNull(),
});

export async function getUserBalances(userId: string): Promise<userBalanceType[]> {
  const userBalances: userBalanceType[] = await db
    .select()
    .from(balances)
    .where(eq(balances.user_id, userId));
  return userBalances;
}

export async function upsertBalance(
  tx: any,
  user_id: string,
  currency: string,
  delta: number,
): Promise<void> {
  await tx
    .insert(balances)
    .values({
      user_id:user_id,
      currency,
      amount: delta,
    })
    .onConflictDoUpdate({
      target: [balances.user_id, balances.currency],
      set: {
        amount: sql`${balances.amount} + ${delta}`,
      },
    })
}
