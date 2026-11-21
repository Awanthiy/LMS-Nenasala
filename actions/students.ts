"use server";

import { requireRole } from "@/lib/authz";
import { runAction, type ActionResult } from "@/lib/action-helpers";
import { createStudentSchema, updateStudentSchema } from "@/lib/validations/users";
import { createStudent, updateStudent } from "@/services/student.service";

export async function createStudentAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    const student = await createStudent(actor, createStudentSchema.parse(input));
    return { ok: true, message: "Student created", redirectTo: `/admin/students/${student.id}` };
  });
}

export async function updateStudentAction(id: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    await updateStudent(actor, id, updateStudentSchema.parse(input));
    return { ok: true, message: "Student updated" };
  });
}