import fetch from "node-fetch";
const CACHE_TTL_MS = 3000;
const priceCache = {};
export async function refreshPrice(pair) {
    const { base, quote } = parsePair(pair);
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${base},${quote}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(`CoinGecko API error: ${data?.error || res.statusText}`);
    }
    const basecur = base.toLocaleLowerCase();
    const quotecur = quote.toLocaleLowerCase();
    if (!data?.tether ||
        typeof data.tether[basecur] !== "number" ||
        typeof data.tether[quotecur] !== "number") {
        throw new Error("Invalid CoinGecko response");
    }
    const rate = data["tether"][quotecur] / data["tether"][basecur];
    setPrice(pair, rate);
    return rate;
}
export function isFresh(pair) {
    const entry = priceCache[pair];
    if (!entry)
        return false;
    return Date.now() - entry.ts < CACHE_TTL_MS;
}
export function getPrice(pair) {
    return priceCache[pair]?.rate ?? null;
}
export function setPrice(pair, rate) {
    priceCache[pair] = {
        rate,
        ts: Date.now(),
    };
}
function parsePair(pair) {
    const symbol = pair.replace("/", "");
    if (symbol.length !== 6) {
        throw new Error(`Invalid pair: ${pair}`);
    }
    return {
        base: symbol.slice(0, 3).toLowerCase(),
        quote: symbol.slice(3).toLowerCase(),
    };
}
