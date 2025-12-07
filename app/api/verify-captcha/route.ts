// app/api/verify-captcha/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

// The SECRET_KEY is securely accessed from the environment variables
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(request: Request) {
  // Ensure the SECRET_KEY is set
  if (!SECRET_KEY) {
    console.error("RECAPTCHA_SECRET_KEY is not configured.");
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 }
    );
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No reCAPTCHA token provided" },
      { status: 400 }
    );
  }

  // Google reCAPTCHA verification endpoint
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`;

  try {
    const verifyRes = await axios.post(verificationUrl);

    // The response data contains the verification status (success: true/false)
    return NextResponse.json({ success: verifyRes.data.success });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { success: false, message: "Server verification failed" },
      { status: 500 }
    );
  }
}
