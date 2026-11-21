"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { selectClass } from "@/components/admin/list-toolbar";
import type { ActionResult } from "@/lib/action-helpers";

export function LinkChildForm(props: {
  options: { value: string; label: string }[];
  action: (input: { studentId: string; relationship: string }) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (props.options.length === 0) {
    return <p className="text-sm text-muted-foreground">No more students available to link.</p>;
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await props.action({ studentId, relationship });
          setResult(r);
          if (r.ok) {
            setStudentId("");
            setRelationship("");
            router.refresh();
          }
        });
      }}
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="studentId">Student</Label>
        <select id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} className={selectClass}>
          <option value="">Select a student…</option>
          {props.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="space-y-2 sm:w-44">
        <Label htmlFor="relationship">Relationship</Label>
        <Input id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Mother, Father…" />
      </div>
      <Button type="submit" disabled={pending || !studentId}>{pending ? "Linking…" : "Link child"}</Button>
      {result && !result.ok && <p role="alert" className="text-sm text-destructive">{result.message}</p>}
    </form>
  );
}