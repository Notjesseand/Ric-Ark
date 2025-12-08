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
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";

type Manager = {
  id: string;
  name: string;
  roi: number;
  img: string;
  moneyBack: number;
};

type Bot = {
  id: string;
  name: string;
  dailyReturn: number;
  img: string;
  moneyBack: number;
};

type Investment = {
  amount: number;
  date: string;
};

export default function WithdrawalsPage() {
  const [botsData, setBotsData] = useState<Record<string, Bot>>({});
  const [managersData, setManagersData] = useState<Record<string, Manager>>({});
  const [managerInvestments, setManagerInvestments] = useState<Record<
    string,
    Investment
  > | null>(null);
  const [botInvestments, setBotInvestments] = useState<Record<
    string,
    Investment
  > | null>(null);

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

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (docSnap) => {
      const data = docSnap.data();
      const managerData = data?.managerInvestments ?? {};
      const bots: Record<string, Investment> = data?.investedBots
        ? Object.fromEntries(
            data.investedBots.map((botId: string) => [
              botId,
              data.botInvestments?.[botId] || { amount: 0, date: "" },
            ])
          )
        : {};

      setManagerInvestments(managerData);
      setBotInvestments(bots);
    });
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

  const calculateDueDate = (dateStr: string, days: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date;
  };

  const isDue = (dueDate: Date) => {
    return new Date() >= dueDate;
  };

  if (!managerInvestments || !botInvestments) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col px-6 py-4 md:py-8">
          <h2 className="text-2xl font-bold font-montserrat mb-6">Withdrawals</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 font-montserrat">
            {/* Manager Investments */}
            {Object.entries(managerInvestments).map(([managerId, inv]) => {
              const manager = managersData[managerId];
              if (!manager) return null;
              const dueDate = calculateDueDate(inv.date, manager.moneyBack);
              const dueAmount = inv.amount + inv.amount * manager.roi;

              return (
                <Card key={managerId}>
                  <CardHeader>
                    <CardTitle>{manager.name}</CardTitle>
                    <CardDescription>
                      Invested: {formatCurrency(inv.amount)}
                      <br />
                      Due Amount: {formatCurrency(dueAmount)}
                      <br />
                      Due Date: {formatDate(dueDate.toISOString())}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button disabled={!isDue(dueDate)}>Withdraw</Button>
                  </CardContent>
                </Card>
              );
            })}

            {/* Bot Investments */}
            {Object.entries(botInvestments).map(([botId, inv]) => {
              const bot = botsData[botId];
              if (!bot) return null;
              const dueDate = calculateDueDate(inv.date, bot.moneyBack);
              const roi = bot.dailyReturn * bot.moneyBack;
              const dueAmount = inv.amount + inv.amount * roi;

              return (
                <Card key={botId}>
                  <CardHeader>
                    <CardTitle>{bot.name}</CardTitle>
                    <CardDescription>
                      Invested: {formatCurrency(inv.amount)}
                      <br />
                      Due Amount: {formatCurrency(dueAmount)}
                      <br />
                      Due Date: {formatDate(dueDate.toISOString())}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button disabled={!isDue(dueDate)}>Withdraw</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
