// admin/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "./../components/app-sidebar";
import { SiteHeader } from "./../components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  sender: "admin" | "user";
  message: string;
  timestamp: any;
  userId: string;
};

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  hasNewUserMessage?: boolean;
  lastMessageTimestamp?: number;
};

export default function AdminMessagesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const { toast } = useToast();
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesCount = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.role === "admin") {
            setAuthorized(true);
          } else {
            router.push("/auth/login");
          }
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/auth login");
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authorized || loadingAuth) return;

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));

      const usersWithLastMsg = await Promise.all(
        usersSnapshot.docs.map(async (docSnap) => {
          const userData = docSnap.data();
          const userId = docSnap.id;

          const msgsQuery = query(
            collection(db, "messages"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          const msgsSnap = await getDocs(msgsQuery);
          const lastMsg = msgsSnap.docs[0]?.data();

          return {
            id: userId,
            email: userData.email,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            hasNewUserMessage: userData.hasNewUserMessage || false,
            lastMessageTimestamp: lastMsg?.timestamp?.toMillis() || 0,
          };
        })
      );

      usersWithLastMsg.sort(
        (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
      );

      setUsers(usersWithLastMsg);
    };

    fetchUsers();
  }, [authorized, loadingAuth]);

  useEffect(() => {
    if (!authorized || loadingAuth || !selectedUser?.id) return;

    setLoadingMessages(true);

    const q = query(
      collection(db, "messages"),
      where("userId", "==", selectedUser.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Message, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });

      if (
        messages.length > 0 &&
        msgs.length > prevMessagesCount.current &&
        msgs[msgs.length - 1].sender === "user"
      ) {
        toast({
          title: "New Message",
          description: `New message from ${
            selectedUser.firstName || selectedUser.email
          }`,
        });

        const userRef = doc(db, "users", selectedUser.id);
        updateDoc(userRef, { hasNewUserMessage: false });

        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === selectedUser.id ? { ...u, hasNewUserMessage: false } : u
          )
        );
      }

      setMessages(msgs);
      prevMessagesCount.current = msgs.length;
      setLoadingMessages(false);
    });

    return () => {
      unsubscribe();
      setMessages([]);
      prevMessagesCount.current = 0;
    };
  }, [selectedUser?.id, authorized, loadingAuth]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // const sendMessage = async () => {
  //   if (!newMessage.trim() || !selectedUser) return;

  //   try {
  //     // Add the new admin message
  //     await addDoc(collection(db, "messages"), {
  //       userId: selectedUser.id,
  //       sender: "admin",
  //       message: newMessage,
  //       timestamp: serverTimestamp(),
  //     });

  //     // Update the user's document to indicate they have a new message from admin
  //     const userRef = doc(db, "users", selectedUser.id);
  //     await updateDoc(userRef, {
  //       hasNewMessage: true, // <-- new field indicating unread messages from admin
  //     });

  //     setNewMessage("");
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   }
  // };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        userId: selectedUser.id,
        sender: "admin",
        message: newMessage,
        timestamp: serverTimestamp(),
      });

      // Set `hasNewMessage` to true so the user gets notified
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, {
        hasNewMessage: true,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loadingAuth) return <Loading />;
  if (!authorized) return null;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col items-center font-montserrat p-6 w-full">
          <h1 className="text-2xl font-semibold mb-6 text-foreground">
            Admin Chat
          </h1>
          <div className="sm:flex gap-4 w-full max-w-6xl space-y-5 sm:space-y-0">
            <Card className="sm:w-1/3 min-w-[250px] h-[500px] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {users.map((user) => (
                  <Button
                    key={user.id}
                    variant={
                      selectedUser?.id === user.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-between relative text-sm lg:text-xs"
                    onClick={async () => {
                      setSelectedUser(user);

                      const userRef = doc(db, "users", user.id);
                      await updateDoc(userRef, { hasNewUserMessage: false });

                      setUsers((prevUsers) =>
                        prevUsers.map((u) =>
                          u.id === user.id
                            ? { ...u, hasNewUserMessage: false }
                            : u
                        )
                      );
                    }}
                  >
                    <span>{user.email}</span>

                    {user.hasNewUserMessage && (
                      <span className="ml-2 text-xs font-semibold text-red-600 bg-red-100 rounded px-2 py-0.5">
                        New
                      </span>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="w-full max-w-2xl font-montserrat flex flex-col justify-between min-h-[500px] mx-auto">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  {selectedUser
                    ? selectedUser.firstName || selectedUser.lastName
                      ? `Chat with ${selectedUser.firstName || ""} ${
                          selectedUser.lastName || ""
                        }`.trim()
                      : `Chat with ${selectedUser.email}`
                    : "Select a user"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-2 overflow-y-auto max-h-[400px] text-sm">
                {loadingMessages && <Loading />}
                {!loadingMessages &&
                  messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      ref={idx === messages.length - 1 ? lastMessageRef : null}
                      className={`p-3 rounded-xl max-w-[75%] ${
                        msg.sender === "admin"
                          ? "bg-black border text-white self-end"
                          : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-zinc-200 self-start"
                      }`}
                    >
                      {msg.message}
                    </div>
                  ))}
              </CardContent>
              {selectedUser && (
                <div className="p-4 border-t flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
