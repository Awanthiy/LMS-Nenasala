import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/authz";
import { createParentSchema, parseListQuery } from "@/lib/validations/users";
import { createParent, listParents } from "@/services/parent.service";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireRole("ADMIN");
    const query = parseListQuery(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await listParents(actor, query), "Parents retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    return ok(await createParent(actor, createParentSchema.parse(body)), "Parent created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}