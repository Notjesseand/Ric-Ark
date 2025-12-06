//app/managers/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmTransaction from "@/components/managers/drawer";
import Loading from "@/components/loading";

type Manager = {
  id: string;
  name: string;
  trades: number;
  winRate: number;
  roi: number;
  investors: number;
  min: number;
  img?: string;
  moneyBack: number; // Added moneyBack field
};

export default function ManagerDetailPage() {
  const { id } = useParams();
  const [manager, setManager] = useState<Manager | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchManager = async () => {
      if (!id) return;
      const ref = doc(db, "managers", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setManager({
          id: snap.id,
          ...snap.data(),
          moneyBack: snap.data()["money-back"], // Map money-back to moneyBack
        } as Manager);
      } else {
        setNotFound(true);
      }
    };

    fetchManager();
  }, [id]);

  if (notFound) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-full font-montserrat">
            <p className="text-xl text-muted-foreground">Manager not found</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!manager) return <Loading />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center font-montserrat">
          <h1 className="text-2xl font-semibold mt-8 text-foreground">
            {manager.name}
          </h1>
          <div className="p-6 w-full max-w-[550px]">
            <Card className="flex flex-col justify-between font-montserrat">
              <div>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {manager.name}
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
                <ConfirmTransaction manager={manager} />
              </div>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
