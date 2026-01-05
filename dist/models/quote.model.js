import { pgTable, uuid, text, timestamp, decimal } from "drizzle-orm/pg-core";
import { db } from "../database/client.js";
export const quotes = pgTable("quotes", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull(),
    pair: text("pair").notNull(),
    side: text("side").notNull(),
    rate: decimal("rate", { precision: 18, scale: 8 }).notNull(),
    status: text("status").notNull(),
    expires_at: timestamp("expires_at").notNull()
});
export async function createQuote(data) {
    const [quote] = await db
        .insert(quotes)
        .values({
        user_id: data.userId,
        pair: data.pair,
        side: data.side,
        rate: String(data.rate),
        status: "ACTIVE",
        expires_at: new Date(Date.now() + 50000)
    })
        .returning({
        id: quotes.id,
        rate: quotes.rate,
        expires_at: quotes.expires_at
    });
    return quote;
}
