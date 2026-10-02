import type { Problem } from '@/types/content';

const BIG_O = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];

export const twoSumSorted: Problem = {
  slug: 'two-sum-ii-sorted',
  title: 'Two Sum II — Sorted Input',
  pattern: 'two-pointers',
  difficulty: 'Medium',
  leetcode: 167,
  statement:
    'The {{list|array}} is sorted in increasing order. Exactly one pair of values adds up to the target. Return their positions counted from 1 (not 0), smaller first. Use only constant extra memory.',
  constraints: ['2 ≤ numbers.length ≤ 30,000', 'numbers is sorted ascending', 'Answer positions are 1-based', 'O(1) extra space'],
  examples: [
    { input: 'numbers = [1, 3, 4, 6, 8, 11], target = 10', output: '[3, 4]', explanation: '4 + 6 = 10; they are the 3rd and 4th numbers.' },
    { input: 'numbers = [2, 7, 11, 15], target = 9', output: '[1, 2]', explanation: '2 + 7 = 9.' },
  ],
  signature: {
    python: 'two_sum_sorted',
    java: 'twoSum',
    params: [
      { name: 'numbers', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
    returns: 'int[]',
  },
  understanding: [
    {
      prompt: 'numbers = [2, 3, 9], target = 11. What is returned?',
      options: [
        { label: '[1, 3]', correct: true, feedback: '2 and 9 are the 1st and 3rd numbers. Positions start at 1 here.' },
        { label: '[0, 2]', feedback: 'Those are 0-based indices. This problem wants positions counted from 1.' },
        { label: '[2, 9]', feedback: 'Those are the values, not the positions.' },
      ],
    },
    {
      prompt: 'You add the smallest and the largest number and the sum is too big. What do you now know?',
      options: [
        { label: 'The largest number cannot be in the answer', correct: true, feedback: 'Even paired with the smallest it overshoots, so it overshoots with everything. Throw it away.' },
        { label: 'The smallest number cannot be in the answer', feedback: 'Replacing the smallest with anything bigger only makes the sum larger still.' },
        { label: 'Nothing; you need to check other pairs', feedback: 'Sorted order tells you more than that: the largest is already too big with its best possible partner.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'The {{list|array}} is sorted and extra memory is off the table. How do you search?',
      options: [
        {
          label: 'Two pointers: one at each end, move inward based on the sum',
          correct: true,
          feedback: 'Every comparison eliminates one number for good, so the pointers meet after at most n moves.',
          complexity: { time: 'O(n)', space: 'O(1)' },
          demo: `def two_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]
        if total < target:
            left += 1
        else:
            right -= 1`,
        },
        {
          label: '{{Dict|HashMap}} of seen values, like Two Sum',
          valid: true,
          feedback: 'It works, but it spends O(n) memory and ignores the gift of sorted order. The constraint rules it out.',
          complexity: { time: 'O(n)', space: 'O(n)' },
        },
        {
          label: 'Check every pair',
          valid: true,
          feedback: 'Ignores the sorted order completely. Watch how much work that is.',
          complexity: { time: 'O(n²)', space: 'O(1)' },
          demo: `def two_sum_sorted(numbers, target):
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == target:
                return [i + 1, j + 1]`,
        },
      ],
    },
    {
      prompt: 'numbers[left] + numbers[right] is smaller than the target. Which pointer moves?',
      options: [
        { label: 'left moves right', correct: true, feedback: 'You need a bigger sum, and the only way to get one is a bigger left value.' },
        { label: 'right moves left', feedback: 'That makes the sum even smaller.' },
        { label: 'Both move inward', feedback: 'You could skip straight past the answer. Move only the pointer you have proven useless.' },
      ],
    },
  ],
  planSteps: [
    'Put left at the first position and right at the last.',
    'Repeat while left is before right.',
    'Add the two values the pointers sit on.',
    'If the sum equals the target, return both positions plus one.',
    'Otherwise move one pointer inward: left if the sum is too small, right if it is too big.',
  ],
  hints: [
    'What does sorted order tell you when smallest + largest is too big? Too small?',
    'Start with pointers at both ends. Each comparison lets you discard one end.',
    'left = 0; right = last index\nwhile left < right:\n    total = numbers[left] + numbers[right]\n    equal → return [left + 1, right + 1]\n    too small → left += 1\n    too big → right -= 1',
  ],
  starter: {
    python: `def two_sum_sorted(numbers, target):
    pass
`,
    java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        return new int[0];
    }
}
`,
  },
  solution: {
    python: `def two_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]
        if total < target:
            left += 1
        else:
            right -= 1
`,
    java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int total = numbers[left] + numbers[right];
            if (total == target) {
                return new int[]{left + 1, right + 1};
            }
            if (total < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[0];
    }
}
`,
  },
  tests: [
    { args: [[1, 3, 4, 6, 8, 11], 10], expected: [3, 4] },
    { args: [[2, 7, 11, 15], 9], expected: [1, 2] },
    { args: [[2, 3, 9], 11], expected: [1, 3] },
    { args: [[-4, -1, 0, 5], -5], expected: [1, 2] },
    { args: [[1, 2, 5, 9, 14, 20, 27], 34], expected: [5, 6] },
  ],
  demoArgs: [[1, 2, 5, 8, 9, 14, 20, 27], 22],
  reflect: {
    prompt: 'Why is it safe to throw a number away after a single comparison? What would break if the {{list|array}} were not sorted?',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(1)' },
  },
};

export const longestSubstring: Problem = {
  slug: 'longest-substring-without-repeating',
  title: 'Longest Substring Without Repeating Characters',
  pattern: 'sliding-window',
  difficulty: 'Medium',
  leetcode: 3,
  statement: 'Given a string, return the length of the longest stretch of consecutive characters in which no character appears twice.',
  constraints: ['0 ≤ s.length ≤ 50,000', 's may contain letters, digits, symbols and spaces'],
  examples: [
    { input: 's = "abcabcbb"', output: '3', explanation: '"abc" is the longest stretch with all different characters.' },
    { input: 's = "pwwkew"', output: '3', explanation: '"wke". Note "pwke" is not consecutive, so it does not count.' },
  ],
  signature: { python: 'length_of_longest_substring', java: 'lengthOfLongestSubstring', params: [{ name: 's', type: 'String' }], returns: 'int' },
  understanding: [
    {
      prompt: 's = "dvdf". What is the answer?',
      options: [
        { label: '3', correct: true, feedback: '"vdf". The window has to restart after the first d, not after the second.' },
        { label: '2', feedback: '"dv" and "df" are valid, but "vdf" is longer.' },
        { label: '4', feedback: 'The whole string contains d twice.' },
      ],
    },
    {
      prompt: 'Your current stretch is "abc" and the next character is "b". What is the longest valid stretch that ends on this new b?',
      options: [
        { label: '"cb"', correct: true, feedback: 'Everything up to and including the old b has to go. You do not restart from scratch.' },
        { label: '"b"', feedback: 'Too aggressive: "c" does not clash with anything, so it can stay.' },
        { label: '"abcb"', feedback: 'That contains b twice.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'How do you search for the longest clean stretch?',
      options: [
        {
          label: 'Start a fresh scan from every position',
          valid: true,
          feedback: 'Correct, but each restart re-reads characters you already know are fine.',
          complexity: { time: 'O(n²)', space: 'O(n)' },
          demo: `def length_of_longest_substring(s):
    best = 0
    for start in range(len(s)):
        seen = set()
        for end in range(start, len(s)):
            if s[end] in seen:
                break
            seen.add(s[end])
            best = max(best, end - start + 1)
    return best`,
        },
        {
          label: 'Slide a window: grow the right edge, shrink the left edge when a repeat enters',
          correct: true,
          feedback: 'Each character enters the window once and leaves at most once.',
          complexity: { time: 'O(n)', space: 'O(n)' },
          demo: `def length_of_longest_substring(s):
    window = set()
    left = 0
    best = 0
    for right in range(len(s)):
        while s[right] in window:
            window.remove(s[left])
            left += 1
        window.add(s[right])
        best = max(best, right - left + 1)
    return best`,
        },
        {
          label: 'Count the distinct characters in the string',
          feedback: '"abbc" has 3 distinct characters, but the two b\'s sit side by side, so the longest clean stretch is only 2 ("ab" or "bc"). Where the characters sit matters.',
          complexity: { time: 'O(n)', space: 'O(n)' },
        },
      ],
    },
    {
      prompt: 'The character at right is already inside the window. What do you do?',
      options: [
        { label: 'Remove characters from the left until that character is gone, then add it', correct: true, feedback: 'The window stays valid at every moment, and left only ever moves forward.' },
        { label: 'Empty the window and restart at right', feedback: 'For "dvdf" that drops the v and you would answer 2 instead of 3.' },
        { label: 'Skip this character', feedback: 'A substring cannot skip characters; it must be consecutive.' },
      ],
    },
  ],
  planSteps: [
    'Create an empty {{set|HashSet}} for the window, left = 0 and best = 0.',
    'Move right across the string one character at a time.',
    'While the character at right is already in the window, remove the character at left and advance left.',
    'Add the character at right to the window.',
    'Update best with the window length: right − left + 1.',
    'Return best.',
  ],
  hints: [
    'When a repeat shows up, how much of your current stretch is still usable?',
    'Keep a window [left, right] and a {{set|HashSet}} of what is inside it. Shrink from the left only as far as needed.',
    'for right in 0..n-1:\n    while s[right] in window:\n        remove s[left]; left += 1\n    add s[right]\n    best = max(best, right - left + 1)',
  ],
  starter: {
    python: `def length_of_longest_substring(s):
    pass
`,
    java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        return 0;
    }
}
`,
  },
  solution: {
    python: `def length_of_longest_substring(s):
    window = set()
    left = 0
    best = 0
    for right in range(len(s)):
        while s[right] in window:
            window.remove(s[left])
            left += 1
        window.add(s[right])
        best = max(best, right - left + 1)
    return best
`,
    java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            while (window.contains(s.charAt(right))) {
                window.remove(s.charAt(left));
                left++;
            }
            window.add(s.charAt(right));
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
`,
  },
  tests: [
    { args: ['abcabcbb'], expected: 3 },
    { args: ['pwwkew'], expected: 3 },
    { args: ['dvdf'], expected: 3 },
    { args: [''], expected: 0 },
    { args: ['bbbb'], expected: 1 },
    { args: ['a b c a'], expected: 3 },
  ],
  demoArgs: ['abcbdeafb'],
  reflect: {
    prompt: 'There is a while loop inside a for loop, yet this is O(n). Explain why in your own words.',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(n)' },
  },
};

export const binarySearch: Problem = {
  slug: 'binary-search',
  title: 'Binary Search',
  pattern: 'binary-search',
  difficulty: 'Easy',
  leetcode: 704,
  statement: 'Given a sorted {{list|array}} of distinct integers and a target, return the index of the target, or −1 if it is not in the {{list|array}}.',
  constraints: ['1 ≤ nums.length ≤ 10,000', 'nums is sorted ascending with no repeats', 'Aim for O(log n)'],
  examples: [
    { input: 'nums = [-4, 1, 3, 7, 9, 12, 20], target = 9', output: '4', explanation: '9 sits at index 4.' },
    { input: 'nums = [2, 5, 8], target = 6', output: '-1', explanation: '6 is not present.' },
  ],
  signature: {
    python: 'search',
    java: 'search',
    params: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
    returns: 'int',
  },
  understanding: [
    {
      prompt: 'You look at the middle value and it is smaller than the target. Where can the target still be?',
      options: [
        { label: 'Only to the right of the middle', correct: true, feedback: 'Everything left of the middle is smaller still, so half the {{list|array}} is eliminated by one look.' },
        { label: 'Only to the left of the middle', feedback: 'Values on the left are even smaller than the middle.' },
        { label: 'Anywhere', feedback: 'The {{list|array}} is sorted, so one comparison rules out an entire half.' },
      ],
    },
    {
      prompt: '{{A list|An array}} has 1,000,000 sorted values. Roughly how many looks does halving need in the worst case?',
      options: [
        { label: 'About 20', correct: true, feedback: '2²⁰ is just over a million. That is what O(log n) buys you.' },
        { label: 'About 1,000', feedback: 'That would be √n. Halving is far faster.' },
        { label: 'About 500,000', feedback: 'That is a linear scan on average. Halving each time collapses the range much quicker.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'How do you find the target?',
      options: [
        {
          label: 'Scan from the start until you hit it',
          valid: true,
          feedback: 'Correct but ignores the sorted order: one look eliminates one value.',
          complexity: { time: 'O(n)', space: 'O(1)' },
          demo: `def search(nums, target):
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return -1`,
        },
        {
          label: 'Keep a [low, high] range and repeatedly test its middle',
          correct: true,
          feedback: 'One look eliminates half of what remains.',
          complexity: { time: 'O(log n)', space: 'O(1)' },
          demo: `def search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
        },
        {
          label: 'Put everything in a {{set|HashSet}} and check membership',
          feedback: 'Building the {{set|HashSet}} already reads every value, and a {{set|HashSet}} cannot tell you the index.',
          complexity: { time: 'O(n)', space: 'O(n)' },
        },
      ],
    },
    {
      prompt: 'nums[mid] is smaller than the target. What is the new range?',
      options: [
        { label: 'low = mid + 1', correct: true, feedback: 'mid itself has been checked and rejected, so exclude it.' },
        { label: 'low = mid', feedback: 'When low and high are neighbours, mid equals low and the range never shrinks: an infinite loop.' },
        { label: 'high = mid − 1', feedback: 'That keeps the half with the smaller values and discards the half that could hold the target.' },
      ],
    },
    {
      prompt: 'When should the loop keep going?',
      options: [
        { label: 'While low ≤ high', correct: true, feedback: 'When low equals high there is still one unchecked value in the range.' },
        { label: 'While low < high', feedback: 'That stops with one candidate unexamined. Searching [5] for 5 would return −1.' },
      ],
    },
  ],
  planSteps: [
    'Set low to the first index and high to the last.',
    'Repeat while low ≤ high.',
    'Compute mid, the middle index of the range.',
    'If nums[mid] is the target, return mid.',
    'If nums[mid] is too small, move low to mid + 1; otherwise move high to mid − 1.',
    'If the range empties, return −1.',
  ],
  hints: [
    'If you could look at only one value, which one tells you the most?',
    'Track the range that could still contain the target with two indices, and halve it each time.',
    'low = 0; high = n - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    equal → return mid\n    too small → low = mid + 1\n    too big → high = mid - 1\nreturn -1',
  ],
  starter: {
    python: `def search(nums, target):
    pass
`,
    java: `class Solution {
    public int search(int[] nums, int target) {
        return -1;
    }
}
`,
  },
  solution: {
    python: `def search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`,
    java: `class Solution {
    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) {
                return mid;
            }
            if (nums[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }
}
`,
  },
  tests: [
    { args: [[-4, 1, 3, 7, 9, 12, 20, 31], 12], expected: 5 },
    { args: [[2, 5, 8], 6], expected: -1 },
    { args: [[5], 5], expected: 0 },
    { args: [[1, 4], 4], expected: 1 },
    { args: [[1, 4, 6, 9], 0], expected: -1 },
    { args: [[3, 6, 9, 12, 15, 18, 21, 24, 27, 30], 3], expected: 0 },
  ],
  demoArgs: [[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], 32],
  reflect: {
    prompt: 'Explain why you use mid + 1 and mid − 1 rather than mid, and why the loop condition is ≤.',
    time: { options: BIG_O, answer: 'O(log n)' },
    space: { options: BIG_O, answer: 'O(1)' },
  },
};
