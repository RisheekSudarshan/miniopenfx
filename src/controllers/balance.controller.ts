import { success } from "../utilities/response";
import { Context } from "hono";

import { getBalancebyUserService } from "../services/balance.service";
import { DbLike } from "../types/types";
import { createDb } from "../database/client";

export async function creditBalanceController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const userId = c.get("userId");

  const res = await getBalancebyUserService(db, userId);

  return success(c, { balances: res }, 200);
}
