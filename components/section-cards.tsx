// "use client";
// import {
//   TrendingDownIcon,
//   TrendingUpIcon,
//   DollarSign,
//   LineChart,
//   ArrowDownLeft,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Card,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { MarketCarousel } from "@/components/marketsCarousel/carousel";
// import { doc, onSnapshot } from "firebase/firestore";
// import { auth, db } from "@/lib/firebase";
// import { useEffect, useState, useCallback } from "react";

// export function SectionCards() {
//   const [balance, setBalance] = useState<number | null>(null);
//   const [pending, setPending] = useState<boolean | null>(null);
//   const [investedAmount, setInvestedAmount] = useState<number | null>(null);
//   const [hasNewMessages, setHasNewMessages] = useState(false);
//   const [trend, setTrend] = useState<number>(0);
//   const [totalDeposits, setTotalDeposits] = useState<number>(0);

//   // Memoized function to calculate trend
//   const calculateTrend = useCallback(
//     (invested: number | null, deposits: number) => {
//       if (deposits > 0 && invested !== null) {
//         const trendPercent = ((invested - deposits) / deposits) * 100;
//         const roundedTrend = Number(trendPercent.toFixed(1));
//         console.log("Trend calculated:", {
//           invested,
//           deposits,
//           trendPercent,
//           roundedTrend,
//         });
//         return roundedTrend;
//       }
//       console.log("Trend set to 0: no deposits or invested amount null", {
//         invested,
//         deposits,
//       });
//       return 0;
//     },
//     []
//   );

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user?.uid) {
//       console.log("No user logged in");
//       return;
//     }

//     console.log("useEffect: Fetching data for user", user.uid);
//     const docRef = doc(db, "users", user.uid);
//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnapshot) => {
//         if (docSnapshot.exists()) {
//           const userData = docSnapshot.data();
//           console.log("Firestore data received:", userData);

//           // Set balance and pending status
//           setBalance(userData.walletBalance ?? 0);
//           setPending(userData.pendingStatus ?? false);
//           setHasNewMessages(userData.hasNewMessage ?? false);

//           // Calculate invested amount
//           const managerInvestments = userData.managerInvestments ?? {};
//           const botInvestments = userData.botInvestments ?? {};
//           const managerTotal = Object.values(
//             managerInvestments as Record<
//               string,
//               { amount: number; date: string }
//             >
//           ).reduce((sum, val) => sum + (val.amount || 0), 0);
//           const botTotal = Object.values(
//             botInvestments as Record<string, { amount: number; date: string }>
//           ).reduce((sum, val) => sum + (val.amount || 0), 0);
//           const invested = managerTotal + botTotal;
//           console.log("Invested amount calculated:", {
//             managerTotal,
//             botTotal,
//             invested,
//           });

//           // Calculate total deposits (aligned with Transaction History)
//           const history = userData.history ?? [];
//           console.log("Raw history:", history);
//           if (!Array.isArray(history) || history.length === 0) {
//             console.log("No history data, setting totalDeposits to 0");
//             setTotalDeposits(0);
//             setInvestedAmount(invested);
//             setTrend(calculateTrend(invested, 0));
//             return;
//           }

//           const processedHistory = history.map((tx: any) => {
//             const rawTimestamp = tx.timestamp;
//             const date =
//               rawTimestamp instanceof Date
//                 ? rawTimestamp
//                 : rawTimestamp?.toDate?.() ?? new Date(rawTimestamp);
//             console.log("Processing transaction:", { tx, date });
//             return {
//               ...tx,
//               type: tx.type || "deposit", // Default to "deposit" if type missing
//               timestamp: date,
//             };
//           });

//           const depositsTotal = processedHistory
//             .filter((tx) => {
//               const isDeposit = tx.type.toLowerCase() === "deposit";
//               console.log("Filtered transaction:", { tx, isDeposit });
//               return isDeposit;
//             })
//             .reduce((sum: number, tx) => {
//               const amount = tx.amount || 0;
//               console.log("Adding amount:", { amount, sum });
//               return sum + amount;
//             }, 0);
//           console.log("Total deposits calculated:", depositsTotal);

//           // Update states
//           setInvestedAmount(invested);
//           setTotalDeposits(depositsTotal);
//           setTrend(calculateTrend(invested, depositsTotal));
//         } else {
//           console.log("No user data found in Firestore");
//           setBalance(0);
//           setInvestedAmount(0);
//           setTotalDeposits(0);
//           setTrend(0);
//         }
//       },
//       (error) => {
//         console.error("Error fetching user data:", error);
//       }
//     );

//     return () => {
//       console.log("Cleaning up Firestore listener");
//       unsubscribe();
//     };
//   }, [calculateTrend]);

//   return (
//     <div className="grid grid-cols-1 gap-6 px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-8">
//       {/* Notification Banner */}
//       {hasNewMessages && (
//         <div className="col-span-full mb-4 rounded-lg bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 dark:from-yellow-600/20 dark:to-yellow-400/20 p-4 text-yellow-900 dark:text-yellow-200 font-semibold shadow-sm animate-pulse transition-all duration-500">
//           You have new notifications!
//         </div>
//       )}

//       {/* Wallet Balance Card */}
//       <Card className="@container/card font-montserrat transform transition-transform hover:scale-105 bg-gradient-to-t from-blue-500/10 to-blue-100/10 dark:from-blue-700/10 dark:to-card border-2 border-blue-300 dark:border-blue-600 shadow-md hover:shadow-lg animate-in fade-in duration-500">
//         <CardHeader className="relative">
//           <div className="sm:flex space-y-4 sm:space-y-0 sm:space-x-6">
//             <div className="flex items-center space-x-2">
//               {/* <DollarSign className="size-5 text-blue-500 dark:text-blue-300" /> */}
//               <div>
//                 <CardDescription className="text-muted-foreground">
//                   Wallet Balance
//                 </CardDescription>
//                 <CardTitle className="@[250px]/card:text-3xl text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-300">
//                   {balance !== null ? (
//                     `$${balance.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}`
//                   ) : (
//                     <span className="font-medium text-base flex text-muted-foreground">
//                       Loading...
//                     </span>
//                   )}
//                 </CardTitle>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               {/* <DollarSign className="size-5 text-blue-500 dark:text-blue-300" /> */}
//               <div>
//                 <CardDescription className="text-muted-foreground">
//                   Investments
//                 </CardDescription>
//                 <CardTitle className="@[250px]/card:text-3xl text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-300">
//                   {investedAmount !== null ? (
//                     `$${investedAmount.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}`
//                   ) : (
//                     <span className="font-medium text-base flex text-muted-foreground">
//                       Loading...
//                     </span>
//                   )}
//                 </CardTitle>
//               </div>
//             </div>
//             {/* <div className="flex items-center space-x-2">
//               <ArrowDownLeft className="size-5 text-blue-500 dark:text-blue-300" />
//               <div>
//                 <CardDescription className="text-muted-foreground">
//                   Total Deposits
//                 </CardDescription>
//                 <CardTitle className="@[250px]/card:text-3xl text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-300">
//                   {totalDeposits !== null ? (
//                     `$${totalDeposits.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}`
//                   ) : (
//                     <span className="font-medium text-base flex text-muted-foreground">
//                       Loading...
//                     </span>
//                   )}
//                 </CardTitle>
//               </div>
//             </div> */}
//           </div>
//           <div className="absolute right-4 top-4">
//             <Badge
//               variant="outline"
//               className={`flex gap-1 rounded-lg text-xs border-0 ${
//                 trend >= 0
//                   ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
//                   : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
//               }`}
//             >
//               {trend >= 0 ? (
//                 <TrendingUpIcon className="size-3" />
//               ) : (
//                 <TrendingDownIcon className="size-3" />
//               )}
//               {trend >= 0 ? `+${trend}%` : `${trend}%`}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardFooter className="flex-col items-start gap-1 text-sm">
//           <div className="line-clamp-1 flex gap-2 font-medium text-blue-500 dark:text-blue-300">
//             {trend >= 0 ? (
//               <p className="text-green-500">up ${trend}%</p>
//             ) : (
//               <p className="text-red-500">down ${Math.abs(trend)}%</p>
//             )}{" "}
//             {trend >= 0 ? (
//               <TrendingUpIcon className="size-4 text-green-500" />
//             ) : (
//               <TrendingDownIcon className="size-4 text-red-500" />
//             )}
//           </div>
//           {pending === true ? (
//             <div className="text-muted-foreground">Pending Transaction...</div>
//           ) : (
//             <div className="text-muted-foreground">on deposits</div>
//           )}
//         </CardFooter>
//       </Card>

//       {/* Markets Card */}
//       <Card className="@container/card font-montserrat transform transition-transform hover:scale-105 bg-gradient-to-t from-green-500/10 to-green-100/10 dark:from-green-700/10 dark:to-card border-2 border-green-300 dark:border-green-600 shadow-md hover:shadow-lg animate-in fade-in duration-500">
//         <CardHeader className="relative">
//           <div className="flex items-center space-x-2">
//             <LineChart className="size-5 text-blue-500 dark:text-blue-300" />
//             <CardDescription className="text-muted-foreground">
//               Markets
//             </CardDescription>
//           </div>
//           <MarketCarousel />
//         </CardHeader>
//       </Card>
//     </div>
//   );
// }

"use client";
import {
  TrendingDownIcon,
  TrendingUpIcon,
  DollarSign,
  LineChart,
  ArrowDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketCarousel } from "@/components/marketsCarousel/carousel";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState, useCallback } from "react";

