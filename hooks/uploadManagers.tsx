// scripts/uploadAiBots.ts
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";

// Replace this with your actual AI bot trading plans
export const aiBots = [
  {
    id: "high-yield-savings",
    name: "High Yield-Savings Account",
    investmentRange: "$200–$5,000",
    minInvestment: 200,
    maxInvestment: 5000,
    dailyReturn: 0.6,
    details:
      "FDIK-insured, liquid, and ideal for short-term goals or emergency funds.",
  },
  {
    id: "treasury-etfs",
    name: "Short-Term Treasury ETFs",
    investmentRange: "$5,000–$20,000",
    minInvestment: 5000,
    maxInvestment: 20000,
    dailyReturn: 0.8,
    details: "Invests in U.S. Treasury bills; low risk and highly liquid.",
  },
  {
    id: "corporate-bond-funds",
    name: "Corporate Bond Funds (Medium-Term)",
    investmentRange: "$10,000–$50,000",
    minInvestment: 10000,
    maxInvestment: 50000,
    dailyReturn: 1.2,
    details:
      "Diversified bonds from stable companies; moderate risk with steady income.",
  },
  {
    id: "dividend-stock",
    name: "Dividend Stock Fund",
    investmentRange: "$15,000–$100,000",
    minInvestment: 15000,
    maxInvestment: 100000,
    dailyReturn: 1.5,
    details:
      "Focuses on stable companies paying dividends; higher volatility but long-term growth potential.",
  },
  {
    id: "reit-index",
    name: "REIT Index Fund",
    investmentRange: "$20,000–$250,000",
    minInvestment: 20000,
    maxInvestment: 250000,
    dailyReturn: 2.0,
    details:
      "Invests in real estate trusts; offers dividends and capital appreciation, with moderate risk.",
  },
];

export async function uploadAiBots() {
  try {
    const batchPromises = aiBots.map((bot) => {
      const ref = doc(db, "aiBots", bot.id); // Save to "aiBots" collection
      return setDoc(ref, bot);
    });

    await Promise.all(batchPromises);
    console.log("AI bots uploaded successfully!");
  } catch (err) {
    console.error("Error uploading AI bots:", err);
  }
}
