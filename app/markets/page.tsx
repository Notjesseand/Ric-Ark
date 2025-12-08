"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getData } from "@/api/fetchrates";
import Spinner from "@/components/spinner";

export default function MarketsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coins = await getData();
        setData(coins.slice(0, 100));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="px-4 py-10 md:py-16 font-montserrat">
          <h2 className="text-2xl font-bold mb-6">Top 100 Cryptocurrencies</h2>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-left text-sm md:text-base">
                  <tr className="border-b border-slate-300 dark:border-slate-700">
                    <th className="px-4 py-2">Coin</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">24h</th>
                    <th className="px-4 py-2 hidden md:table-cell">
                      High (24h)
                    </th>
                    <th className="px-4 py-2 hidden md:table-cell">
                      Low (24h)
                    </th>
                    <th className="px-4 py-2 hidden md:table-cell">Volume</th>
                    <th className="px-4 py-2">Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((coin, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-200 dark:border-slate-700 text-sm"
                    >
                      <td className="px-4 py-2 flex items-center gap-2">
                        <img
                          src={coin?.image}
                          alt={coin?.name}
                          className="h-5 w-5"
                        />
                        {coin.name}{" "}
                        <span className="text-slate-500 uppercase ml-1">
                          {coin?.symbol}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        ${coin.current_price.toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-2 ${
                          coin.price_change_percentage_24h < 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        ${coin.high_24h?.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        ${coin.low_24h?.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        ${coin.total_volume?.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        ${coin.market_cap?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
