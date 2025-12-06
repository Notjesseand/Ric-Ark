// // "use client";

// // import { useEffect, useState } from "react";
// // import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
// // import { db } from "@/lib/firebase";
// // import { useRouter } from "next/navigation";
// // import { getAuth, onAuthStateChanged } from "firebase/auth";

// // import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";
// // import { AppSidebar } from "../components/app-sidebar";
// // import { SiteHeader } from "../components/site-header";
// // import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// // import { FaSpinner } from "react-icons/fa6";

// // type Wallet = {
// //   id: string;
// //   name: string;
// //   address: string;
// // };

// // function useAdminCheck() {
// //   const [status, setStatus] = useState<
// //     "loading" | "unauthorized" | "authorized"
// //   >("loading");

// //   useEffect(() => {
// //     const auth = getAuth();
// //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
// //       if (!user) return setStatus("unauthorized");

// //       const userDoc = await getDoc(doc(db, "users", user.uid));
// //       if (userDoc.exists() && userDoc.data().role === "admin") {
// //         setStatus("authorized");
// //       } else {
// //         setStatus("unauthorized");
// //       }
// //     });

// //     return () => unsubscribe();
// //   }, []);

// //   return status;
// // }

// // export default function AdminWalletsPage() {
// //   const [wallets, setWallets] = useState<Wallet[]>([
// //     { id: "btc", name: "Bitcoin (BTC)", address: "" },
// //     { id: "eth", name: "Ethereum (ETH)", address: "" },
// //     { id: "sol", name: "Solana (SOL)", address: "" },
// //     { id: "usdt", name: "Tether (USDT)", address: "" },
// //     { id: "usdc", name: "USD Coin (USDC)", address: "" },
// //   ]);
// //   const [walletUpdates, setWalletUpdates] = useState<Record<string, string>>(
// //     {}
// //   );
// //   const [loading, setLoading] = useState(true);
// //   const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
// //     {}
// //   );
// //   const router = useRouter();
// //   const adminStatus = useAdminCheck();

// //   useEffect(() => {
// //     const fetchWallets = async () => {
// //       try {
// //         const walletsSnap = await getDocs(collection(db, "wallets"));
// //         const walletData: Record<string, string> = {};
// //         walletsSnap.docs.forEach((doc) => {
// //           walletData[doc.id] = doc.data().address || "";
// //         });

// //         setWallets((prev) =>
// //           prev.map((wallet) => ({
// //             ...wallet,
// //             address: walletData[wallet.id] || "",
// //           }))
// //         );
// //         setWalletUpdates(walletData);
// //       } catch (error) {
// //         console.error("Error fetching wallets:", error);
// //         alert("Failed to load wallet addresses.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     if (adminStatus === "authorized") fetchWallets();
// //     else if (adminStatus === "unauthorized") router.replace("/");
// //   }, [adminStatus]);

// //   const handleInputChange = (id: string, value: string) => {
// //     setWalletUpdates((prev) => ({ ...prev, [id]: value }));
// //   };

// //   const saveWalletAddress = async (wallet: Wallet) => {
// //     const address = walletUpdates[wallet.id]?.trim();
// //     if (!address) return alert("Wallet address cannot be empty.");

// //     setLoadingStates((prev) => ({ ...prev, [wallet.id]: true }));

// //     try {
// //       await setDoc(doc(db, "wallets", wallet.id), {
// //         name: wallet.name,
// //         address,
// //         updatedAt: new Date().toISOString(),
// //       });

// //       setWallets((prev) =>
// //         prev.map((w) => (w.id === wallet.id ? { ...w, address } : w))
// //       );
// //       alert(`Updated wallet address for ${wallet.name}`);
// //     } catch (error) {
// //       console.error("Error saving wallet address:", error);
// //       alert("Failed to save wallet address. Please try again.");
// //     } finally {
// //       setLoadingStates((prev) => ({ ...prev, [wallet.id]: false }));
// //     }
// //   };

// //   if (adminStatus === "loading" || loading) {
// //     return <div className="p-6 font-montserrat">Loading...</div>;
// //   }

