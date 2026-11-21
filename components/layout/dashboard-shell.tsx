import { GraduationCap, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NAV_BY_ROLE } from "@/components/layout/nav-config";
import type { CurrentUser } from "@/lib/authz";

const ROLE_LABEL = { ADMIN: "Administrator", TEACHER: "Teacher", STUDENT: "Student", PARENT: "Parent" } as const;

export function DashboardShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const items = NAV_BY_ROLE[user.role];
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
          <GraduationCap className="h-5 w-5 text-primary" aria-hidden /> ClassHub
        </div>
        <div className="flex-1 p-4">
          <SidebarNav items={items} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="flex items-center gap-2 font-semibold md:hidden">
            <GraduationCap className="h-5 w-5 text-primary" aria-hidden /> ClassHub
          </div>
          <div className="hidden text-sm text-muted-foreground md:block">{ROLE_LABEL[user.role]}</div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </Button>
            </form>
          </div>
        </header>
        <div className="border-b bg-card px-4 py-2 md:hidden">
          <SidebarNav items={items} orientation="horizontal" />
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
