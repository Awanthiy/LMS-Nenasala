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
import { listStudents } from "@/services/student.service";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireRole("ADMIN");
  const query = parseListQuery(await searchParams);
  const data = await listStudents(actor, query);

  return (
    <>
      <PageHeader title="Students" description={`${data.total} student${data.total === 1 ? "" : "s"}`} />
      <ListToolbar action="/admin/students" q={query.q} status={query.status} addHref="/admin/students/new" addLabel="Add student" />
      {data.items.length === 0 ? (
        <EmptyState title="No students found" description="Try a different search, or add a new student." />
      ) : (
        <Card>
          <Table>
            <THead>
              <tr><TH>ID</TH><TH>Name</TH><TH>Email</TH><TH>Phone</TH><TH>Classes</TH><TH>Status</TH></tr>
            </THead>
            <TBody>
              {data.items.map((s) => (
                <TR key={s.id}>
                  <TD className="font-mono text-xs">{s.studentCode}</TD>
                  <TD><Link href={`/admin/students/${s.id}`} className="font-medium text-primary hover:underline">{s.user.name}</Link></TD>
                  <TD>{s.user.email}</TD>
                  <TD>{s.phone ?? "—"}</TD>
                  <TD>{s._count.classes}</TD>
                  <TD><StatusBadge status={s.user.status} /></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
      <Pagination basePath="/admin/students" page={data.page} totalPages={data.totalPages} total={data.total} q={query.q} status={query.status} />
    </>
  );
}