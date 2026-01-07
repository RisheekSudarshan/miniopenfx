import { createQuoteService } from "../services/quote.service.js";
import { success } from "../utilities/response.js";
export async function quoteController(c) {
    const userId = c.get("userId");
    const { pair, side } = await c.req.json();
    const quote = await createQuoteService(userId, pair, side);
    return success(c, quote, 201);
}
