"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow font-montserrat text-foreground">
      <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>

      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button onClick={handleReset} className="w-full mt-4">
        Send Reset Link
      </Button>

      {message && <p className="text-green-600 mt-4 text-sm">{message}</p>}
      {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

      <p className="text-sm text-center mt-6">
        <Button
          variant="link"
          onClick={() => router.push("/login")}
          className="text-blue-500"
        >
          Back to login
        </Button>
      </p>
    </div>
  );
}
