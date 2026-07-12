"use server";

import { db } from "@/db";
import { users, orgs, emailVerificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import crypto from "crypto";

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please fill in all fields." };
  }

  // Rate Limiting
  const rateLimit = checkRateLimit(email);
  if (!rateLimit.allowed) {
    return { error: "Too many login attempts. Please try again in 15 minutes." };
  }

  try {
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = existingUsers[0];

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const passwordMatch = await argon2.verify(user.passwordHash, password);
    if (!passwordMatch) {
      return { error: "Invalid email or password." };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        error: "Please verify your email before logging in. Check the console for the verification link.",
      };
    }

    const session = await getSession();
    session.userId = user.id;
    session.orgId = user.orgId;
    session.role = user.role;
    await session.save();
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/admin");
}

export async function signup(state: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const orgName = formData.get("orgName") as string;

  if (!name || !email || !password) {
    return { error: "Please fill in all fields." };
  }

  try {
    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers[0]) {
      return { error: "A user with that email already exists." };
    }

    // Determine if this is the first user ever (which makes them owner & prompts org creation)
    const allUsers = await db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = allUsers.length === 0;

    let orgId: string;
    let role: "owner" | "admin" = "admin";

    if (isFirstUser) {
      if (!orgName) {
        return { error: "Since this is the first account, please specify an Organization Name." };
      }

      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const newOrgs = await db.insert(orgs).values({
        name: orgName,
        slug,
      }).returning({ id: orgs.id });

      orgId = newOrgs[0].id;
      role = "owner";
    } else {
      // Subsequent signups join the existing first org for simplicity (single org MVP rule)
      const existingOrgs = await db.select().from(orgs).limit(1);
      if (existingOrgs.length === 0) {
        return { error: "No organization exists yet. The first user must create it." };
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
    }).returning({ id: users.id });

    // Generate random 32-byte email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Store in emailVerificationTokens table (24 hours TTL)
    await db.insert(emailVerificationTokens).values({
      userId: newUsers[0].id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      used: false,
    });

    // Log the verification link to the console
    console.log(`\n================================================================================\n[DEV ONLY] Email Verification Link for ${email}:\nhttp://localhost:3000/verify-email?token=${token}\n================================================================================\n`);

  } catch (err) {
    console.error("Signup error:", err);
    return { error: "Failed to create account. Please try again." };
  }

  // Redirect to login page with a query flag pointing out they need verification link
  redirect("/login?registered=true");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
