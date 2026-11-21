import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { requireRole } from "@/lib/authz";

export const metadata: Metadata = { title: "Teacher dashboard" };

export default async function TeacherDashboardPage() {
  const user = await requireRole("TEACHER");
  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} description="Your classes and students." />
      <EmptyState title="Your dashboard is coming together" description="Widgets appear here as the next phases are built." />
    </>
  );
}
