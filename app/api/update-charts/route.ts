// app/api/update-charts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { fetchCandleData } from "@/lib/fetch-candle-data";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const days = "30";

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1"
    );
    const topCoins = await res.json();

    for (const coin of topCoins) {
      const candles = await fetchCandleData(coin.id, days);

      for (const candle of candles) {
        await setDoc(
          doc(db, "charts", coin.id, "data", `${candle.date}`),
          {
            ...candle,
            coinId: coin.id,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating charts:", error);
    return NextResponse.json(
      { error: "Failed to update charts" },
      { status: 500 }
    );
  }
}
