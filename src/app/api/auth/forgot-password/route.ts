import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkCustomRateLimit } from "@/lib/rate-limit";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

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

      // 5. Build reset URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // 6. Log the reset URL to console as a fallback in dev
      console.log(`\n================================================================================\n[DEV ONLY] Password Reset Link for ${email}:\n${resetUrl}\n================================================================================\n`);

      // 7. Send the actual email using Resend onboarding sandbox domain
      try {
        await resend.emails.send({
          from: "StatusForge <onboarding@resend.dev>",
          to: email,
          subject: "Reset your StatusForge password",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #2563eb;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>You requested a password reset for your StatusForge account. Click the button below to set a new password:</p>
              <div style="margin: 24px 0;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 6px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This link is single-use, valid for 15 minutes, and will expire shortly.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px;">If you did not request this email, you can safely ignore it.</p>
            </div>
          `,
        });
        console.log(`[RESEND] Email successfully sent to ${email}`);
      } catch (emailErr) {
        console.error("[RESEND] Failed to send email via API:", emailErr);
      }
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
