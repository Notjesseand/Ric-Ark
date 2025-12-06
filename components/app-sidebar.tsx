"use client";
//client sidebar

import * as React from "react";

import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  CircleDollarSign,
  Bitcoin,
  UsersIcon,
  Option,
  Wallet,
  CircleUserRound,
  LineChart,
  BarChart,
  AreaChart,
  UserCircle,
  User,
  User2,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  Banknote,
  Bot,
  MessageCircle,
  Trophy,
  ArrowLeftRight,
  UsersRound,
  Newspaper,
  BadgeInfo,
} from "lucide-react";

import { History } from "lucide-react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
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
import { MarketCarousel } from "@/components/marketsCarousel/carousel";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    // {
    //   title: "Dashboard",
    //   url: "#",
    //   icon: LayoutDashboardIcon,
    // },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: CircleDollarSign,
    },
    {
      title: "Portfolio Managers",
      url: "/managers",
      icon: User2,
    },
    {
      title: "AI Trading",
      url: "/bots",
      icon: Bot,
    },
    {
      title: "Trades",
      url: "/trades",
      icon: ArrowLeftRight,
    },
    {
      title: "Markets",
      url: "/markets",
      icon: LineChart,
    },
    {
      title: "Headlines",
      url: "/articles",
      icon: Newspaper,
    },
    // {
    //   title: "Messages",
    //   url: "/notifications",
    //   icon: MessageCircle,
    // },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "/support",
      icon: HelpCircleIcon,
    },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: SearchIcon,
    // },
  ],
  documents: [
    {
      name: "Investments",
      url: "/investments",
      icon: Banknote,
    },

    {
      name: "KYC",
      url: "/kyc",
      icon: ShieldCheck,
    },
    {
      name: "Messages",
      url: "/messages",
      icon: MessageCircle,
    },
    {
      name: "History",
      url: "/history",
      icon: History,
    },
    {
      name: "Referrals",
      url: "/referrals",
      icon: UsersRound,
    },
    {
      name: "Withdrawals",
      url: "/withdrawals",
      icon: Trophy,
    },
    {
      name: "How it works",
      url: "/info",
      icon: BadgeInfo,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            setUserData({
              name: data.firstName ?? "Unnamed",
              email: data.email ?? user.email ?? "no-email@example.com",
              avatar: data.avatar ?? "/avatars/default.jpg", // fallback
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe(); // clean up listener on unmount
  }, []);

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="font-montserrat test-sm"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-sm font-semibold font-montserrat">
                  Ric Ark Investment
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
        {userData && <NavUser user={userData} />}
      </SidebarFooter>
    </Sidebar>
  );
}
