//app/trades/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCards } from "@/components/section-cards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Loading from "@/components/loading";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

type Trade = {
  id: string;
  asset: string;
  type: "buy" | "sell";
  amount: number;
  leverage: number;
  stopLoss: number | null;
  takeProfit: number | null;
  timestamp: string;
  timestampRaw: Timestamp | null;
};

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [form, setForm] = useState<{
    asset: string;
    type: "buy" | "sell";
    amount: string;
    leverage: string;
    stopLoss: string | null;
    takeProfit: string | null;
  }>({
    asset: "",
    type: "buy",
    amount: "",
    leverage: "1",
    stopLoss: null,
    takeProfit: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [pending, setPending] = useState<boolean | null>(null);
  const [investedAmount, setInvestedAmount] = useState<number | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [trend, setTrend] = useState<number>(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [initialInvestments, setInitialInvestments] = useState<number>(0);

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

  // Fetch user's trades and wallet data from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.uid) return;

    // Fetch trades
    const tradesRef = collection(db, "users", user.uid, "trades");
    const tradesUnsubscribe = onSnapshot(tradesRef, (snapshot) => {
      const tradeData: Trade[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tradeData.push({
          id: doc.id,
          asset: data.asset,
          type: data.type,
          amount: data.amount,
          leverage: data.leverage,
          stopLoss: data.stopLoss ?? null,
          takeProfit: data.takeProfit ?? null,
          timestamp: data.timestamp
            ? data.timestamp.toDate().toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A",
          timestampRaw: data.timestamp || null,
        });
      });
      tradeData.sort((a, b) => {
        if (!a.timestampRaw && !b.timestampRaw) return 0;
        if (!a.timestampRaw) return 1;
        if (!b.timestampRaw) return -1;
        return b.timestampRaw.toMillis() - a.timestampRaw.toMillis();
      });
      setTrades(tradeData);
    });

    // Fetch wallet balance and other user data
    const docRef = doc(db, "users", user.uid);
    const userUnsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("Firestore data received:", userData);

          // Set balance, pending status, and initial investments
          setBalance(userData.walletBalance ?? 0);
          setPending(userData.pendingStatus ?? null);
          setHasNewMessages(userData.hasNewMessage ?? false);
          setInitialInvestments(userData.initialInvestments ?? 0);

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
        console.error("Error listening to user data:", error);
      }
    );

    return () => {
      tradesUnsubscribe();
      userUnsubscribe();
    };
  }, [calculateTrend]);

  // Handle form submission to place a trade
  const handlePlaceTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", form);

    const user = auth.currentUser;
    if (!user) {
      toast({ title: "Error", description: "Please log in to place a trade." });
      console.log("No user logged in");
      return;
    }

    if (!form.asset || !form.amount || !form.leverage) {
      toast({
        title: "Error",
        description:
          "Please fill required fields: Asset, Amount, and Leverage.",
      });
      console.log("Missing required fields", {
        asset: form.asset,
        amount: form.amount,
        leverage: form.leverage,
      });
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be a positive number.",
      });
      console.log("Invalid amount", form.amount);
      return;
    }

    if (balance === null) {
      toast({
        title: "Error",
        description: "Wallet balance is still loading. Please try again.",
      });
      console.log("Balance not loaded");
      return;
    }
    if (amount > balance) {
      toast({
        title: "Error",
        description: `Insufficient funds. Available balance: $${balance.toFixed(
          2
        )}.`,
      });
      console.log("Insufficient balance", { amount, balance });
      return;
    }

    const leverage = parseInt(form.leverage);
    if (isNaN(leverage) || leverage <= 0) {
      toast({ title: "Error", description: "Invalid leverage value." });
      console.log("Invalid leverage", form.leverage);
      return;
    }

    let stopLoss: number | null = null;
    let takeProfit: number | null = null;

    if (form.stopLoss) {
      const sl = parseFloat(form.stopLoss);
      if (isNaN(sl) || sl <= 0) {
        toast({
          title: "Warning",
          description:
            "Invalid Stop Loss. Trade will proceed without Stop Loss.",
        });
        console.log("Invalid stopLoss", form.stopLoss);
      } else {
        stopLoss = sl;
      }
    }

    if (form.takeProfit) {
      const tp = parseFloat(form.takeProfit);
      if (isNaN(tp) || tp <= 0) {
        toast({
          title: "Warning",
          description:
            "Invalid Take Profit. Trade will proceed without Take Profit.",
        });
        console.log("Invalid takeProfit", form.takeProfit);
      } else {
        takeProfit = tp;
      }
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const tradesRef = collection(db, "users", user.uid, "trades");

      // Deduct trade amount from walletBalance
      await updateDoc(userRef, {
        walletBalance: balance - amount,
      });

      // Add trade to Firestore
      await addDoc(tradesRef, {
        asset: form.asset,
        type: form.type,
        amount,
        leverage,
        stopLoss,
        takeProfit,
        timestamp: serverTimestamp(),
      });

      toast({ title: "Success", description: "Trade placed successfully!" });
      console.log("Trade placed", {
        asset: form.asset,
        amount,
        leverage,
        stopLoss,
        takeProfit,
      });
      setForm({
        asset: "",
        type: "buy",
        amount: "",
        leverage: "1",
        stopLoss: null,
        takeProfit: null,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to place trade." });
      console.error("Firestore error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // List of tradable assets
  const assets = [
    "BTC/USD",
    "ETH/USD",
    "XRP/USD",
    "LTC/USD",
    "ADA/USD",
    "SOL/USD",
  ];

  // Leverage options
  const leverageOptions = ["1", "5", "10", "20", "50"];

  // Disable submit button if amount exceeds balance
  const isAmountValid = () => {
    if (!form.amount || balance === null) return false;
    const amount = parseFloat(form.amount);
    return !isNaN(amount) && amount > 0 && amount <= balance;
  };

  if (!auth.currentUser) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 font-montserrat">
              {/* Balance Card */}
              <Card className="@container/card font-montserrat transform transition-transform hover:scale-100 scale-95 bg-gradient-to-t from-blue-500/10 to-blue-100/10 dark:from-blue-700/10 dark:to-card border-2 border-blue-300 dark:border-blue-600 shadow-md hover:shadow-lg animate-in fade-in duration-500">
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
                    <div className="text-muted-foreground">
                      Pending Transaction...
                    </div>
                  ) : (
                    <div className="text-muted-foreground">on investments</div>
                  )}
                </CardFooter>
              </Card>

              {/* Trade Placement Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Place a Trade</CardTitle>
                  <CardDescription>
                    Enter trade details to open a new position.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handlePlaceTrade}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="asset">Asset</Label>
                        <Select
                          value={form.asset}
                          onValueChange={(value) =>
                            setForm({ ...form, asset: value })
                          }
                        >
                          <SelectTrigger id="asset">
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                          <SelectContent className="font-montserrat">
                            {assets.map((asset) => (
                              <SelectItem key={asset} value={asset}>
                                {asset}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Trade Type</Label>
                        <Select
                          value={form.type}
                          onValueChange={(value) =>
                            setForm({ ...form, type: value as "buy" | "sell" })
                          }
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="font-montserrat">
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="sell">Sell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount (USD)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={form.amount}
                          onChange={(e) =>
                            setForm({ ...form, amount: e.target.value })
                          }
                          placeholder={`Max: $${
                            balance !== null ? balance.toFixed(2) : "Loading"
                          }`}
                          min="0"
                          step="0.01"
                          required
                        />
                        {form.amount &&
                          parseFloat(form.amount) > (balance ?? Infinity) && (
                            <p className="text-red-500 text-xs mt-1">
                              Amount exceeds available balance ($
                              {balance?.toFixed(2) || "Loading"}).
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="leverage">Leverage</Label>
                        <Select
                          value={form.leverage}
                          onValueChange={(value) =>
                            setForm({ ...form, leverage: value })
                          }
                        >
                          <SelectTrigger id="leverage">
                            <SelectValue placeholder="Select leverage" />
                          </SelectTrigger>
                          <SelectContent>
                            {leverageOptions.map((leverage) => (
                              <SelectItem key={leverage} value={leverage}>
                                {leverage}x
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="stopLoss">Stop Loss (USD)</Label>
                        <Input
                          id="stopLoss"
                          type="number"
                          value={form.stopLoss ?? ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              stopLoss: e.target.value || null,
                            })
                          }
                          placeholder="Optional"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="takeProfit">Take Profit (USD)</Label>
                        <Input
                          id="takeProfit"
                          type="number"
                          value={form.takeProfit ?? ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              takeProfit: e.target.value || null,
                            })
                          }
                          placeholder="Optional"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !isAmountValid()}
                    >
                      {isSubmitting ? "Placing Trade..." : "Place Trade"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Trades List */}
              <Card>
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>
                    View all trades you have placed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trades.length === 0 ? (
                    <p>No trades placed yet.</p>
                  ) : (
                    <div className="grid gap-4 text-sm">
                      {trades.map((trade) => (
                        <Card key={trade.id}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {trade.asset}
                            </CardTitle>
                            <CardDescription>
                              {trade.type.toUpperCase()} - $
                              {trade.amount.toFixed(2)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>Leverage: {trade.leverage}x</p>
                            <p>
                              Stop Loss:{" "}
                              {trade.stopLoss
                                ? `$${trade.stopLoss.toFixed(2)}`
                                : "N/A"}
                            </p>
                            <p>
                              Take Profit:{" "}
                              {trade.takeProfit
                                ? `$${trade.takeProfit.toFixed(2)}`
                                : "N/A"}
                            </p>
                            <p>Placed: {trade.timestamp}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
