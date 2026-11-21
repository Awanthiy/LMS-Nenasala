import type { Metadata } from "next";
import { createStudentAction } from "@/actions/students";
import { EntityForm } from "@/components/admin/entity-form";
import { studentFields } from "@/components/admin/entity-fields";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/authz";

export const metadata: Metadata = { title: "Add student" };

export default async function NewStudentPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="Add student" description="A unique student ID is generated automatically." />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <EntityForm fields={studentFields("create")} action={createStudentAction} submitLabel="Create student" />
        </CardContent>
      </Card>
    </>
  );
}