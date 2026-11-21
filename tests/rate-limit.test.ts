import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimit());

  it("allows up to the limit then blocks", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000).allowed).toBe(true);
    expect(rateLimit("k", 3, 1000).allowed).toBe(false);
  });
  it("tracks keys independently", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("b", 1, 1000).allowed).toBe(true);
  });
});
