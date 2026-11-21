import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { requireRole } from "@/lib/authz";

export const metadata: Metadata = { title: "Parent dashboard" };

export default async function ParentDashboardPage() {
  const user = await requireRole("PARENT");
  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} description="Your children's attendance and grades." />
      <EmptyState title="Your dashboard is coming together" description="Widgets appear here as the next phases are built." />
    </>
  );
}
