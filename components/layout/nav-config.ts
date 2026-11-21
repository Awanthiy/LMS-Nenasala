import type { Role } from "@/lib/roles";

export type NavItem = { label: string; href: string; icon: string };

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "layout-dashboard" },
    { label: "Students", href: "/admin/students", icon: "graduation-cap" },
    { label: "Parents", href: "/admin/parents", icon: "users" },
    { label: "Teachers", href: "/admin/teachers", icon: "user-round" },
  ],
  TEACHER: [{ label: "Dashboard", href: "/teacher/dashboard", icon: "layout-dashboard" }],
  STUDENT: [{ label: "Dashboard", href: "/student/dashboard", icon: "layout-dashboard" }],
  PARENT: [{ label: "Dashboard", href: "/parent/dashboard", icon: "layout-dashboard" }],
};