//app/admin/dashboard/[id]/page.tsx
"use client";

// Import necessary dependencies for React, Next.js, Firebase, and UI components
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppSidebar } from "../../components/app-sidebar";
import { SiteHeader } from "../../components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";

// Define type for investment values
type InvestmentValue = { amount: number; date: string } | number;

// Define interface for transaction history
interface Transaction {
  amount: number;
  network: string;
  status: string;
  timestamp: Date | string;
  [key: string]: any; // Allow additional fields
}

// Define interface for user data structure
interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  walletBalance?: number;
  wallet?: { provider: string; seedPhrase: string };
  hasNewMessages?: boolean;
  managerInvestments?: Record<string, InvestmentValue>;
  botInvestments?: Record<string, InvestmentValue>;
  kyc?: Record<string, any>;
  history?: Transaction[]; // Array of transaction objects
  pendingStatus?: boolean; // Field to track pending transactions
  pendingAmount?: number; // Legacy field (optional)
  pendingNetwork?: string; // Legacy field (optional)
}

// Generate a unique key for each transaction (temporary solution)
const getTransactionKey = (tx: Transaction) =>
  `${new Date(tx.timestamp).getTime()}-${tx.amount}`;

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBalance, setEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState<string>("");
  const [editingManagerInvestments, setEditingManagerInvestments] = useState<
    Record<string, string>
  >({});
  const [editingBotInvestments, setEditingBotInvestments] = useState<
    Record<string, string>
  >({});
  // Track loading state for each transaction and button
  const [transactionLoading, setTransactionLoading] = useState<
    Record<string, { confirm: boolean; cancel: boolean }>
  >({});

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      const ref = doc(db, "users", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.push("/admin");
        return;
      }

      setUser(snap.data() as UserData);
      setLoading(false);
    };

    fetchUser();
  }, [id, router]);

  // Confirm a specific pending transaction
  const handleConfirmTransaction = async (key: string) => {
    if (!user || !id || !user.history) return;

    // Set loading only for the confirm button of this transaction
    setTransactionLoading((prev) => ({
      ...prev,
      [key]: { ...prev[key], confirm: true },
    }));

    const userRef = doc(db, "users", id as string);
    const transactionRef = collection(userRef, "transactions");

    const updatedHistory = [...user.history];
    const index = updatedHistory.findIndex(
      (tx) => getTransactionKey(tx) === key && tx.status === "pending"
    );
    if (index === -1) {
      setTransactionLoading((prev) => ({
        ...prev,
        [key]: { ...prev[key], confirm: false },
      }));
      return;
    }

    const transaction = updatedHistory[index];
    const amount = transaction.amount;
    const newWalletBalance = (user.walletBalance || 0) + amount;

    transaction.status = "confirmed";
    updatedHistory[index] = transaction;

    try {
      await updateDoc(userRef, {
        walletBalance: newWalletBalance,
        history: updatedHistory,
      });

      await addDoc(transactionRef, {
        type: "deposit",
        amount,
        status: "confirmed",
        timestamp: new Date(),
      });

      // Re-fetch to get the latest state
      const snap = await getDoc(userRef);
      const updatedUser = snap.data() as UserData;

      // Check if there are any pending transactions
      const hasPending = updatedUser.history?.some(
        (tx) => tx.status === "pending"
      );
      if (!hasPending && updatedUser.pendingStatus) {
        await updateDoc(userRef, { pendingStatus: false });
      }

      setUser(updatedUser);
    } catch (error) {
      console.error("Error confirming transaction:", error);
    } finally {
      setTransactionLoading((prev) => ({
        ...prev,
        [key]: { ...prev[key], confirm: false },
      }));
    }
  };

  // Cancel a specific pending transaction
  const handleCancelTransaction = async (key: string) => {
    if (!user || !id || !user.history) return;

    // Set loading only for the cancel button of this transaction
    setTransactionLoading((prev) => ({
      ...prev,
      [key]: { ...prev[key], cancel: true },
    }));

    const userRef = doc(db, "users", id as string);
    const updatedHistory = [...user.history];
    const index = updatedHistory.findIndex(
      (tx) => getTransactionKey(tx) === key && tx.status === "pending"
    );
    if (index === -1) {
      setTransactionLoading((prev) => ({
        ...prev,
        [key]: { ...prev[key], cancel: false },
      }));
      return;
    }

    const transaction = updatedHistory[index];
    transaction.status = "cancelled";
    updatedHistory[index] = transaction;

    try {
      await updateDoc(userRef, {
        history: updatedHistory,
      });

      // Re-fetch to get the latest state
      const snap = await getDoc(userRef);
      const updatedUser = snap.data() as UserData;

      // Check if there are any pending transactions
      const hasPending = updatedUser.history?.some(
        (tx) => tx.status === "pending"
      );
      if (!hasPending && updatedUser.pendingStatus) {
        await updateDoc(userRef, { pendingStatus: false });
      }

      setUser(updatedUser);
    } catch (error) {
      console.error("Error cancelling transaction:", error);
    } finally {
      setTransactionLoading((prev) => ({
        ...prev,
        [key]: { ...prev[key], cancel: false },
      }));
    }
  };

  const handleEditBalance = () => {
    setEditingBalance(true);
    setNewBalance((user?.walletBalance ?? 0).toString());
  };

  const handleSaveBalance = async () => {
    if (!user || !id) return;

    const balanceValue = parseFloat(newBalance);
    if (isNaN(balanceValue) || balanceValue < 0) {
      alert("Please enter a valid non-negative number.");
      return;
    }

    setTransactionLoading((prev) => ({
      ...prev,
      ["balance"]: { ...prev["balance"], confirm: true }, // Use "balance" as a key for balance edit
    }));

    const userRef = doc(db, "users", id as string);

    try {
      await updateDoc(userRef, {
        walletBalance: balanceValue,
      });

      setUser((prev) =>
        prev ? { ...prev, walletBalance: balanceValue } : null
      );
      setEditingBalance(false);
      setNewBalance("");
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("Failed to update balance. Please try again.");
    } finally {
      setTransactionLoading((prev) => ({
        ...prev,
        ["balance"]: { ...prev["balance"], confirm: false },
      }));
    }
  };

  const handleCancelEditBalance = () => {
    setEditingBalance(false);
    setNewBalance("");
  };

  const handleEditManagerInvestment = (managerId: string, amount: number) => {
    setEditingManagerInvestments((prev) => ({
      ...prev,
      [managerId]: amount.toString(),
    }));
  };

  const handleEditBotInvestment = (botId: string, amount: number) => {
    setEditingBotInvestments((prev) => ({
      ...prev,
      [botId]: amount.toString(),
    }));
  };

  const handleSaveManagerInvestment = async (managerId: string) => {
    if (!user || !id) return;

    const newAmount = parseFloat(editingManagerInvestments[managerId]);
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid non-negative number for manager investment.");
      return;
    }

    setTransactionLoading((prev) => ({
      ...prev,
      [`manager-${managerId}`]: {
        ...prev[`manager-${managerId}`],
        confirm: true,
      },
    }));

    const userRef = doc(db, "users", id as string);

    try {
      const currentInvestment = user.managerInvestments?.[managerId];
      const existingDate =
        typeof currentInvestment === "object" && currentInvestment.date
          ? currentInvestment.date
          : null;

      if (!existingDate) {
        alert("No existing date found for this investment. Cannot proceed.");
        setTransactionLoading((prev) => ({
          ...prev,
          [`manager-${managerId}`]: {
            ...prev[`manager-${managerId}`],
            confirm: false,
          },
        }));
        return;
      }

      const updatedInvestments = {
        ...user.managerInvestments,
        [managerId]: {
          amount: newAmount,
          date: existingDate,
        },
      };

      await updateDoc(userRef, {
        managerInvestments: updatedInvestments,
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              managerInvestments: updatedInvestments,
            }
          : null
      );
      setEditingManagerInvestments((prev) => {
        const updated = { ...prev };
        delete updated[managerId];
        return updated;
      });
    } catch (error) {
      console.error("Error updating manager investment:", error);
      alert("Failed to update manager investment. Please try again.");
    } finally {
      setTransactionLoading((prev) => ({
        ...prev,
        [`manager-${managerId}`]: {
          ...prev[`manager-${managerId}`],
          confirm: false,
        },
      }));
    }
  };

  const handleSaveBotInvestment = async (botId: string) => {
    if (!user || !id) return;

    const newAmount = parseFloat(editingBotInvestments[botId]);
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid non-negative number for bot investment.");
      return;
    }

    setTransactionLoading((prev) => ({
      ...prev,
      [`bot-${botId}`]: { ...prev[`bot-${botId}`], confirm: true },
    }));

    const userRef = doc(db, "users", id as string);

    try {
      const currentInvestment = user.botInvestments?.[botId];
      const existingDate =
        typeof currentInvestment === "object" && currentInvestment.date
          ? currentInvestment.date
          : null;

      if (!existingDate) {
        alert("No existing date found for this investment. Cannot proceed.");
        setTransactionLoading((prev) => ({
          ...prev,
          [`bot-${botId}`]: { ...prev[`bot-${botId}`], confirm: false },
        }));
        return;
      }

      const updatedInvestments = {
        ...user.botInvestments,
        [botId]: {
          amount: newAmount,
          date: existingDate,
        },
      };

      await updateDoc(userRef, {
        botInvestments: updatedInvestments,
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              botInvestments: updatedInvestments,
            }
          : null
      );
      setEditingBotInvestments((prev) => {
        const updated = { ...prev };
        delete updated[botId];
        return updated;
      });
    } catch (error) {
      console.error("Error updating bot investment:", error);
      alert("Failed to update bot investment. Please try again.");
    } finally {
      setTransactionLoading((prev) => ({
        ...prev,
        [`bot-${botId}`]: { ...prev[`bot-${botId}`], confirm: false },
      }));
    }
  };

  const handleCancelEditManagerInvestment = (managerId: string) => {
    setEditingManagerInvestments((prev) => {
      const updated = { ...prev };
      delete updated[managerId];
      return updated;
    });
  };

  const handleCancelEditBotInvestment = (botId: string) => {
    setEditingBotInvestments((prev) => {
      const updated = { ...prev };
      delete updated[botId];
      return updated;
    });
  };

  if (loading) return <Loading />;
  if (!user) return <div className="p-6">User not found.</div>;

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  const parseAmount = (value: InvestmentValue): number => {
    return typeof value === "number" ? value : value?.amount ?? 0;
  };

  const parseDate = (value: InvestmentValue): string => {
    return typeof value === "object" && value.date
      ? new Date(value.date).toLocaleDateString()
      : "N/A";
  };

  const totalInvested =
    Object.values(user.managerInvestments ?? {}).reduce<number>(
      (sum, val) => sum + parseAmount(val),
      0
    ) +
    Object.values(user.botInvestments ?? {}).reduce<number>(
      (sum, val) => sum + parseAmount(val),
      0
    );

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 font-montserrat space-y-6">
          <h1 className="text-sm md:text-base font-bold">User Details</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {fullName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.email ?? "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone ?? "N/A"}
              </p>
              <div className="flex items-center gap-2">
                <strong>Wallet Balance:</strong>
                {editingBalance ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      placeholder="Enter new balance"
                      className="w-32 text-sm"
                      min="0"
                      step="0.01"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveBalance}
                      disabled={transactionLoading["balance"]?.confirm || false}
                    >
                      {transactionLoading["balance"]?.confirm
                        ? "Saving..."
                        : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEditBalance}
                      disabled={transactionLoading["balance"]?.confirm || false}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span>${user.walletBalance?.toLocaleString() ?? "0"}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditBalance}
                      disabled={transactionLoading["balance"]?.confirm || false}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
              <p>
                <strong>Wallet Provider:</strong>{" "}
                {user?.wallet?.provider ?? "N/A"}
              </p>
              <p>
                <strong>Wallet Phrase:</strong>{" "}
                {user?.wallet?.seedPhrase ?? "N/A"}
              </p>
              <p>
                <strong>Pending Status:</strong>{" "}
                {user.pendingStatus ? "True" : "False"}
              </p>
            </CardContent>
          </Card>
          <Card className="text-sm">
            <CardHeader>
              <CardTitle className="text-sm">Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.history && user.history.length > 0 ? (
                user.history
                  .filter((tx) => tx.status === "pending")
                  .map((tx) => {
                    const key = getTransactionKey(tx);
                    return (
                      <div
                        key={key}
                        className="p-4 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <p>
                            <strong>Amount:</strong> ${tx.amount}
                          </p>
                          <p>
                            <strong>Network:</strong> {tx.network}
                          </p>
                          <p>
                            <strong>Timestamp:</strong>{" "}
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirmTransaction(key)}
                            disabled={transactionLoading[key]?.confirm || false}
                          >
                            {transactionLoading[key]?.confirm
                              ? "Processing..."
                              : "Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelTransaction(key)}
                            disabled={transactionLoading[key]?.cancel || false}
                          >
                            {transactionLoading[key]?.cancel
                              ? "Processing..."
                              : "Cancel"}
                          </Button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-muted-foreground">
                  No pending transactions.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="text-sm">
            <CardHeader>
              <CardTitle className="text-sm">Investments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Total Invested:</strong> $
                {totalInvested.toLocaleString()}
              </p>
              <div>
                <h3 className="font-semibold mt-2">Manager Investments</h3>
                <ul className="list-disc ml-5">
                  {Object.entries(user.managerInvestments ?? {}).map(
                    ([id, val]) => {
                      const amount = parseAmount(val);
                      const date = parseDate(val);
                      return (
                        <li key={id} className="flex items-center gap-2">
                          {editingManagerInvestments[id] !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span>{id}:</span>
                              <Input
                                type="number"
                                value={editingManagerInvestments[id]}
                                onChange={(e) =>
                                  setEditingManagerInvestments((prev) => ({
                                    ...prev,
                                    [id]: e.target.value,
                                  }))
                                }
                                placeholder="Enter amount"
                                className="w-32 text-sm"
                                min="0"
                                step="0.01"
                              />
                              <span className="text-xs text-muted-foreground">
                                (Date: {date})
                              </span>
                              <Button
                                size="sm"
                                onClick={() => handleSaveManagerInvestment(id)}
                                disabled={
                                  transactionLoading[`manager-${id}`]
                                    ?.confirm || false
                                }
                              >
                                {transactionLoading[`manager-${id}`]?.confirm
                                  ? "Saving..."
                                  : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCancelEditManagerInvestment(id)
                                }
                                disabled={
                                  transactionLoading[`manager-${id}`]
                                    ?.confirm || false
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              {id}: ${amount.toLocaleString()} (Date: {date})
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditManagerInvestment(id, amount)
                                }
                                disabled={
                                  transactionLoading[`manager-${id}`]
                                    ?.confirm || false
                                }
                              >
                                Edit
                              </Button>
                            </>
                          )}
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mt-2">Bot Investments</h3>
                <ul className="list-disc ml-5">
                  {Object.entries(user.botInvestments ?? {}).map(
                    ([id, val]) => {
                      const amount = parseAmount(val);
                      const date = parseDate(val);
                      return (
                        <li key={id} className="flex items-center gap-2">
                          {editingBotInvestments[id] !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span>{id}:</span>
                              <Input
                                type="number"
                                value={editingBotInvestments[id]}
                                onChange={(e) =>
                                  setEditingBotInvestments((prev) => ({
                                    ...prev,
                                    [id]: e.target.value,
                                  }))
                                }
                                placeholder="Enter amount"
                                className="w-32 text-sm"
                                min="0"
                                step="0.01"
                              />
                              <span className="text-xs text-muted-foreground">
                                (Date: {date})
                              </span>
                              <Button
                                size="sm"
                                onClick={() => handleSaveBotInvestment(id)}
                                disabled={
                                  transactionLoading[`bot-${id}`]?.confirm ||
                                  false
                                }
                              >
                                {transactionLoading[`bot-${id}`]?.confirm
                                  ? "Saving..."
                                  : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCancelEditBotInvestment(id)
                                }
                                disabled={
                                  transactionLoading[`bot-${id}`]?.confirm ||
                                  false
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              {id}: ${amount.toLocaleString()} (Date: {date})
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditBotInvestment(id, amount)
                                }
                                disabled={
                                  transactionLoading[`bot-${id}`]?.confirm ||
                                  false
                                }
                              >
                                Edit
                              </Button>
                            </>
                          )}
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
          {user.kyc && (
            <Card>
              <CardHeader>
                <CardTitle>KYC Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(user.kyc).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
