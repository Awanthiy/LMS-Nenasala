import type { Metadata } from "next";
import { updateTeacherAction } from "@/actions/teachers";
import { ActionButton } from "@/components/admin/action-button";
import { EntityForm } from "@/components/admin/entity-form";
import { teacherFields } from "@/components/admin/entity-fields";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/authz";
import { orNotFound } from "@/lib/page-helpers";
import { getTeacher, listSubjectOptions } from "@/services/teacher.service";

export const metadata: Metadata = { title: "Teacher" };

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("ADMIN");
  const { id } = await params;
  const [teacher, subjects] = await Promise.all([orNotFound(getTeacher(actor, id)), listSubjectOptions(actor)]);
  const active = teacher.user.status === "ACTIVE";

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{teacher.user.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {teacher.user.email} <StatusBadge status={teacher.user.status} />
          </p>
        </div>
        <ActionButton
          label={active ? "Deactivate" : "Activate"}
          variant={active ? "destructive" : "default"}
          confirmText={active ? "Deactivate this teacher? They will no longer be able to sign in." : undefined}
          action={updateTeacherAction.bind(null, id, { status: active ? "INACTIVE" : "ACTIVE" })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <EntityForm
              fields={teacherFields("edit", subjects)}
              initial={{
                name: teacher.user.name,
                email: teacher.user.email,
                phone: teacher.phone ?? "",
                bio: teacher.bio ?? "",
                subjectIds: teacher.subjects.map((s) => s.id),
              }}
              action={updateTeacherAction.bind(null, id)}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Assigned classes</CardTitle></CardHeader>
          <CardContent>
            {teacher.classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes assigned yet. Class assignment arrives in Phase 3.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {teacher.classes.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground"> · {c.dayOfWeek.toLowerCase()} {c.startTime}–{c.endTime}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}