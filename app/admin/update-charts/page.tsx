// //app/admin/update-charts/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { AppSidebar } from "../components/app-sidebar";
// import { SiteHeader } from "../components/site-header";
// import { format } from "date-fns";

// const ReactApexChart = dynamic(() => import("react-apexcharts"), {
//   ssr: false,
// });

// export default function UpdateChartsPage() {
//   const [authorized, setAuthorized] = useState(false);
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [updating, setUpdating] = useState(false);
//   const [topCoins, setTopCoins] = useState<{ id: string; name: string }[]>([]);
//   const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
//   const [filterDays, setFilterDays] = useState(30); // Toggle state: 7, 30, or 90

//   // Admin check
//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) return setAuthorized(false);
//       const userDoc = await getDocs(collection(db, "users"));
//       const thisUser = userDoc.docs.find((doc) => doc.id === user.uid);
//       if (thisUser?.data().role === "admin") setAuthorized(true);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Load coin list
//   // useEffect(() => {
//   //   const fetchTopCoins = async () => {
//   //     const res = await fetch(
//   //       "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
//   //     );
//   //     const data = await res.json();
//   //     setTopCoins(data.map((coin: any) => ({ id: coin.id, name: coin.name })));
//   //   };
//   //   fetchTopCoins();
//   // }, []);
//   useEffect(() => {
//     const loadTopCoinsFromFirestore = async () => {
//       const chartsSnapshot = await getDocs(collection(db, "charts"));
//       const coins = chartsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1), // capitalize coin names for display
//       }));
//       setTopCoins(coins);
//     };

//     loadTopCoinsFromFirestore();
//   }, []);

//   // Load chart data
//   useEffect(() => {
//     const loadChartData = async () => {
//       const snapshot = await getDocs(
//         collection(db, "charts", selectedCoinId, "data")
//       );
//       const allData = snapshot.docs
//         .map((doc) => doc.data())
//         .sort((a, b) => a.date - b.date);

//       const cutoff = Date.now() - filterDays * 24 * 60 * 60 * 1000;
//       const filteredData = allData.filter((item) => item.date >= cutoff);

//       setChartData(filteredData);
//     };

//     if (selectedCoinId) loadChartData();
//   }, [selectedCoinId, filterDays]);

//   // Auto-refresh every 6 hours
//   useEffect(() => {
//     const interval = setInterval(() => {
//       handleUpdate();
//     }, 6 * 60 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleUpdate = async () => {
//     setUpdating(true);
//     try {
//       const res = await fetch("/api/update-charts", {
//         method: "POST",
//       });

//       if (!res.ok) throw new Error("Failed to trigger update");

//       alert(
//         "Update has started in the background. You can safely leave this page."
//       );
//     } catch (err) {
//       console.error("Update failed:", err);
//       alert("Failed to trigger update.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   if (!authorized)
//     return (
//       <div className="p-6 font-montserrat h-full flex justify-center items-center">
//         Admin access only.
//       </div>
//     );

//   return (
//     <SidebarProvider>
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="p-6 font-montserrat space-y-6">
//           <h1 className="text-2xl font-bold">Update Chart Data</h1>
//           <Button onClick={handleUpdate} disabled={updating}>
//             {updating ? "Updating..." : "Update Charts Now"}
//           </Button>

//           <div className="space-y-4">
//             <label className="block font-semibold">Select Coin</label>
//             <select
//               className="border rounded px-4 py-2"
//               value={selectedCoinId}
//               onChange={(e) => setSelectedCoinId(e.target.value)}
//             >
//               {topCoins.map((coin) => (
//                 <option key={coin.id} value={coin.id}>
//                   {coin.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="space-x-2">
//             <Button
//               variant={filterDays === 7 ? "default" : "outline"}
//               onClick={() => setFilterDays(7)}
//             >
//               7D
//             </Button>
//             <Button
//               variant={filterDays === 30 ? "default" : "outline"}
//               onClick={() => setFilterDays(30)}
//             >
//               1M
//             </Button>
//             <Button
//               variant={filterDays === 90 ? "default" : "outline"}
//               onClick={() => setFilterDays(90)}
//             >
//               3M
//             </Button>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>{selectedCoinId} Candlestick Chart</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {chartData.length > 0 ? (
//                 <ReactApexChart
//                   type="candlestick"
//                   height={400}
//                   series={[
//                     {
//                       data: chartData.map((d) => ({
//                         x: new Date(d.date),
//                         y: [d.open, d.high, d.low, d.close],
//                       })),
//                     },
//                   ]}
//                   options={{
//                     chart: {
//                       type: "candlestick",
//                       toolbar: { show: true },
//                     },
//                     xaxis: {
//                       type: "datetime",
//                       labels: {
//                         formatter: (val) => format(new Date(val), "MM-dd"),
//                       },
//                     },
//                     yaxis: {
//                       tooltip: { enabled: true },
//                     },
//                     tooltip: {
//                       shared: true,
//                       custom: ({ series, seriesIndex, dataPointIndex, w }) => {
//                         const ohlc =
//                           w.globals.initialSeries[seriesIndex].data[
//                             dataPointIndex
//                           ].y;
//                         return `
//                           <div style="padding: 6px">
//                             <b>O:</b> ${ohlc[0]} <b>H:</b> ${ohlc[1]}<br/>
//                             <b>L:</b> ${ohlc[2]} <b>C:</b> ${ohlc[3]}
//                           </div>
//                         `;
//                       },
//                     },
//                   }}
//                 />
//               ) : (
//                 <p className="text-sm text-muted-foreground">
//                   Loading chart data...
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
