"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // Update if path differs
import Link from "next/link";
import Image from "next/image";

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

export default function WalletButton() {
  const [walletProvider, setWalletProvider] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const provider = data.wallet?.provider;
        if (provider) {
          setWalletProvider(provider);
        }
      }
    };

    fetchWallet();
  }, []);

  const walletIcon = popularWallets.find(
    (w) => w.name === walletProvider
  )?.icon;

  return walletProvider ? (
    <div className="flex items-center space-x-2 bg-black text-white  py-2 w-full justify-center rounded">
      {walletIcon && (
        <Image
          src={walletIcon}
          alt={walletProvider}
          width={22}
          height={22}
          className="rounded"
        />
      )}
      <span className="font-montserrat text-sm sm:text-xs">Connected</span>
    </div>
  ) : (
    <Link
      href="/connect-wallet"
      className="font-montserrat text-sm sm:text-xs bg-black text-white text-center w-full px-4 py-2 rounded"
    >
      Connect wallet
    </Link>
  );
}
