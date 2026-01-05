import { isFresh, refreshPrice, getPrice } from "./price.js";
import { createQuote } from "../models/quote.model.js";
const BUY_SPREAD = 0.0002;
const SELL_SPREAD = 0.0002;
export async function createQuoteService(userId, pair, side) {
    if (!isFresh(pair)) {
        await refreshPrice(pair);
    }
    const market = getPrice(pair);
    if (market === null) {
        throw new Error("MARKET_PRICE_UNAVAILABLE");
    }
    const rate = side === "BUY"
        ? market * (1 + BUY_SPREAD)
        : market * (1 - SELL_SPREAD);
    return createQuote({
        userId,
        pair,
        side,
        rate
    });
}
