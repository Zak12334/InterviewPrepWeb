import type { Problem } from '@/types/content';

const BIG_O = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];

export const twoSum: Problem = {
  slug: 'two-sum',
  title: 'Two Sum',
  pattern: 'arrays-hashing',
  difficulty: 'Easy',
  leetcode: 1,
  statement:
    'You get {{a list|an array}} of integers and a target. Exactly one pair of different positions holds values that add up to the target. Return those two positions, smaller index first.',
  constraints: ['2 ≤ nums.length ≤ 10,000', 'Values can be negative', 'You may not use the same position twice'],
  examples: [
    { input: 'nums = [3, 8, 5, 11, 4], target = 9', output: '[2, 4]', explanation: 'nums[2] + nums[4] = 5 + 4 = 9.' },
    { input: 'nums = [3, 3], target = 6', output: '[0, 1]', explanation: 'Equal values at different positions are fine.' },
  ],
  signature: {
    python: 'two_sum',
    java: 'twoSum',
    params: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
    returns: 'int[]',
  },
  understanding: [
    {
      prompt: 'nums = [4, 2, 4], target = 8. What is the answer?',
      options: [
        { label: '[0, 2]', correct: true, feedback: 'Right. Two different positions that both hold 4.' },
        { label: '[0, 0]', feedback: 'That uses position 0 twice. The pair must be two different positions.' },
        { label: '[4, 4]', feedback: 'Those are the values. The question asks for the positions (indices).' },
      ],
    },
    {
      prompt: 'You are standing on the value 5 and the target is 9. What single value would finish the pair?',
      options: [
        { label: '4', correct: true, feedback: 'Yes: target − current. Hold on to that idea, it is the whole problem.' },
        { label: '14', feedback: 'That is target + current. You need the amount still missing: 9 − 5.' },
        { label: 'It depends on the rest of the {{list|array}}', feedback: 'The partner is fully determined: it must be 9 − 5 = 4. The {{list|array}} only decides whether a 4 exists.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'For each number you know exactly which partner you need. How do you find out if that partner exists?',
      options: [
        {
          label: 'Try every pair with two nested loops',
          valid: true,
          feedback: 'Correct answers, but for each number you re-scan the rest of the {{list|array}}. Watch how many steps it burns.',
          complexity: { time: 'O(n²)', space: 'O(1)' },
          demo: `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]`,
        },
        {
          label: 'Remember every value already passed in a {{dict|HashMap}}, and look the partner up',
          correct: true,
          feedback: 'One pass. Each lookup is instant, so you trade a little memory for a lot of time.',
          complexity: { time: 'O(n)', space: 'O(n)' },
          demo: `def two_sum(nums, target):
    seen = {}
    for i, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], i]
        seen[value] = i`,
        },
        {
          label: 'Sort the {{list|array}}, then close in from both ends',
          feedback: 'The two-pointer idea finds the values, but sorting scrambles the positions you were asked to return. You would have to carry the original indices along.',
          complexity: { time: 'O(n log n)', space: 'O(n)' },
        },
      ],
    },
    {
      prompt: 'What should the {{dict|HashMap}} hold so you can answer with positions?',
      options: [
        { label: 'value → index where it was seen', correct: true, feedback: 'Look up the partner value, get back its position immediately.' },
        { label: 'index → value', feedback: 'That is just the {{list|array}} again. You cannot ask it "where is a 4?" without scanning.' },
        { label: 'value → how many times it appears', feedback: 'Counts tell you a partner exists, but not where it is.' },
      ],
    },
    {
      prompt: 'At each number: look up the partner first, or store the current number first?',
      options: [
        { label: 'Look up first, then store', correct: true, feedback: 'The map then only ever contains earlier positions, so a number can never pair with itself.' },
        { label: 'Store first, then look up', feedback: 'With nums = [4, 1] and target 8, the 4 would find itself and you would return [0, 0].' },
      ],
    },
  ],
  planSteps: [
    'Create an empty map from value to index.',
    'Walk through the {{list|array}} with both index and value.',
    'Work out the partner needed: target − value.',
    'If the partner is already in the map, return its index and the current index.',
    'Otherwise record the current value and its index in the map.',
  ],
  hints: [
    'While standing on one number, which exact number are you hoping to have seen already?',
    'A {{dict|HashMap}} answers "have I seen X, and where?" in one step. Fill it as you walk.',
    'for each (i, value):\n    need = target - value\n    if need is in the map → return [map[need], i]\n    map[value] = i',
  ],
  starter: {
    python: `def two_sum(nums, target):
    # Write your plan as code. The animation follows every line you add.
    pass
`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your plan as code. The animation follows every line you add.
        return new int[0];
    }
}
`,
  },
  solution: {
    python: `def two_sum(nums, target):
    seen = {}
    for i, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], i]
        seen[value] = i
