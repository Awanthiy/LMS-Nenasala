import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-slate-200 text-slate-700",
  SUSPENDED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STYLES[status] ?? STYLES.INACTIVE)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}