"use server";

import { requireRole } from "@/lib/authz";
import { runAction, type ActionResult } from "@/lib/action-helpers";
import { createParentSchema, linkChildSchema, updateParentSchema } from "@/lib/validations/users";
import { createParent, linkChild, unlinkChild, updateParent } from "@/services/parent.service";

export async function createParentAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    const parent = await createParent(actor, createParentSchema.parse(input));
    return { ok: true, message: "Parent created", redirectTo: `/admin/parents/${parent.id}` };
  });
}

export async function updateParentAction(id: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    await updateParent(actor, id, updateParentSchema.parse(input));
    return { ok: true, message: "Parent updated" };
  });
}

export async function linkChildAction(parentId: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    await linkChild(actor, parentId, linkChildSchema.parse(input));
    return { ok: true, message: "Child linked" };
  });
}

export async function unlinkChildAction(parentId: string, studentId: string): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireRole("ADMIN");
    await unlinkChild(actor, parentId, studentId);
    return { ok: true, message: "Child unlinked" };
  });
}