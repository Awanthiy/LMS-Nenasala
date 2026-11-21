"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-helpers";

export function ActionButton(props: {
  label: string;
  action: () => Promise<ActionResult>;
  variant?: ButtonProps["variant"];
  confirmText?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant={props.variant ?? "outline"}
        disabled={pending}
        onClick={() => {
          if (props.confirmText && !window.confirm(props.confirmText)) return;
          setError(null);
          startTransition(async () => {
            const r = await props.action();
            if (r.ok) router.refresh();
            else setError(r.message ?? "Action failed");
          });
        }}
      >
        {pending ? "Working…" : props.label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}