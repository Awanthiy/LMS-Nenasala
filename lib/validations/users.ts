import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/validations/auth";

export const statusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);

const name = z.string().trim().min(2, "Name is required").max(100);

// Empty string → null (clears the field). Missing → undefined (leaves it unchanged on update).
const emptyToNull = (v: string | undefined) => (v === undefined ? undefined : v === "" ? null : v);

const optionalText = (max: number) => z.string().trim().max(max).optional().transform(emptyToNull);

const optionalPhone = z
  .string()
  .trim()
  .max(20)
  .regex(/^[+0-9 ()-]*$/, "Invalid phone number")
  .optional()
  .transform(emptyToNull);

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (v === undefined) return undefined;
    if (v === "") return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date of birth" });
      return z.NEVER;
    }
    return d;
  });

// ───── Students ─────
export const createStudentSchema = z.object({
  name,
  email: emailSchema,
  password: passwordSchema,
  phone: optionalPhone,
  dateOfBirth: optionalDate,
  address: optionalText(255),
});
export const updateStudentSchema = createStudentSchema
  .omit({ password: true })
  .partial()
  .extend({ status: statusSchema.optional() });

// ───── Parents ─────
export const createParentSchema = z.object({
  name,
  email: emailSchema,
  password: passwordSchema,
  phone: optionalPhone,
  address: optionalText(255),
});
export const updateParentSchema = createParentSchema
  .omit({ password: true })
  .partial()
  .extend({ status: statusSchema.optional() });

export const linkChildSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  relationship: optionalText(50),
});

// ───── Teachers ─────
export const createTeacherSchema = z.object({
  name,
  email: emailSchema,
  password: passwordSchema,
  phone: optionalPhone,
  bio: optionalText(2000),
  subjectIds: z.array(z.string().min(1)).max(20).default([]),
});
export const updateTeacherSchema = createTeacherSchema
  .omit({ password: true })
  .partial()
  .extend({ status: statusSchema.optional() });

// ───── List query (search / filter / page) ─────
export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional().transform((v) => v || undefined).catch(undefined),
  status: z.preprocess((v) => (v === "" ? undefined : v), statusSchema.optional()).catch(undefined),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

export function parseListQuery(params: Record<string, string | string[] | undefined>) {
  const flat = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  return listQuerySchema.parse(flat);
}

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateParentInput = z.infer<typeof createParentSchema>;
export type UpdateParentInput = z.infer<typeof updateParentSchema>;
export type LinkChildInput = z.infer<typeof linkChildSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;