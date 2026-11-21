import type { Role } from "@/lib/roles";

export type NavItem = { label: string; href: string; icon: string };

// Later phases add entries here; the sidebar renders whatever the role has.
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [{ label: "Dashboard", href: "/admin/dashboard", icon: "layout-dashboard" }],
  TEACHER: [{ label: "Dashboard", href: "/teacher/dashboard", icon: "layout-dashboard" }],
  STUDENT: [{ label: "Dashboard", href: "/student/dashboard", icon: "layout-dashboard" }],
  PARENT: [{ label: "Dashboard", href: "/parent/dashboard", icon: "layout-dashboard" }],
};
