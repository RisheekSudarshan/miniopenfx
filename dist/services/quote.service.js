import { isFresh, refreshPrice, getPrice } from "./price.service.js";
import { createQuote } from "../models/quotes.model.js";
import { ErrorCode } from "../errors/error_codes.js";
const BUY_SPREAD = 0.0002;
const SELL_SPREAD = 0.0002;
export async function createQuoteService(userId, pair, side) {
    if (!isFresh(pair)) {
        await refreshPrice(pair);
    }
    const market = getPrice(pair);
    if (market === null) {
        throw new Error(ErrorCode.MARKET_PRICE_UNAVAILABLE);
    }
    const rate = side === "BUY" ? market * (1 + BUY_SPREAD) : market * (1 - SELL_SPREAD);
    return await createQuote({
        userId,
        pair,
        side,
        rate
    });
}
