import { describe, expect, it } from "vitest";
import { loginSchema, resetPasswordSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("normalises email", () => {
    const r = loginSchema.parse({ email: "  Admin@ClassHub.test ", password: "x" });
    expect(r.email).toBe("admin@classhub.test");
  });
  it("rejects invalid email and empty password", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const token = "a".repeat(64);
  it("accepts a strong matching password", () => {
    expect(resetPasswordSchema.safeParse({ token, password: "Str0ngPassword", confirmPassword: "Str0ngPassword" }).success).toBe(true);
  });
  it("rejects weak or mismatched passwords", () => {
    expect(resetPasswordSchema.safeParse({ token, password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token, password: "Str0ngPassword", confirmPassword: "Different1Pass" }).success).toBe(false);
  });
});
