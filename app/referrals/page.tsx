//app/referrals/page.tsx

"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [lastClaimed, setLastClaimed] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      let totalEarnings = 0;
      if (userData?.referrals?.length) {
        const referralDocs = await Promise.all(
          userData.referrals.map((id: string) => getDoc(doc(db, "users", id)))
        );
        const referralUsers = referralDocs
          .filter((doc) => doc.exists())
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        referralUsers.forEach((referral) => {
          const initialInvestments = referral.initialInvestments ?? 0;
          totalEarnings += initialInvestments * 0.1;
        });

        setReferrals(referralUsers);
      }

      setReferralCode(userData?.referralCode ?? "");
      setReferralEarnings(totalEarnings);
      setLastClaimed(userData?.lastReferralClaim ?? 0);
      setWalletBalance(userData?.walletBalance ?? 0);
      setLoading(false);
    };

    fetchReferrals();
  }, []);

  function maskEmail(email: string): string {
    const [user, domain] = email.split("@");
    const visible = user?.slice(0, 5);
    return `${visible}***@${domain}`;
  }

  const referralUrl = `https://yieldfountain.com/auth?ref=${referralCode}`;

  const handleClaim = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const nextClaimable = Math.floor(referralEarnings / 1000) * 1000;
    const bonusToClaim = nextClaimable - lastClaimed;

    if (bonusToClaim < 1000) {
      toast.error("Not enough referral earnings to claim.");
      return;
    }

    try {
      setClaiming(true);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        walletBalance: walletBalance + bonusToClaim,
        lastReferralClaim: nextClaimable,
      });

      // Add transaction log
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        type: "referral-claim",
        amount: bonusToClaim,
        timestamp: new Date(),
        description: `Claimed referral bonus of $${bonusToClaim}`,
      });

      setWalletBalance(walletBalance + bonusToClaim);
      setLastClaimed(nextClaimable);
      toast.success(
        <p className="font-montserrat">Successfully claimed ${bonusToClaim}!</p>
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to claim bonus.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 font-montserrat">
          <h2 className="text-2xl font-bold mb-4">Referral Program</h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>
                Share this code to invite others and earn 10% of their initial
                investments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold truncate">{referralUrl}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralUrl);
                    toast.success("Referral link copied!");
                  }}
                  className="p-1 hover:text-blue-600 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Code: <span className="font-semibold">{referralCode}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Referral Earnings</CardTitle>
              <CardDescription>
                Total earnings from your referrals&apos; initial investments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${referralEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Wallet Balance: ${walletBalance.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You can claim a bonus every time your referral earnings reach a
                new $1000 milestone.
              </p>
              {referralEarnings - lastClaimed >= 1000 && (
                <Button
                  className="mt-4"
                  onClick={handleClaim}
                  disabled={claiming}
                >
                  {claiming
                    ? "Claiming..."
                    : `Claim $${
                        Math.floor(referralEarnings / 1000) * 1000 - lastClaimed
                      } Bonus`}
                </Button>
              )}
            </CardContent>
          </Card>

          <h3 className="text-xl font-semibold mb-2">Your Referrals</h3>
          {referrals.length === 0 ? (
            <p>No referrals yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {referrals.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {maskEmail(user.email)}
                    </CardTitle>
                    <CardDescription>Joined via your referral</CardDescription>
                    {/* <p className="text-sm">
                      Investments: ${user.initialInvestments ?? 0}
                    </p> */}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
