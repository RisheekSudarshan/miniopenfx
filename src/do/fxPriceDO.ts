import { EnvBindings } from "../types/env";
import type { Quote } from "../types/types";

export class FxPricesDO {
  state: DurableObjectState;
  env: EnvBindings;

  ws?: WebSocket;
  prices: Record<string, Quote> = {};

  // Keep track of what we’re currently subscribed to
  private subscribedSymbolsKey = "";
  private reconnecting = false;

  constructor(state: DurableObjectState, env: EnvBindings) {
    this.state = state;
    this.env = env;
  }

  private buildUrl(symbols: string[]) {
    const streams = symbols.map((s) => `${s.toLowerCase()}@bookTicker`).join("/");
    // Encode streams for safety
    return `wss://stream.binance.com:9443/stream?streams=${encodeURIComponent(streams)}`;
  }

  async ensureConnected(symbols: string[]) {
    const key = symbols.map((s) => s.toUpperCase()).sort().join(",");

    // If we’re already connected/connecting to the same set of streams, do nothing
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) &&
      this.subscribedSymbolsKey === key
    ) {
      return;
    }

    // If symbols changed, close old socket and reconnect
    if (this.ws) {
      try { this.ws.close(1000, "resubscribe"); } catch {}
      this.ws = undefined;
    }

    this.subscribedSymbolsKey = key;
    const url = this.buildUrl(symbols);

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.addEventListener("open", () => {
      // Optional: schedule periodic alarms so DO wakes up and can self-heal
      // (Helpful if you want the upstream to stay alive without constant HTTP traffic)
      this.state.storage.setAlarm(Date.now() + 30_000).catch(() => {});
    });

    ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(String(evt.data));

      // Combined streams wrapper: { stream: "...", data: {...} } :contentReference[oaicite:3]{index=3}
      const data = msg.data ?? msg;

      const sym = String(data.s);     // "EURUSDT" (Binance sends uppercase in payload)
      const bid = String(data.b);
      const ask = String(data.a);
      const mid = (Number(bid) + Number(ask)) / 2;

      this.prices[sym] = { bid, ask, mid: String(mid), ts: Date.now() };
    });

    ws.addEventListener("close", () => {
      if (this.ws === ws) this.ws = undefined;
      this.scheduleReconnect(symbols);
    });

    ws.addEventListener("error", () => {
      try { ws.close(); } catch {}
      if (this.ws === ws) this.ws = undefined;
      this.scheduleReconnect(symbols);
    });
  }

  private scheduleReconnect(symbols: string[]) {
    if (this.reconnecting) return;
    this.reconnecting = true;

    // simple backoff
    const delayMs = 1000;

    // Use alarm instead of setTimeout for DO
    this.state.storage.setAlarm(Date.now() + delayMs).catch(() => {});
    // store symbols we want to reconnect to (in memory is fine for this)
    this.subscribedSymbolsKey = symbols.map((s) => s.toUpperCase()).sort().join(",");
  }

  // Alarm handler: used for keepalive + reconnects
  async alarm() {
    this.reconnecting = false;

    const symbols = this.subscribedSymbolsKey
      ? this.subscribedSymbolsKey.split(",").filter(Boolean)
      : ["EURUSDT"];

    // If socket is missing/closed, reconnect
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      await this.ensureConnected(symbols);
    }

    // Keep waking up periodically while connected to self-heal
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      await this.state.storage.setAlarm(Date.now() + 30_000);
    }
  }

  async fetch(req: Request) {
    const url = new URL(req.url);

    const symbols = (url.searchParams.get("symbols") ?? "EURUSDT")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    await this.ensureConnected(symbols);

    const out: Record<string, Quote | null> = {};
    for (const s of symbols) out[s] = this.prices[s] ?? null;

    return new Response(JSON.stringify(out), {
      headers: { "content-type": "application/json" },
    });
  }
}
