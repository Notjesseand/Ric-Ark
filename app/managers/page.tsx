// "use client";
// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import Link from "next/link";
// import { AppSidebar } from "@/components/app-sidebar";
// import { SiteHeader } from "@/components/site-header";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import Loading from "@/components/loading";

// type Manager = {
//   id: string;
//   name: string;
//   trades: number;
//   winRate: number;
//   roi: number;
//   investors: number;
//   img?: string;
//   min: number;
// };

// export default function ManagersPage() {
//   const [managers, setManagers] = useState<Manager[] | null>(null);

//   useEffect(() => {
//     const fetchManagers = async () => {
//       const snapshot = await getDocs(collection(db, "managers"));
//       const data: Manager[] = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as Manager[];
//       setManagers(data);
//     };
//     fetchManagers();
//   }, []);

//   if (!managers) return <Loading />;

//   return (
//     <SidebarProvider>
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="flex flex-1 flex-col items-center font-montserrat">
//           <h1 className="text-2xl font-semibold mt-8 text-foreground">
//             Portfolio Managers
//           </h1>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 p-6 w-full max-w-7xl">
//             {managers.map((manager, idx) => (
//               <Card
//                 key={manager.id}
//                 className="flex flex-col justify-between font-montserrat"
//               >
//                 <div>
//                   <CardHeader>
//                     <CardTitle className="text-lg font-bold text-foreground">
//                       #{idx + 1} {manager.name}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="grid grid-cols-2 gap-2 text-sm font-medium text-foreground">
//                     <div className="space-y-2">
//                       <p>Trades: {manager.trades.toLocaleString()}</p>
//                       <p>Win Rate: {manager.winRate}%</p>
//                       <p>ROI/Trade: {manager.roi}%</p>
//                       <p>Investors: {manager.investors.toLocaleString()}</p>
//                       <p>Capital back in 30 days</p>
//                       <p>Min amount: ${manager.min}</p>
//                     </div>
//                     <img
//                       src={manager.img}
//                       alt={manager.name}
//                       className="h-36 aspect-square rounded-full object-cover"
//                     />
//                   </CardContent>
//                 </div>
//                 <div className="flex justify-center pt-2 pb-4">
//                   <Link
//                     href={`/managers/${manager.id}`}
//                     className="py-2 px-5 border-2 border-foreground text-foreground rounded-lg hover:bg-foreground hover:text-background transition-all duration-300"
//                   >
//                     Invest Now
//                   </Link>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";

type Manager = {
  id: string;
  name: string;
  trades: number;
  winRate: number;
  roi: number;
  investors: number;
  img?: string;
  min: number;
  moneyBack: number; // Added moneyBack field
};

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[] | null>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      const snapshot = await getDocs(collection(db, "managers"));
      const data: Manager[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        moneyBack: doc.data()["money-back"], // Map money-back to moneyBack
      })) as Manager[];
      setManagers(data);
    };
    fetchManagers();
  }, []);

  if (!managers) return <Loading />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center font-montserrat">
          <h1 className="text-2xl font-semibold mt-8 text-foreground">
            Portfolio Managers
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 p-6 w-full max-w-7xl">
            {managers.map((manager, idx) => (
              <Card
                key={manager.id}
                className="flex flex-col justify-between font-montserrat"
              >
                <div>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground">
                      #{idx + 1} {manager.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2 text-sm font-medium text-foreground">
                    <div className="space-y-2">
                      <p>Trades: {manager.trades.toLocaleString()}</p>
                      <p>Win Rate: {manager.winRate}%</p>
                      <p>ROI/Trade: {manager.roi}%</p>
                      <p>Investors: {manager.investors.toLocaleString()}</p>
                      <p>Capital back in {manager.moneyBack || "N/A"} days</p>
                      <p>Min amount: ${manager.min}</p>
                    </div>
                    <img
                      src={manager.img}
                      alt={manager.name}
                      className="h-36 aspect-square rounded-full object-cover"
                    />
                  </CardContent>
                </div>
                <div className="flex justify-center pt-2 pb-4">
                  <Link
                    href={`/managers/${manager.id}`}
                    className="py-2 px-5 border-2 border-foreground text-foreground rounded-lg hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    Invest Now
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
