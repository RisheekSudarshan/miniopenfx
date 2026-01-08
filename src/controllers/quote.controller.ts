import { Context } from "hono";
import { createQuoteService } from "../services/quote.service.js";
import { success } from "../utilities/response.js";
import { DbLike } from "../types/types.js";
import { createDb } from "../database/client.js";

export async function quoteController(c: Context) {
  const userId = c.get("userId");
  const { pair, side } = await c.req.json();

  const db: DbLike = createDb(c.env.DATABASE_URL);
  const quote = await createQuoteService(db, userId, pair, side, c.env.pricecache);
  return success(c, quote, 201);
}
