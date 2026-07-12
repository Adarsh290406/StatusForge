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
      // 1. Generate 32-byte reset token
      const token = crypto.randomBytes(32).toString("hex");

      // 2. Hash it with SHA-256
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // 3. Mark prior reset tokens as used/invalidated
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, user.id));

      // 4. Save new token to DB (valid for 15 minutes)
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
      });

      // 5. Console log the reset URL for development purposes
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      console.log(`\n================================================================================\n[DEV ONLY] Password Reset Link for ${email}:\n${resetUrl}\n================================================================================\n`);
    }

    // Return generic success to protect against email enumeration
    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
