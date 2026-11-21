import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { requireRole } from "@/lib/authz";

export const metadata: Metadata = { title: "Student dashboard" };

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");
  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} description="Your classes, courses and progress." />
      <EmptyState title="Your dashboard is coming together" description="Widgets appear here as the next phases are built." />
    </>
  );
}
