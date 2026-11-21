import type { Field } from "@/components/admin/entity-form";

const passwordField: Field = {
  name: "password",
  label: "Temporary password",
  type: "password",
  required: true,
  hint: "At least 10 characters with upper case, lower case and a number.",
};

export const studentFields = (mode: "create" | "edit"): Field[] => [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  ...(mode === "create" ? [passwordField] : []),
  { name: "phone", label: "Phone" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  { name: "address", label: "Address", type: "textarea" },
];

export const parentFields = (mode: "create" | "edit"): Field[] => [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  ...(mode === "create" ? [passwordField] : []),
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address", type: "textarea" },
];

export const teacherFields = (mode: "create" | "edit", subjects: { id: string; name: string }[]): Field[] => [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  ...(mode === "create" ? [passwordField] : []),
  { name: "phone", label: "Phone" },
  { name: "bio", label: "Bio", type: "textarea" },
  ...(subjects.length > 0
    ? [{ name: "subjectIds", label: "Subjects", type: "checkboxes" as const, options: subjects.map((s) => ({ value: s.id, label: s.name })) }]
    : []),
];