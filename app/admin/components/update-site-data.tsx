"use client";

import { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UpdateSiteDataPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [aiBots, setAiBots] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const mgrSnap = await getDocs(collection(db, "managers"));
      const aiSnap = await getDocs(collection(db, "aiBots"));

      setManagers(mgrSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setAiBots(aiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const handleDelete = async (type: "managers" | "aiBots", id: string) => {
    await deleteDoc(doc(db, type, id));
    if (type === "managers")
      setManagers((m) => m.filter((item) => item.id !== id));
    else setAiBots((b) => b.filter((item) => item.id !== id));
  };

  return (
    <div className="grid gap-6 p-6">
      <h1 className="text-2xl font-bold">Managers</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {managers.map((manager) => (
          <Card key={manager.id}>
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold">{manager.name}</p>
              <p>Investors: {manager.investors}</p>
              <p>ROI: {manager.roi}%</p>
              <p>Min: ${manager.min}</p>
              <Button
                onClick={() => handleDelete("managers", manager.id)}
                variant="destructive"
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <h1 className="text-2xl font-bold mt-8">AI Bots</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {aiBots.map((bot) => (
          <Card key={bot.id}>
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold">{bot.name}</p>
              <p>Daily Return: {bot.dailyReturn}%</p>
              <p>Range: {bot.investmentRange}</p>
              <Button
                onClick={() => handleDelete("aiBots", bot.id)}
                variant="destructive"
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
