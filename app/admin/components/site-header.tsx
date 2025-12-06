//admin header
"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/toggleTheme";
import { Bell } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export function SiteHeader() {
  const [hasNewUserMessages, setHasNewUserMessages] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const hasMessages = snapshot.docs.some(
        (doc) => doc.data().hasNewUserMessage
      );
      setHasNewUserMessages(hasMessages);
    });

    return () => unsub();
  }, []);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="w-full flex justify-between items-center sm:pr-1">
          <h1 className="text-base font-medium font-montserrat">Admin</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/chat" className="relative">
              <Bell
                size={20}
                className={`transition-colors ${
                  hasNewUserMessages ? "text-red-500" : "text-muted-foreground"
                }`}
              />
              {hasNewUserMessages && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </Link>

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
