import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkCustomRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Rate limiting: 3 attempts per email per 15 minutes
    const rateLimit = checkCustomRateLimit(`forgot-pw-${email}`, 3, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = existingUsers[0];
    if (user) {
      // 1. Generate 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // 2. Hash it with SHA-256
      const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");

      // 3. Mark prior reset tokens as used/invalidated
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, user.id));

      // 4. Save new OTP token to DB
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        used: false,
      });

      // 5. Console log the OTP for development purposes
      console.log(`\n========================================\n[DEV ONLY] OTP for ${email}: ${otp}\n========================================\n`);
    }

    // Return generic success to protect against email enumeration
    return NextResponse.json({
      message: "If an account exists, an OTP has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
