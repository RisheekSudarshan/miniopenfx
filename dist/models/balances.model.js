import { pgTable, decimal, text, uuid } from "drizzle-orm/pg-core";
import { db } from "../database/client.js";
import { eq, sql } from "drizzle-orm";
export const balances = pgTable("balances", {
    user_id: uuid("user_id").notNull().primaryKey(),
    currency: text("currency").notNull(),
    amount: decimal("amount", {
        precision: 18,
        scale: 8,
        mode: "number",
    }).notNull(),
});
export async function getUserBalances(userId) {
    const userBalances = await db
        .select()
        .from(balances)
        .where(eq(balances.user_id, userId));
    return userBalances;
}
export async function upsertBalance(tx, user_id, currency, delta) {
    await tx
        .insert(balances)
        .values({
        user_id: user_id,
        currency,
        amount: delta,
    })
        .onConflictDoUpdate({
        target: [balances.user_id, balances.currency],
        set: {
            amount: sql `${balances.amount} + ${delta}`,
        },
    });
}
