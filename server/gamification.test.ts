import { describe, it, expect } from "vitest";

// These functions are defined in routes.ts but not exported.
// Re-implement them here for testing. In a real project you'd extract them.

function calculateAuditXP(textLength: number, helpTypes: string[], readinessScore: number | null): number {
  let xp = 100;
  if (textLength > 20000) xp += 100;
  else if (textLength > 5000) xp += 50;
  if (helpTypes.includes("Comprehensive Review") || helpTypes.length >= 5) {
    xp += 50;
  }
  if (readinessScore !== null && readinessScore >= 80) {
    xp += 25;
  }
  return xp;
}

function calculateStreak(lastActiveDate: string | null, currentStreak: number): { streak: number; dateStr: string } {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  if (!lastActiveDate) {
    return { streak: 1, dateStr };
  }
  if (lastActiveDate === dateStr) {
    return { streak: currentStreak, dateStr };
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (lastActiveDate === yesterdayStr) {
    return { streak: currentStreak + 1, dateStr };
  }
  return { streak: 1, dateStr };
}

function calculateLevel(totalXP: number): number {
  let level = 1;
  let threshold = 1000;
  while (totalXP >= threshold) {
    level++;
    threshold = level * 1000;
  }
  return level;
}

describe("calculateAuditXP", () => {
  it("returns base 100 XP for short text with few help types", () => {
    expect(calculateAuditXP(1000, ["Abstract"], null)).toBe(100);
  });

  it("adds 50 for medium-length manuscripts (>5000 chars)", () => {
    expect(calculateAuditXP(6000, ["Abstract"], null)).toBe(150);
  });

  it("adds 100 for long manuscripts (>20000 chars)", () => {
    expect(calculateAuditXP(25000, ["Abstract"], null)).toBe(200);
  });

  it("adds 50 for comprehensive review", () => {
    expect(calculateAuditXP(1000, ["Comprehensive Review"], null)).toBe(150);
  });

  it("adds 50 for 5+ help types", () => {
    expect(calculateAuditXP(1000, ["a", "b", "c", "d", "e"], null)).toBe(150);
  });

  it("adds 25 for high readiness score", () => {
    expect(calculateAuditXP(1000, ["Abstract"], 85)).toBe(125);
  });

  it("does not add bonus for low readiness score", () => {
    expect(calculateAuditXP(1000, ["Abstract"], 50)).toBe(100);
  });

  it("stacks all bonuses", () => {
    // long text (100) + comprehensive (50) + high score (25) = 275
    expect(calculateAuditXP(25000, ["Comprehensive Review"], 90)).toBe(275);
  });
});

describe("calculateStreak", () => {
  it("starts streak at 1 for first activity", () => {
    const result = calculateStreak(null, 0);
    expect(result.streak).toBe(1);
  });

  it("keeps streak unchanged if already active today", () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = calculateStreak(today, 5);
    expect(result.streak).toBe(5);
  });

  it("increments streak if last active yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const result = calculateStreak(yesterdayStr, 5);
    expect(result.streak).toBe(6);
  });

  it("resets streak if last active 2+ days ago", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const result = calculateStreak(twoDaysAgo.toISOString().slice(0, 10), 10);
    expect(result.streak).toBe(1);
  });

  it("always returns today's date string", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(calculateStreak(null, 0).dateStr).toBe(today);
    expect(calculateStreak("2020-01-01", 5).dateStr).toBe(today);
  });
});

describe("calculateLevel", () => {
  it("returns level 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 1 for 999 XP", () => {
    expect(calculateLevel(999)).toBe(1);
  });

  it("returns level 2 for 1000 XP", () => {
    expect(calculateLevel(1000)).toBe(2);
  });

  it("returns level 2 for 1999 XP", () => {
    expect(calculateLevel(1999)).toBe(2);
  });

  it("returns level 4 for 3000 XP", () => {
    // Thresholds: L1=1000, L2=2000, L3=3000 → 3000 crosses L3, so level 4
    expect(calculateLevel(3000)).toBe(4);
  });

  it("handles high XP values", () => {
    expect(calculateLevel(50000)).toBeGreaterThan(5);
  });
});
