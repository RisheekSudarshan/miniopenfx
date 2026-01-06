import { Context } from "hono";
import { trade } from "../services/trade.service.js";
import { success } from "../utilities/response.js";


export async function selfTradeController(c: Context) {
  const userId = c.get("userId");
  const idempotencyKey = c.req.header("Idempotency-Key");
  const { quoteId, amount } = await c.req.json();

  const result = await trade(userId, userId, idempotencyKey, quoteId, amount);

  return success(c, "Executed", 201);
}

export async function otherTradeController(c: Context) {
  const userId = c.get("userId");
  const idempotencyKey = c.req.header("Idempotency-Key");
  const { quoteId, amount, receiverId } = await c.req.json();

  const result = await trade(
    userId,
    receiverId,
    idempotencyKey,
    quoteId,
    amount,
  );

  return success(c, "Executed", 201);
}

