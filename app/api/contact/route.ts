import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, message, token } = await req.json();

  // Verify CAPTCHA token with Google
  const verify = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    }
  );

  const data = await verify.json();

  if (!data.success) {
    return NextResponse.json({ error: "Captcha failed" }, { status: 400 });
  }

  // TODO: your success logic here (send email, save to DB, etc.)
  return NextResponse.json({ success: true });
}
