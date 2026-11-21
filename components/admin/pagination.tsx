import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Pagination(props: { basePath: string; page: number; totalPages: number; total: number; q?: string; status?: string }) {
  const href = (page: number) => {
    const p = new URLSearchParams();
    if (props.q) p.set("q", props.q);
    if (props.status) p.set("status", props.status);
    p.set("page", String(page));
    return `${props.basePath}?${p.toString()}`;
  };
  if (props.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>Page {props.page} of {props.totalPages} · {props.total} total</span>
      <div className="flex gap-2">
        {props.page > 1 && <Button asChild variant="outline" size="sm"><Link href={href(props.page - 1)}>Previous</Link></Button>}
        {props.page < props.totalPages && <Button asChild variant="outline" size="sm"><Link href={href(props.page + 1)}>Next</Link></Button>}
      </div>
    </div>
  );
}