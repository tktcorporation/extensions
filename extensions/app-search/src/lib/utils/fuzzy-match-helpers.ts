/**
 * Helper functions for fuzzy matching
 */

import { match, P } from "ts-pattern";
import { MatchScore } from "../../types";

/**
 * Normalize separators (hyphens and underscores to spaces)
 */
export function normalizeSeparators(str: string): string {
  return str.replace(/[-_]/g, " ");
}

/**
 * Split string into words
 */
export function splitIntoWords(str: string): string[] {
  return str.split(/[\s-_]+/);
}

/**
 * Check for exact match
 */
export function checkExactMatch(target: string, query: string): MatchScore | null {
  return match({ target, query })
    .with({ target: P.when((t) => t === query) }, () => ({ score: 100, reason: "exact" as const }))
    .with(
      P.when(({ target, query }) => {
        const targetNoSep = normalizeSeparators(target);
        const queryNoSep = normalizeSeparators(query);
        return targetNoSep === queryNoSep;
      }),
      () => ({ score: 100, reason: "exact" as const }),
    )
    .otherwise(() => null);
}

/**
 * Check for word match
 */
export function checkWordMatch(target: string, query: string): MatchScore | null {
  const targetWords = splitIntoWords(target);
  const queryWords = splitIntoWords(normalizeSeparators(query));

  // Check if query is a complete word in target
  const hasCompleteWordMatch = targetWords.some((w) => w === query);

  // Check if all query words appear in target words
  const hasMultiWordMatch =
    queryWords.length > 1 && queryWords.every((qw) => targetWords.some((tw) => tw.includes(qw)));

  return match({ hasCompleteWordMatch, hasMultiWordMatch })
    .with({ hasCompleteWordMatch: true }, () => ({ score: 100, reason: "exact" as const }))
    .with({ hasMultiWordMatch: true }, () => ({ score: 85, reason: "prefix" as const }))
    .otherwise(() => null);
}

/**
 * Check for prefix match
 */
export function checkPrefixMatch(target: string, query: string): MatchScore | null {
  const targetWords = splitIntoWords(target);

  return match({ target, targetWords, query })
    .with({ target: P.when((t) => t.startsWith(query)) }, ({ target, query }) => {
      const matchRatio = query.length / target.length;
      const score = 85 + matchRatio * 10; // 85-95 range
      return { score: Math.round(score), reason: "prefix" as const };
    })
    .with({ targetWords: P.when((words) => words.some((w) => w.startsWith(query))) }, ({ targetWords, query }) => {
      const matchingWord = targetWords.find((w) => w.startsWith(query))!;
      const matchRatio = query.length / matchingWord.length;
      const score = 75 + matchRatio * 10; // 75-85 range
      return { score: Math.round(score), reason: "prefix" as const };
    })
    .otherwise(() => null);
}

/**
 * Check for contains match
 */
export function checkContainsMatch(target: string, query: string): MatchScore | null {
  return match({ target, query })
    .with({ target: P.when((t) => t.includes(query)) }, ({ target, query }) => {
      const matchRatio = query.length / target.length;
      return match(matchRatio)
        .with(
          P.when((r) => r > 0.3),
          (ratio) => {
            const score = 55 + ratio * 15; // 55-70 range
            return { score: Math.round(score), reason: "contains" as const };
          },
        )
        .otherwise((ratio) => {
          const score = 40 + ratio * 15; // 40-55 range
          return { score: Math.round(score), reason: "contains" as const };
        });
    })
    .otherwise(() => null);
}

/**
 * Check for acronym match
 */
export function checkAcronymMatch(target: string, query: string): MatchScore | null {
  const targetWords = splitIntoWords(target).filter((w) => w.length > 0);

  return match(targetWords)
    .with([], () => null)
    .with(
      P.when((words) => {
        const acronym = words.map((w) => w.charAt(0)).join("");
        return acronym.includes(query);
      }),
      () => ({ score: 45, reason: "contains" as const }),
    )
    .otherwise(() => null);
}
