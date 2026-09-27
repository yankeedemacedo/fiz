import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins strings and ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("supports numbers and nested arrays", () => {
    expect(cn("a", 0, ["b", ["c"]])).toBe("a 0 b c");
  });

  it("supports record maps", () => {
    expect(cn({ active: true, hidden: false, shown: 1 as unknown as boolean })).toBe(
      "active shown",
    );
  });

  it("returns empty string for empty input", () => {
    expect(cn()).toBe("");
  });
});
