import type { Metadata } from "next";
import { BookOpen, GraduationCap, UserRound, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/authz";
import { getAdminOverview } from "@/services/dashboard.service";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const overview = await getAdminOverview();
  const stats = [
    { label: "Students", value: overview.students, icon: GraduationCap },
    { label: "Teachers", value: overview.teachers, icon: UserRound },
    { label: "Parents", value: overview.parents, icon: Users },
    { label: "Active classes", value: overview.classes, icon: BookOpen },
  ];
  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your tuition centre." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent><div className="text-3xl font-semibold">{value}</div></CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
