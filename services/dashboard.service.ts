import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  const [students, teachers, parents, classes] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null, user: { status: "ACTIVE" } } }),
    prisma.teacher.count({ where: { user: { status: "ACTIVE", deletedAt: null } } }),
    prisma.parent.count({ where: { user: { status: "ACTIVE", deletedAt: null } } }),
    prisma.class.count({ where: { deletedAt: null, status: "ACTIVE" } }),
  ]);
  return { students, teachers, parents, classes };
}