// //   return (
// //     <SidebarProvider>
// //       <AppSidebar variant="inset" />
// //       <SidebarInset>
// //         <SiteHeader />
// //         <div className="p-6 font-montserrat space-y-6">
// //           <h1 className="text-2xl font-bold">Wallet Addresses</h1>
// //           <p className="text-sm text-muted-foreground">
// //             Enter or edit wallet addresses for each cryptocurrency. These
// //             addresses will be used for transactions.
// //           </p>

// //           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
// //             {wallets.map((wallet) => (
// //               <Card key={wallet.id}>
// //                 <CardHeader>
// //                   <CardTitle>{wallet.name}</CardTitle>
// //                   <p className="text-xs text-muted-foreground capitalize">
// //                     {wallet.id}
// //                   </p>
// //                 </CardHeader>
// //                 <CardContent className="space-y-4">
// //                   <Input
// //                     type="text"
// //                     placeholder={`Enter ${wallet.name} address`}
// //                     value={walletUpdates[wallet.id] || ""}
// //                     onChange={(e) =>
// //                       handleInputChange(wallet.id, e.target.value)
// //                     }
// //                   />
// //                   <Button
// //                     onClick={() => saveWalletAddress(wallet)}
// //                     disabled={
// //                       !walletUpdates[wallet.id] || loadingStates[wallet.id]
// //                     }
// //                   >
// //                     {loadingStates[wallet.id] ? (
// //                       <FaSpinner className="animate-spin" />
// //                     ) : (
// //                       "Save Address"
// //                     )}
// //                   </Button>
// //                 </CardContent>
// //               </Card>
// //             ))}
// //           </div>
// //         </div>
// //       </SidebarInset>
// //     </SidebarProvider>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { useRouter } from "next/navigation";
// import { getAuth, onAuthStateChanged } from "firebase/auth";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { AppSidebar } from "../components/app-sidebar";
// import { SiteHeader } from "../components/site-header";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { FaSpinner } from "react-icons/fa6";

// const initialWallets = {
//   BTC: "",
//   ETH: "",
//   SOL: "",
//   USDT: "",
//   USDC: "",
// };

// function useAdminCheck() {
//   const [status, setStatus] = useState<
//     "loading" | "unauthorized" | "authorized"
//   >("loading");

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) return setStatus("unauthorized");

//       const userDoc = await getDoc(doc(db, "users", user.uid));
//       if (userDoc.exists() && userDoc.data().role === "admin") {
//         setStatus("authorized");
//       } else {
//         setStatus("unauthorized");
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   return status;
// }

// export default function AdminWalletsPage() {
//   const [wallets, setWallets] = useState(initialWallets);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const router = useRouter();
//   const adminStatus = useAdminCheck();

//   useEffect(() => {
//     const fetchWallets = async () => {
//       const walletDoc = await getDoc(doc(db, "siteData", "wallets"));
//       if (walletDoc.exists()) {
//         setWallets({ ...initialWallets, ...walletDoc.data() });
//       }
//       setLoading(false);
//     };

//     if (adminStatus === "authorized") fetchWallets();
//     else if (adminStatus === "unauthorized") router.replace("/");
//   }, [adminStatus]);

//   const handleChange = (key: keyof typeof wallets, value: string) => {
//     setWallets((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       await setDoc(doc(db, "siteData", "wallets"), wallets);
//       alert("Wallet addresses updated successfully.");
//     } catch (error) {
//       console.error("Error updating wallets:", error);
//       alert("Failed to update wallet addresses.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (adminStatus === "loading" || loading) {
//     return <div className="p-6 font-montserrat">Loading...</div>;
//   }

//   return (
//     <SidebarProvider>
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="p-6 font-montserrat space-y-6">
//           <h1 className="text-2xl font-bold">Wallet Addresses</h1>
//           <p className="text-sm text-muted-foreground">
//             Manage wallet addresses shown to users.
//           </p>

