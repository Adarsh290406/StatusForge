import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const wantsJson = req.headers.get("accept")?.includes("application/json");

    if (!token) {
      if (wantsJson) {
        return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
      }
      return NextResponse.redirect(new URL("/login?verifyError=missing_token", req.url));
    }

    // 1. Hash incoming token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Query active token in DB
    const matchingTokens = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          eq(emailVerificationTokens.used, false),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    const tokenRecord = matchingTokens[0];
    if (!tokenRecord) {
      if (wantsJson) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
      }
      return NextResponse.redirect(new URL("/login?verifyError=invalid_or_expired", req.url));
    }

    // 3. Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ used: true })
      .where(eq(emailVerificationTokens.id, tokenRecord.id));

    // 4. Set user emailVerified = true
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, tokenRecord.userId));

    // 5. Respond
    if (wantsJson) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (err) {
    console.error("Verify email endpoint error:", err);
    if (req.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/login?verifyError=server_error", req.url));
  }
}
