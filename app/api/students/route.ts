import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/authz";
import { createStudentSchema, parseListQuery } from "@/lib/validations/users";
import { createStudent, listStudents } from "@/services/student.service";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireRole("ADMIN");
    const query = parseListQuery(Object.fromEntries(req.nextUrl.searchParams));
    return ok(await listStudents(actor, query), "Students retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    const student = await createStudent(actor, createStudentSchema.parse(body));
    return ok(student, "Student created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}