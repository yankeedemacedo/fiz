import { describe, expect, it } from "vitest";
import {
  diffDays,
  formatAbsoluteDue,
  formatRelativeDue,
  formatRelativeTime,
  todayKey,
} from "@/lib/dates";

// Fixed "now": 2026-09-27 12:00 local.
const NOW = new Date(2026, 8, 27, 12, 0, 0);

describe("due-date helpers", () => {
  it("todayKey formats local date", () => {
    expect(todayKey(NOW)).toBe("2026-09-27");
  });

  it("diffDays counts calendar days", () => {
    expect(diffDays("2026-09-27", NOW)).toBe(0);
    expect(diffDays("2026-09-28", NOW)).toBe(1);
    expect(diffDays("2026-09-20", NOW)).toBe(-7);
    expect(diffDays("2026-09-28T23:59:59.000Z", NOW)).toBe(1);
  });

  it("formatRelativeDue speaks pt-BR", () => {
    expect(formatRelativeDue("2026-09-27", NOW)).toBe("hoje");
    expect(formatRelativeDue("2026-09-28", NOW)).toBe("amanhã");
    expect(formatRelativeDue("2026-09-26", NOW)).toBe("ontem");
    expect(formatRelativeDue("2026-10-02", NOW)).toBe("em 5 dias");
    expect(formatRelativeDue("2026-09-25", NOW)).toBe("há 2 dias");
  });

  it("formatAbsoluteDue speaks pt-BR", () => {
    const s = formatAbsoluteDue("2026-10-05");
    expect(s).toContain("out");
    expect(s).toContain("2026");
  });
});

describe("formatRelativeTime", () => {
  it("scales from minutes to dates", () => {
    const at = (h: string) => `2026-09-27T${h}`;
    expect(formatRelativeTime(at("11:59:30"), NOW)).toBe("agora mesmo");
    expect(formatRelativeTime(at("11:15:00"), NOW)).toBe("há 45 min");
    expect(formatRelativeTime(at("09:00:00"), NOW)).toBe("há 3 h");
    expect(formatRelativeTime("2026-09-26T12:00:00", NOW)).toBe("ontem");
    expect(formatRelativeTime("2026-09-24T12:00:00", NOW)).toBe("há 3 dias");
    expect(formatRelativeTime("2026-01-05T12:00:00", NOW)).toBe("05/01/2026");
  });
});
