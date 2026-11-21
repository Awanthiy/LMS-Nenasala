import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticationError, ForbiddenError, NotFoundError } from "@/lib/errors";
import type { Role } from "@/lib/roles";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image: string | null;
};

/**
 * Resolves the signed-in user from the DB on every call, so deactivated or
 * deleted accounts lose access immediately (not when the JWT expires).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findFirst({
    where: { id: session.user.id, status: "ACTIVE", deletedAt: null },
    select: { id: true, name: true, email: true, role: true, image: true },
  });
  return user ? { ...user, role: user.role as Role } : null;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();
  return user;
}

export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

/**
 * Can this user access this student's data?
 *  ADMIN   → any student
 *  STUDENT → only their own profile
 *  PARENT  → only linked children (parent → parentStudent → student)
 *  TEACHER → only students enrolled in classes they teach
 */
export async function canAccessStudent(user: CurrentUser, studentId: string): Promise<boolean> {
  switch (user.role) {
    case "ADMIN":
      return (await prisma.student.count({ where: { id: studentId, deletedAt: null } })) > 0;
    case "STUDENT":
      return (await prisma.student.count({ where: { id: studentId, userId: user.id, deletedAt: null } })) > 0;
    case "PARENT":
      return (
        (await prisma.parentStudent.count({
          where: { studentId, parent: { userId: user.id }, student: { deletedAt: null } },
        })) > 0
      );
    case "TEACHER":
      return (
        (await prisma.classStudent.count({
          where: { studentId, class: { teacher: { userId: user.id }, deletedAt: null } },
        })) > 0
      );
    default:
      return false;
  }
}

/**
 * Can this user access this class?
 *  ADMIN → any · TEACHER → assigned · STUDENT → enrolled · PARENT → a linked child is enrolled
 */
export async function canAccessClass(user: CurrentUser, classId: string): Promise<boolean> {
  const base = { id: classId, deletedAt: null };
  switch (user.role) {
    case "ADMIN":
      return (await prisma.class.count({ where: base })) > 0;
    case "TEACHER":
      return (await prisma.class.count({ where: { ...base, teacher: { userId: user.id } } })) > 0;
    case "STUDENT":
      return (await prisma.class.count({ where: { ...base, students: { some: { student: { userId: user.id } } } } })) > 0;
    case "PARENT":
      return (
        (await prisma.class.count({
          where: {
            ...base,
            students: { some: { student: { parentLinks: { some: { parent: { userId: user.id } } } } } },
          },
        })) > 0
      );
    default:
      return false;
  }
}

/** Throws NotFound (not Forbidden) so callers can't probe for valid IDs. */
export async function assertCanAccessStudent(user: CurrentUser, studentId: string) {
  if (!(await canAccessStudent(user, studentId))) throw new NotFoundError("Student not found");
}

export async function assertCanAccessClass(user: CurrentUser, classId: string) {
  if (!(await canAccessClass(user, classId))) throw new NotFoundError("Class not found");
}
export function assertAdmin(user: CurrentUser) {
  if (user.role !== "ADMIN") throw new ForbiddenError();
}