//client header
"use client";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./toggleTheme";
import { Deposit } from "./dashboard/deposit";
import { useAuth } from "@/context/AuthContext";
import { Bell, Info } from "lucide-react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function SiteHeader() {
  const { currentUser } = useAuth();
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      const data = docSnap.data();
      setHasNewMessage(!!data?.hasNewMessage);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="w-full flex justify-between items-center sm:pr-1">
          <div className="flex justify-between w-full pr-4">
            <img
              src="/logo-text.png"
              alt=""
              className="max-w-24 object-contain hidden sm:flex -ml-2  "
            />
            <h1 className="text-base flex">
              <Deposit />
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <Link href="/messages" className="relative">
              <Bell
                size={20}
                className={`transition-colors ${
                  hasNewMessage ? "text-red-500" : "text-muted-foreground"
                }`}
              />
              {hasNewMessage && (
                <>
                  {/* Red dot */}
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                </>
              )}
            </Link>
            <Link href="/info" className="items-center flex px-0 sm:px-2">
              <Info />
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
