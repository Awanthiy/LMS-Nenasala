import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdmin, type CurrentUser } from "@/lib/authz";
import { NotFoundError } from "@/lib/errors";
import { assertEmailFree, hashPassword, pageMeta, skipTake } from "@/services/shared";
import type { CreateTeacherInput, ListQuery, UpdateTeacherInput } from "@/lib/validations/users";

export async function listTeachers(actor: CurrentUser, query: ListQuery) {
  assertAdmin(actor);
  const where: Prisma.TeacherWhereInput = {
    user: { deletedAt: null, ...(query.status ? { status: query.status } : {}) },
    ...(query.q
      ? {
          OR: [
            { phone: { contains: query.q } },
            { user: { name: { contains: query.q } } },
            { user: { email: { contains: query.q } } },
            { subjects: { some: { name: { contains: query.q } } } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, status: true } },
        subjects: { select: { id: true, name: true } },
        _count: { select: { classes: true } },
      },
      orderBy: { createdAt: "desc" },
      ...skipTake(query.page),
    }),
    prisma.teacher.count({ where }),
  ]);
  return { items, ...pageMeta(total, query.page) };
}

export async function getTeacher(actor: CurrentUser, id: string) {
  assertAdmin(actor);
  const teacher = await prisma.teacher.findFirst({
    where: { id, user: { deletedAt: null } },
    include: {
      user: { select: { name: true, email: true, status: true, createdAt: true } },
      subjects: { select: { id: true, name: true } },
      classes: {
        where: { deletedAt: null },
        select: { id: true, name: true, dayOfWeek: true, startTime: true, endTime: true, status: true },
      },
    },
  });
  if (!teacher) throw new NotFoundError("Teacher not found");
  return teacher;
}

export async function createTeacher(actor: CurrentUser, input: CreateTeacherInput) {
  assertAdmin(actor);
  await assertEmailFree(input.email);
  const passwordHash = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: input.name, email: input.email, passwordHash, role: "TEACHER" },
    });
    return tx.teacher.create({
      data: {
        userId: user.id,
        phone: input.phone,
        bio: input.bio,
        subjects: { connect: input.subjectIds.map((id) => ({ id })) },
      },
      select: { id: true },
    });
  });
}

export async function updateTeacher(actor: CurrentUser, id: string, input: UpdateTeacherInput) {
  assertAdmin(actor);
  const teacher = await prisma.teacher.findFirst({ where: { id, user: { deletedAt: null } }, select: { userId: true } });
  if (!teacher) throw new NotFoundError("Teacher not found");
  if (input.email) await assertEmailFree(input.email, teacher.userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: teacher.userId },
      data: { name: input.name, email: input.email, status: input.status },
    }),
    prisma.teacher.update({
      where: { id },
      data: {
        phone: input.phone,
        bio: input.bio,
        subjects: input.subjectIds ? { set: input.subjectIds.map((sid) => ({ id: sid })) } : undefined,
      },
    }),
  ]);
  return getTeacher(actor, id);
}

export async function listSubjectOptions(actor: CurrentUser) {
  assertAdmin(actor);
  return prisma.subject.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}