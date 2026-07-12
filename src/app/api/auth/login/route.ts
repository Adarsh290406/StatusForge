import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
    }

    // Rate Limiting
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = existingUsers[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const passwordMatch = await argon2.verify(user.passwordHash, password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in. Check the console for the verification link." },
        { status: 400 }
      );
    }

    const session = await getSession();
    session.userId = user.id;
    session.orgId = user.orgId;
    session.role = user.role;
    await session.save();

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });
  } catch (err) {
    console.error("API Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