export function SectionCards() {
  const [balance, setBalance] = useState<number | null>(null);
  const [pending, setPending] = useState<boolean | null>(null);
  const [investedAmount, setInvestedAmount] = useState<number | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [trend, setTrend] = useState<number>(0);
  const [totalDeposits, setTotalDeposits] = useState<number>(0);
  const [initialInvestments, setInitialInvestments] = useState<number>(0); // New state

  // Memoized function to calculate trend
  const calculateTrend = useCallback(
    (currentInvestments: number | null, initialInvestments: number) => {
      if (initialInvestments > 0 && currentInvestments !== null) {
        const trendPercent =
          ((currentInvestments - initialInvestments) / initialInvestments) *
          100;
        const roundedTrend = Number(trendPercent.toFixed(1));
        console.log("Trend calculated:", {
          currentInvestments,
          initialInvestments,
          trendPercent,
          roundedTrend,
        });
        return roundedTrend;
      }
      console.log(
        "Trend set to 0: no initial investments or current investments null",
        {
          currentInvestments,
          initialInvestments,
        }
      );
      return 0;
    },
    []
  );

  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.uid) {
      console.log("No user logged in");
      return;
    }

    console.log("useEffect: Fetching data for user", user.uid);
    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          console.log("Firestore data received:", userData);

          // Set balance, pending status, and initial investments
          setBalance(userData.walletBalance ?? 0);
          setPending(userData.pendingStatus ?? false);
          setHasNewMessages(userData.hasNewMessage ?? false);
          setInitialInvestments(userData.initialInvestments ?? 0); // New field

          // Calculate invested amount
          const managerInvestments = userData.managerInvestments ?? {};
          const botInvestments = userData.botInvestments ?? {};
          const managerTotal = Object.values(
            managerInvestments as Record<
              string,
              { amount: number; date: string }
            >
          ).reduce((sum, val) => sum + (val.amount || 0), 0);
          const botTotal = Object.values(
            botInvestments as Record<string, { amount: number; date: string }>
          ).reduce((sum, val) => sum + (val.amount || 0), 0);
          const invested = managerTotal + botTotal;
          console.log("Invested amount calculated:", {
            managerTotal,
            botTotal,
            invested,
          });

          // Calculate total deposits (aligned with Transaction History)
          const history = userData.history ?? [];
          console.log("Raw history:", history);
          if (!Array.isArray(history) || history.length === 0) {
            console.log("No history data, setting totalDeposits to 0");
            setTotalDeposits(0);
            setInvestedAmount(invested);
            setTrend(
              calculateTrend(invested, userData.initialInvestments ?? 0)
            );
            return;
          }

          const processedHistory = history.map((tx: any) => {
            const rawTimestamp = tx.timestamp;
            const date =
              rawTimestamp instanceof Date
                ? rawTimestamp
                : rawTimestamp?.toDate?.() ?? new Date(rawTimestamp);
            console.log("Processing transaction:", { tx, date });
            return {
              ...tx,
              type: tx.type || "deposit",
              timestamp: date,
            };
          });

          const depositsTotal = processedHistory
            .filter((tx) => {
              const isDeposit = tx.type.toLowerCase() === "deposit";
              console.log("Filtered transaction:", { tx, isDeposit });
              return isDeposit;
            })
            .reduce((sum: number, tx) => {
              const amount = tx.amount || 0;
              console.log("Adding amount:", { amount, sum });
              return sum + amount;
            }, 0);
          console.log("Total deposits calculated:", depositsTotal);

          // Update states
          setInvestedAmount(invested);
          setTotalDeposits(depositsTotal);
          setTrend(calculateTrend(invested, userData.initialInvestments ?? 0));
        } else {
          console.log("No user data found in Firestore");
          setBalance(0);
          setInvestedAmount(0);
          setTotalDeposits(0);
          setInitialInvestments(0);
          setTrend(0);
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
      }
    );

    return () => {
      console.log("Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [calculateTrend]);

  return (
    <div className="grid grid-cols-1 gap-6 px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-8">
      {/* Notification Banner */}
      {hasNewMessages && (
        <div className="col-span-full mb-4 rounded-lg bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 dark:from-yellow-600/20 dark:to-yellow-400/20 p-4 text-yellow-900 dark:text-yellow-200 font-semibold shadow-sm animate-pulse transition-all duration-500">
          You have new notifications!
        </div>
      )}

      {/* Wallet Balance Card */}
      <Card className="@container/card font-montserrat transform transition-transform hover:scale-105  border-2 border-[#c9a678] shadow-md hover:shadow-lg animate-in fade-in duration-500">
        <CardHeader className="relative">
          <div className="sm:flex space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <div>
                <CardDescription className="text-muted-foreground">
                  Wallet Balance
                </CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-300">
                  {balance !== null ? (
                    `$${balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  ) : (
                    <span className="font-medium text-base flex text-muted-foreground">
                      Loading...
                    </span>
                  )}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div>
                <CardDescription className="text-muted-foreground">
                  Investments
                </CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-300">
                  {investedAmount !== null ? (
                    `$${investedAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  ) : (
                    <span className="font-medium text-base flex text-muted-foreground">
                      Loading...
                    </span>
                  )}
                </CardTitle>
              </div>
            </div>
          </div>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex gap-1 rounded-lg text-xs border-0 ${
                trend >= 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
              }`}
            >
              {trend >= 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-blue-500 dark:text-blue-300">
            {trend >= 0 ? (
              <p className="text-green-500">up ${trend}%</p>
            ) : (
              <p className="text-red-500">down ${Math.abs(trend)}%</p>
            )}{" "}
            {trend >= 0 ? (
              <TrendingUpIcon className="size-4 text-green-500" />
            ) : (
              <TrendingDownIcon className="size-4 text-red-500" />
            )}
          </div>
          {pending === true ? (
            <div className="text-muted-foreground">Pending Transaction...</div>
          ) : (
            <div className="text-muted-foreground">on investments</div>
          )}
        </CardFooter>
      </Card>

      {/* Markets Card */}
      <Card className="@container/card font-montserrat transform transition-transform hover:scale-105  dark:to-card border-[#c9a678] border-2 shadow-md hover:shadow-lg animate-in fade-in duration-500">
        <CardHeader className="relative">
          <div className="flex items-center space-x-2">
            <LineChart className="size-5 text-blue-500 dark:text-blue-300" />
            <CardDescription className="text-muted-foreground">
              Markets
            </CardDescription>
          </div>
          <MarketCarousel />
        </CardHeader>
      </Card>
    </div>
  );
}
