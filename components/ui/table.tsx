import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full text-sm">{children}</table>
  </div>
);
export const THead = ({ children }: { children: React.ReactNode }) => (
  <thead className="border-b bg-muted/50 text-left text-muted-foreground">{children}</thead>
);
export const TBody = ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>;
export const TR = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b last:border-0 hover:bg-muted/30">{children}</tr>
);
export const TH = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("px-4 py-3 font-medium", className)} {...props} />
);
export const TD = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-3", className)} {...props} />
);