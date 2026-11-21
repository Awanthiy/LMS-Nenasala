"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { requestPasswordReset, resetPassword } from "@/services/password-reset.service";

export type ActionResult = { ok: boolean; message?: string; fieldErrors?: Record<string, string[] | undefined> };

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid email or password" };

  const ip = await clientIp();
  const limited = rateLimit(`login:${ip}:${parsed.data.email}`, 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return { ok: false, message: "Too many attempts. Please try again in a few minutes." };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/" });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, message: "Invalid email or password" };
    throw error; // lets Next.js handle the redirect
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const ip = await clientIp();
  const limited = rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.allowed) return { ok: false, message: "Too many requests. Please try again later." };

  await requestPasswordReset(parsed.data.email);
  return { ok: true, message: "If an account exists for that email, a reset link has been sent." };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const ip = await clientIp();
  const limited = rateLimit(`reset:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.allowed) return { ok: false, message: "Too many attempts. Please try again later." };

  const done = await resetPassword(parsed.data.token, parsed.data.password);
  return done
    ? { ok: true, message: "Password updated. You can now sign in." }
    : { ok: false, message: "This reset link is invalid or has expired." };
}
