// lib/fetch-candle-data.ts

export interface CandleData {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function fetchCandleData(
  coinId: string,
  days: string
): Promise<CandleData[]> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch candle data for ${coinId}`);
  }

  const data: [number, number, number, number, number][] = await res.json();

  return data.map(([timestamp, open, high, low, close]) => ({
    date: timestamp,
    open,
    high,
    low,
    close,
  }));
}
