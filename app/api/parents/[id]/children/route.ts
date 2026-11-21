import type { NextRequest } from "next/server";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/authz";
import { linkChildSchema } from "@/lib/validations/users";
import { linkChild, unlinkChild } from "@/services/parent.service";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/parents/:id/children   body: { studentId, relationship? }
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    const body = await req.json().catch(() => null);
    return ok(await linkChild(actor, id, linkChildSchema.parse(body)), "Child linked successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/parents/:id/children?studentId=...
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    const studentId = req.nextUrl.searchParams.get("studentId");
    if (!studentId) return fail("studentId is required", 422, { studentId: ["Required"] });
    await unlinkChild(actor, id, studentId);
    return ok(null, "Child unlinked successfully");
  } catch (error) {
    return handleApiError(error);
  }
}