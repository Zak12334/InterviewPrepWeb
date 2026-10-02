import type { PatternId, Problem } from '@/types/content';
import { patterns } from '../patterns';
import { climbStairs, containsDuplicate, maxProfit, twoSum } from './arrays';
import { binarySearch, longestSubstring, twoSumSorted } from './pointers';
import { maxDepth, reverseList, validParentheses } from './structures';
import * as setA from './setA';
import * as setB from './setB';
import * as setC from './setC';
import * as setD from './setD';

const RANK = { Easy: 0, Medium: 1, Hard: 2 };

const all: Problem[] = [
  containsDuplicate,
  twoSum,
  twoSumSorted,
  maxProfit,
  longestSubstring,
  validParentheses,
  binarySearch,
  reverseList,
  maxDepth,
  climbStairs,
  ...Object.values(setA),
  ...Object.values(setB),
  ...Object.values(setC),
  ...Object.values(setD),
];

/** Every problem, in roadmap order: pattern by pattern, easiest first within each pattern. */
export const problems: Problem[] = patterns.flatMap((pattern) =>
  all.filter((p) => p.pattern === pattern.id).sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]),
);

export const problemsOf = (pattern: PatternId) => problems.filter((p) => p.pattern === pattern);

export const getProblem = (slug: string) => problems.find((p) => p.slug === slug);
