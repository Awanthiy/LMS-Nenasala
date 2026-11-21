import { describe, expect, it } from "vitest";
import { formatStudentCode } from "@/lib/student-code";
import { createStudentSchema, parseListQuery, updateStudentSchema } from "@/lib/validations/users";

const base = { name: "Amal Perera", email: "Amal@Example.test", password: "Str0ngPassword" };

describe("createStudentSchema", () => {
  it("normalises email and turns empty optional fields into null", () => {
    const r = createStudentSchema.parse({ ...base, phone: "", dateOfBirth: "", address: "" });
    expect(r.email).toBe("amal@example.test");
    expect(r.phone).toBeNull();
    expect(r.dateOfBirth).toBeNull();
  });

  it("rejects a future date of birth and a bad phone number", () => {
    expect(createStudentSchema.safeParse({ ...base, dateOfBirth: "2999-01-01" }).success).toBe(false);
    expect(createStudentSchema.safeParse({ ...base, phone: "abc" }).success).toBe(false);
  });
});

describe("updateStudentSchema", () => {
  it("leaves missing fields undefined so they are not overwritten", () => {
    const r = updateStudentSchema.parse({ status: "INACTIVE" });
    expect(r.status).toBe("INACTIVE");
    expect(r.phone).toBeUndefined();
    expect(r.name).toBeUndefined();
  });

  it("does not accept a password change", () => {
    const r = updateStudentSchema.parse({ name: "New Name", password: "x" } as never);
    expect("password" in r).toBe(false);
  });
});

describe("parseListQuery", () => {
  it("defaults the page and ignores bad values", () => {
    expect(parseListQuery({}).page).toBe(1);
    expect(parseListQuery({ page: "abc", status: "WRONG" })).toMatchObject({ page: 1, status: undefined });
  });
  it("reads search and status", () => {
    expect(parseListQuery({ q: " amal ", status: "ACTIVE", page: "2" })).toEqual({ q: "amal", status: "ACTIVE", page: 2 });
  });
});

describe("formatStudentCode", () => {
  it("pads the sequence", () => {
    expect(formatStudentCode(21, 2026)).toBe("STU-2026-0021");
  });
});