// app/client-messages/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { sendEmail } from "@/hooks/sendMail";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { MdOutlineSupportAgent, MdSend } from "react-icons/md";
import Spinner from "@/components/spinner";
import { CgSpinner } from "react-icons/cg";

type Message = {
  id: string;
  sender: "admin" | "user";
  message: string;
  timestamp: any;
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function NotificationsPage() {
  const { currentUser: user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // New state for sending status
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const isNotificationSupported =
    typeof Notification !== "undefined" && Notification.requestPermission;

  const handleEnableNotifications = () => {
    if (isNotificationSupported) {
      Notification.requestPermission()
        .then((permission) => {
          setNotificationPermission(permission);
        })
        .catch((e) =>
          console.error("Notification permission request failed:", e)
        );
    } else {
      alert("Notifications are not supported by your browser or device.");
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .filter(
          (doc: QueryDocumentSnapshot<DocumentData>) =>
            doc.data().userId === user.uid
        )
        .map(
          (doc: QueryDocumentSnapshot<DocumentData>) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Message
        );

      setMessages((prevMessages) => {
        const newAdminMsgs = msgs.filter(
          (msg) =>
            msg.sender === "admin" &&
            !prevMessages.some((existing) => existing.id === msg.id)
        );

        if (isNotificationSupported && Notification.permission === "granted") {
          newAdminMsgs.forEach((msg) => {
            try {
              new Notification("New message from admin", {
                body: msg.message,
              });
            } catch (e) {
              console.error("Failed to show notification:", e);
            }
          });
        }

        return msgs;
      });

      setLoading(false);

      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg?.sender === "admin") {
        try {
          const userDocRef = doc(db, "users", user.uid);
          updateDoc(userDocRef, {
            hasNewMessage: false,
          });
        } catch (error) {
          console.error("Failed to clear admin message flag:", error);
        }
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [user?.uid, isNotificationSupported]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return; // Prevent sending if already in progress

    setIsSending(true); // Show spinner
    try {
      // Set the flag BEFORE sending the message
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        hasNewUserMessage: true,
      });

      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        userId: user.uid,
        sender: "user",
        message: newMessage,
        timestamp: serverTimestamp(),
      });

      // Debug user object to check available fields
      console.log("User object:", {
        uid: user.uid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
      });

      // Construct full name with fallback
      const fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.displayName || user.email || "User";

      // Send email notification to admin
      await sendEmail(
        "mccathdavid71@gmail.com",
        "A Client just sent a Message",
        `<p>New message from ${escapeHtml(fullName)}:</p><p>Message: ${escapeHtml(newMessage)}</p>`
      );

      setNewMessage("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Failed to send message or email:", error);
    } finally {
      setIsSending(false); // Hide spinner
    }
  };

  if (loading) return <Loading />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col items-center font-montserrat p-6">
          <h1 className="text-2xl font-semibold mb-6 text-foreground gradient-text">
            Support
          </h1>
          <Card className="w-full max-w-2xl font-montserrat flex flex-col justify-between min-h-[500px]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground flex items-center">
                Talk to a Rep{" "}
                <MdOutlineSupportAgent className="ml-2 text-2xl" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2 overflow-y-auto max-h-[400px] text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-[75%] ${
                    msg.sender === "user"
                      ? " bg-black border text-white self-end"
                      : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-zinc-200 self-start"
                  }`}
                >
                  {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isSending} // Disable input while sending
              />
              <Button onClick={sendMessage} disabled={isSending}>
                {isSending ? (
                  <CgSpinner className="animate-spin text-lg" />
                ) : (
                  <MdSend className="text-lg" />
                )}
              </Button>
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
