/**
 * Helper functions for app search
 */

import { Application } from "@raycast/api";
import { match, P } from "ts-pattern";
import { AppSearchResult } from "../../types";
import { fuzzyMatch } from "../utils/fuzzy-match";
import { QueryInterpretation } from "../ai/query-interpreter";
import { getCommonAppsForQuery } from "../data/app-database";

/**
 * Check if app name contains the suggested name (case-insensitive)
 *
 * This uses simple partial matching (includes) rather than strict word-boundary matching
 * because:
 * - AI-suggested app names may not exactly match the actual app name
 *   (e.g., "VS Code" vs "Visual Studio Code")
 * - Category definitions may have slight variations in app names
 * - Partial matching reduces false negatives while still being reasonably accurate
 *   for matching apps against AI suggestions and category definitions
 *
 * @internal Exported for testing
 */
export function isFlexibleNameMatch(appName: string, suggestedName: string): boolean {
  return appName.toLowerCase().includes(suggestedName.toLowerCase());
}

/**
 * Merge additional search results from AI-suggested search terms
 */
export function mergeAISearchTermResults(
  existingResults: AppSearchResult[],
  apps: Application[],
  interpretation: QueryInterpretation,
  originalQuery: string,
): AppSearchResult[] {
  const results = [...existingResults];

  if (!interpretation.searchTerms.length) {
    return results;
  }

  for (const term of interpretation.searchTerms) {
    if (term.toLowerCase() === originalQuery.toLowerCase()) {
      continue;
    }

    const additionalResults = fuzzyMatch(apps, term);

    for (const result of additionalResults) {
      const isDuplicate = results.some((r) => r.app.bundleId === result.app.bundleId);
      if (!isDuplicate) {
        results.push({
          ...result,
          matchScore: Math.max(result.matchScore - 5, 0),
          matchReason: "AI suggested",
        });
      }
    }
  }

  return results;
}

/**
 * Boost scores for AI-suggested apps that are already in results
 */
export function boostAISuggestedApps(results: AppSearchResult[], suggestedAppNames: string[]): AppSearchResult[] {
  return results.map((result) => {
    const isAISuggested = suggestedAppNames.some((name) => isFlexibleNameMatch(result.app.name, name));

    return match({ isAISuggested, matchScore: result.matchScore })
      .with({ isAISuggested: true, matchScore: P.when((score) => score < 95) }, () => ({
        ...result,
        matchScore: Math.min(result.matchScore + 15, 98),
        matchReason: "AI recommended" as const,
      }))
      .with({ isAISuggested: true }, () => result)
      .with({ isAISuggested: false }, () => result)
      .exhaustive();
  });
}

/**
 * Add AI-suggested apps that weren't found by fuzzy match
 */
export function addMissingAISuggestedApps(
  results: AppSearchResult[],
  apps: Application[],
  suggestedAppNames: string[],
): AppSearchResult[] {
  const newResults = suggestedAppNames.flatMap((suggestedName) => {
    const alreadyIncluded = results.some((r) => isFlexibleNameMatch(r.app.name, suggestedName));
    const matchedApp = apps.find((app) => isFlexibleNameMatch(app.name, suggestedName));

    return match({ alreadyIncluded, matchedApp })
      .with({ alreadyIncluded: false, matchedApp: P.not(P.nullish) }, ({ matchedApp }) => [
        {
          app: matchedApp,
          matchScore: 85,
          matchReason: "AI recommended" as const,
        },
      ])
      .with({ alreadyIncluded: true }, () => [])
      .with({ matchedApp: P.nullish }, () => [])
      .exhaustive();
  });

  return [...results, ...newResults];
}

/**
 * Boost scores for apps that match categories
 */
export function boostCategoryMatches(results: AppSearchResult[], commonAppNames: string[]): AppSearchResult[] {
  return results.map((result) => {
    const isInCategory = commonAppNames.some((appName) => isFlexibleNameMatch(result.app.name, appName));

    return match({ isInCategory, matchScore: result.matchScore })
      .with({ isInCategory: true, matchScore: P.when((score) => score < 90) }, () => ({
        ...result,
        matchScore: Math.min(result.matchScore + 10, 95),
        matchReason: "Category match" as const,
      }))
      .with({ isInCategory: true }, () => result)
      .with({ isInCategory: false }, () => result)
      .exhaustive();
  });
}

/**
 * Add apps that match categories but weren't found by fuzzy match
 */
export function addMissingCategoryMatches(
  results: AppSearchResult[],
  apps: Application[],
  commonAppNames: string[],
): AppSearchResult[] {
  const newResults = apps.flatMap((app) => {
    const alreadyIncluded = results.some((r) => r.app.bundleId === app.bundleId);
    const isInCategory = commonAppNames.some((appName) => isFlexibleNameMatch(app.name, appName));

    return match({ alreadyIncluded, isInCategory })
      .with({ alreadyIncluded: false, isInCategory: true }, () => [
        {
          app,
          matchScore: 70,
          matchReason: "Category match" as const,
        },
      ])
      .with({ alreadyIncluded: false, isInCategory: false }, () => [])
      .with({ alreadyIncluded: true, isInCategory: true }, () => [])
      .with({ alreadyIncluded: true, isInCategory: false }, () => [])
      .exhaustive();
  });

  return [...results, ...newResults];
}

/**
 * Apply category-based matching to results
 */
export function applyCategoryMatching(
  results: AppSearchResult[],
  apps: Application[],
  matchedCategories: string[],
  query: string,
): AppSearchResult[] {
  return match(matchedCategories)
    .with([], () => results)
    .with(P.array(), () => {
      const commonAppNames = getCommonAppsForQuery(query);
      const boosted = boostCategoryMatches(results, commonAppNames);
      const withMissing = addMissingCategoryMatches(boosted, apps, commonAppNames);

      // Sort by score
      return withMissing.sort((a, b) => b.matchScore - a.matchScore);
    })
    .exhaustive();
}
