import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Creates a reset token for an active user. Callers must respond identically
 * whether or not the email exists (prevents account enumeration).
 * Phase 7 will deliver the link by email; until then it is logged in development only.
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findFirst({ where: { email, status: "ACTIVE", deletedAt: null } });
  if (!user) return;

  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    }),
  ]);

  if (process.env.NODE_ENV !== "production") {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    console.info(`[dev] Password reset link for ${email}: ${base}/reset-password?token=${token}`);
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return false;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, id: { not: record.id } } }),
  ]);
  return true;
}
