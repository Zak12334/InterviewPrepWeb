import { make, no, ok, q, yes } from './builder';

export const houseRobber = make({
  slug: 'house-robber',
  title: 'House Robber',
  pattern: 'dp-1d',
  difficulty: 'Medium',
  leetcode: 198,
  statement:
    'nums[i] is the money in house i along a street. You may not take from two houses next to each other. Return the largest total you can take.',
  constraints: ['1 ≤ nums.length ≤ 100', '0 ≤ nums[i] ≤ 400'],
  examples: [
    ['nums = [2, 7, 9, 3, 1]', '12', 'Houses 0, 2 and 4: 2 + 9 + 1.'],
    ['nums = [2, 1, 1, 2]', '4', 'Houses 0 and 3. Skipping two in a row is allowed.'],
  ],
  fn: ['rob', 'rob'],
  params: [['nums', 'int[]']],
  returns: 'int',
  understanding: [
    q(
      'nums = [2, 1, 1, 2]. Why is the answer not 3 (take every other house)?',
      yes('Taking houses 0 and 3 gives 4; you are allowed to skip more than one house', '"Every other house" is just one option, not the rule.'),
      no('It is 3', 'Houses 0 and 3 are not adjacent and total 4.'),
      no('Because you must start at house 0', 'There is no such rule.'),
    ),
    q(
      'You are standing at house i. What are your only two options?',
      yes('Take it (and add the best total up to house i − 2), or skip it (and keep the best total up to house i − 1)', 'Everything else is already summarised in those two earlier answers.'),
      no('Take it or take the next one', 'You might skip both.'),
      no('Take it if it is bigger than its neighbours', 'A locally big house can still be the wrong choice: see [2, 3, 2] versus [1, 3, 1, 3, 100].'),
    ),
  ],
  approach: [
    q(
      'best(i) = max(best(i − 1), best(i − 2) + nums[i]). How do you compute it?',
      yes('Walk left to right keeping only the last two answers', 'Each house is handled once with constant work.', {
        time: 'O(n)',
        space: 'O(1)',
        demo: `def rob(nums):
    prev, curr = 0, 0
    for money in nums:
        prev, curr = curr, max(curr, prev + money)
    return curr`,
      }),
      no('Plain recursion: at each house try "take" and "skip"', 'Correct, but the same sub-streets are solved again and again.', {
        time: 'O(2ⁿ)',
        space: 'O(n)',
        demo: `def rob(nums, i=0):
    if i >= len(nums):
        return 0
    take = nums[i] + rob(nums, i + 2)
    skip = rob(nums, i + 1)
    return max(take, skip)`,
      }),
      no('Greedy: always take the largest remaining house that is still allowed', '[2, 3, 2]: greedy takes 3 and stops with 3, but 2 + 2 = 4.', { time: 'O(n log n)', space: 'O(n)' }),
    ),
    q(
      'With prev = best up to i − 2 and curr = best up to i − 1, what is the new curr after looking at house i?',
      yes('max(curr, prev + nums[i])', 'Skip (keep curr) or take (prev plus this house).'),
      no('curr + nums[i]', 'That would take two adjacent houses.'),
      no('max(prev, nums[i])', 'It forgets to add this house to prev, and ignores curr.'),
    ),
  ],
  langQ: {
    python: q(
      'Why does `prev, curr = curr, max(curr, prev + money)` work in one line?',
      yes('The right side is fully evaluated with the old values before anything is assigned', 'So prev + money still uses the old prev.'),
      no('Python assigns prev first, then computes the max with the new prev', 'If it did, the answer would be wrong. The whole right side is computed first.'),
      no('It does not work; you need a temporary variable', 'Tuple assignment makes the temporary unnecessary.'),
    ),
    java: q(
      'Java has no tuple assignment. How do you update prev and curr correctly?',
      yes('int next = Math.max(curr, prev + money); prev = curr; curr = next;', 'Compute the new value first, then shift.'),
      no('prev = curr; curr = Math.max(curr, prev + money);', 'prev has already been overwritten, so prev + money uses the wrong value.'),
      no('curr = Math.max(curr, prev + money); prev = curr;', 'prev becomes the NEW curr, skipping a step.'),
    ),
  },
  plan: [
    'Set prev and curr to 0 (best totals two houses back and one house back).',
    'Visit each house in order.',
    'Work out the best total including this house: the larger of curr and prev + its money.',
    'Shift: prev becomes the old curr, curr becomes the new best.',
    'Return curr.',
  ],
  hints: ['If you already knew the best total for the first i − 1 houses and for the first i − 2, how would you get the best for the first i?', 'A take-or-skip recurrence on the previous two answers. Two variables are enough.'],
  solution: {
    python: `def rob(nums):
    prev, curr = 0, 0
    for money in nums:
        prev, curr = curr, max(curr, prev + money)
    return curr
`,
    java: `class Solution {
    public int rob(int[] nums) {
        int prev = 0, curr = 0;
        for (int money : nums) {
            int next = Math.max(curr, prev + money);
            prev = curr;
            curr = next;
        }
        return curr;
    }
}
`,
  },
  tests: [
    [[[2, 7, 9, 3, 1]], 12],
    [[[1, 2, 3, 1]], 4],
    [[[5]], 5],
    [[[2, 1, 1, 2]], 4],
    [[[0, 0]], 0],
  ],
  demoArgs: [[2, 7, 9, 3, 1, 4, 8]],
  reflect: ['State the take-or-skip rule in your own words. Why are two variables enough?', 'O(n)', 'O(1)'],
});

