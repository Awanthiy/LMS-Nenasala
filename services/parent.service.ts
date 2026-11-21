import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdmin, type CurrentUser } from "@/lib/authz";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { assertEmailFree, hashPassword, pageMeta, skipTake } from "@/services/shared";
import type { CreateParentInput, LinkChildInput, ListQuery, UpdateParentInput } from "@/lib/validations/users";

export async function listParents(actor: CurrentUser, query: ListQuery) {
  assertAdmin(actor);
  const where: Prisma.ParentWhereInput = {
    user: { deletedAt: null, ...(query.status ? { status: query.status } : {}) },
    ...(query.q
      ? {
          OR: [
            { phone: { contains: query.q } },
            { user: { name: { contains: query.q } } },
            { user: { email: { contains: query.q } } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.parent.findMany({
      where,
      include: { user: { select: { name: true, email: true, status: true } }, _count: { select: { studentLinks: true } } },
      orderBy: { createdAt: "desc" },
      ...skipTake(query.page),
    }),
    prisma.parent.count({ where }),
  ]);
  return { items, ...pageMeta(total, query.page) };
}

export async function getParent(actor: CurrentUser, id: string) {
  assertAdmin(actor);
  const parent = await prisma.parent.findFirst({
    where: { id, user: { deletedAt: null } },
    include: {
      user: { select: { name: true, email: true, status: true, createdAt: true } },
      studentLinks: {
        orderBy: { createdAt: "asc" },
        include: { student: { select: { id: true, studentCode: true, user: { select: { name: true } } } } },
      },
    },
  });
  if (!parent) throw new NotFoundError("Parent not found");
  return parent;
}

export async function createParent(actor: CurrentUser, input: CreateParentInput) {
  assertAdmin(actor);
  await assertEmailFree(input.email);
  const passwordHash = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: input.name, email: input.email, passwordHash, role: "PARENT" },
    });
    return tx.parent.create({
      data: { userId: user.id, phone: input.phone, address: input.address },
      select: { id: true },
    });
  });
}

export async function updateParent(actor: CurrentUser, id: string, input: UpdateParentInput) {
  assertAdmin(actor);
  const parent = await prisma.parent.findFirst({ where: { id, user: { deletedAt: null } }, select: { userId: true } });
  if (!parent) throw new NotFoundError("Parent not found");
  if (input.email) await assertEmailFree(input.email, parent.userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: parent.userId },
      data: { name: input.name, email: input.email, status: input.status },
    }),
    prisma.parent.update({ where: { id }, data: { phone: input.phone, address: input.address } }),
  ]);
  return getParent(actor, id);
}

export async function linkChild(actor: CurrentUser, parentId: string, input: LinkChildInput) {
  assertAdmin(actor);
  const [parent, student] = await Promise.all([
    prisma.parent.findFirst({ where: { id: parentId, user: { deletedAt: null } }, select: { id: true } }),
    prisma.student.findFirst({ where: { id: input.studentId, deletedAt: null }, select: { id: true } }),
  ]);
  if (!parent) throw new NotFoundError("Parent not found");
  if (!student) throw new NotFoundError("Student not found");

  const existing = await prisma.parentStudent.findUnique({
    where: { parentId_studentId: { parentId, studentId: student.id } },
  });
  if (existing) throw new ConflictError("This student is already linked to the parent");

  return prisma.parentStudent.create({
    data: { parentId, studentId: student.id, relationship: input.relationship },
    select: { id: true },
  });
}

export async function unlinkChild(actor: CurrentUser, parentId: string, studentId: string) {
  assertAdmin(actor);
  const { count } = await prisma.parentStudent.deleteMany({ where: { parentId, studentId } });
  if (count === 0) throw new NotFoundError("Link not found");
}