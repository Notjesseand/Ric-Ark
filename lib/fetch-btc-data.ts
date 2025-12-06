export async function fetchCoinMarketChart(coinId: string, timeRange: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${timeRange}&interval=daily`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data for " + coinId);
  }

  const data = await res.json();

  return data.prices.map(([timestamp, price]: [number, number]) => ({
    date: new Date(timestamp).toISOString().slice(0, 10),
    price,
  }));
}