//           <Card>
//             <CardHeader>
//               <CardTitle>Edit Wallets</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Object.entries(wallets).map(([key, value]) => (
//                 <div key={key} className="space-y-1">
//                   <label className="block text-sm font-medium">{key}</label>
//                   <Input
//                     type="text"
//                     value={value}
//                     onChange={(e) =>
//                       handleChange(key as keyof typeof wallets, e.target.value)
//                     }
//                     placeholder={`Enter ${key} wallet address`}
//                   />
//                 </div>
//               ))}
//               <Button onClick={handleSave} disabled={saving}>
//                 {saving ? (
//                   <FaSpinner className="animate-spin" />
//                 ) : (
//                   "Save Wallets"
//                 )}
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FaSpinner } from "react-icons/fa6";

type Wallet = {
  id: string;
  name: string;
  address: string;
};

function useAdminCheck() {
  const [status, setStatus] = useState<
    "loading" | "unauthorized" | "authorized"
  >("loading");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return setStatus("unauthorized");

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setStatus("authorized");
      } else {
        setStatus("unauthorized");
      }
    });

    return () => unsubscribe();
  }, []);

  return status;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: "btc", name: "Bitcoin (BTC)", address: "" },
    { id: "eth", name: "Ethereum (ETH)", address: "" },
    { id: "sol", name: "Solana (SOL)", address: "" },
    { id: "usdt", name: "Tether (USDT)", address: "" },
    { id: "usdc", name: "USD Coin (USDC)", address: "" },
  ]);
  const [walletUpdates, setWalletUpdates] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const router = useRouter();
  const adminStatus = useAdminCheck();

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const walletsSnap = await getDocs(collection(db, "wallets"));
        const walletData: Record<string, string> = {};
        walletsSnap.docs.forEach((doc) => {
          walletData[doc.id] = doc.data().address || "";
        });

        setWallets((prev) =>
          prev.map((wallet) => ({
            ...wallet,
            address: walletData[wallet.id] || "",
          }))
        );
        setWalletUpdates(walletData);
      } catch (error) {
        console.error("Error fetching wallets:", error);
        alert("Failed to load wallet addresses.");
      } finally {
        setLoading(false);
      }
    };

    if (adminStatus === "authorized") fetchWallets();
    else if (adminStatus === "unauthorized") router.replace("/");
  }, [adminStatus]);

  const handleInputChange = (id: string, value: string) => {
    setWalletUpdates((prev) => ({ ...prev, [id]: value }));
  };

  const saveWalletAddress = async (wallet: Wallet) => {
    const address = walletUpdates[wallet.id]?.trim();
    if (!address) return alert("Wallet address cannot be empty.");

    setLoadingStates((prev) => ({ ...prev, [wallet.id]: true }));

    try {
      await setDoc(doc(db, "wallets", wallet.id), {
        name: wallet.name,
        address,
        updatedAt: new Date().toISOString(),
      });

      setWallets((prev) =>
        prev.map((w) => (w.id === wallet.id ? { ...w, address } : w))
      );
      alert(`Updated wallet address for ${wallet.name}`);
    } catch (error) {
      console.error("Error saving wallet address:", error);
      alert("Failed to save wallet address. Please try again.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [wallet.id]: false }));
    }
  };

  if (adminStatus === "loading" || loading) {
    return <div className="p-6 font-montserrat">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 font-montserrat space-y-6">
          <h1 className="text-2xl font-bold">Wallet Addresses</h1>
          <p className="text-sm text-muted-foreground">
            Enter or edit wallet addresses for each cryptocurrency. These
            addresses will be used for transactions.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardHeader>
                  <CardTitle>{wallet.name}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {wallet.id}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="text"
                    placeholder={`Enter ${wallet.name} address`}
                    value={walletUpdates[wallet.id] || ""}
                    onChange={(e) =>
                      handleInputChange(wallet.id, e.target.value)
                    }
                  />
                  <Button
                    onClick={() => saveWalletAddress(wallet)}
                    disabled={
                      !walletUpdates[wallet.id] || loadingStates[wallet.id]
                    }
                  >
                    {loadingStates[wallet.id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Save Address"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
