// //app/investments/page.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
// import { db, auth } from "@/lib/firebase";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { AppSidebar } from "@/components/app-sidebar";
// import { SectionCards } from "./sectioncard";
// import { SiteHeader } from "@/components/site-header";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import Loading from "@/components/loading";

// type Manager = {
//   id: string;
//   name: string;
//   roi: number;
//   img?: string;
// };

// export default function InvestmentsPage() {
//   const [managerInvestments, setManagerInvestments] = useState<Record<
//     string,
//     number
//   > | null>(null);
//   const [managersData, setManagersData] = useState<Record<string, Manager>>({});

//   // Fetch manager investment data for user
//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return;
//     const ref = doc(db, "users", user.uid);
//     return onSnapshot(ref, (docSnap) => {
//       const data = docSnap.data();
//       setManagerInvestments(data?.managerInvestments ?? {});
//     });
//   }, []);

//   // Fetch all managers data from Firestore
//   useEffect(() => {
//     const fetchManagers = async () => {
//       const snapshot = await getDocs(collection(db, "managers"));
//       const data: Record<string, Manager> = {};
//       snapshot.forEach((doc) => {
//         data[doc.id] = { id: doc.id, ...doc.data() } as Manager;
//       });
//       setManagersData(data);
//     };
//     fetchManagers();
//   }, []);

//   if (!managerInvestments) {
//     return <Loading />;
//   }

//   return (
//     <SidebarProvider>
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="flex flex-1 flex-col">
//           <div className="@container/main flex flex-1 flex-col gap-2">
//             <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//               <SectionCards />
//               <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
//                 {Object.entries(managerInvestments).map(
//                   ([managerId, amount]) => {
//                     const manager = managersData[managerId];
//                     return (
//                       <Card key={managerId}>
//                         <CardHeader>
//                           <CardTitle>
//                             {manager ? manager.name : `Manager ${managerId}`}
//                           </CardTitle>
//                           <CardDescription>
//                             Invested: ${amount.toFixed(2)}
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                           ROI Estimate:{" "}
//                           {manager ? `+${manager.roi.toFixed(2)}%` : "N/A"}
//                         </CardContent>
//                       </Card>
//                     );
//                   }
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "./sectioncard";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";

type Manager = {
  id: string;
  name: string;
  roi: number;
  img?: string;
};

type Investment = {
  amount: number;
  date: string;
};

export default function InvestmentsPage() {
  const [managerInvestments, setManagerInvestments] = useState<Record<
    string,
    Investment
  > | null>(null);
  const [managersData, setManagersData] = useState<Record<string, Manager>>({});

  // Fetch manager investment data for user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (docSnap) => {
      const data = docSnap.data();
      setManagerInvestments(data?.managerInvestments ?? {});
    });
  }, []);

  // Fetch all managers data from Firestore
  useEffect(() => {
    const fetchManagers = async () => {
      const snapshot = await getDocs(collection(db, "managers"));
      const data: Record<string, Manager> = {};
      snapshot.forEach((doc) => {
        data[doc.id] = { id: doc.id, ...doc.data() } as Manager;
      });
      setManagersData(data);
    };
    fetchManagers();
  }, []);

  if (!managerInvestments) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 font-montserrat">
                {Object.entries(managerInvestments).map(
                  ([managerId, investment]) => {
                    const manager = managersData[managerId];
                    return (
                      <Card key={managerId}>
                        <CardHeader>
                          <CardTitle>
                            {manager ? manager.name : `Manager ${managerId}`}
                          </CardTitle>
                          <CardDescription>
                            Invested: ${investment.amount.toFixed(2)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          ROI Estimate:{" "}
                          {manager ? `+${manager.roi.toFixed(2)}%` : "N/A"}
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
