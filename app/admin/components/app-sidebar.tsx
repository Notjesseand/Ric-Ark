// admin dashboard sidebar
"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  CameraIcon,
  FileCodeIcon,
  FileTextIcon,
  HelpCircleIcon,
  SettingsIcon,
  User2,
  ShieldCheck,
  Banknote,
  Bot,
  MessageCircle,
  LineChart,
  RotateCw,
  RotateCcw,
  LayoutDashboardIcon,
  RefreshCcw,
  Pencil,
  Activity,
  Wallet,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";

const data = {
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: SettingsIcon,
    // },
    // {
    //   title: "Get Help",
    //   url: "/support",
    //   icon: HelpCircleIcon,
    // },
  ],
  documents: [
    // {
    //   name: "View Investments",
    //   url: "/investments",
    //   icon: Banknote,
    // },
    // {
    //   name: "KYC",
    //   url: "/kyc",
    //   icon: ShieldCheck,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        setUid(user.uid);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              name: data.firstName ?? "Unnamed",
              email: data.email ?? user.email ?? "no-email@example.com",
              avatar: data.avatar ?? "/avatars/default.jpg",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const navMain = [
    {
      title: "Admin Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Admin Chat",
      url: "/admin/chat",
      icon: MessageCircle,
    },
    {
      title: "Update Data",
      url: "/admin/updatesitedata",
      icon: Pencil,
    },
    {
      title: "Refresh Charts",
      url: "/admin/update-charts",
      icon: RefreshCcw,
    },
    {
      title: "Trades",
      url: "/admin/trades",
      icon: Activity,
    },
    {
      title: "Wallets",
      url: "/admin/wallets",
      icon: Wallet,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props} className="font-montserrat">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className=" font-semibold font-montserrat">
                  Ric Ark Admin
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="font-montserrat">
        <NavMain items={navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
    </Sidebar>
  );
}
