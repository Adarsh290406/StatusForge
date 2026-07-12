import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Reset token is missing." }, { status: 400 });
    }

    if (!password || !confirmPassword) {
      return NextResponse.json({ error: "Password fields are required." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    // 1. Hash the incoming reset token to compare with DB
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find matching active reset token in DB
    const matchingTokens = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    const tokenRecord = matchingTokens[0];
    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    // 3. Hash the new password using Argon2id
    const passwordHash = await argon2.hash(password);

    // 4. Update user password in the DB
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, tokenRecord.userId));

    // 5. Invalidate the reset token
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