export const coinChange = make({
  slug: 'coin-change',
  title: 'Coin Change',
  pattern: 'dp-1d',
  difficulty: 'Medium',
  leetcode: 322,
  statement:
    'coins are the coin values available (as many of each as you like). Return the fewest coins needed to make exactly amount, or −1 if it cannot be made.',
  constraints: ['1 ≤ coins.length ≤ 12', '0 ≤ amount ≤ 10,000'],
  examples: [
    ['coins = [1, 2, 5], amount = 11', '3', '5 + 5 + 1.'],
    ['coins = [2], amount = 3', '-1', 'Only even amounts are possible.'],
  ],
  fn: ['coin_change', 'coinChange'],
  params: [
    ['coins', 'int[]'],
    ['amount', 'int'],
  ],
  returns: 'int',
  understanding: [
    q(
      'coins = [1, 3, 4], amount = 6. What is the fewest coins?',
      yes('2', '3 + 3. Taking the biggest coin first gives 4 + 1 + 1 = three coins, which is worse.'),
      no('3', 'That is what "biggest coin first" gives. 3 + 3 does it in two.'),
      no('6', 'Six 1-coins works but is far from the fewest.'),
    ),
    q(
      'amount = 0. What is the answer?',
      yes('0', 'No coins are needed to make nothing.'),
      no('-1', '−1 means impossible; zero is possible with zero coins.'),
      no('1', 'No coin has value 0.'),
    ),
  ],
  approach: [
    q(
      'How do you find the fewest coins for the full amount?',
      yes('Build a table: fewest coins for every amount from 1 up to the target, each computed from smaller amounts', 'fewest(a) = 1 + the smallest fewest(a − coin) over all coins that fit.', { time: 'O(amount · coins)', space: 'O(amount)' }),
      no('Greedy: keep taking the largest coin that fits', 'Fails for [1, 3, 4] and 6, as you just saw.', { time: 'O(amount)', space: 'O(1)' }),
      ok('Try every combination of coins recursively', 'Correct but exponential: the same remaining amounts are solved over and over.', { time: 'exponential', space: 'O(amount)' }),
    ),
    q(
      'What should the table hold for amounts you have not managed to make yet?',
      yes('A value larger than any real answer, such as amount + 1', 'Then taking a minimum works naturally, and a value still above amount at the end means "impossible".'),
      no('0', '0 would look like "needs no coins" and win every minimum.'),
      no('-1', 'A minimum would happily pick −1, corrupting the results.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you build the table so dp[0] is 0 and everything else is "too big"?',
      yes('dp = [0] + [amount + 1] * amount', 'One zero, then amount entries of the sentinel.'),
      no('dp = [amount + 1] * amount', 'That has no slot for dp[amount] and dp[0] is not 0.'),
      no('dp = [0] * (amount + 1)', 'All zeros would make every minimum come out as 0 or 1.'),
    ),
    java: q(
      'How do you fill the table with the "too big" value?',
      yes('Arrays.fill(dp, amount + 1); then dp[0] = 0;', 'Arrays.fill sets every slot; then fix the base case.'),
      no('Leave it; new int[] is already large', 'New int arrays are all zeros.'),
      no('Arrays.fill(dp, Integer.MAX_VALUE) and later compute dp[a - coin] + 1', 'Adding 1 to Integer.MAX_VALUE overflows to a large negative number, which then wins the minimum.'),
    ),
  },
  plan: [
    'Create a table with one entry per amount from 0 to the target; entry 0 is 0 and the rest are "too big".',
    'For each amount from 1 up to the target, try every coin.',
    'If the coin fits, the candidate is 1 + the table value at (amount − coin).',
    'Keep the smallest candidate in the table.',
    'At the end, return the table value at the target, or −1 if it is still "too big".',
  ],
  hints: ['If the last coin you add has value c, how many coins did the rest take?', 'Bottom-up table over amounts. Each entry is 1 + the best smaller entry reachable by one coin.'],
  solution: {
    python: `def coin_change(coins, amount):
    dp = [0] + [amount + 1] * amount
    for total in range(1, amount + 1):
        for coin in coins:
            if coin <= total:
                dp[total] = min(dp[total], dp[total - coin] + 1)
    return dp[amount] if dp[amount] <= amount else -1
`,
    java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int total = 1; total <= amount; total++) {
            for (int coin : coins) {
                if (coin <= total) {
                    dp[total] = Math.min(dp[total], dp[total - coin] + 1);
                }
            }
        }
        return dp[amount] <= amount ? dp[amount] : -1;
    }
}
`,
  },
  tests: [
    [[[1, 2, 5], 6], 2],
    [[[1, 2, 5], 11], 3],
    [[[2], 3], -1],
    [[[1], 0], 0],
    [[[1, 3, 4], 6], 2],
    [[[2, 5, 10, 1], 27], 4],
  ],
  reflect: ['Why does greedy fail here, and what does each table entry mean?', 'O(amount · coins)', 'O(amount)'],
});

export const uniquePaths = make({
  slug: 'unique-paths',
  title: 'Unique Paths',
  pattern: 'dp-2d',
  difficulty: 'Medium',
  leetcode: 62,
  statement:
    'A robot starts in the top-left cell of an m × n grid and can only move right or down. Return how many different paths lead to the bottom-right cell.',
  constraints: ['1 ≤ m, n ≤ 100', 'The answer fits in a 32-bit integer'],
  examples: [
    ['m = 3, n = 2', '3', 'Down-down-right, down-right-down, right-down-down.'],
    ['m = 3, n = 7', '28', 'Too many to list: count them with a table.'],
  ],
  fn: ['unique_paths', 'uniquePaths'],
  params: [
    ['m', 'int'],
    ['n', 'int'],
  ],
  returns: 'int',
  understanding: [
    q(
      'How many paths reach any cell in the top row?',
      yes('Exactly 1', 'You can only get there by moving right all the way. The same holds for the first column (down all the way).'),
      no('As many as its column number', 'There is no choice to make along the top edge.'),
      no('0', 'The cell is reachable.'),
    ),
    q(
      'You arrive at a cell in the middle of the grid. From which cells could your last move have come?',
      yes('The cell above or the cell to the left', 'So paths(here) = paths(above) + paths(left).'),
      no('Any neighbouring cell', 'Only right and down moves exist, so you can only arrive from above or from the left.'),
      no('Only the cell above', 'You could also have moved right from the left neighbour.'),
    ),
  ],
  approach: [
    q(
      'How do you count the paths?',
      yes('Fill a table row by row: each cell is the sum of the cell above and the cell to the left', 'Every cell is computed once from two already-known cells.', { time: 'O(m · n)', space: 'O(m · n)' }),
      ok('Recursively explore every path and count them', 'Correct, but the number of paths grows explosively and sub-grids are recounted.', { time: 'exponential', space: 'O(m + n)' }),
      no('Multiply m by n', '3 × 2 = 6, but the answer for a 3 × 2 grid is 3.', { time: 'O(1)', space: 'O(1)' }),
    ),
    q(
      'Which cells must be known before the row-by-row fill can start?',
      yes('The first row and the first column, all equal to 1', 'They are the base cases: cells with only one way in.'),
      no('Only the top-left cell', 'Cells on the edges have no "above" or no "left" to add.'),
      no('The bottom-right cell', 'That is the answer you are working toward.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you create an m × n table filled with 1s?',
      yes('dp = [[1] * n for _ in range(m)]', 'A fresh row for each of the m rows.'),
      no('dp = [[1] * n] * m', 'That repeats the SAME row m times: changing dp[1][2] changes every row.'),
      no('dp = [1] * n * m', 'That is one flat list, not rows and columns.'),
    ),
    java: q(
      'How do you declare an m × n table of ints?',
      yes('int[][] dp = new int[m][n];', 'Rows first, then columns; all cells start at 0.'),
      no('int[][] dp = new int[m, n];', 'That is C# syntax.'),
      no('int[] dp = new int[m][n];', 'The type on the left must also be two-dimensional.'),
    ),
  },
  plan: [
    'Create an m × n table.',
    'Set every cell of the first row and first column to 1.',
    'Visit the remaining cells row by row, left to right.',
    'Set each cell to the cell above plus the cell to the left.',
    'Return the bottom-right cell.',
  ],
  hints: ['To stand on a cell, where could you have been one move earlier?', 'A 2-D table where each cell adds its upper and left neighbours; edges are 1.'],
  solution: {
    python: `def unique_paths(m, n):
    dp = [[1] * n for row in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]
`,
    java: `class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (r == 0 || c == 0) {
                    dp[r][c] = 1;
                } else {
                    dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
                }
            }
        }
        return dp[m - 1][n - 1];
    }
}
`,
  },
  tests: [
    [[3, 4], 10],
    [[3, 7], 28],
    [[1, 1], 1],
    [[3, 2], 3],
    [[7, 3], 28],
    [[10, 10], 48620],
  ],
  reflect: ['What does one cell of the table mean, and why is it the sum of two neighbours?', 'O(m · n)', 'O(m · n)'],
});

export const longestCommonSubsequence = make({
  slug: 'longest-common-subsequence',
  title: 'Longest Common Subsequence',
  pattern: 'dp-2d',
  difficulty: 'Medium',
  leetcode: 1143,
  statement:
    'A subsequence keeps some characters of a string in their original order (not necessarily next to each other). Return the length of the longest subsequence that appears in both text1 and text2.',
  constraints: ['1 ≤ text1.length, text2.length ≤ 1,000', 'Lowercase letters only'],
  examples: [
    ['text1 = "abcde", text2 = "ace"', '3', '"ace" appears in both, in order.'],
    ['text1 = "abc", text2 = "def"', '0', 'No letter in common.'],
  ],
  fn: ['longest_common_subsequence', 'longestCommonSubsequence'],
  params: [
    ['text1', 'String'],
    ['text2', 'String'],
  ],
  returns: 'int',
  understanding: [
    q(
      'Is "aec" a subsequence of "abcde"?',
      yes('No', 'The letters exist, but e comes after c in "abcde". Order must be kept.'),
      no('Yes', 'A subsequence cannot reorder characters.'),
    ),
    q(
      'The last characters of the two strings are equal. What does that tell you?',
      yes('That character can be the end of a common subsequence: answer = 1 + the answer for both strings without it', 'Matching last characters can always be paired up.'),
      no('The whole strings are equal', 'Only the last characters were compared.'),
      no('Nothing useful', 'It lets you shrink both strings by one and add 1.'),
    ),
  ],
  approach: [
    q(
      'How do you compute the answer?',
      yes('A table where cell (r, c) is the answer for the first r characters of text1 and the first c of text2', 'Equal characters: diagonal + 1. Otherwise: the better of dropping a character from one string or the other.', { time: 'O(m · n)', space: 'O(m · n)' }),
      no('Generate every subsequence of text1 and test each against text2', 'text1 has 2ⁿ subsequences.', { time: 'O(2ⁿ · m)', space: 'O(n)' }),
      no('Count the letters the two strings share', 'That ignores order: "abc" and "cba" share three letters but their longest common subsequence has length 1.', { time: 'O(m + n)', space: 'O(1)' }),
    ),
    q(
      'The characters at (r, c) differ. What goes in the cell?',
      yes('The larger of the cell above and the cell to the left', 'Either text1\'s character or text2\'s character is not part of the answer; try dropping each.'),
      no('The diagonal cell + 1', 'That is for when the characters match.'),
      no('0', 'Earlier matches still count.'),
    ),
  ],
  langQ: {
    python: q(
      'The table has an extra row and column of zeros, so cell (r, c) refers to which characters?',
      yes('text1[r - 1] and text2[c - 1]', 'Row r means "the first r characters", whose last one is at index r − 1.'),
      no('text1[r] and text2[c]', 'At r = len(text1) that index is out of range.'),
      no('text1[r + 1] and text2[c + 1]', 'The shift goes the other way.'),
    ),
    java: q(
      'How do you compare the characters for cell (r, c)?',
      yes('text1.charAt(r - 1) == text2.charAt(c - 1)', 'chars are primitives, so == compares them correctly.'),
      no('text1.charAt(r - 1).equals(text2.charAt(c - 1))', 'char is a primitive and has no equals method.'),
      no('text1[r - 1] == text2[c - 1]', 'Strings cannot be indexed with brackets in Java.'),
    ),
  },
  plan: [
    'Create a table with (length of text1 + 1) rows and (length of text2 + 1) columns, all zeros.',
    'Visit the cells row by row, starting from row 1 and column 1.',
    'If the two characters for this cell are equal, the cell is the diagonal neighbour plus 1.',
    'Otherwise the cell is the larger of the cell above and the cell to the left.',
    'Return the bottom-right cell.',
  ],
  hints: ['Look at the last character of each string. What are the cases?', 'A 2-D table over prefixes. Match → diagonal + 1; no match → max(up, left).'],
  solution: {
    python: `def longest_common_subsequence(text1, text2):
    rows, cols = len(text1), len(text2)
    dp = [[0] * (cols + 1) for row in range(rows + 1)]
    for r in range(1, rows + 1):
        for c in range(1, cols + 1):
            if text1[r - 1] == text2[c - 1]:
                dp[r][c] = dp[r - 1][c - 1] + 1
            else:
                dp[r][c] = max(dp[r - 1][c], dp[r][c - 1])
    return dp[rows][cols]
