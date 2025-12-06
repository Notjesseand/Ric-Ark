// app/admin/dashboard
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  getDocs,
  DocumentData,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import Link from "next/link";
import Loading from "@/components/loading";

type Investment = {
  amount: number;
  date: string;
};

function useAdminCheck() {
  const [status, setStatus] = useState<
    "loading" | "unauthorized" | "authorized"
  >("loading");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("unauthorized");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setStatus("unauthorized");
      }
    });

    return () => unsubscribe();
  }, []);

  return status;
}

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const adminStatus = useAdminCheck();
  const router = useRouter();

  useEffect(() => {
    if (adminStatus !== "authorized") return;

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminStatus]);

  if (adminStatus === "loading")
    return (
      <div className="p-6 font-montserrat h-full flex justify-center items-center">
        Checking admin access...
      </div>
    );
  if (adminStatus === "unauthorized") {
    router.replace("/");
    return null;
  }
  if (loading) return <Loading />;

  const getUserTotal = (user: any): number => {
    const botInvestments =
      (user.botInvestments as Record<string, number>) ?? {};
    const managerInvestments =
      (user.managerInvestments as Record<string, number>) ?? {};
    const botTotal = Object.values(botInvestments).reduce(
      (sum, inv: any) => sum + (inv?.amount || 0),
      0
    );

    const managerTotal = Object.values(managerInvestments).reduce(
      (sum, inv: any) => sum + (inv?.amount || 0),
      0
    );

    return botTotal + managerTotal;
  };

  const totalInvested = users.reduce(
    (sum, user) => sum + getUserTotal(user),
    0
  );
  const hasUserMessages = users.some((u) => u.hasNewUserMessage);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 font-montserrat space-y-6">
          <h1 className="text-2xl font-bold">Admin Overview</h1>

          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Total Invested</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  ${totalInvested.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>New Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={hasUserMessages ? "destructive" : "secondary"}>
                  {hasUserMessages ? "Yes" : "No"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Invested</th>
                      <th className="p-2">Pending</th>
                      <th className="p-2">Messages</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const userInvested = getUserTotal(u);
                      return (
                        <tr
                          key={u.id}
                          className="border-b hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
                        >
                          <td className="p-2">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="p-2">{u.email}</td>
                          <td className="p-2">{u.phone}</td>
                          <td className="p-2">
                            ${userInvested.toLocaleString()}
                          </td>
                          <td className="p-2">
                            $
                            {u.pendingStatus === true
                              ? u.pendingAmount.toLocaleString()
                              : 0}
                            {/* ${(u.pendingAmount || 0).toLocaleString()} */}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                u.hasNewUserMessage
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {u.hasNewUserMessage ? "New" : "None"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Link href={`/admin/dashboard/${u.id}`}>
                              <Button size="sm">View</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
