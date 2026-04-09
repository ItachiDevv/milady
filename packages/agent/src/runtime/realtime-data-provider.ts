/**
 * Provider that auto-fetches real-time data when the user asks about something
 * that requires a live lookup (crypto prices, site uptime, etc.).
 *
 * Runs before the LLM generates a response. The result gets injected into the
 * model's context as a provider fact, so the LLM sees real numbers instead of
 * hallucinating from stale training data.
 *
 * This is the eliza-native way to solve the "model says BTC is $82k when it's
 * actually $70k" problem — no character prompt hacking, no action routing
 * override. The LLM picks REPLY naturally, and the reply uses the real data
 * because it's right there in context.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";

const COINGECKO_IDS: Record<string, string> = {
  bitcoin: "bitcoin",
  btc: "bitcoin",
  ethereum: "ethereum",
  eth: "ethereum",
  solana: "solana",
  sol: "solana",
};

// Match any message that mentions a crypto name in a way that implies wanting
// to know its current state — deliberately broad so we fetch rather than miss.
// False positives are cheap (one CoinGecko call that adds context the LLM can
// ignore); false negatives are expensive (the LLM hallucinates a number).
const PRICE_PATTERN =
  /\b(bitcoin|btc|ethereum|eth|solana|sol)\b/i;

async function fetchCryptoPrice(
  coin: string,
): Promise<string | null> {
  const id = COINGECKO_IDS[coin.toLowerCase()];
  if (!id) return null;
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >;
    const entry = data[id];
    if (!entry?.usd) return null;
    const change = entry.usd_24h_change;
    const changeStr =
      change !== undefined
        ? ` (${change >= 0 ? "+" : ""}${change.toFixed(2)}% 24h)`
        : "";
    return `${id}: $${entry.usd.toLocaleString("en-US")}${changeStr} — fetched live from CoinGecko API just now, NOT from training data`;
  } catch {
    return null;
  }
}

export const realtimeDataProvider: Provider = {
  name: "REALTIME_DATA",
  description:
    "Auto-fetches live crypto prices and other real-time data when the user's message asks about them. Prevents the LLM from hallucinating stale numbers.",
  position: -10,
  get: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
  ): Promise<ProviderResult> => {
    const text =
      typeof message.content === "string"
        ? message.content
        : (message.content?.text ?? "");

    const priceMatch = text.match(PRICE_PATTERN);
    if (!priceMatch) return { text: "" };
    const coin = (priceMatch[1] ?? "").toLowerCase();
    const price = await fetchCryptoPrice(coin);
    if (!price) return { text: "" };
    return {
      text: `[LIVE DATA — use this, do NOT use your training data for prices]\n${price}`,
    };
  },
};
