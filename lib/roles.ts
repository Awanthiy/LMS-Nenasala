// Edge-safe (no Prisma import) so it can be used in middleware.
export const ROLES = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard",
};

export const ROLE_PREFIX: Record<Role, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Returns the role that owns a path prefix, or null for shared/public paths. */
export function roleForPath(pathname: string): Role | null {
  for (const role of ROLES) {
    const prefix = ROLE_PREFIX[role];
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return role;
  }
  return null;
}
