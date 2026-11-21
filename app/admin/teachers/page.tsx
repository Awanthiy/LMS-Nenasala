import type { Metadata } from "next";
import Link from "next/link";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireRole } from "@/lib/authz";
import { parseListQuery } from "@/lib/validations/users";
import { listTeachers } from "@/services/teacher.service";

export const metadata: Metadata = { title: "Teachers" };

export default async function TeachersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireRole("ADMIN");
  const query = parseListQuery(await searchParams);
  const data = await listTeachers(actor, query);

  return (
    <>
      <PageHeader title="Teachers" description={`${data.total} teacher${data.total === 1 ? "" : "s"}`} />
      <ListToolbar action="/admin/teachers" q={query.q} status={query.status} addHref="/admin/teachers/new" addLabel="Add teacher" />
      {data.items.length === 0 ? (
        <EmptyState title="No teachers found" description="Try a different search, or add a new teacher." />
      ) : (
        <Card>
          <Table>
            <THead>
              <tr><TH>Name</TH><TH>Email</TH><TH>Subjects</TH><TH>Classes</TH><TH>Status</TH></tr>
            </THead>
            <TBody>
              {data.items.map((t) => (
                <TR key={t.id}>
                  <TD><Link href={`/admin/teachers/${t.id}`} className="font-medium text-primary hover:underline">{t.user.name}</Link></TD>
                  <TD>{t.user.email}</TD>
                  <TD>{t.subjects.map((s) => s.name).join(", ") || "—"}</TD>
                  <TD>{t._count.classes}</TD>
                  <TD><StatusBadge status={t.user.status} /></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
      <Pagination basePath="/admin/teachers" page={data.page} totalPages={data.totalPages} total={data.total} q={query.q} status={query.status} />
    </>
  );
}