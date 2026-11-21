import { describe, expect, it } from "vitest";
import { ROLE_HOME, isRole, roleForPath } from "@/lib/roles";

describe("roles", () => {
  it("maps path prefixes to the owning role", () => {
    expect(roleForPath("/admin/dashboard")).toBe("ADMIN");
    expect(roleForPath("/teacher")).toBe("TEACHER");
    expect(roleForPath("/student/classes/1")).toBe("STUDENT");
    expect(roleForPath("/parent/dashboard")).toBe("PARENT");
  });

  it("does not treat look-alike prefixes as protected areas", () => {
    expect(roleForPath("/administrator")).toBeNull();
    expect(roleForPath("/login")).toBeNull();
  });

  it("validates role values", () => {
    expect(isRole("ADMIN")).toBe(true);
    expect(isRole("admin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });

  it("has a home route for every role", () => {
    expect(Object.keys(ROLE_HOME).sort()).toEqual(["ADMIN", "PARENT", "STUDENT", "TEACHER"]);
  });
});
