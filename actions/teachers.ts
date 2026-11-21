"use server";

import { requireRole } from "@/lib/authz";
import { runAction, type ActionResult } from "@/lib/action-helpers";
import { createTeacherSchema, updateTeacherSchema } from "@/lib/validations/users";
import { createTeacher, updateTeacher } from "@/services/teacher.service";

export async function createTeacherAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    const teacher = await createTeacher(actor, createTeacherSchema.parse(input));
    return { ok: true, message: "Teacher created", redirectTo: `/admin/teachers/${teacher.id}` };
  });
}

export async function updateTeacherAction(id: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    await updateTeacher(actor, id, updateTeacherSchema.parse(input));
    return { ok: true, message: "Teacher updated" };
  });
}