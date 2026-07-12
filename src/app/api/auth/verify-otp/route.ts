import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { checkCustomRateLimit } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    // Rate limiting: 3 verification attempts per email per 15 minutes
    const rateLimit = checkCustomRateLimit(`verify-otp-${email}`, 3, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many code verification attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // 1. Fetch user by email
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = existingUsers[0];
    if (!user) {
      return NextResponse.json({ error: "Invalid verification code or email." }, { status: 400 });
    }

    // 2. Hash incoming OTP
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // 3. Query valid, unused, and unexpired OTP tokens in the database
    const matchingTokens = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.tokenHash, otpHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    const tokenRecord = matchingTokens[0];
    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    // 4. Mark the verified OTP token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    // 5. Generate secure temporary reset token
    const plainResetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(plainResetToken).digest("hex");

    // 6. Save reset token to DB (valid for 5 minutes)
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: resetTokenHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      used: false,
    });

    // 7. Store plain reset token in an httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("reset_token", plainResetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
