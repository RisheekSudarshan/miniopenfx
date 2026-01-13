import { devAddMoneyService } from "../services/dev.service";
import { success } from "../utilities/response";
export async function devAddMoneyController(c) {
    const userId = c.get("userId");
    const { currency, amount, reciverId } = await c.req.json();
    await devAddMoneyService(reciverId, currency, amount, userId);
    return success(c, "Credited!", 201);
}
