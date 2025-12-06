"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";

type Manager = {
  id: string;
  name: string;
  roi: number;
  img: string;
  moneyBack: number; // Money-back period in days
};

type Bot = {
  id: string;
  name: string;
  roi: number;
  img: string;
  dailyReturn: number;
  moneyBack: number; // Money-back period in days
};

type Investment = { amount: number; date: string }; // Updated to ensure date is always present

export default function InvestmentsPage() {
  const [botsData, setBotsData] = useState<Record<string, Bot>>({});
  const [balance, setBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [managersData, setManagersData] = useState<Record<string, Manager>>({});
  const [managerInvestments, setManagerInvestments] = useState<Record<
    string,
    Investment
  > | null>(null);
  const [botInvestments, setBotInvestments] = useState<Record<
    string,
    Investment
  > | null>(null); // Updated to expect { amount, date }

  useEffect(() => {
    const fetchManagers = async () => {
      const snapshot = await getDocs(collection(db, "managers"));
      const data: Record<string, Manager> = {};
      snapshot.forEach((doc) => {
        data[doc.id] = {
          id: doc.id,
          ...doc.data(),
          moneyBack: doc.data()["money-back"],
        } as Manager;
      });
      setManagersData(data);
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (docSnap) => {
      const data = docSnap.data();
      const investments: Record<string, Investment> =
        data?.managerInvestments ?? {};
      const bots: Record<string, Investment> = data?.investedBots
        ? Object.fromEntries(
            data.investedBots.map((botId: string) => [
              botId,
              data.botInvestments?.[botId] || { amount: 0, date: "" },
            ])
          )
        : {};
      const userBalance = data?.walletBalance ?? 0;

      setManagerInvestments(investments);
      setBotInvestments(bots);

      const managerTotal = Object.values(investments).reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      const botTotal = Object.values(bots).reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      setInvested(managerTotal + botTotal);
      setBalance(userBalance);
    });
  }, []);

  useEffect(() => {
    const fetchBots = async () => {
      const snapshot = await getDocs(collection(db, "aiBots"));
      const data: Record<string, Bot> = {};
      snapshot.forEach((doc) => {
        data[doc.id] = {
          id: doc.id,
          ...doc.data(),
          moneyBack: doc.data()["money-back"],
        } as Bot;
      });
      setBotsData(data);
    };
    fetchBots();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDueDate = (dateStr: string, moneyBackDays: number) => {
    if (!dateStr || !moneyBackDays) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    date.setDate(date.getDate() + moneyBackDays);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!managerInvestments || !botInvestments) {
    return <Loading />;
  }

  const totalROI =
    Object.entries(managerInvestments).reduce((acc, [managerId, inv]) => {
      const manager = managersData[managerId];
      if (!manager) return acc;
      return acc + inv.amount * manager.roi;
    }, 0) +
    Object.entries(botInvestments).reduce((acc, [botId, inv]) => {
      const bot = botsData[botId];
      if (!bot) return acc;
      return acc + inv.amount * bot.dailyReturn;
    }, 0);

  const roiEstimate = invested > 0 ? (totalROI / invested).toFixed(2) : "0.00";

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col font-montserrat">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="grid gap-6 p-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription>Wallet Balance</CardDescription>
                    <CardTitle className="text-2xl">
                      {formatCurrency(balance)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Total Invested</CardDescription>
                    <CardTitle className="text-2xl">
                      {formatCurrency(invested)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardDescription>ROI Estimate</CardDescription>
                    <CardTitle className="text-xl flex items-center gap-2">
                      +{roiEstimate}%{" "}
                      <Badge variant="outline">
                        <TrendingUpIcon className="w-4 h-4" />
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {Object.keys(managerInvestments).length < 2 && (
                <p className="text-center text-muted-foreground px-6 font-montserrat text-sm md:text-xs">
                  You can invest with more managers to diversify your portfolio.
                </p>
              )}

              <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(managerInvestments).map(([managerId, inv]) => {
                  const manager = managersData[managerId];
                  const dueDate = calculateDueDate(
                    inv.date,
                    manager?.moneyBack || 0
                  );

                  return (
                    <Card key={managerId} className="font-montserrat">
                      <CardHeader>
                        <CardTitle>
                          {manager ? manager.name : `Manager ${managerId}`}
                        </CardTitle>
                        <CardDescription className="text-sm md:text-xs">
                          Invested: {formatCurrency(inv.amount)}
                          <div className="text-xs text-muted-foreground mt-1">
                            Invested on: {formatDate(inv.date)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Due Date: {dueDate}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm md:text-xs ">
                        ROI Estimate:{" "}
                        {manager ? `+${manager.roi.toFixed(2)}%` : "N/A"}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {Object.keys(botInvestments).length > 0 && (
                <>
                  <h2 className="px-6 text-lg font-semibold font-montserrat">
                    AI Trade Bots
                  </h2>
                  <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 font-montserrat">
                    {Object.entries(botInvestments).map(([botId, inv]) => {
                      const bot = botsData[botId];
                      const dueDate = calculateDueDate(
                        inv.date,
                        bot?.moneyBack || 0
                      );

                      return (
                        <Card
                          key={botId}
                          className="flex flex-col min-h-[250px]" // Set min height for consistency
                        >
                          <CardHeader className="flex-grow">
                            <CardTitle>
                              {bot ? bot.name : `AI Bot ${botId}`}
                            </CardTitle>
                            <CardDescription>
                              Invested: {formatCurrency(inv.amount)}
                              <div className="text-xs text-muted-foreground mt-1">
                                Invested on: {formatDate(inv.date)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Due Date: {dueDate}
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2 text-sm md:text-xs">
                            Daily ROI Estimate:{" "}
                            {bot && typeof bot.dailyReturn === "number" ? (
                              `+${bot.dailyReturn.toFixed(2)}%`
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
