"use server";

import { db } from "@/db";
import { users, orgs } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  success?: boolean;
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

    const newUsers = await db.insert(users).values({
      name,
      email,
      passwordHash,
      orgId,
      role,
    }).returning({ id: users.id });

    const session = await getSession();
    session.userId = newUsers[0].id;
    session.orgId = orgId;
    session.role = role;
    await session.save();
  } catch (err) {
    console.error("Signup error:", err);
    return { error: "Failed to create account. Please try again." };
  }

  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
