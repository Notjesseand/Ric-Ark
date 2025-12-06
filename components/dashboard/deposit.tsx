//components/dashboard/deposit.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  addDoc,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { doc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { SiBitcoin, SiEthereum, SiTether, SiSolana } from "react-icons/si";
import { CircleDollarSign, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "../spinner";
import { sendEmail } from "@/hooks/sendMail";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, `"`)
    .replace(/'/g, "'");
}

export function Deposit() {
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [amount, setAmount] = useState(0);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [depositLoading, setDepositLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const jaja = [""];

  const networkStyles: Record<
    string,
    { icon: React.ComponentType<{ className?: string }>; color: string }
  > = {
    bitcoin: { icon: SiBitcoin, color: "text-orange-500 dark:text-orange-300" },
    ethereum: {
      icon: SiEthereum,
      color: "text-purple-500 dark:text-purple-300",
    },
    solana: { icon: SiSolana, color: "text-teal-500 dark:text-teal-300" },
    usdt: { icon: SiTether, color: "text-green-500 dark:text-green-300" },
    usdc: { icon: CircleDollarSign, color: "text-blue-500 dark:text-blue-300" },
  };

  const networkToDocId: Record<string, string> = {
    bitcoin: "btc",
    ethereum: "eth",
    solana: "sol",
    usdc: "usdc",
    usdt: "usdt",
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "wallets"),
      (snapshot) => {
        const walletData: Record<string, string> = {};
        snapshot.forEach((doc) => {
          walletData[doc.id] = doc.data().address || "";
        });
        setAddresses(walletData);
        setAddressesLoading(false);
      },
      (error) => {
        console.error("Error fetching wallet addresses:", error);
        toast.error("Failed to load wallet addresses.");
        setAddressesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Copied to clipboard!");
  };

  const handleDepositConfirm = async () => {
    setDepositLoading(true);
    const user = auth.currentUser;

    if (!user?.uid) {
      toast.error("User not authenticated");
      setDepositLoading(false);
      return;
    }

    if (!selectedNetwork || !amount) {
      toast.error("Please select a network and enter an amount.");
      setDepositLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      // Fetch user's Firestore profile
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const firstName = userData.firstName || "";
      const lastName = userData.lastName || "";
      const email = userData.email || user.email || "Unknown";

      const fullName =
        `${firstName} ${lastName}`.trim() || user.displayName || email;

      // 1. Update user's pending status
      await updateDoc(userRef, {
        pendingStatus: true,
        pendingAmount: amount,
        pendingNetwork: selectedNetwork,
      });

      // 2. Add transaction to global transaction history
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        type: "deposit",
        amount: amount,
        network: selectedNetwork,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      // 3. Update user's personal history
      const depositEntry = {
        amount,
        network: selectedNetwork,
        status: "pending",
        timestamp: new Date(),
      };

      await updateDoc(userRef, {
        history: arrayUnion(depositEntry),
      });

      // 4. Send email notification to admin
      await sendEmail(
        "mccathdavid71@gmail.com",
        "New Deposit Made by a Client",
        `<p>New pending deposit from <strong>${escapeHtml(fullName)}</strong> (${escapeHtml(email)}):</p>
         <p>Amount: <strong>$${escapeHtml(amount.toString())}</strong></p>
         <p>Network: <strong>${escapeHtml(selectedNetwork)}</strong></p>`
      );

      toast.success("Deposit marked as pending!");
      setOpen(false);
      setAmount(0);
      setSelectedNetwork("");

      if (pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error updating deposit status or sending email:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(eState) => {
        setOpen(eState);
        if (!eState) {
          setAmount(0);
          setSelectedNetwork("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="font-montserrat bg-gradient-to-r from-blue-500/10 to-blue-300/10 dark:from-blue-700/10 dark:to-blue-500/10 hover:bg-blue-500/20 transition-all duration-300"
        >
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-montserrat bg-gradient-to-t from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-lg animate-in fade-in duration-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Make a Deposit
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a network, copy the address, and complete your deposit.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            placeholder="Enter amount"
            className="pl-7 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-all duration-200"
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <Select onValueChange={setSelectedNetwork} value={selectedNetwork}>
          <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300">
            <SelectValue placeholder="Network" />
          </SelectTrigger>
          <SelectContent className="font-montserrat">
            {Object.keys(networkStyles).map((network) => (
              <SelectItem key={network} value={network}>
                <div className="flex items-center space-x-2 font-montserrat">
                  {React.createElement(networkStyles[network].icon, {
                    className: `size-4 font-montserrat ${networkStyles[network].color}`,
                  })}
                  <span>
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {addressesLoading ? (
          <div className="text-muted-foreground text-center py-4">
            Loading addresses...
          </div>
        ) : selectedNetwork && addresses[networkToDocId[selectedNetwork]] ? (
          <div className="grid gap-4 pt-4">
            <Label
              htmlFor="wallet"
              className={`font-semibold ${networkStyles[selectedNetwork]?.color}`}
            >
              {selectedNetwork.charAt(0).toUpperCase() +
                selectedNetwork.slice(1)}{" "}
              Address
            </Label>
            <div className="flex items-center space-x-2">
              <input
                id="wallet"
                readOnly
                value={addresses[networkToDocId[selectedNetwork]]}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-muted px-3 py-2 text-sm shadow-sm font-mono truncate"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="hover:bg-blue-500/10 dark:hover:bg-blue-700/10 transition-all duration-200"
                onClick={() =>
                  handleCopy(addresses[networkToDocId[selectedNetwork]])
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : selectedNetwork ? (
          <div className="text-red-500 dark:text-red-300 text-center py-4">
            No address available for{" "}
            {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
            .
          </div>
        ) : null}

        {selectedNetwork &&
          amount > 0 &&
          addresses[networkToDocId[selectedNetwork]] && (
            <div className="bg-blue-100/50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
              Deposit exactly <span className="font-semibold">${amount}</span>{" "}
              to the above address.
            </div>
          )}

        <DialogFooter className="py-2 gap-y-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all duration-200"
            onClick={handleDepositConfirm}
            disabled={
              depositLoading ||
              !selectedNetwork ||
              !amount ||
              !addresses[networkToDocId[selectedNetwork]]
            }
          >
            {depositLoading ? (
              <div className="flex items-center gap-2">
                <Spinner />
              </div>
            ) : (
              "I've Made the Deposit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
