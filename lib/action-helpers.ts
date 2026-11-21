import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AuthenticationError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  redirectTo?: string;
};

/** Wraps a server action so errors become friendly results instead of crashes. */
export async function runAction(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ZodError) {
      return { ok: false, message: "Please fix the highlighted fields", fieldErrors: error.flatten().fieldErrors };
    }
    if (
      error instanceof ConflictError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError ||
      error instanceof AuthenticationError
    ) {
      return { ok: false, message: error.message };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "A record with these details already exists" };
    }
    console.error("[action] unexpected error", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}