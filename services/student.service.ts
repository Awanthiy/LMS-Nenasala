import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdmin, type CurrentUser } from "@/lib/authz";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { formatStudentCode } from "@/lib/student-code";
import { assertEmailFree, hashPassword, pageMeta, skipTake } from "@/services/shared";
import type { CreateStudentInput, ListQuery, UpdateStudentInput } from "@/lib/validations/users";

export async function listStudents(actor: CurrentUser, query: ListQuery) {
  assertAdmin(actor);
  const where: Prisma.StudentWhereInput = {
    deletedAt: null,
    user: { deletedAt: null, ...(query.status ? { status: query.status } : {}) },
    ...(query.q
      ? {
          OR: [
            { studentCode: { contains: query.q } },
            { phone: { contains: query.q } },
            { user: { name: { contains: query.q } } },
            { user: { email: { contains: query.q } } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { user: { select: { name: true, email: true, status: true } }, _count: { select: { classes: true } } },
      orderBy: { createdAt: "desc" },
      ...skipTake(query.page),
    }),
    prisma.student.count({ where }),
  ]);
  return { items, ...pageMeta(total, query.page) };
}

export async function getStudent(actor: CurrentUser, id: string) {
  assertAdmin(actor);
  const student = await prisma.student.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: { select: { name: true, email: true, status: true, createdAt: true } },
      parentLinks: {
        include: { parent: { select: { id: true, user: { select: { name: true, email: true } } } } },
      },
      classes: {
        include: { class: { select: { id: true, name: true, dayOfWeek: true, startTime: true, endTime: true } } },
      },
    },
  });
  if (!student) throw new NotFoundError("Student not found");
  return student;
}

async function nextStudentCode(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const last = await tx.student.findFirst({
    where: { studentCode: { startsWith: `STU-${year}-` } },
    orderBy: { studentCode: "desc" },
    select: { studentCode: true },
  });
  const seq = last ? parseInt(last.studentCode.split("-")[2] ?? "0", 10) + 1 : 1;
  return formatStudentCode(seq, year);
}

export async function createStudent(actor: CurrentUser, input: CreateStudentInput) {
  assertAdmin(actor);
  await assertEmailFree(input.email);
  const passwordHash = await hashPassword(input.password);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const studentCode = await nextStudentCode(tx);
        const user = await tx.user.create({
          data: { name: input.name, email: input.email, passwordHash, role: "STUDENT" },
        });
        return tx.student.create({
          data: {
            userId: user.id,
            studentCode,
            phone: input.phone,
            dateOfBirth: input.dateOfBirth,
            address: input.address,
          },
          select: { id: true, studentCode: true },
        });
      });
    } catch (error) {
      const isCodeClash = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isCodeClash || attempt === 2) throw error;
    }
  }
  throw new ConflictError("Could not allocate a student ID. Please try again.");
}

export async function updateStudent(actor: CurrentUser, id: string, input: UpdateStudentInput) {
  assertAdmin(actor);
  const student = await prisma.student.findFirst({ where: { id, deletedAt: null }, select: { userId: true } });
  if (!student) throw new NotFoundError("Student not found");
  if (input.email) await assertEmailFree(input.email, student.userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: student.userId },
      data: { name: input.name, email: input.email, status: input.status },
    }),
    prisma.student.update({
      where: { id },
      data: { phone: input.phone, dateOfBirth: input.dateOfBirth, address: input.address },
    }),
  ]);
  return getStudent(actor, id);
}

/** Active students, optionally excluding ones already linked to a given parent. */
export async function listStudentOptions(actor: CurrentUser, excludeParentId?: string) {
  assertAdmin(actor);
  return prisma.student.findMany({
    where: {
      deletedAt: null,
      user: { status: "ACTIVE", deletedAt: null },
      ...(excludeParentId ? { parentLinks: { none: { parentId: excludeParentId } } } : {}),
    },
    select: { id: true, studentCode: true, user: { select: { name: true } } },
    orderBy: { studentCode: "asc" },
  });
}