import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AuthenticationError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";

export function ok<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function fail(message: string, status = 400, errors: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

/** Maps known errors to consistent JSON responses. Never leaks internals. */
export function handleApiError(error: unknown) {
  if (error instanceof ZodError) return fail("Validation failed", 422, error.flatten().fieldErrors);
  if (error instanceof AuthenticationError) return fail(error.message, 401);
  if (error instanceof ForbiddenError) return fail(error.message, 403);
  if (error instanceof NotFoundError) return fail(error.message, 404);
  if (error instanceof ConflictError) return fail(error.message, 409);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return fail("A record with these details already exists", 409);
    if (error.code === "P2025") return fail("Related record not found", 404);
  }
  console.error("[api] unhandled error", error);
  return fail("Something went wrong", 500);
}