"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Spinner from "@/components/spinner";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SiBitcoin,
  SiEthereum,
  SiTether,
  SiSolana,
  SiCoinmarketcap,
} from "react-icons/si";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";

// Transaction type
interface Transaction {
  type: string;
  amount: number;
  status?: string;
  network?: string;
  manager?: string;
  bot?: string;
  timestamp: Date | string;
  [key: string]: any;
}

export default function Page() {
  const loading = useAuthRedirect();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalDeposits, setTotalDeposits] = useState<number>(0);

  // Map network to corresponding icon
  const networkIcons = {
    bitcoin: SiBitcoin,
    ethereum: SiEthereum,
    solana: SiSolana,
    usdt: SiTether,
    usdc: HiOutlineCurrencyDollar,
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (docSnapshot) => {
        const data = docSnapshot.data();
        const deposits = data?.history || [];

        if (!Array.isArray(deposits) || deposits.length === 0) {
          setTransactions([]);
          setTotalDeposits(0);
          return;
        }

        const sorted = deposits
          .map((tx: any) => {
            const rawTimestamp = tx.timestamp;
            const date =
              rawTimestamp instanceof Date
                ? rawTimestamp
                : rawTimestamp?.toDate?.() ?? new Date(rawTimestamp);

            return {
              ...tx,
              type: tx.type || "deposit",
              timestamp: date,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

        // Calculate total deposit amount for confirmed transactions
        const total = sorted
          .filter(
            (tx) =>
              tx.type.toLowerCase() === "deposit" &&
              tx.status?.toLowerCase() === "confirmed"
          )
          .reduce((sum, tx) => {
            const amount = tx.amount || 0;
            console.log("Processing confirmed deposit:", { tx, amount, sum });
            return sum + amount;
          }, 0);

        console.log("Total confirmed deposits:", total);

        setTransactions(sorted);
        setTotalDeposits(total);
      },
      (error: Error) => {
        console.error("Error fetching user transaction history:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col gap-4 p-4 md:p-6 font-montserrat">
          <h1 className="text-2xl font-semibold">Transaction History</h1>
          {/* Total Deposits Card */}
          <Card className="transform transition-transform scale-95 hover:scale-[98%] bg-gradient-to-t from-green-500/10 to-green-100/10 dark:from-green-700/10 dark:to-card border-2 border-green-300 dark:border-green-600 shadow-md hover:shadow-lg animate-in fade-in duration-500">
            <CardHeader className="flex flex-row items-center gap-3">
              <HiOutlineCurrencyDollar className="text-2xl text-green-600 dark:text-green-400" />
              <CardTitle className="text-lg font-semibold text-green-600 dark:text-green-300">
                Total Confirmed Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">
                $
                {totalDeposits.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Sum of all confirmed deposit transactions
              </p>
            </CardContent>
          </Card>
          {/* Transaction List */}
          {transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions found.</p>
          ) : (
            transactions.map((tx, idx) => {
              const IconComponent =
                // @ts-ignore
                tx.network && networkIcons[tx.network.toLowerCase()]
                  ? // @ts-ignore
                    networkIcons[tx.network.toLowerCase()]
                  : null;

              return (
                <Card
                  key={idx}
                  className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 transition-all duration-200 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {IconComponent && (
                      <IconComponent
                        className={`text-2xl transition-colors duration-200 ${
                          tx.network?.toLowerCase() === "bitcoin"
                            ? "text-orange-500 dark:text-orange-400"
                            : tx.network?.toLowerCase() === "ethereum"
                            ? "text-indigo-600 dark:text-indigo-400"
                            : tx.network?.toLowerCase() === "solana"
                            ? "text-purple-600 dark:text-purple-400"
                            : tx.network?.toLowerCase() === "usdt"
                            ? "text-teal-600 dark:text-teal-400"
                            : tx.network?.toLowerCase() === "usdc"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />
                    )}
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.network || tx.manager || tx.bot || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${tx.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.status || "N/A"}
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
