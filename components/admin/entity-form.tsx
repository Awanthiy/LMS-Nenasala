"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-helpers";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "date" | "textarea" | "checkboxes";
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
};

type Values = Record<string, string | string[]>;

export function EntityForm(props: {
  fields: Field[];
  initial?: Values;
  action: (values: Values) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => {
    const base: Values = {};
    for (const f of props.fields) base[f.name] = props.initial?.[f.name] ?? (f.type === "checkboxes" ? [] : "");
    return base;
  });
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (name: string, value: string | string[]) => setValues((v) => ({ ...v, [name]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const r = await props.action(values);
      setResult(r);
      if (r.ok) {
        if (r.redirectTo) router.push(r.redirectTo);
        else router.refresh();
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {props.fields.map((f) => {
        const error = result?.fieldErrors?.[f.name]?.[0];
        const value = values[f.name];
        return (
          <div key={f.name} className="space-y-2">
            <Label htmlFor={f.name}>
              {f.label}
              {f.required && <span className="text-destructive"> *</span>}
            </Label>
            {f.type === "textarea" ? (
              <textarea
                id={f.name}
                value={value as string}
                onChange={(e) => set(f.name, e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : f.type === "checkboxes" ? (
              <div className="flex flex-wrap gap-4">
                {f.options?.map((o) => {
                  const checked = (value as string[]).includes(o.value);
                  return (
                    <label key={o.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          set(f.name, checked ? (value as string[]).filter((x) => x !== o.value) : [...(value as string[]), o.value])
                        }
                      />
                      {o.label}
                    </label>
                  );
                })}
              </div>
            ) : (
              <Input
                id={f.name}
                type={f.type ?? "text"}
                value={value as string}
                onChange={(e) => set(f.name, e.target.value)}
                autoComplete={f.type === "password" ? "new-password" : "off"}
              />
            )}
            {f.hint && !error && <p className="text-xs text-muted-foreground">{f.hint}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      })}
      {result && !result.ok && result.message && <p role="alert" className="text-sm text-destructive">{result.message}</p>}
      {result?.ok && !result.redirectTo && <p role="status" className="text-sm text-green-700">{result.message}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : props.submitLabel}</Button>
    </form>
  );
}