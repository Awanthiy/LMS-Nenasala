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
import { listParents } from "@/services/parent.service";

export const metadata: Metadata = { title: "Parents" };

export default async function ParentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireRole("ADMIN");
  const query = parseListQuery(await searchParams);
  const data = await listParents(actor, query);

  return (
    <>
      <PageHeader title="Parents" description={`${data.total} parent${data.total === 1 ? "" : "s"}`} />
      <ListToolbar action="/admin/parents" q={query.q} status={query.status} addHref="/admin/parents/new" addLabel="Add parent" />
      {data.items.length === 0 ? (
        <EmptyState title="No parents found" description="Try a different search, or add a new parent." />
      ) : (
        <Card>
          <Table>
            <THead>
              <tr><TH>Name</TH><TH>Email</TH><TH>Phone</TH><TH>Children</TH><TH>Status</TH></tr>
            </THead>
            <TBody>
              {data.items.map((p) => (
                <TR key={p.id}>
                  <TD><Link href={`/admin/parents/${p.id}`} className="font-medium text-primary hover:underline">{p.user.name}</Link></TD>
                  <TD>{p.user.email}</TD>
                  <TD>{p.phone ?? "—"}</TD>
                  <TD>{p._count.studentLinks}</TD>
                  <TD><StatusBadge status={p.user.status} /></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
      <Pagination basePath="/admin/parents" page={data.page} totalPages={data.totalPages} total={data.total} q={query.q} status={query.status} />
    </>
  );
}