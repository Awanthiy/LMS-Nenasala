import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/authz";
import { updateStudentSchema } from "@/lib/validations/users";
import { getStudent, updateStudent } from "@/services/student.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    return ok(await getStudent(actor, id), "Student retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    const body = await req.json().catch(() => null);
    return ok(await updateStudent(actor, id, updateStudentSchema.parse(body)), "Student updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}