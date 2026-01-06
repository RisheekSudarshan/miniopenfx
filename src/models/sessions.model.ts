import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { db } from "../database/client";
import { eq } from "drizzle-orm";
import { sessionType } from "../types/types";

export const sessions = pgTable("sessions", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export async function createSession(
  sessionId: string,
  userId: string,
  expiresAt: Date,
): Promise<void> {
  await db.insert(sessions).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
}

export async function getSessionById(sessionId: string): Promise<sessionType> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  return session;
}

export async function deleteSessionById(sessionId: string): Promise<void>{
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
