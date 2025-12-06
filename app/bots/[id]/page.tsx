// app/ai-trader/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";
import ConfirmTransaction from "@/components/bots/drawer";

type AiBot = {
  id: string;
  name: string;
  investmentRange: string;
  dailyReturn: number;
  details: string;
  minInvestment: number;
  maxInvestment: number;
};

export default function AITraderPlanDetailPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState<AiBot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPlan = async () => {
      const ref = doc(db, "aiBots", String(id));
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setPlan({ id: snapshot.id, ...snapshot.data() } as AiBot);
      }
      setLoading(false);
    };

    fetchPlan();
  }, [id]);

  if (loading) return <Loading />;
  if (!plan) return <div className="p-6 text-center">Plan not found.</div>;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col items-center font-montserrat p-6">
          <h1 className="text-2xl font-semibold mb-6 text-foreground">
            {plan.name}
          </h1>
          <Card className="max-w-xl w-full font-montserrat">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">
                {plan.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-medium text-foreground space-y-3">
              <p>
                <strong>Investment Range:</strong> {plan.investmentRange}
              </p>
              <p>
                <strong>Daily Returns:</strong> {plan.dailyReturn}%
              </p>
              <p>
                <strong>Details:</strong> {plan.details}
              </p>

              <div className="mx-auto flex justify-center">
                <ConfirmTransaction
                  manager={{
                    id: plan.id,
                    name: plan.name,
                    roi: plan.dailyReturn,
                    minInvestment: plan.minInvestment,
                    maxInvestment: plan.maxInvestment,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
