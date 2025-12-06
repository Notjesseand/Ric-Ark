//components/managers/drawer.tsx
"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { doc, getDoc, updateDoc, setDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ConfirmTransactionProps = {
  manager: {
    id: string;
    min: number;
    roi: number;
    [key: string]: any;
  };
};

interface UserData {
  availableBalance: number;
  investedAmount?: number;
  initialInvestments?: number;
  managerInvestments?: Record<
    string,
    {
      amount: number;
      date: string;
    }
  >;
  referralBonuses?: number; // New field to track total referral bonuses
}

const ConfirmTransaction: React.FC<ConfirmTransactionProps> = ({ manager }) => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              availableBalance: data.walletBalance ?? 0,
              investedAmount: data.investedAmount ?? 0,
              initialInvestments: data.initialInvestments ?? 0,
              referralBonuses: data.referralBonuses ?? 0, // Initialize referralBonuses
            });
            setUserId(user.uid);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const min = manager?.min;
  const [amount, setAmount] = React.useState(min);

  function onClick(adjustment: number) {
    setAmount((prev) => Math.max(min, prev + adjustment));
  }

  const totalROI = ((manager?.roi / 100) * amount).toFixed(2);

  const handleConfirm = async () => {
    if (!userId || !userData) return;
    setLoading(true);

    try {
      const userRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userRef);
      const data = userDocSnap.data();

      const currentBalance = data?.walletBalance ?? 0;
      const currentInvestments: Record<
        string,
        { amount: number; date: string }
      > = data?.managerInvestments ?? {};
      const existingManagers: string[] = data?.patronizedManagers ?? [];
      const currentInitialInvestments = data?.initialInvestments ?? 0;
      const referredBy = data?.referredBy;

      // Validate balance
      if (currentBalance < amount) {
        console.error("Insufficient balance", { currentBalance, amount });
        setLoading(false);
        return;
      }

      const newBalance = currentBalance - amount;
      const updatedManagers = existingManagers.includes(manager.id)
        ? existingManagers
        : [...existingManagers, manager.id];

      const prev = currentInvestments[manager.id] ?? {
        amount: 0,
        date: new Date().toISOString(),
      };

      const updatedInvestments = {
        ...currentInvestments,
        [manager.id]: {
          amount: prev.amount + amount,
          date: prev.amount === 0 ? new Date().toISOString() : prev.date,
        },
      };

      const newInitialInvestments = currentInitialInvestments + amount;
      console.log("Updating initialInvestments:", {
        current: currentInitialInvestments,
        newAmount: amount,
        total: newInitialInvestments,
      });

      // Check if this is the first investment with this manager
      const isFirstInvestment = !currentInvestments[manager.id];

      // Update user's document
      await updateDoc(userRef, {
        walletBalance: newBalance,
        managerInvestments: updatedInvestments,
        patronizedManagers: updatedManagers,
        initialInvestments: newInitialInvestments,
      });

      // Credit referrer with 10% of investment amount (only for first investment)
      if (referredBy && isFirstInvestment) {
        const referrerRef = doc(db, "users", referredBy);
        const referrerDocSnap = await getDoc(referrerRef);
        if (referrerDocSnap.exists()) {
          const referrerData = referrerDocSnap.data();
          const referrerBalance = referrerData?.walletBalance ?? 0;
          const currentReferralBonuses = referrerData?.referralBonuses ?? 0;
          const referralBonus = amount * 0.1; // 10% of investment

          // Update referrer's walletBalance and referralBonuses
          await updateDoc(referrerRef, {
            walletBalance: referrerBalance + referralBonus,
            referralBonuses: currentReferralBonuses + referralBonus,
          });

          // Log referral bonus as a transaction
          const transactionRef = doc(
            collection(db, `users/${referredBy}/transactions`)
          );
          await setDoc(transactionRef, {
            type: "referral_bonus",
            amount: referralBonus,
            referrerId: referredBy,
            referredUserId: userId,
            managerId: manager.id,
            timestamp: new Date().toISOString(),
          });

          console.log("Credited referrer:", {
            referrerId: referredBy,
            bonus: referralBonus,
            newBalance: referrerBalance + referralBonus,
            newReferralBonuses: currentReferralBonuses + referralBonus,
            transactionId: transactionRef.id,
          });
        }
      }

      // Update local state
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              availableBalance: newBalance,
              initialInvestments: newInitialInvestments,
            }
          : null
      );

      router.push("/portfolio");
      document.getElementById("drawer-close-btn")?.click();
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="py-2 px-5 border-2 border-black hover:text-white rounded-lg text-black bg-white transition-all duration-500 hover:bg-black">
          Invest Now
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm font-montserrat">
          <DrawerHeader>
            <DrawerTitle>Enter Amount</DrawerTitle>
            <DrawerDescription>
              Adjust investment to see projected ROI.
            </DrawerDescription>
            <p className="text-sm">
              Available Balance:{" "}
              <span className="font-semibold">
                ${userData?.availableBalance ?? "Loading..."}
              </span>
            </p>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(-100)}
                disabled={amount <= min}
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-5xl font-bold tracking-tighter">
                  ${amount}
                </div>
                <div className="text-muted-foreground text-xs uppercase">
                  Investment Amount
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(100)}
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>

            <div className="mt-4 text-center text-white">
              <p className="text-sm">Estimated ROI:</p>
              <p className="text-2xl font-semibold text-green-400">
                ${totalROI}
              </p>
              <p className="text-xs text-muted-foreground">
                ({manager?.roi}% per trade)
              </p>
            </div>
            {userData && userData.availableBalance < amount && (
              <p className="text-red-500 text-sm text-center mt-2">
                Insufficient balance to confirm this transaction.
              </p>
            )}
          </div>

          <DrawerFooter>
            <Button
              disabled={loading || (userData?.availableBalance ?? 0) < amount}
              onClick={handleConfirm}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Confirm"
              )}
            </Button>

            <DrawerClose asChild>
              <Button variant="outline" id="drawer-close-btn">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ConfirmTransaction;
