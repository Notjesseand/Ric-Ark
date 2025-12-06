"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Spinner from "@/components/spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PanelLeft } from "lucide-react";

export default function HowItWorksPage() {
  const loading = useAuthRedirect();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col font-montserrat">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 font-montserrat">
                  How It Works
                </h1>
                <div className="flex flex-col gap-8">
                  {/* Navigate Section */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        How to Navigate
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Understand how to use the platform&apos;s interface
                        effectively.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          1. Click on the{" "}
                          <PanelLeft className="inline my-auto -mt-1" /> icon on
                          the left of the logo to view the sidebar and access
                          key features.
                          <br />
                          2. Check the <strong>Dashboard</strong> for an
                          overview of your portfolio.
                          <br />
                          3. Visit <strong>Headlines</strong> to stay updated on
                          market trends.
                          <br />
                          5. Access <strong>Settings</strong> to customize your
                          experience.
                          <br />
                          6. Contact support via the <strong>Help</strong>{" "}
                          section if needed.
                        </p>
                      </div>
                      <div className="flex-1">
                        <img
                          src="/info/navigate.png"
                          alt="Navigation guide"
                          className=" rounded-lg w-3/4 flex mx-auto "
                          onError={(e) => {
                            e.currentTarget.src = "/fallback.jpeg";
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deposit Section */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        How to make a Deposit
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Learn how to add funds to your account to start
                        investing or trading.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          1. Click on the <strong>Deposit</strong> button on the
                          header.
                          <br />
                          2. Enter the amount you&apos;d like to deposit and
                          choose your preferred cryptocurrency (e.g., Bitcoin,
                          Ethereum).
                          <br />
                          3. Copy the provided wallet address or scan the QR
                          code.
                          <br />
                          4. Send the exact amount from your external wallet.
                          You can also complete the transaction from an ATM
                          <br />
                          5. Wait for confirmation (typically 1-3 confirmations
                          on the blockchain).
                          <br />
                          6. Your balance will update automatically once
                          confirmed.
                        </p>
                      </div>
                      <div className="flex-1">
                        <img
                          src="/info/deposit.png"
                          alt="Deposit process"
                          className=" rounded-lg w-3/5 flex mx-auto"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback.jpeg";
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Invest Section */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        How to Invest
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Discover how to allocate funds to investment
                        opportunities.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          1. To invest with your deposit, navigate to the
                          <strong> Portfolio Managers</strong>,{" "}
                          <strong>AI Trading</strong> or{" "}
                          <strong>Trades </strong>
                          pages from the sidebar.
                          <br />
                          2. Browse available investment plans or portfolios.
                          <br />
                          3. Select a plan and review its details (e.g.,
                          expected returns, risk level).
                          <br />
                          4. Enter the amount you wish to invest from your
                          wallet balance.
                          <br />
                          5. Confirm the investment and track its performance in
                          the dashboard.
                        </p>
                      </div>
                      <div className="flex-1">
                        <img
                          src="/info/invest.png"
                          alt="Investment process"
                          className=" rounded-lg w-2/3 mx-auto"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback.jpeg";
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Messages */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Notifications
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        The bell icon will glow when you have a new
                        notification.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          1. Access the <strong>Messages</strong> page via the
                          sidebar or by clicking the bell icon.
                          <br />
                          2. You can view notifications as well as send messages
                          and complaints and we will respond to you as soon as
                          possible
                          <br />
                        </p>
                      </div>
                      <div className="flex-1">
                        <img
                          src="/info/noti.png"
                          alt="Trading process"
                          className="rounded-lg w-3/4 flex mx-auto"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback.jpeg";
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Referrals */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Referrals
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Refer our platfrom to your friends and family and earn
                        10% of their investments when they join via your
                        referral link or use your code to sign up.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          1. Access the <strong>Referrals</strong> page via the
                          sidebar.
                          <br />
                          2. Copy your referral link and share to your friends.
                          <br />
                          3. Check back on the referral page from time to time
                          to claim your rewards when you earn up to $1000 from
                          referrals.
                          <br />
                        </p>
                      </div>
                      <div className="flex-1">
                        <img
                          src="/info/referrals.png"
                          alt="Trading process"
                          className="rounded-lg w-3/4 flex mx-auto"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback.jpeg";
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
