export const priceCache: Record<string, { rate: number; ts: number }> = {}

export function isFresh(pair: string) {
  return priceCache[pair] && Date.now() - priceCache[pair].ts < 30000
}
