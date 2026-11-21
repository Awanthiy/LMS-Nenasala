import type { Metadata } from "next";
import { createParentAction } from "@/actions/parents";
import { EntityForm } from "@/components/admin/entity-form";
import { parentFields } from "@/components/admin/entity-fields";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/authz";

export const metadata: Metadata = { title: "Add parent" };

export default async function NewParentPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="Add parent" description="You can link children after the parent is created." />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <EntityForm fields={parentFields("create")} action={createParentAction} submitLabel="Create parent" />
        </CardContent>
      </Card>
    </>
  );
}