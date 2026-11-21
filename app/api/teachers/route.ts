import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/authz";
import { createTeacherSchema, parseListQuery } from "@/lib/validations/users";
import { createTeacher, listTeachers } from "@/services/teacher.service";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireRole("ADMIN");
    const query = parseListQuery(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await listTeachers(actor, query), "Teachers retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    return ok(await createTeacher(actor, createTeacherSchema.parse(body)), "Teacher created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}