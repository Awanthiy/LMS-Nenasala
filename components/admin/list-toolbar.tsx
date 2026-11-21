import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ListToolbar(props: { action: string; q?: string; status?: string; addHref: string; addLabel: string }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form action={props.action} method="GET" className="flex flex-1 flex-col gap-2 sm:flex-row">
        <Input name="q" defaultValue={props.q ?? ""} placeholder="Search name, email, phone…" className="sm:max-w-xs" />
        <select name="status" defaultValue={props.status ?? ""} className={`${selectClass} sm:w-40`} aria-label="Status">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <Button type="submit" variant="outline">Search</Button>
        {(props.q || props.status) && (
          <Button asChild variant="ghost"><Link href={props.action}>Clear</Link></Button>
        )}
      </form>
      <Button asChild>
        <Link href={props.addHref}><Plus className="h-4 w-4" aria-hidden /> {props.addLabel}</Link>
      </Button>
    </div>
  );
}