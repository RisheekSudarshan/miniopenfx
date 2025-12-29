import { cache } from "hono/cache";

export const priceCache: Record<string, { rate: number; ts: number }> = {}

// const g20Currencies: string[] = ['EUR', 'JPY', 'GBP', 'CAD', 'CHF', 'NZD', 'CNH', 'INR', 'KRW', 'MXN', 'BRL', 'ZAR', 'TRY', 'IDR', 'RUB','SAR','ARS'];
// for (let currency of g20Currencies){
//   priceCache[currency].rate = 234
//   priceCache[currency].ts == Date.now()
// }

// export  priceCache

export function isFresh(pair: string) {
  return priceCache[pair] && Date.now() - priceCache[pair].ts < 3000
}
