import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/authz";

// Pattern every API route follows: authenticate → authorize → validate → respond.
export async function GET() {
  try {
    const user = await requireUser();
    return ok(user, "Current user retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
