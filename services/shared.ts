import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ConflictError } from "@/lib/errors";

export const PAGE_SIZE = 20;

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const skipTake = (page: number) => ({ skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });

export function pageMeta(total: number, page: number) {
  return { total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function assertEmailFree(email: string, exceptUserId?: string) {
  const existing = await prisma.user.findFirst({
    where: { email, ...(exceptUserId ? { id: { not: exceptUserId } } : {}) },
    select: { id: true },
  });
  if (existing) throw new ConflictError("A user with this email already exists");
}