`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[]{seen.get(need), i};
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
`,
  },
  tests: [
    { args: [[3, 8, 5, 11, 4], 9], expected: [2, 4] },
    { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { args: [[3, 3], 6], expected: [0, 1] },
    { args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
    { args: [[4, 1, 9, 7, 3, 8], 17], expected: [2, 5] },
  ],
  demoArgs: [[6, 2, 9, 4, 12, 7, 3, 15], 22],
  reflect: {
    prompt: 'In your own words: why does remembering what you have seen remove the need for the inner loop?',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(n)' },
  },
};

export const containsDuplicate: Problem = {
  slug: 'contains-duplicate',
  title: 'Contains Duplicate',
  pattern: 'arrays-hashing',
  difficulty: 'Easy',
  leetcode: 217,
  statement: 'Given {{a list|an array}} of integers, return {{True|true}} if any value shows up more than once, and {{False|false}} if every value is different.',
  constraints: ['1 ≤ nums.length ≤ 100,000', 'Values can be negative'],
  examples: [
    { input: 'nums = [5, 1, 8, 1]', output: '{{True|true}}', explanation: '1 appears at positions 1 and 3.' },
    { input: 'nums = [4, 9, 2]', output: '{{False|false}}', explanation: 'All three values are different.' },
  ],
  signature: { python: 'contains_duplicate', java: 'containsDuplicate', params: [{ name: 'nums', type: 'int[]' }], returns: 'boolean' },
  understanding: [
    {
      prompt: 'nums = [7]. What should be returned?',
      options: [
        { label: '{{False|false}}', correct: true, feedback: 'One value cannot repeat.' },
        { label: '{{True|true}}', feedback: 'A duplicate needs at least two positions with the same value.' },
      ],
    },
    {
      prompt: 'When can you stop looking?',
      options: [
        { label: 'The moment one repeat is found', correct: true, feedback: 'The question is yes/no. One repeat settles it, so return early.' },
        { label: 'Only after reading the whole {{list|array}}', feedback: 'That is only necessary when the answer is {{False|false}}. A found repeat already proves {{True|true}}.' },
        { label: 'After counting every value', feedback: 'You were not asked how many repeats. One is enough.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'How do you know whether the number in your hand appeared earlier?',
      options: [
        {
          label: 'Compare it against every earlier number',
          valid: true,
          feedback: 'Works, but the comparisons pile up: the 1,000th number needs 999 checks.',
          complexity: { time: 'O(n²)', space: 'O(1)' },
          demo: `def contains_duplicate(nums):
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] == nums[i]:
                return True
    return False`,
        },
        {
          label: 'Keep a {{set|HashSet}} of numbers already seen',
          correct: true,
          feedback: 'A {{set|HashSet}} answers "is this in here?" in one step, so each number costs constant work.',
          complexity: { time: 'O(n)', space: 'O(n)' },
          demo: `def contains_duplicate(nums):
    seen = set()
    for value in nums:
        if value in seen:
            return True
        seen.add(value)
    return False`,
        },
        {
          label: 'Sort, then compare neighbours',
          valid: true,
          feedback: 'Valid: equal values end up side by side. Sorting costs more than one pass with a {{set|HashSet}}, but uses no extra structure. Worth knowing; the {{set|HashSet}} is the faster default.',
          complexity: { time: 'O(n log n)', space: 'O(1)' },
        },
      ],
    },
    {
      prompt: 'Why a {{set|HashSet}} and not {{a list|an array}} for the "seen" collection?',
      options: [
        { label: 'Membership checks on a {{set|HashSet}} take constant time', correct: true, feedback: '{{A list|An array}} would scan element by element, which quietly brings back the O(n²).' },
        { label: 'Sets use less memory', feedback: 'They typically use more. The win is lookup speed.' },
        { label: 'Sets keep things in order', feedback: 'They do not, and order does not matter here anyway.' },
      ],
    },
  ],
  planSteps: [
    'Create an empty {{set|HashSet}} of seen values.',
    'Visit each value in the {{list|array}}.',
    'If the value is already in the {{set|HashSet}}, return {{True|true}}.',
    'Otherwise add the value to the {{set|HashSet}}.',
    'After the loop ends with no repeat, return {{False|false}}.',
  ],
  hints: [
    'What question do you ask about each number as you reach it?',
    'A {{set|HashSet}} gives you instant "have I seen this?" checks.',
    'for each value:\n    if value is in seen → return {{True|true}}\n    add value to seen\nreturn {{False|false}}',
  ],
  starter: {
    python: `def contains_duplicate(nums):
    pass
`,
    java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        return false;
    }
}
`,
  },
  solution: {
    python: `def contains_duplicate(nums):
    seen = set()
    for value in nums:
        if value in seen:
            return True
        seen.add(value)
    return False
`,
    java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int value : nums) {
            if (seen.contains(value)) {
                return true;
            }
            seen.add(value);
        }
        return false;
    }
}
`,
  },
  tests: [
    { args: [[5, 1, 8, 3, 1, 6]], expected: true },
    { args: [[4, 9, 2]], expected: false },
    { args: [[7]], expected: false },
    { args: [[2, 2]], expected: true },
    { args: [[-1, 0, 1, -1]], expected: true },
  ],
  demoArgs: [[9, 4, 7, 1, 8, 3, 6, 4]],
  reflect: {
    prompt: 'Explain the trade you made: what did you spend, and what did you buy with it?',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(n)' },
  },
};

export const maxProfit: Problem = {
  slug: 'best-time-to-buy-and-sell-stock',
  title: 'Best Time to Buy and Sell Stock',
  pattern: 'sliding-window',
  difficulty: 'Easy',
  leetcode: 121,
  statement:
    'prices[i] is the price of a stock on day i. Pick one day to buy and a later day to sell. Return the largest profit possible, or 0 if no trade makes money.',
  constraints: ['1 ≤ prices.length ≤ 100,000', '0 ≤ prices[i] ≤ 10,000', 'You must buy before you sell'],
  examples: [
    { input: 'prices = [7, 2, 5, 1, 6, 4]', output: '5', explanation: 'Buy at 1 (day 3), sell at 6 (day 4).' },
    { input: 'prices = [9, 6, 3]', output: '0', explanation: 'Prices only fall, so the best move is no trade.' },
  ],
  signature: { python: 'max_profit', java: 'maxProfit', params: [{ name: 'prices', type: 'int[]' }], returns: 'int' },
  understanding: [
    {
      prompt: 'prices = [3, 10, 1, 4]. What is the best profit?',
      options: [
        { label: '7', correct: true, feedback: 'Buy at 3, sell at 10. The later low of 1 only offers 4 − 1 = 3.' },
        { label: '9', feedback: '10 − 1 would mean selling on day 1 and buying on day 2. Time only runs forward.' },
        { label: '3', feedback: 'That is buying at the overall minimum. The overall minimum is not always the best buy day.' },
      ],
    },
    {
      prompt: 'If you sell today, which buy day gives the most profit?',
      options: [
        { label: 'The cheapest day before today', correct: true, feedback: 'Exactly. So for each day you only need one number from the past: the lowest price so far.' },
        { label: 'Yesterday', feedback: 'Not necessarily. An even cheaper day further back gives more.' },
        { label: 'The cheapest day in the whole {{list|array}}', feedback: 'That day might come after today, and you cannot buy in the future.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'How do you find the best buy/sell pair?',
      options: [
        {
          label: 'Try every buy day with every later sell day',
          valid: true,
          feedback: 'Correct but slow. Every sell day re-examines all earlier days, even though only the cheapest one matters.',
          complexity: { time: 'O(n²)', space: 'O(1)' },
          demo: `def max_profit(prices):
    best = 0
    for buy in range(len(prices)):
        for sell in range(buy + 1, len(prices)):
            best = max(best, prices[sell] - prices[buy])
    return best`,
        },
        {
          label: 'Walk once, carrying the lowest price so far',
          correct: true,
          feedback: 'Each day: "if I sold today, I would have bought at the lowest price so far." One pass, two variables.',
          complexity: { time: 'O(n)', space: 'O(1)' },
          demo: `def max_profit(prices):
    lowest = prices[0]
    best = 0
    for price in prices:
        lowest = min(lowest, price)
        best = max(best, price - lowest)
    return best`,
        },
        {
          label: 'Find the minimum and the maximum, subtract',
          feedback: 'Take [10, 1]: max − min = 9, but the 10 comes before the 1, so that trade is impossible. Order matters.',
          complexity: { time: 'O(n)', space: 'O(1)' },
        },
      ],
    },
    {
      prompt: 'Which two things do you need to remember while walking?',
      options: [
        { label: 'Lowest price so far, and best profit so far', correct: true, feedback: 'Everything else about the past is irrelevant.' },
        { label: 'Lowest price and highest price so far', feedback: 'The highest so far may have happened before the lowest, which is not a legal trade.' },
        { label: 'Every previous price', feedback: 'You only ever use the smallest of them. Keep that one number.' },
      ],
    },
  ],
  planSteps: [
    'Start with lowest = the first price and best = 0.',
    'Visit each price in order.',
    'If this price is below lowest, it becomes the new lowest.',
    'Compute the profit of selling today: price − lowest.',
    'If that profit beats best, update best.',
    'After the loop, return best.',
  ],
  hints: [
    'Fix the sell day. What is the only fact about earlier days you care about?',
    'Carry a running minimum. At every day compare (price − minimum) with your best.',
    'lowest = prices[0]; best = 0\nfor each price:\n    lowest = min(lowest, price)\n    best = max(best, price - lowest)\nreturn best',
  ],
  starter: {
    python: `def max_profit(prices):
    pass
`,
    java: `class Solution {
    public int maxProfit(int[] prices) {
        return 0;
    }
}
`,
  },
  solution: {
    python: `def max_profit(prices):
    lowest = prices[0]
    best = 0
    for price in prices:
        lowest = min(lowest, price)
        best = max(best, price - lowest)
    return best
`,
    java: `class Solution {
    public int maxProfit(int[] prices) {
        int lowest = prices[0];
        int best = 0;
        for (int price : prices) {
            lowest = Math.min(lowest, price);
            best = Math.max(best, price - lowest);
        }
        return best;
    }
}
`,
  },
  tests: [
    { args: [[7, 2, 5, 1, 6, 4]], expected: 5 },
    { args: [[9, 6, 3]], expected: 0 },
    { args: [[3, 10, 1, 4]], expected: 7 },
    { args: [[5]], expected: 0 },
    { args: [[2, 4, 1, 7, 3, 9]], expected: 8 },
  ],
  demoArgs: [[7, 2, 5, 1, 6, 4, 8, 3]],
  reflect: {
    prompt: 'Why is "lowest price so far" enough? What did the brute force waste time on?',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(1)' },
  },
};

export const climbStairs: Problem = {
  slug: 'climbing-stairs',
  title: 'Climbing Stairs',
  pattern: 'dp-1d',
  difficulty: 'Easy',
  leetcode: 70,
  statement: 'A staircase has n steps. Each move you climb either 1 or 2 steps. Return how many different sequences of moves reach the top.',
  constraints: ['1 ≤ n ≤ 45'],
  examples: [
    { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1.' },
    { input: 'n = 4', output: '5', explanation: '1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2.' },
  ],
  signature: { python: 'climb_stairs', java: 'climbStairs', params: [{ name: 'n', type: 'int' }], returns: 'int' },
  understanding: [
    {
      prompt: 'Are 1+2 and 2+1 counted as the same way to climb 3 steps?',
      options: [
        { label: 'No, order matters, they are two ways', correct: true, feedback: 'Right, a way is a sequence of moves.' },
        { label: 'Yes, they use the same moves', feedback: 'The example for n = 3 lists both. Each ordering counts separately.' },
      ],
    },
    {
      prompt: 'Your last move onto step n came from where?',
      options: [
        { label: 'Step n−1 or step n−2', correct: true, feedback: 'So every way to reach n is a way to reach n−1 plus a 1-step, or a way to reach n−2 plus a 2-step.' },
        { label: 'Always step n−1', feedback: 'You could also have arrived with a 2-step from n−2.' },
        { label: 'Any lower step', feedback: 'A single move covers at most 2 steps.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'ways(n) = ways(n−1) + ways(n−2). How do you compute it?',
      options: [
        {
          label: 'Plain recursion straight from the formula',
          valid: true,
          feedback: 'Correct but it recomputes the same sub-answers again and again. Watch the call stack thrash.',
          complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
          demo: `def climb_stairs(n):
    if n <= 2:
        return n
    return climb_stairs(n - 1) + climb_stairs(n - 2)`,
        },
        {
          label: 'Build up from the bottom, keeping only the last two answers',
          correct: true,
          feedback: 'Each answer is computed once and only two are ever needed at a time.',
          complexity: { time: 'O(n)', space: 'O(1)' },
          demo: `def climb_stairs(n):
    if n <= 2:
        return n
    prev, curr = 1, 2
    for step in range(3, n + 1):
        prev, curr = curr, prev + curr
    return curr`,
        },
        {
          label: 'List out every sequence and count them',
          feedback: 'The number of sequences grows exponentially; for n = 45 there are over a billion.',
          complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
        },
      ],
    },
    {
      prompt: 'What are the starting values before the loop?',
      options: [
        { label: 'ways(1) = 1 and ways(2) = 2', correct: true, feedback: 'One step: just "1". Two steps: "1+1" or "2".' },
        { label: 'ways(1) = 1 and ways(2) = 1', feedback: 'Two steps can be climbed as 1+1 or as 2, so that is 2 ways.' },
        { label: 'ways(0) = 0 and ways(1) = 1', feedback: 'That would give ways(2) = 1, but there are 2 ways to climb two steps.' },
      ],
    },
  ],
  planSteps: [
    'If n is 1 or 2, return n directly.',
    'Set prev = 1 (ways to reach step 1) and curr = 2 (ways to reach step 2).',
    'Loop over steps 3 up to n.',
    'The new count is prev + curr; slide both variables forward.',
    'Return curr.',
  ],
  hints: [
    'Think about the very last move. Where could you have been standing just before it?',
    'Each answer depends only on the two before it. Build upward from the small cases.',
    'prev, curr = 1, 2\nrepeat for steps 3..n:\n    prev, curr = curr, prev + curr\nreturn curr',
  ],
  starter: {
    python: `def climb_stairs(n):
    pass
`,
    java: `class Solution {
    public int climbStairs(int n) {
        return 0;
    }
}
`,
  },
  solution: {
    python: `def climb_stairs(n):
    if n <= 2:
        return n
    prev, curr = 1, 2
    for step in range(3, n + 1):
        prev, curr = curr, prev + curr
    return curr
`,
    java: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }
        int prev = 1, curr = 2;
        for (int step = 3; step <= n; step++) {
            int next = prev + curr;
            prev = curr;
            curr = next;
        }
        return curr;
    }
}
`,
  },
  tests: [
    { args: [6], expected: 13 },
    { args: [1], expected: 1 },
    { args: [2], expected: 2 },
    { args: [3], expected: 3 },
    { args: [10], expected: 89 },
    { args: [30], expected: 1346269 },
  ],
  demoArgs: [7],
  reflect: {
    prompt: 'Why did the plain recursion explode, and what exactly does the bottom-up version avoid repeating?',
    time: { options: [...BIG_O, 'O(2ⁿ)'], answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(1)' },
  },
};
