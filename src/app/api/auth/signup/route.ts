import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, orgs, emailVerificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, password, orgName } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers[0]) {
      return NextResponse.json({ error: "A user with that email already exists." }, { status: 400 });
    }

    // Determine if this is the first user ever
    const allUsers = await db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = allUsers.length === 0;

    let orgId: string;
    let role: "owner" | "admin" = "admin";

    if (isFirstUser) {
      if (!orgName) {
        return NextResponse.json(
          { error: "Since this is the first account, please specify an Organization Name." },
          { status: 400 }
        );
      }

      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const newOrgs = await db.insert(orgs).values({
        name: orgName,
        slug,
      }).returning({ id: orgs.id });

      orgId = newOrgs[0].id;
      role = "owner";
    } else {
      const existingOrgs = await db.select().from(orgs).limit(1);
      if (existingOrgs.length === 0) {
        return NextResponse.json(
          { error: "No organization exists yet. The first user must create it." },
          { status: 400 }
        );
      }
      orgId = existingOrgs[0].id;
    }

    const passwordHash = await argon2.hash(password);

    // Save user with emailVerified = false
    const newUsers = await db.insert(users).values({
      name,
      email,
      passwordHash,
      orgId,
      role,
      emailVerified: false,
    }).returning({ id: users.id, email: users.email, name: users.name, role: users.role, emailVerified: users.emailVerified });

    const createdUser = newUsers[0];

    // Generate random 32-byte email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Store in emailVerificationTokens table (24 hours TTL)
    await db.insert(emailVerificationTokens).values({
      userId: createdUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      used: false,
    });

    // Log the verification link to the console
    console.log(`\n================================================================================\n[DEV ONLY] Email Verification Link for ${email}:\nhttp://localhost:3000/verify-email?token=${token}\n================================================================================\n`);

    return NextResponse.json(createdUser);
  } catch (err) {
    console.error("API Signup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
