import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import * as argon2 from "@node-rs/argon2";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { password, confirmPassword } = await req.json();

    if (!password || !confirmPassword) {
      return NextResponse.json({ error: "Password fields are required." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    // 1. Get reset token from cookies
    const cookieStore = await cookies();
    const resetToken = cookieStore.get("reset_token")?.value;
    if (!resetToken) {
      return NextResponse.json({ error: "Unauthorized or expired reset session." }, { status: 401 });
    }

    // 2. Hash the incoming reset token
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // 3. Find matching active reset token in DB
    const matchingTokens = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, resetTokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    const tokenRecord = matchingTokens[0];
    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired reset session." }, { status: 401 });
    }

    // 4. Hash the new password using Argon2id
    const passwordHash = await argon2.hash(password);

    // 5. Update user password
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, tokenRecord.userId));

    // 6. Invalidate reset token
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    // 7. Clear the cookie
    cookieStore.delete("reset_token");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
