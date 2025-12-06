import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";

    // Calculate the 'from' date (e.g., 7 days ago for broader results)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7); // 7 days ago
    const from = fromDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Base query for cryptocurrency-related terms
    let query = `"cryptocurrency" OR "bitcoin" OR "ethereum" OR "decentralized finance" OR "nft" -stock -politics -entertainment`;

    // Adjust query based on category
    if (category !== "all") {
      if (["business", "technology", "finance"].includes(category)) {
        // Broaden the query to include category as a keyword
        query = `${query} ${category}`;
      }
    }

    // Adjust sortBy based on category
    const sortBy = category === "trending" ? "popularity" : "publishedAt";

    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&language=en&from=${from}&pageSize=30&sortBy=${sortBy}&apiKey=4a9d6931b3d944439b997df03864b3f4`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) {
      console.error(`NewsAPI error: ${res.status} ${res.statusText}`);
      throw new Error(`NewsAPI error: ${res.status}`);
    }

    const data = await res.json();
    if (data.status === "error") {
      console.error("NewsAPI response error:", data.message);
      throw new Error(`NewsAPI response error: ${data.message}`);
    }

    console.log("NewsAPI response:", data);
    return NextResponse.json({ results: data.articles || [] });
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return NextResponse.json(
      { results: [], error: String(error) },
      { status: 500 }
    );
  }
}
