import { Context } from "hono";
import { devAddMoneyService } from "../services/dev.service";
import { success } from "../utilities/response";

export async function devAddMoneyController(c: Context) {
  const userId = c.get("userId");

  const { currency, amount, reciverId } = await c.req.json();
  await devAddMoneyService(reciverId, currency, amount, userId);
  return success(c, "Credited!" , 201);
}
