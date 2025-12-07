// components/chart-area-interactive.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fetchCandleData } from "@/lib/fetch-candle-data";
import Spinner from "./spinner";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(key);
    return null;
  } catch (err) {
    console.error("Error reading cache:", err);
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (err) {
    console.error("Error writing to cache:", err);
  }
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();

  const [timeRange, setTimeRange] = React.useState("30");
  const [selectedCoin, setSelectedCoin] = React.useState("bitcoin");
  const [coinList, setCoinList] = React.useState<any[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false); // NEW

  React.useEffect(() => {
    if (isMobile) setTimeRange("7");
  }, [isMobile]);

  React.useEffect(() => {
    const fetchTopCoins = async () => {
      const cacheKey = "topCoins";
      const cachedCoins = getCachedData(cacheKey);

      if (cachedCoins) {
        setCoinList(cachedCoins);
        return;
      }

      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
        );
        const data = await res.json();
        setCoinList(data);
        setCachedData(cacheKey, data);
      } catch (err) {
        console.error("Error fetching coin list:", err);
      }
    };

    fetchTopCoins();
  }, []);

  React.useEffect(() => {
    const getData = async () => {
      setLoading(true); // NEW
      const cacheKey = `chartData:${selectedCoin}:${timeRange}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setChartData(cachedData);
        setLoading(false); // NEW
        return;
      }

      try {
        const candleData = await fetchCandleData(selectedCoin, timeRange);
        setChartData(candleData);
        setCachedData(cacheKey, candleData);
      } catch (error) {
        console.error("Error fetching candle data:", error);
      } finally {
        setLoading(false); // NEW
      }
    };

    getData();
  }, [selectedCoin, timeRange]);

  return (
    <Card className="@container/card font-montserrat">
      <CardHeader className="relative font-montserrat">
        <CardTitle>Charts</CardTitle>
        <p className="font-nunito capitalize">{selectedCoin}</p>
        <CardDescription className="font-montserrat">
          {selectedCoin.toUpperCase()} / USD - Last {timeRange} days
        </CardDescription>

        <div className="flex flex-col gap-4 mt-4">
          <Select value={selectedCoin} onValueChange={setSelectedCoin}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a coin" />
            </SelectTrigger>
            <SelectContent className="max-h-80 overflow-y-auto">
              {coinList.map((coin) => (
                <SelectItem
                  key={coin.id}
                  value={coin.id}
                  className="font-montserrat"
                >
                  {coin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90" className="h-8 px-2.5">
              90d
            </ToggleGroupItem>
            <ToggleGroupItem value="30" className="h-8 px-2.5">
              30d
            </ToggleGroupItem>
            <ToggleGroupItem value="7" className="h-8 px-2.5">
              7d
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="mt-4 block @[767px]/card:hidden">
            <Select
              value={timeRange}
              onValueChange={(val) => val && setTimeRange(val)}
            >
              <SelectTrigger className="w-48 font-montserrat">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="w-48 font-montserrat">
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="text-muted-foreground text-sm p-4">
            <Spinner />
          </div>
        ) : (
          <ReactApexChart
            type="area"
            className="font-montserrat"
            series={[
              {
                name: "Price",
                data: chartData.map((item) => ({
                  x: new Date(item.date),
                  y: item.close,
                })),
              },
            ]}
            options={{
              chart: {
                type: "area",
                height: 350,
                toolbar: { show: false },

                zoom: { enabled: false },
                // @ts-ignore
                pan: { enabled: false },
                // @ts-ignore
                events: { mouseWheelZoom: false },

                fontFamily: "Montserrat, sans-serif",
              },
              dataLabels: { enabled: false },
              stroke: { curve: "smooth", width: 2 },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  opacityFrom: 0.4,
                  opacityTo: 0.1,
                },
              },
              xaxis: { type: "datetime", labels: { show: true } },
              yaxis: { tooltip: { enabled: true }, labels: { show: true } },
              grid: { borderColor: "rgba(128,128,128,0.3)" },
              theme: { mode: resolvedTheme === "dark" ? "dark" : "light" },
            }}
            height={350}
          />
        )}
      </CardContent>
    </Card>
  );
}
