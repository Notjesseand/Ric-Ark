"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading"; // Optional loading spinner

type AiBot = {
  id: string;
  name: string;
  investmentRange: string;
  dailyReturn: number;
  details: string;
};

export default function AITraderPlansPage() {
  const [plans, setPlans] = useState<AiBot[] | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const snapshot = await getDocs(collection(db, "aiBots"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AiBot[];
      setPlans(data);
    };

    fetchPlans();
  }, []);

  if (!plans) return <Loading />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col items-center font-montserrat">
          <h1 className="text-2xl font-semibold mt-8 text-foreground">
            AI Trader Plans
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6 w-full max-w-7xl">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="font-montserrat flex flex-col h-full"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm font-medium text-foreground flex flex-col justify-between flex-grow space-y-2">
                  <div className="space-y-2">
                    <p>Investment range: {plan.investmentRange}</p>
                    <p>Daily returns: {plan.dailyReturn}%</p>
                    <p>Details: {plan.details}</p>
                  </div>

                  <div className="pt-4 mt-auto">
                    <Link
                      href={`/bots/${plan.id}`}
                      className="inline-block px-4 py-2 border-2 border-foreground rounded-lg hover:bg-foreground hover:text-background transition-all"
                    >
                      Invest Now
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
