import type { Metadata } from "next";
import Link from "next/link";
import { linkChildAction, unlinkChildAction, updateParentAction } from "@/actions/parents";
import { ActionButton } from "@/components/admin/action-button";
import { EntityForm } from "@/components/admin/entity-form";
import { parentFields } from "@/components/admin/entity-fields";
import { LinkChildForm } from "@/components/admin/link-child-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/authz";
import { orNotFound } from "@/lib/page-helpers";
import { getParent } from "@/services/parent.service";
import { listStudentOptions } from "@/services/student.service";

export const metadata: Metadata = { title: "Parent" };

export default async function ParentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("ADMIN");
  const { id } = await params;
  const parent = await orNotFound(getParent(actor, id));
  const options = await listStudentOptions(actor, id);
  const active = parent.user.status === "ACTIVE";

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{parent.user.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {parent.user.email} <StatusBadge status={parent.user.status} />
          </p>
        </div>
        <ActionButton
          label={active ? "Deactivate" : "Activate"}
          variant={active ? "destructive" : "default"}
          confirmText={active ? "Deactivate this parent? They will no longer be able to sign in." : undefined}
          action={updateParentAction.bind(null, id, { status: active ? "INACTIVE" : "ACTIVE" })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <EntityForm
              fields={parentFields("edit")}
              initial={{ name: parent.user.name, email: parent.user.email, phone: parent.phone ?? "", address: parent.address ?? "" }}
              action={updateParentAction.bind(null, id)}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Children</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {parent.studentLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No children linked yet.</p>
            ) : (
              <ul className="divide-y text-sm">
                {parent.studentLinks.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2">
                    <div>
                      <Link href={`/admin/students/${l.student.id}`} className="font-medium text-primary hover:underline">{l.student.user.name}</Link>
                      <span className="text-muted-foreground"> · {l.student.studentCode}{l.relationship ? ` · ${l.relationship}` : ""}</span>
                    </div>
                    <ActionButton
                      label="Remove"
                      confirmText={`Remove ${l.student.user.name} from this parent?`}
                      action={unlinkChildAction.bind(null, id, l.student.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
            <LinkChildForm
              options={options.map((s) => ({ value: s.id, label: `${s.user.name} (${s.studentCode})` }))}
              action={linkChildAction.bind(null, id)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}