"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Spinner from "@/components/spinner";
import { FaSpinner } from "react-icons/fa6";

type Entity = {
  id: string;
  name: string;
  type: "manager" | "bot";
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

export default function AdminTradesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [percentageUpdates, setPercentageUpdates] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  ); // Track loading per entity
  const router = useRouter();
  const adminStatus = useAdminCheck();

  useEffect(() => {
    const fetchEntities = async () => {
      const [managersSnap, botsSnap] = await Promise.all([
        getDocs(collection(db, "managers")),
        getDocs(collection(db, "aiBots")),
      ]);

      const data: Entity[] = [
        ...managersSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          type: "manager" as const,
        })),
        ...botsSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          type: "bot" as const,
        })),
      ];
      setEntities(data);
      setLoading(false);
    };

    if (adminStatus === "authorized") fetchEntities();
    else if (adminStatus === "unauthorized") router.replace("/");
  }, [adminStatus]);

  const handleInputChange = (id: string, value: string) => {
    setPercentageUpdates((prev) => ({ ...prev, [id]: value }));
  };

  const applyTradeUpdate = async (entity: Entity) => {
    const rawInput = percentageUpdates[entity.id];
    if (!rawInput) return;

    const percent = parseFloat(rawInput);
    if (isNaN(percent)) return alert("Invalid percentage input.");

    // Set loading state for this entity
    setLoadingStates((prev) => ({ ...prev, [entity.id]: true }));

    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const batch = writeBatch(db);
      const timestamp = new Date().toISOString();

      usersSnap.docs.forEach((userDoc) => {
        const userData = userDoc.data();
        const fieldKey =
          entity.type === "manager" ? "managerInvestments" : "botInvestments";
        const userInvestments = userData[fieldKey]?.[entity.id];

        if (userInvestments?.amount) {
          const oldAmount = userInvestments.amount;
          const newAmount = +(oldAmount * (1 + percent / 100)).toFixed(2);

          const userRef = doc(db, "users", userDoc.id);
          batch.update(userRef, {
            [`${fieldKey}.${entity.id}.amount`]: newAmount,
          });
        }
      });

      // Log the trade result
      await addDoc(collection(db, "trades"), {
        targetId: entity.id,
        targetType: entity.type,
        percentageChange: percent,
        timestamp,
      });

      await batch.commit();
      alert(
        `Updated balances for ${entity.name} (${
          percent > 0 ? "+" : ""
        }${percent}%)`
      );
      setPercentageUpdates((prev) => ({ ...prev, [entity.id]: "" }));
    } catch (error) {
      console.error("Error applying trade update:", error);
      alert("Failed to apply trade update. Please try again.");
    } finally {
      // Reset loading state for this entity
      setLoadingStates((prev) => ({ ...prev, [entity.id]: false }));
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
          <h1 className="text-2xl font-bold">Trade Updates</h1>
          <p className="text-sm text-muted-foreground">
            Enter % change for each manager or bot. This updates balances of
            clients invested in them.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <Card key={entity.id}>
                <CardHeader>
                  <CardTitle>{entity.name}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entity.type}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="number"
                    placeholder="% change (e.g. 5 or -3)"
                    value={percentageUpdates[entity.id] || ""}
                    onChange={(e) =>
                      handleInputChange(entity.id, e.target.value)
                    }
                  />
                  <Button
                    onClick={() => applyTradeUpdate(entity)}
                    disabled={
                      !percentageUpdates[entity.id] || loadingStates[entity.id]
                    }
                  >
                    {loadingStates[entity.id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Apply Update"
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
