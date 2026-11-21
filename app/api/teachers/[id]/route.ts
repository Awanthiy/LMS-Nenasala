import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/authz";
import { updateTeacherSchema } from "@/lib/validations/users";
import { getTeacher, updateTeacher } from "@/services/teacher.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    return ok(await getTeacher(actor, id), "Teacher retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    const body = await req.json().catch(() => null);
    return ok(await updateTeacher(actor, id, updateTeacherSchema.parse(body)), "Teacher updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}