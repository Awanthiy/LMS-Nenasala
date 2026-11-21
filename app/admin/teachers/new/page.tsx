import type { Metadata } from "next";
import { createTeacherAction } from "@/actions/teachers";
import { EntityForm } from "@/components/admin/entity-form";
import { teacherFields } from "@/components/admin/entity-fields";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/authz";
import { listSubjectOptions } from "@/services/teacher.service";

export const metadata: Metadata = { title: "Add teacher" };

export default async function NewTeacherPage() {
  const actor = await requireRole("ADMIN");
  const subjects = await listSubjectOptions(actor);
  return (
    <>
      <PageHeader title="Add teacher" description="Assign subjects now or later." />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <EntityForm fields={teacherFields("create", subjects)} action={createTeacherAction} submitLabel="Create teacher" />
        </CardContent>
      </Card>
    </>
  );
}