`,
    java: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int rows = text1.length(), cols = text2.length();
        int[][] dp = new int[rows + 1][cols + 1];
        for (int r = 1; r <= rows; r++) {
            for (int c = 1; c <= cols; c++) {
                if (text1.charAt(r - 1) == text2.charAt(c - 1)) {
                    dp[r][c] = dp[r - 1][c - 1] + 1;
                } else {
                    dp[r][c] = Math.max(dp[r - 1][c], dp[r][c - 1]);
                }
            }
        }
        return dp[rows][cols];
    }
}
`,
  },
  tests: [
    [['abcde', 'ace'], 3],
    [['abc', 'abc'], 3],
    [['abc', 'def'], 0],
    [['abc', 'cba'], 1],
    [['ezupkr', 'ubmrapg'], 2],
  ],
  reflect: ['What does cell (r, c) mean? Explain the two cases that fill it.', 'O(m · n)', 'O(m · n)'],
});

export const maxSubArray = make({
  slug: 'maximum-subarray',
  title: 'Maximum Subarray',
  pattern: 'greedy',
  difficulty: 'Medium',
  leetcode: 53,
  statement: 'Return the largest sum of any contiguous, non-empty stretch of nums.',
  constraints: ['1 ≤ nums.length ≤ 100,000', 'Values can be negative'],
  examples: [
    ['nums = [2, -5, 3, 4, -1]', '7', '3 + 4.'],
    ['nums = [-3, -1, -2]', '-1', 'All negative: the best you can do is the single largest value.'],
  ],
  fn: ['max_sub_array', 'maxSubArray'],
  params: [['nums', 'int[]']],
  returns: 'int',
  understanding: [
    q(
      'nums = [-3, -1, -2]. Why is the answer not 0?',
      yes('The stretch must be non-empty, so you have to take at least one value', 'Starting "best" at 0 is the classic bug here.'),
      no('It is 0', 'An empty stretch is not allowed.'),
      no('Because −1 is positive', 'It is negative; it is just the least bad.'),
    ),
    q(
      'The running sum of your current stretch is −4 and the next value is 3. What is the best stretch ending on that 3?',
      yes('Just [3]', 'Dragging a negative total along can only make things worse. Drop it and restart.'),
      no('The old stretch plus 3, giving −1', '3 on its own beats −1.'),
      no('Skip the 3', 'A stretch ending at 3 has to include it.'),
    ),
  ],
  approach: [
    q(
      'How do you find the best stretch?',
      yes('One pass: at each value, either extend the current stretch or restart from this value, whichever is larger; remember the best seen', 'A greedy decision that never needs revisiting (Kadane\'s algorithm).', { time: 'O(n)', space: 'O(1)' }),
      ok('Try every start and every end', 'Correct, with n² stretches to sum.', { time: 'O(n²)', space: 'O(1)' }),
      no('Add up all the positive numbers', 'They may not be contiguous: [5, −100, 5] is not 10.', { time: 'O(n)', space: 'O(1)' }),
    ),
    q(
      'Why keep two variables (current and best)?',
      yes('The best stretch may have ended earlier; current can drop afterwards', 'current is "best ending here"; best is "best ending anywhere so far".'),
      no('One is for positives, one for negatives', 'Both hold sums of stretches.'),
      no('It is not needed; current alone is the answer', 'For [5, −100] current ends at −95 while the answer is 5.'),
    ),
  ],
  langQ: {
    python: q(
      'What should best and current start as?',
      yes('nums[0]', 'The first value is a valid stretch, and it handles all-negative input.'),
      no('0', 'Then [-3, -1] would wrongly answer 0.'),
      no('float("inf")', 'Nothing can beat infinity; the answer would never update.'),
    ),
    java: q(
      'What should best and current start as?',
      yes('nums[0]', 'The first value is a valid stretch, and it handles all-negative input.'),
      no('0', 'Then {-3, -1} would wrongly answer 0.'),
      no('Integer.MAX_VALUE', 'Nothing can beat it; the answer would never update.'),
    ),
  },
  plan: [
    'Start both current and best at the first value.',
    'Visit each later value.',
    'Set current to the larger of: the value alone, or current plus the value.',
    'If current beats best, update best.',
    'Return best.',
  ],
  hints: ['When is it better to abandon the stretch you have been building?', 'At every value: extend or restart. Track the best total seen along the way.'],
  solution: {
    python: `def max_sub_array(nums):
    best = current = nums[0]
    for i in range(1, len(nums)):
        current = max(nums[i], current + nums[i])
        best = max(best, current)
    return best
`,
    java: `class Solution {
    public int maxSubArray(int[] nums) {
        int best = nums[0], current = nums[0];
        for (int i = 1; i < nums.length; i++) {
            current = Math.max(nums[i], current + nums[i]);
            best = Math.max(best, current);
        }
        return best;
    }
}
`,
  },
  tests: [
    [[[2, -5, 3, 4, -1]], 7],
    [[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6],
    [[[1]], 1],
    [[[5, 4, -1, 7, 8]], 23],
    [[[-3, -1, -2]], -1],
  ],
  reflect: ['Explain "extend or restart". Why is it safe to throw away a negative running total?', 'O(n)', 'O(1)'],
});

export const jumpGame = make({
  slug: 'jump-game',
  title: 'Jump Game',
  pattern: 'greedy',
  difficulty: 'Medium',
  leetcode: 55,
  statement: 'You start at index 0. nums[i] is the furthest you can jump forward from index i. Return {{True|true}} if you can reach the last index.',
  constraints: ['1 ≤ nums.length ≤ 10,000', '0 ≤ nums[i] ≤ 100,000'],
  examples: [
    ['nums = [2, 3, 1, 1, 4]', '{{True|true}}', 'Jump 1 to index 1, then 3 to the end.'],
    ['nums = [3, 2, 1, 0, 4]', '{{False|false}}', 'Every route lands on index 3, whose jump length is 0.'],
  ],
  fn: ['can_jump', 'canJump'],
  params: [['nums', 'int[]']],
  returns: 'boolean',
  understanding: [
    q(
      'nums = [0]. Can you reach the last index?',
      yes('Yes', 'You are already standing on it.'),
      no('No', 'The start is the last index; no jump is needed.'),
    ),
    q(
      'nums[i] = 3. Which indexes can you land on from i?',
      yes('i + 1, i + 2 or i + 3', 'It is a maximum, so any shorter jump is allowed too.'),
      no('Only i + 3', 'The value is the furthest you may jump, not an exact distance.'),
      no('i − 3 to i + 3', 'Jumps only go forward.'),
    ),
  ],
  approach: [
    q(
      'How do you decide whether the end is reachable?',
      yes('One pass tracking the furthest index reachable so far; if you ever stand beyond it, you are stuck', 'You never need to know which jumps were taken, only how far you could have got.', { time: 'O(n)', space: 'O(1)' }),
      ok('Try every possible sequence of jumps', 'Correct, but the number of sequences explodes.', { time: 'exponential', space: 'O(n)' }),
      no('Always take the biggest jump available', '[2, 3, 0, 0, 4]: the full jump lands on index 2, where the jump length is 0 and you are stuck, while the shorter jump to index 1 reaches the end.', { time: 'O(n)', space: 'O(1)' }),
    ),
    q(
      'At index i, how do you update the furthest reachable index?',
      yes('reach = max(reach, i + nums[i])', 'From i you can get as far as i + nums[i]; keep the larger.'),
      no('reach = i + nums[i]', 'That can shrink reach when an earlier index reached further.'),
      no('reach += nums[i]', 'Jump lengths from different indexes do not add up.'),
    ),
  ],
  langQ: {
    python: q(
      'Which check detects being stuck?',
      yes('if i > reach: return False', 'Index i itself cannot be reached.'),
      no('if nums[i] == 0: return False', 'A zero is harmless if an earlier jump can carry you past it.'),
      no('if i == reach: return False', 'Standing exactly on the furthest reachable index is fine; you may still jump from it.'),
    ),
    java: q(
      'Which check detects being stuck?',
      yes('if (i > reach) return false;', 'Index i itself cannot be reached.'),
      no('if (nums[i] == 0) return false;', 'A zero is harmless if an earlier jump can carry you past it.'),
      no('if (i == reach) return false;', 'Standing exactly on the furthest reachable index is fine; you may still jump from it.'),
    ),
  },
  plan: [
    'Set the furthest reachable index to 0.',
    'Visit each index in order.',
    'If this index is beyond the furthest reachable index, return {{False|false}}.',
    'Update the furthest reachable index with this index plus its jump length.',
    'If the loop finishes, return {{True|true}}.',
  ],
  hints: ['Do you need to know the exact jumps, or only how far you can possibly get?', 'Greedy: carry the maximum reachable index; failing means meeting an index beyond it.'],
  solution: {
    python: `def can_jump(nums):
    reach = 0
    for i in range(len(nums)):
        if i > reach:
            return False
        reach = max(reach, i + nums[i])
    return True
`,
    java: `class Solution {
    public boolean canJump(int[] nums) {
        int reach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > reach) {
                return false;
            }
            reach = Math.max(reach, i + nums[i]);
        }
        return true;
    }
}
`,
  },
  tests: [
    [[[2, 3, 1, 1, 4]], true],
    [[[3, 2, 1, 0, 4]], false],
    [[[0]], true],
    [[[1, 0, 2]], false],
    [[[2, 0, 0]], true],
  ],
  reflect: ['Why is "furthest reachable index" all you need to remember?', 'O(n)', 'O(1)'],
});

export const meetingRooms = make({
  slug: 'meeting-rooms',
  title: 'Meeting Rooms',
  pattern: 'intervals',
  difficulty: 'Easy',
  leetcode: 252,
  statement:
    'intervals[i] = [start, end] is a meeting. Return {{True|true}} if one person could attend all of them, i.e. no two meetings overlap. A meeting that starts exactly when another ends does not overlap it.',
  constraints: ['0 ≤ intervals.length ≤ 10,000', 'start < end for every meeting', 'The meetings are in no particular order'],
  examples: [
    ['intervals = [[9, 12], [1, 4], [3, 6]]', '{{False|false}}', '[1, 4] and [3, 6] overlap.'],
    ['intervals = [[7, 10], [2, 4]]', '{{True|true}}', 'Plenty of room between them.'],
  ],
  fn: ['can_attend_meetings', 'canAttendMeetings'],
  params: [['intervals', 'int[][]']],
  returns: 'boolean',
  understanding: [
    q(
      'Do [1, 5] and [5, 8] overlap?',
      yes('No', 'One ends exactly as the other begins; the statement says that is allowed.'),
      no('Yes', 'Touching end-to-start is not an overlap here.'),
    ),
    q(
      'The meetings arrive unsorted. If you sort them by start time, which pairs can possibly overlap?',
      yes('Only meetings that are next to each other in the sorted order need checking', 'If a meeting does not run into the very next one, it cannot run into any later one.'),
      no('Any two meetings', 'True before sorting; sorting is what removes that problem.'),
      no('Only the first and the last', 'Overlaps can occur anywhere along the day.'),
    ),
  ],
  approach: [
    q(
      'How do you check for any overlap?',
      yes('Sort by start time, then compare each meeting with the one before it', 'After sorting, a single pass over neighbours is enough.', { time: 'O(n log n)', space: 'O(1)' }),
      ok('Compare every meeting with every other meeting', 'Correct, with n² comparisons.', { time: 'O(n²)', space: 'O(1)' }),
      no('Check the meetings in the order given, each against the previous one', 'Without sorting, overlapping meetings may not be neighbours: [[9, 12], [1, 4], [3, 6]].', { time: 'O(n)', space: 'O(1)' }),
    ),
    q(
      'After sorting, when do meeting i and the one before it overlap?',
      yes('When meeting i starts before the previous one ends', 'start(i) < end(i − 1). Equal is fine.'),
      no('When meeting i starts after the previous one ends', 'That is the gap you hope for.'),
      no('When meeting i ends after the previous one ends', 'That is true of almost every later meeting, overlapping or not.'),
    ),
  ],
  langQ: {
    python: q(
      'What does intervals.sort() do with a list of [start, end] pairs?',
      yes('Sorts them by start, breaking ties by end', 'Lists compare element by element, which is exactly the order needed.'),
      no('Raises an error because lists cannot be compared', 'Lists of numbers compare fine.'),
      no('Sorts each pair internally', 'It reorders the pairs, not their contents.'),
    ),
    java: q(
      'How do you sort int[][] intervals by start time?',
      yes('Arrays.sort(intervals, (a, b) -> a[0] - b[0]);', 'A comparator that compares the first element of each pair.'),
      no('Arrays.sort(intervals);', 'int[] has no natural ordering; this throws ClassCastException.'),
      no('intervals.sort();', 'Arrays have no sort method.'),
    ),
  },
  plan: [
    'Sort the meetings by start time.',
    'Visit each meeting from the second one onward.',
    'If it starts before the previous meeting ends, return {{False|false}}.',
    'If no pair overlaps, return {{True|true}}.',
  ],
  hints: ['In what order would you read the meetings to make an overlap obvious?', 'Sort by start; then only neighbours can overlap.'],
  solution: {
    python: `def can_attend_meetings(intervals):
    intervals.sort()
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True
`,
    java: `class Solution {
    public boolean canAttendMeetings(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                return false;
            }
        }
        return true;
    }
}
`,
  },
  tests: [
    [[[[9, 12], [1, 4], [3, 6]]], false],
    [[[[7, 10], [2, 4]]], true],
    [[[]], true],
    [[[[1, 5], [5, 8]]], true],
    [[[[0, 30], [5, 10], [15, 20]]], false],
  ],
  reflect: ['Why does sorting reduce "compare every pair" to "compare neighbours"?', 'O(n log n)', 'O(1)'],
});

export const mergeIntervals = make({
  slug: 'merge-intervals',
  title: 'Merge Intervals',
  pattern: 'intervals',
  difficulty: 'Medium',
  leetcode: 56,
  statement: 'Given a list of intervals [start, end], merge all that overlap and return the resulting non-overlapping intervals sorted by start. Intervals that touch (one ends where the next begins) are merged too.',
  constraints: ['1 ≤ intervals.length ≤ 10,000', 'start ≤ end', 'The input is in no particular order'],
  examples: [
    ['intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]', '[[1, 6], [8, 10], [15, 18]]', '[1, 3] and [2, 6] overlap.'],
    ['intervals = [[1, 4], [4, 5]]', '[[1, 5]]', 'Touching intervals merge.'],
  ],
  fn: ['merge', 'merge'],
  params: [['intervals', 'int[][]']],
  returns: 'int[][]',
  understanding: [
    q(
      'Merge [1, 4] and [2, 3]. What is the result?',
      yes('[1, 4]', 'The second lies entirely inside the first, so the end stays 4.'),
      no('[1, 3]', 'The merged end is the larger of the two ends, not the later interval\'s end.'),
      no('[2, 4]', 'The merged start is the earlier start.'),
    ),
    q(
      'intervals = [[1, 4], [0, 2], [3, 5]]. What is the result?',
      yes('[[0, 5]]', 'Sorted: [0, 2], [1, 4], [3, 5]. Each overlaps the running merge.'),
      no('[[0, 4], [3, 5]]', '[3, 5] starts at 3, which is inside [0, 4].'),
      no('[[1, 4], [0, 2], [3, 5]]', 'These overlap and must be merged.'),
    ),
  ],
  approach: [
    q(
      'How do you merge everything that overlaps?',
      yes('Sort by start; keep a result list; each interval either extends the last result or starts a new one', 'After sorting, an interval can only overlap the most recent merged interval.', { time: 'O(n log n)', space: 'O(n)' }),
      ok('Repeatedly scan all pairs and merge any two that overlap until nothing changes', 'Correct, but each scan is quadratic and you may need many.', { time: 'O(n³)', space: 'O(n)' }),
      no('Merge each interval with the next one in the given order', 'Without sorting, overlapping intervals may be far apart.', { time: 'O(n)', space: 'O(n)' }),
    ),
    q(
      'The current interval overlaps the last merged one. What is the merged end?',
      yes('The larger of the two ends', 'The current interval might be swallowed completely, as with [1, 4] and [2, 3].'),
      no('The current interval\'s end', 'That would shrink [1, 4] to [1, 3] in that example.'),
      no('The sum of the two ends', 'Ends are positions, not lengths.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you get the most recently merged interval?',
      yes('merged[-1]', 'Index −1 is the last element; changing merged[-1][1] updates it in place.'),
      no('merged[0]', 'That is the first merged interval.'),
      no('merged.pop()', 'That removes it from the result.'),
    ),
    java: q(
      'merged is a List<int[]>. How do you return it as int[][]?',
      yes('merged.toArray(new int[merged.size()][]);', 'toArray with a typed array gives back an int[][].'),
      no('(int[][]) merged', 'A List cannot be cast to an array.'),
      no('merged.toArray()', 'Without an argument it returns Object[], which is not an int[][].'),
    ),
  },
  plan: [
    'Sort the intervals by start.',
    'Start the result with the first interval.',
    'Visit each remaining interval.',
    'If it starts at or before the end of the last result, extend that end to the larger of the two ends.',
    'Otherwise append it as a new result interval.',
    'Return the result.',
  ],
  hints: ['Once sorted by start, which earlier interval is the only one the current interval could overlap?', 'Sort, then sweep: extend the last merged interval or start a new one.'],
  solution: {
    python: `def merge(intervals):
    intervals.sort()
    merged = [intervals[0]]
    for i in range(1, len(intervals)):
        last = merged[-1]
        if intervals[i][0] <= last[1]:
            last[1] = max(last[1], intervals[i][1])
        else:
            merged.append(intervals[i])
    return merged
`,
    java: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        List<int[]> merged = new ArrayList<>();
        merged.add(intervals[0]);
        for (int i = 1; i < intervals.length; i++) {
            int[] last = merged.get(merged.size() - 1);
            if (intervals[i][0] <= last[1]) {
                last[1] = Math.max(last[1], intervals[i][1]);
            } else {
                merged.add(intervals[i]);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}
`,
  },
  tests: [
    [[[[1, 3], [2, 6], [8, 10], [15, 18]]], [[1, 6], [8, 10], [15, 18]]],
    [[[[1, 4], [4, 5]]], [[1, 5]]],
    [[[[5, 7]]], [[5, 7]]],
    [[[[1, 4], [0, 2], [3, 5]]], [[0, 5]]],
    [[[[1, 4], [2, 3]]], [[1, 4]]],
  ],
  reflect: ['Why can a sorted interval only overlap the most recent merged one? Why take the max of the ends?', 'O(n log n)', 'O(n)'],
});
