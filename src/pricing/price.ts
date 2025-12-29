import fetch from 'node-fetch'
import { priceCache } from './cache.js'

export async function refreshPrice(pair: string) {
  const symbol: string = pair.replace('/', '')
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${symbol.slice(0,3)},${symbol.slice(3)}`
  )
  const data: any = await res.json()
  const basecur: string = symbol.slice(0,3).toLocaleLowerCase()
  const qoutecur: string = symbol.slice(3).toLocaleLowerCase()
//need to assert the currencies and responses of the api
  priceCache[pair] = {
    rate: Number(data.tether[qoutecur])/Number(data.tether[basecur]),
    ts: Date.now(),
  }
}
