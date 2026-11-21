import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));

const db = vi.hoisted(() => ({
  prisma: {
    student: { count: vi.fn() },
    parentStudent: { count: vi.fn() },
    classStudent: { count: vi.fn() },
    class: { count: vi.fn() },
    user: { findFirst: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => db);

import { assertAdmin, canAccessStudent, type CurrentUser } from "@/lib/authz";

const user = (role: CurrentUser["role"]): CurrentUser => ({
  id: `${role.toLowerCase()}-user`,
  name: "Test",
  email: "t@example.test",
  role,
  image: null,
});

beforeEach(() => vi.clearAllMocks());

describe("canAccessStudent", () => {
  it("parent: query is scoped to the parent's own user id", async () => {
    db.prisma.parentStudent.count.mockResolvedValue(1);
    expect(await canAccessStudent(user("PARENT"), "student-1")).toBe(true);
    expect(db.prisma.parentStudent.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ studentId: "student-1", parent: { userId: "parent-user" } }),
    });
  });

  it("parent: no link means no access", async () => {
    db.prisma.parentStudent.count.mockResolvedValue(0);
    expect(await canAccessStudent(user("PARENT"), "someone-elses-child")).toBe(false);
  });

  it("student: only their own profile", async () => {
    db.prisma.student.count.mockResolvedValue(0);
    expect(await canAccessStudent(user("STUDENT"), "other-student")).toBe(false);
    expect(db.prisma.student.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: "other-student", userId: "student-user" }),
    });
  });

  it("teacher: only students in classes they teach", async () => {
    db.prisma.classStudent.count.mockResolvedValue(0);
    expect(await canAccessStudent(user("TEACHER"), "student-9")).toBe(false);
    expect(db.prisma.classStudent.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        studentId: "student-9",
        class: expect.objectContaining({ teacher: { userId: "teacher-user" } }),
      }),
    });
  });
});

describe("assertAdmin", () => {
  it("allows admin and rejects every other role", () => {
    expect(() => assertAdmin(user("ADMIN"))).not.toThrow();
    for (const role of ["TEACHER", "STUDENT", "PARENT"] as const) {
      expect(() => assertAdmin(user(role))).toThrow();
    }
  });
});