/**
 * Tests for app search helper functions
 */

import { describe, it, expect } from "vitest";
import {
  isFlexibleNameMatch,
  boostAISuggestedApps,
  addMissingAISuggestedApps,
  boostCategoryMatches,
  addMissingCategoryMatches,
} from "./app-search-helpers";
import { AppSearchResult } from "../../types";

describe("app search helpers", () => {
  describe("isFlexibleNameMatch", () => {
    it("should match exact names case-insensitively", () => {
      expect(isFlexibleNameMatch("Google Chrome", "Google Chrome")).toBe(true);
      expect(isFlexibleNameMatch("google chrome", "GOOGLE CHROME")).toBe(true);
    });

    it("should match partial names", () => {
      expect(isFlexibleNameMatch("Visual Studio Code", "Code")).toBe(true);
      expect(isFlexibleNameMatch("Visual Studio Code", "Studio")).toBe(true);
      expect(isFlexibleNameMatch("Google Chrome", "Chrome")).toBe(true);
    });

    it("should match with different cases", () => {
      expect(isFlexibleNameMatch("Safari", "safari")).toBe(true);
      expect(isFlexibleNameMatch("safari", "SAFARI")).toBe(true);
      expect(isFlexibleNameMatch("Firefox Developer Edition", "firefox")).toBe(true);
    });

    it("should not match abbreviated names that don't appear in the full name", () => {
      expect(isFlexibleNameMatch("Visual Studio Code", "vscode")).toBe(false);
      expect(isFlexibleNameMatch("Visual Studio Code", "VS Code")).toBe(false);
    });

    it("should not match unrelated names", () => {
      expect(isFlexibleNameMatch("Google Chrome", "Firefox")).toBe(false);
      expect(isFlexibleNameMatch("Safari", "Chrome")).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(isFlexibleNameMatch("Google Chrome", "")).toBe(true);
      expect(isFlexibleNameMatch("", "Chrome")).toBe(false);
    });
  });

  describe("boostAISuggestedApps", () => {
    it("should boost scores for AI-suggested apps", () => {
      const results: AppSearchResult[] = [
        {
          app: { name: "Google Chrome", bundleId: "com.google.Chrome", path: "/Applications/Chrome.app" },
          matchScore: 80,
          matchReason: "Fuzzy match",
        },
        {
          app: { name: "Safari", bundleId: "com.apple.Safari", path: "/Applications/Safari.app" },
          matchScore: 70,
          matchReason: "Fuzzy match",
        },
      ];

      const boosted = boostAISuggestedApps(results, ["Chrome"]);

      expect(boosted[0]!.matchScore).toBe(95); // 80 + 15
      expect(boosted[0]!.matchReason).toBe("AI recommended");
      expect(boosted[1]!.matchScore).toBe(70); // Unchanged
    });

    it("should not boost scores above 98", () => {
      const results: AppSearchResult[] = [
        {
          app: { name: "Google Chrome", bundleId: "com.google.Chrome", path: "/Applications/Chrome.app" },
          matchScore: 90,
          matchReason: "Fuzzy match",
        },
      ];

      const boosted = boostAISuggestedApps(results, ["Chrome"]);

      expect(boosted[0]!.matchScore).toBe(98); // min(90 + 15, 98)
    });

    it("should not boost scores that are already >= 95", () => {
      const results: AppSearchResult[] = [
        {
          app: { name: "Google Chrome", bundleId: "com.google.Chrome", path: "/Applications/Chrome.app" },
          matchScore: 95,
          matchReason: "Exact match",
        },
      ];

      const boosted = boostAISuggestedApps(results, ["Chrome"]);

      expect(boosted[0]!.matchScore).toBe(95); // Unchanged
      expect(boosted[0]!.matchReason).toBe("Exact match"); // Unchanged
    });
  });

  describe("addMissingAISuggestedApps", () => {
    const mockApps = [
      { name: "Google Chrome", bundleId: "com.google.Chrome", path: "/Applications/Chrome.app" },
      { name: "Safari", bundleId: "com.apple.Safari", path: "/Applications/Safari.app" },
      { name: "Firefox", bundleId: "org.mozilla.firefox", path: "/Applications/Firefox.app" },
    ];

    it("should add AI-suggested apps that are missing from results", () => {
      const results: AppSearchResult[] = [
        {
          app: mockApps[0]!,
          matchScore: 80,
          matchReason: "Fuzzy match",
        },
      ];

      const updated = addMissingAISuggestedApps(results, mockApps, ["Safari", "Firefox"]);

      expect(updated.length).toBe(3);
      expect(updated[1]!.app.name).toBe("Safari");
      expect(updated[1]!.matchScore).toBe(85);
      expect(updated[1]!.matchReason).toBe("AI recommended");
    });

    it("should not duplicate apps already in results", () => {
      const results: AppSearchResult[] = [
        {
          app: mockApps[0]!,
          matchScore: 80,
          matchReason: "Fuzzy match",
        },
      ];

      const updated = addMissingAISuggestedApps(results, mockApps, ["Chrome"]);

      expect(updated.length).toBe(1); // No duplicates
    });

    it("should handle apps that don't exist in the app list", () => {
      const results: AppSearchResult[] = [];

      const updated = addMissingAISuggestedApps(results, mockApps, ["Nonexistent App"]);

      expect(updated.length).toBe(0);
    });
  });

  describe("boostCategoryMatches", () => {
    it("should boost scores for apps in matching categories", () => {
      const results: AppSearchResult[] = [
        {
          app: { name: "Google Chrome", bundleId: "com.google.Chrome", path: "/Applications/Chrome.app" },
          matchScore: 75,
          matchReason: "Fuzzy match",
        },
      ];

      const boosted = boostCategoryMatches(results, ["Chrome", "Safari"]);

      expect(boosted[0]!.matchScore).toBe(85); // 75 + 10
      expect(boosted[0]!.matchReason).toBe("Category match");
    });

    it("should not boost scores above 95", () => {
      const results: AppSearchResult[] = [
        {
          app: { name: "Google Chrome", bundleId: "com.google.Chrome", path: "/Applications/Chrome.app" },
          matchScore: 88,
          matchReason: "Fuzzy match",
        },
      ];

      const boosted = boostCategoryMatches(results, ["Chrome"]);

      expect(boosted[0]!.matchScore).toBe(95); // min(88 + 10, 95)
    });
  });

  describe("addMissingCategoryMatches", () => {
    const mockApps = [
      { name: "Google Chrome", bundleId: "com.google.Chrome", path: "/Applications/Chrome.app" },
      { name: "Safari", bundleId: "com.apple.Safari", path: "/Applications/Safari.app" },
    ];

    it("should add apps from matching categories", () => {
      const results: AppSearchResult[] = [];

      const updated = addMissingCategoryMatches(results, mockApps, ["Chrome"]);

      expect(updated.length).toBe(1);
      expect(updated[0]!.app.name).toBe("Google Chrome");
      expect(updated[0]!.matchScore).toBe(70);
      expect(updated[0]!.matchReason).toBe("Category match");
    });

    it("should not duplicate apps already in results", () => {
      const results: AppSearchResult[] = [
        {
          app: mockApps[0]!,
          matchScore: 80,
          matchReason: "Fuzzy match",
        },
      ];

      const updated = addMissingCategoryMatches(results, mockApps, ["Chrome"]);

      expect(updated.length).toBe(1); // No duplicates
    });
  });
});
