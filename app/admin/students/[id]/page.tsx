import type { Metadata } from "next";
import Link from "next/link";
import { updateStudentAction } from "@/actions/students";
import { ActionButton } from "@/components/admin/action-button";
import { EntityForm } from "@/components/admin/entity-form";
import { studentFields } from "@/components/admin/entity-fields";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/authz";
import { orNotFound } from "@/lib/page-helpers";
import { getStudent } from "@/services/student.service";

export const metadata: Metadata = { title: "Student" };

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("ADMIN");
  const { id } = await params;
  const student = await orNotFound(getStudent(actor, id));
  const active = student.user.status === "ACTIVE";

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{student.user.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{student.studentCode}</span> <StatusBadge status={student.user.status} />
          </p>
        </div>
        <ActionButton
          label={active ? "Deactivate" : "Activate"}
          variant={active ? "destructive" : "default"}
          confirmText={active ? "Deactivate this student? They will no longer be able to sign in." : undefined}
          action={updateStudentAction.bind(null, id, { status: active ? "INACTIVE" : "ACTIVE" })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <EntityForm
              fields={studentFields("edit")}
              initial={{
                name: student.user.name,
                email: student.user.email,
                phone: student.phone ?? "",
                dateOfBirth: student.dateOfBirth?.toISOString().slice(0, 10) ?? "",
                address: student.address ?? "",
              }}
              action={updateStudentAction.bind(null, id)}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Parents</CardTitle></CardHeader>
            <CardContent>
              {student.parentLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No parent linked yet. Link one from the parent&rsquo;s page.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {student.parentLinks.map((l) => (
                    <li key={l.id}>
                      <Link href={`/admin/parents/${l.parent.id}`} className="font-medium text-primary hover:underline">{l.parent.user.name}</Link>
                      {l.relationship && <span className="text-muted-foreground"> · {l.relationship}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Classes</CardTitle></CardHeader>
            <CardContent>
              {student.classes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enrolled in any class yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {student.classes.map((c) => (
                    <li key={c.id}>
                      <span className="font-medium">{c.class.name}</span>
                      <span className="text-muted-foreground"> · {c.class.dayOfWeek.toLowerCase()} {c.class.startTime}–{c.class.endTime}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}