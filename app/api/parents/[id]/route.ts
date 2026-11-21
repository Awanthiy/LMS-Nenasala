import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/authz";
import { updateParentSchema } from "@/lib/validations/users";
import { getParent, updateParent } from "@/services/parent.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    return ok(await getParent(actor, id), "Parent retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    const body = await req.json().catch(() => null);
    return ok(await updateParent(actor, id, updateParentSchema.parse(body)), "Parent updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}