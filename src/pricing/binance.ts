import fetch from 'node-fetch'
import { priceCache } from './cache.js'

export async function refreshPrice(pair: string) {
  const symbol = pair.replace('/', '')
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
  )
  const data: any = await res.json()

  priceCache[pair] = {
    rate: Number(data.price),
    ts: Date.now(),
  }
}
