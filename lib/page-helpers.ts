import { notFound } from "next/navigation";
import { NotFoundError } from "@/lib/errors";

/** Turns a service NotFoundError into Next.js's 404 page. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}