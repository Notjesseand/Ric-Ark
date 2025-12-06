"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";

type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          const docRef = doc(db, "users", user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    };
    fetchUser();
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, [field]: value });
  };

  const handleSave = async () => {
    if (!userId || !userProfile) return;
    setSaving(true);
    await updateDoc(doc(db, "users", userId), {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phone: userProfile.phone,
    });
    setSaving(false);
  };

  if (loading) return <Loading />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="max-w-xl w-full mx-auto mt-10 font-montserrat px-4">
          <h1 className="text-2xl font-semibold mb-6">Settings</h1>
          {!userProfile ? (
            <p className="text-muted-foreground">No user data found.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <Label>First Name</Label>
                <Input
                  value={userProfile.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={userProfile.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={userProfile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={userProfile.email} disabled />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
