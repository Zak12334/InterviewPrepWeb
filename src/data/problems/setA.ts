import { make, no, ok, q, yes } from './builder';

export const groupAnagrams = make({
  slug: 'group-anagrams',
  title: 'Group Anagrams',
  pattern: 'arrays-hashing',
  difficulty: 'Medium',
  leetcode: 49,
  statement:
    'You get {{a list|an array}} of lowercase words. Put the words that are anagrams of each other (same letters, different order) into the same group, and return all the groups. The order of the groups does not matter.',
  constraints: ['1 ≤ strs.length ≤ 10,000', 'Words contain only lowercase letters and may be empty'],
  examples: [
    ['strs = ["eat", "tea", "tan", "ate", "nat", "bat"]', '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]', 'Three different sets of letters, so three groups.'],
    ['strs = ["a"]', '[["a"]]', 'A word with no partner is a group of one.'],
  ],
  fn: ['group_anagrams', 'groupAnagrams'],
  params: [['strs', 'String[]']],
  returns: 'List<List<String>>',
  anyOrder: true,
  understanding: [
    q(
      'Which pair belongs in the same group?',
      yes('"listen" and "silent"', 'Same letters, same counts, different order.'),
      no('"aab" and "abb"', 'Same set of letters, but the counts differ: two a\'s versus two b\'s.'),
      no('"abc" and "abcd"', 'Different lengths can never be anagrams.'),
    ),
    q(
      'What do all anagrams of a word have in common that you could compute from any one of them?',
      yes('Their letters in sorted order', '"eat", "tea" and "ate" all sort to "aet". That shared form can act as a label for the group.'),
      no('Their first letter', '"eat" and "tea" are anagrams with different first letters.'),
      no('Their length only', '"eat" and "bat" have the same length but are not anagrams.'),
    ),
  ],
  approach: [
    q(
      'How do you collect the groups?',
      yes('A {{dict|HashMap}} from the sorted letters to the list of words with those letters', 'One pass: compute the label, append the word to that label\'s list.', { time: 'O(n · k log k)', space: 'O(n · k)' }),
      ok('Compare every word with every other word', 'It works, but each comparison re-sorts or re-counts letters, and there are n² comparisons.', { time: 'O(n² · k)', space: 'O(n · k)' }),
      no('Sort the whole list of words alphabetically', 'Anagrams do not end up next to each other: "ate" and "tea" are far apart alphabetically.', { time: 'O(n log n)', space: 'O(1)' }),
    ),
    q(
      'A word arrives whose label is not in the map yet. What do you do?',
      yes('Create an empty list for that label, then add the word', 'Every label needs its list before the first append.'),
      no('Skip the word', 'Then single words like "bat" would vanish from the answer.'),
      no('Add it to the most recent group', 'Groups are decided by the label, not by position.'),
    ),
  ],
  langQ: {
    python: q(
      'sorted("tea") gives [\'a\', \'e\', \'t\']. Why can that not be used directly as a dict key?',
      yes('Lists are unhashable; join it into a string first', '"".join(sorted(word)) gives "aet", which is hashable. tuple(sorted(word)) also works.'),
      no('It can; lists make fine keys', 'Python raises TypeError: unhashable type: \'list\'.'),
      no('Because the letters are in the wrong order', 'The order is exactly what you want. The problem is the type.'),
    ),
    java: q(
      'How do you get the sorted-letters label of a String word?',
      yes('char[] letters = word.toCharArray(); Arrays.sort(letters); new String(letters)', 'Strings are immutable, so you sort a char array and build a new String from it.'),
      no('word.sort()', 'String has no sort method.'),
      no('Arrays.sort(word)', 'Arrays.sort needs an array, and a String is not one.'),
    ),
  },
  plan: [
    'Create an empty {{dict|HashMap}} from label to list of words.',
    'Visit each word.',
    'Sort the word\'s letters to get its label.',
    'If the label is new, give it an empty list.',
    'Append the word to its label\'s list.',
    'Return all the lists.',
  ],
  hints: [
    'What could you compute from a word that comes out identical for every one of its anagrams?',
    'Use the sorted letters as a {{dict|HashMap}} key, and collect words under it.',
  ],
  solution: {
    python: `def group_anagrams(strs):
    groups = {}
    for word in strs:
        key = ''.join(sorted(word))
        if key not in groups:
            groups[key] = []
        groups[key].append(word)
    return list(groups.values())
`,
    java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String word : strs) {
            char[] letters = word.toCharArray();
            Arrays.sort(letters);
            String key = new String(letters);
            if (!groups.containsKey(key)) {
                groups.put(key, new ArrayList<>());
            }
            groups.get(key).add(word);
        }
        return new ArrayList<>(groups.values());
    }
}
`,
  },
  tests: [
    [[['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]],
    [[['a']], [['a']]],
    [[['']], [['']]],
    [[['ab', 'ba', 'abc']], [['ab', 'ba'], ['abc']]],
  ],
  reflect: ['What made a hash map the right tool here, and what did you use as the key?', 'O(n · k log k)', 'O(n · k)'],
});

export const runningSum = make({
  slug: 'running-sum',
  title: 'Running Sum of 1d Array',
  pattern: 'prefix-sum',
  difficulty: 'Easy',
  leetcode: 1480,
  statement: 'Given {{a list|an array}} of integers, return a new one where position i holds the sum of everything from position 0 up to and including i.',
  constraints: ['1 ≤ nums.length ≤ 1,000', 'Values can be negative'],
  examples: [
    ['nums = [1, 2, 3, 4]', '[1, 3, 6, 10]', '1, 1+2, 1+2+3, 1+2+3+4.'],
    ['nums = [3, 1, 2, 10, 1]', '[3, 4, 6, 16, 17]', 'Each entry adds one more value to the one before.'],
  ],
  fn: ['running_sum', 'runningSum'],
  params: [['nums', 'int[]']],
  returns: 'int[]',
  understanding: [
    q(
      'nums = [5, -2, 4]. What is the result?',
      yes('[5, 3, 7]', '5, then 5 − 2, then 5 − 2 + 4.'),
      no('[5, -2, 4]', 'That is the input unchanged.'),
      no('[7, 7, 7]', 'That is the grand total repeated. Each position only includes values up to itself.'),
    ),
    q(
      'You already know the running sum at position 3 is 10. What is the quickest way to get position 4?',
      yes('Add nums[4] to 10', 'Each answer is the previous answer plus one new value. That reuse is the whole idea of prefix sums.'),
      no('Add up nums[0] through nums[4] again', 'Correct, but it repeats work you have already done.'),
      no('Multiply 10 by nums[4]', 'These are sums, not products.'),
    ),
  ],
  approach: [
    q(
      'How do you fill the result?',
      yes('Carry one running total and write it down at each position', 'One pass, one addition per element.', {
        time: 'O(n)',
        space: 'O(1)',
        demo: `def running_sum(nums):
    result = []
    total = 0
    for value in nums:
        total += value
        result.append(total)
    return result`,
      }),
      no('For each position, loop from the start and add everything up', 'Position 1,000 re-adds 1,000 numbers, most of them already added a moment ago.', {
        time: 'O(n²)',
        space: 'O(1)',
        demo: `def running_sum(nums):
    result = []
    for i in range(len(nums)):
        total = 0
        for j in range(i + 1):
            total += nums[j]
        result.append(total)
    return result`,
      }),
    ),
    q(
      'Once you have these running sums, how would you get the sum of nums[2..4] without a loop?',
      yes('running[4] − running[1]', 'Everything up to 4, minus everything before 2. This subtraction trick is why prefix sums matter.'),
      no('running[4] − running[2]', 'That removes nums[2] as well, and you wanted to keep it.'),
      no('running[2] + running[4]', 'Adding two prefixes double counts the early values.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you add total to the end of the result list?',
      yes('result.append(total)', 'append grows the list by one element.'),
      no('result[i] = total', 'On an empty list that raises IndexError: there is no position i yet.'),
      no('result.add(total)', 'add is for sets. Lists use append.'),
    ),
    java: q(
      'How do you create the result array?',
      yes('int[] result = new int[nums.length];', 'Arrays have a fixed size chosen up front, then you assign result[i].'),
      no('int[] result = new int[];', 'An array needs its size. This does not compile.'),
      no('int[] result = [];', 'That is Python / JavaScript syntax.'),
    ),
  },
  plan: ['Create the result and a running total of 0.', 'Visit each value in order.', 'Add the value to the running total.', 'Store the running total in the result at this position.', 'Return the result.'],
  hints: ['How is the answer at position i related to the answer at position i − 1?', 'Keep one variable that accumulates, and record it as you go.'],
  solution: {
    python: `def running_sum(nums):
    result = []
    total = 0
    for value in nums:
        total += value
        result.append(total)
    return result
`,
    java: `class Solution {
    public int[] runningSum(int[] nums) {
        int[] result = new int[nums.length];
        int total = 0;
        for (int i = 0; i < nums.length; i++) {
            total += nums[i];
            result[i] = total;
        }
        return result;
    }
}
`,
  },
  tests: [
    [[[3, 1, 2, 10, 1]], [3, 4, 6, 16, 17]],
    [[[1, 2, 3, 4]], [1, 3, 6, 10]],
    [[[5]], [5]],
    [[[-1, 1, -1]], [-1, 0, -1]],
  ],
  demoArgs: [[3, 1, 2, 10, 1, 4, 2]],
  reflect: ['Explain how a running total lets you answer "sum between i and j" with one subtraction.', 'O(n)', 'O(n)'],
});

export const subarraySum = make({
  slug: 'subarray-sum-equals-k',
  title: 'Subarray Sum Equals K',
  pattern: 'prefix-sum',
  difficulty: 'Medium',
  leetcode: 560,
  statement: 'Given {{a list|an array}} of integers and a number k, return how many contiguous subarrays add up to exactly k.',
  constraints: ['1 ≤ nums.length ≤ 20,000', 'Values can be negative or zero', 'Subarrays are contiguous and non-empty'],
  examples: [
    ['nums = [1, 1, 1], k = 2', '2', 'The first two 1s, and the last two 1s.'],
    ['nums = [1, 2, 3], k = 3', '2', '[1, 2] and [3].'],
  ],
  fn: ['subarray_sum', 'subarraySum'],
  params: [
    ['nums', 'int[]'],
    ['k', 'int'],
  ],
  returns: 'int',
  understanding: [
    q(
      'nums = [1, -1, 0], k = 0. How many subarrays sum to 0?',
      yes('3', '[1, -1], [0] and [1, -1, 0].'),
      no('1', 'There is more than the single [0]: negatives let sums come back to a value.'),
      no('2', 'You missed one. Check [1, -1], [0] and the whole list.'),
    ),
    q(
      'The running total is 9 at position j and was 4 at some earlier position i. What is the sum of the elements after i up to j?',
      yes('5', 'total(j) − total(i). So a subarray summing to k ends at j exactly when an earlier running total equals total(j) − k.'),
      no('13', 'You subtract the earlier total, not add it.'),
      no('Impossible to know', 'The difference of two running totals is exactly the sum of what lies between them.'),
    ),
  ],
  approach: [
    q(
      'How do you count the subarrays?',
      yes('Track the running total, and count how many earlier running totals equal total − k using a {{dict|HashMap}}', 'Each position asks one question of the map. It also copes with negative numbers.', {
        time: 'O(n)',
        space: 'O(n)',
        demo: `def subarray_sum(nums, k):
    seen = {0: 1}
    total = 0
    count = 0
    for value in nums:
        total += value
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      }),
      no('Try every start and every end', 'Correct, but there are n² start/end pairs.', {
        time: 'O(n²)',
        space: 'O(1)',
        demo: `def subarray_sum(nums, k):
    count = 0
    for start in range(len(nums)):
        total = 0
        for end in range(start, len(nums)):
            total += nums[end]
            if total == k:
                count += 1
    return count`,
      }),
      no('Sliding window: grow right, shrink left when the sum is too big', 'That only works when all values are positive. With negatives, shrinking might make the sum bigger, so the window logic breaks.', { time: 'O(n)', space: 'O(1)' }),
    ),
    q(
      'Why does the map start with {0: 1} instead of empty?',
      yes('So a subarray that starts at position 0 is counted', 'If the running total itself equals k, you need "total − k = 0" to be found once.'),
      no('To avoid a missing-key error', 'A default value already handles missing keys. The entry is there for correctness.'),
      no('It is just a convention', 'Without it, [3] with k = 3 would answer 0.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you read a count from the dict when the key might be missing?',
      yes('seen.get(total - k, 0)', 'get returns the default instead of raising.'),
      no('seen[total - k]', 'That raises KeyError when the key is missing.'),
      no('seen.find(total - k)', 'dict has no find method.'),
    ),
    java: q(
      'How do you read a count from the HashMap when the key might be missing?',
      yes('seen.getOrDefault(total - k, 0)', 'It returns 0 instead of null for a missing key.'),
      no('seen.get(total - k)', 'That returns null for a missing key, and adding null to an int throws NullPointerException.'),
      no('seen[total - k]', 'Square brackets are for arrays, not maps.'),
    ),
  },
  plan: [
    'Create a map of running total → how many times it has occurred, starting with 0 → 1.',
    'Set the running total and the count to 0.',
    'Visit each value and add it to the running total.',
    'Add to the count the number of times (total − k) has occurred before.',
    'Record the current running total in the map.',
    'Return the count.',
  ],
  hints: ['If the running total is T now, which earlier running total would mean the stretch in between sums to k?', 'Count earlier prefix sums in a {{dict|HashMap}} and look up total − k at every step.'],
  solution: {
    python: `def subarray_sum(nums, k):
    seen = {0: 1}
    total = 0
    count = 0
    for value in nums:
        total += value
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count
`,
    java: `class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);
        int total = 0;
        int count = 0;
        for (int value : nums) {
            total += value;
            count += seen.getOrDefault(total - k, 0);
            seen.put(total, seen.getOrDefault(total, 0) + 1);
        }
        return count;
    }
}
`,
  },
  tests: [
    [[[1, 2, 3, -3, 3], 3], 5],
    [[[1, 1, 1], 2], 2],
    [[[1, 2, 3], 3], 2],
    [[[1, -1, 0], 0], 3],
    [[[5], 5], 1],
    [[[3, 4, 7, 2, -3, 1, 4, 2], 7], 4],
  ],
  demoArgs: [[3, 4, 7, 2, -3, 1, 4, 2], 7],
  reflect: ['Why does looking up (total − k) among earlier running totals count the right subarrays? Why not a sliding window?', 'O(n)', 'O(n)'],
});

export const validPalindrome = make({
  slug: 'valid-palindrome',
  title: 'Valid Palindrome',
  pattern: 'two-pointers',
  difficulty: 'Easy',
  leetcode: 125,
  statement:
    'Return {{True|true}} if the string reads the same forwards and backwards once you ignore everything that is not a letter or digit and ignore upper/lower case.',
  constraints: ['1 ≤ s.length ≤ 200,000', 's can contain any printable characters'],
  examples: [
    ['s = "No lemon, no melon"', '{{True|true}}', 'Letters only, lowercased: "nolemonnomelon".'],
    ['s = "race a car"', '{{False|false}}', '"raceacar" is not the same backwards.'],
  ],
  fn: ['is_palindrome', 'isPalindrome'],
  params: [['s', 'String']],
  returns: 'boolean',
  understanding: [
    q(
      'Is " " (a single space) a palindrome under these rules?',
      yes('Yes', 'After ignoring the space nothing is left, and an empty string reads the same both ways.'),
      no('No', 'There are no letters or digits to disagree, so it counts as a palindrome.'),
    ),
    q(
      'Is "0P" a palindrome?',
      yes('No', 'Digits count as characters: "0" and "p" differ.'),
      no('Yes', 'Only punctuation and spaces are ignored. 0 and P are both kept, and they differ.'),
    ),
  ],
  approach: [
    q(
      'How do you check it without building a second string?',
      yes('Two pointers from both ends, skipping characters that do not count', 'Compare, move both inward, stop at the first mismatch.', { time: 'O(n)', space: 'O(1)' }),
      ok('Build a cleaned copy, reverse it, compare', 'Correct and simple, but it uses extra memory for two new strings.', { time: 'O(n)', space: 'O(n)' }),
      no('Compare each character with every other character', 'Only the mirrored positions matter; the rest is wasted work.', { time: 'O(n²)', space: 'O(1)' }),
    ),
    q(
      'The left pointer is on a comma. What happens?',
      yes('Move left forward and compare nothing this round', 'A skipped character must not be compared, and the right pointer must stay where it is.'),
      no('Move both pointers inward', 'Then the right pointer would skip a real character that still needs a partner.'),
      no('Return {{False|false}}', 'Punctuation is ignored, not a mismatch.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you test whether the character s[left] is a letter or digit?',
      yes('s[left].isalnum()', 'isalnum is true for letters and digits only.'),
      no('s[left].isalpha()', 'That rejects digits, and digits count here.'),
      no('s[left] in "abc...z"', 'That misses uppercase letters and digits.'),
    ),
    java: q(
      'How do you test whether a char c is a letter or digit?',
      yes('Character.isLetterOrDigit(c)', 'A static method on Character; pair it with Character.toLowerCase(c) for the comparison.'),
      no('c.isLetterOrDigit()', 'char is a primitive and has no methods.'),
      no('c >= \'a\' && c <= \'z\'', 'That misses uppercase letters and digits.'),
    ),
  },
  plan: [
    'Put left at the first character and right at the last.',
    'Repeat while left is before right.',
    'If the left character does not count, move left forward; else if the right one does not count, move right back.',
    'Otherwise compare them in lower case; if they differ, return {{False|false}}.',
    'Move both pointers inward.',
    'If the pointers meet, return {{True|true}}.',
  ],
  hints: ['Which two characters have to match first? Which two after that?', 'Pointers at both ends moving inward; each skips anything that is not a letter or digit.'],
  solution: {
    python: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():
            left += 1
        elif not s[right].isalnum():
            right -= 1
        else:
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
    return True
`,
    java: `class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (!Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            } else if (!Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            } else {
                if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                    return false;
                }
                left++;
                right--;
            }
        }
        return true;
    }
}
`,
  },
  tests: [
    [['No lemon, no melon'], true],
    [['race a car'], false],
    [[' '], true],
    [['0P'], false],
    [['A man, a plan, a canal: Panama'], true],
  ],
  reflect: ['Why must only one pointer move when it lands on a character that does not count?', 'O(n)', 'O(1)'],
});

export const trappingRainWater = make({
  slug: 'trapping-rain-water',
  title: 'Trapping Rain Water',
  pattern: 'two-pointers',
  difficulty: 'Hard',
  leetcode: 42,
  statement:
    'height[i] is the height of a wall of width 1 at position i. After rain, water collects in the dips between walls. Return the total amount of water trapped.',
  constraints: ['1 ≤ height.length ≤ 20,000', '0 ≤ height[i] ≤ 100,000'],
  examples: [
    ['height = [3, 0, 2, 0, 4]', '7', '3 units above index 1, 1 above index 2, 3 above index 3.'],
    ['height = [1, 2, 3]', '0', 'A staircase holds nothing: water runs off the low side.'],
  ],
  fn: ['trap', 'trap'],
  params: [['height', 'int[]']],
  returns: 'int',
  understanding: [
    q(
      'The tallest wall to the left of a position is 5 and the tallest to its right is 3. The wall at the position itself is 1. How much water sits on it?',
      yes('2', 'Water rises to the lower of the two sides (3), minus the wall itself (1).'),
      no('4', 'Water cannot rise to 5: it would spill over the lower right side at 3.'),
      no('3', 'Subtract the height of the wall standing there.'),
    ),
    q(
      'height = [2, 0, 2]. How much water?',
      yes('2', 'Both sides are 2, the middle is 0, so a column of 2.'),
      no('0', 'The middle is a dip with walls on both sides.'),
      no('4', 'Only the middle position holds water; the walls themselves hold none.'),
    ),
  ],
  approach: [
    q(
      'Water above a position = min(tallest left, tallest right) − its height. How do you get those maximums efficiently?',
      yes('Two pointers from both ends, each carrying the tallest wall seen from its side; always advance the side with the lower wall', 'The lower side is the one that limits the water, so its running maximum is already enough to settle that position.', { time: 'O(n)', space: 'O(1)' }),
      ok('For each position, scan left and scan right for the tallest wall', 'Correct but every position rescans the whole list.', { time: 'O(n²)', space: 'O(1)' }),
      ok('Precompute two arrays: tallest-to-the-left and tallest-to-the-right', 'A valid O(n) solution and a good stepping stone. Two pointers reach the same answer without the two extra arrays.', { time: 'O(n)', space: 'O(n)' }),
    ),
    q(
      'height[left] is smaller than height[right]. Why is it safe to settle the left position now?',
      yes('A taller wall is known to exist on the right, so the left maximum is the limiting side', 'Left only ever advances while something taller stands on the right, so the left maximum never exceeds the right side. It alone decides the water level here.'),
      no('Because left positions always hold more water', 'Nothing about position decides that; it is about which side is lower.'),
      no('It is not safe; you need the full right maximum first', 'You know the right side has something at least this tall, and that is all that is needed.'),
    ),
  ],
  langQ: {
    python: q(
      'What does `left_max = right_max = 0` do?',
      yes('Sets both names to 0', 'Chained assignment. Fine for numbers; avoid it for lists, where both names would share one list.'),
      no('Compares left_max with right_max', 'Comparison is ==. A single = assigns.'),
      no('Syntax error', 'Chained assignment is valid Python.'),
    ),
    java: q(
      'Which line updates the running maximum on the left?',
      yes('leftMax = Math.max(leftMax, height[left]);', 'Math.max returns the larger of the two.'),
      no('leftMax = max(leftMax, height[left]);', 'max needs the Math. prefix in Java.'),
      no('leftMax += height[left];', 'That accumulates a sum, not a maximum.'),
    ),
  },
  plan: [
    'Put left and right at the two ends; both running maximums and the water total start at 0.',
    'Repeat while left is before right.',
    'If the left wall is lower than the right wall: update the left maximum, add (left maximum − left wall) to the water, move left inward.',
    'Otherwise do the mirror image on the right side and move right inward.',
    'Return the water total.',
  ],
  hints: ['For a single position, which two numbers decide how high the water stands above it?', 'Walk inward from both ends with a running maximum per side. Always process the side whose current wall is lower.'],
  solution: {
    python: `def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water
`,
    java: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            } else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
`,
  },
  tests: [
    [[[3, 0, 2, 0, 4]], 7],
    [[[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], 6],
    [[[4, 2, 0, 3, 2, 5]], 9],
    [[[1, 2, 3]], 0],
    [[[3]], 0],
    [[[2, 0, 2]], 2],
  ],
  reflect: ['Explain why always moving the pointer on the lower wall is safe.', 'O(n)', 'O(1)'],
});

export const middleNode = make({
  slug: 'middle-of-the-linked-list',
  title: 'Middle of the Linked List',
  pattern: 'fast-slow',
  difficulty: 'Easy',
  leetcode: 876,
  statement: 'Given the head of a singly linked list, return its middle node. If there are two middle nodes, return the second one.',
  constraints: ['1 ≤ number of nodes ≤ 100', 'You cannot index into a linked list; you can only follow next'],
  examples: [
    ['head = 1 → 2 → 3 → 4 → 5', '3 → 4 → 5', 'Node 3 is the middle; the answer is that node (shown with what follows it).'],
    ['head = 1 → 2 → 3 → 4 → 5 → 6', '4 → 5 → 6', 'Two middles (3 and 4): return the second.'],
  ],
  fn: ['middle_node', 'middleNode'],
  params: [['head', 'ListNode']],
  returns: 'ListNode',
  understanding: [
    q(
      'The list is 1 → 2. Which node is returned?',
      yes('Node 2', 'Both are "middle"; the rule says return the second.'),
      no('Node 1', 'With two middles the second one is wanted.'),
    ),
    q(
      'Why can you not just jump to position length / 2?',
      yes('A linked list has no indexes and you do not know its length without walking it', 'You can only move one next at a time.'),
      no('You can: head[length / 2]', 'Linked lists cannot be indexed.'),
      no('Because the list might be sorted', 'Order of values is irrelevant here.'),
    ),
  ],
  approach: [
    q(
      'How do you find the middle?',
      yes('Two pointers: slow moves 1 step, fast moves 2; when fast reaches the end, slow is in the middle', 'One pass, no counting. Fast covers twice the distance, so slow has covered half.', {
        time: 'O(n)',
        space: 'O(1)',
        demo: `def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
      }),
      no('Walk once to count the nodes, then walk again to the halfway point', 'Correct, but it is two passes where one will do.', {
        time: 'O(n)',
        space: 'O(1)',
        demo: `def middle_node(head):
    length = 0
    node = head
    while node:
        length += 1
        node = node.next
    node = head
    for step in range(length // 2):
        node = node.next
    return node`,
      }),
      ok('Copy the nodes into {{a list|an array}} and index the middle', 'It works but spends O(n) extra memory on something two pointers give for free.', { time: 'O(n)', space: 'O(n)' }),
    ),
    q(
      'When must the loop stop?',
      yes('When fast is {{None|null}} or fast.next is {{None|null}}', 'Fast jumps two at a time, so both it and its next must exist before the jump.'),
      no('When slow is {{None|null}}', 'Slow never reaches the end; fast gets there first.'),
      no('When fast.next.next is {{None|null}}', 'That stops too early and crashes on a one-node list.'),
    ),
  ],
  langQ: {
    python: q(
      'Which loop condition is safe?',
      yes('while fast and fast.next:', 'Python checks fast first; if it is None the second part is never evaluated.'),
      no('while fast.next and fast:', 'When fast is None, fast.next raises AttributeError before the second check runs.'),
      no('while fast.next.next:', 'Crashes whenever fast.next is None.'),
    ),
    java: q(
      'Which loop condition is safe?',
      yes('while (fast != null && fast.next != null)', '&& stops at the first false, so fast.next is only read when fast exists.'),
      no('while (fast.next != null && fast != null)', 'When fast is null, fast.next throws NullPointerException before the second check.'),
      no('while (fast.next.next != null)', 'Throws whenever fast.next is null.'),
    ),
  },
  plan: ['Start slow and fast at the head.', 'Repeat while fast and fast.next both exist.', 'Move slow forward one node.', 'Move fast forward two nodes.', 'Return slow.'],
  hints: ['If one runner goes twice as fast as another, where is the slower one when the faster one finishes?', 'Slow pointer steps once, fast pointer steps twice; stop when fast cannot take two more steps.'],
  solution: {
    python: `def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
`,
    java: `class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
}
`,
  },
  tests: [
    [[[1, 2, 3, 4, 5]], [3, 4, 5]],
    [[[1, 2, 3, 4, 5, 6]], [4, 5, 6]],
    [[[1]], [1]],
    [[[1, 2]], [2]],
  ],
  demoArgs: [[1, 2, 3, 4, 5, 6, 7]],
  reflect: ['Why is slow exactly at the middle when fast runs out? What does the loop condition protect against?', 'O(n)', 'O(1)'],
});

export const findDuplicate = make({
  slug: 'find-the-duplicate-number',
  title: 'Find the Duplicate Number',
  pattern: 'fast-slow',
  difficulty: 'Medium',
  leetcode: 287,
  statement:
    'nums holds n + 1 integers, each between 1 and n, so at least one value repeats. Exactly one value is repeated (possibly several times). Return it without modifying nums and using only constant extra memory.',
  constraints: ['nums.length = n + 1', '1 ≤ nums[i] ≤ n', 'Do not modify nums', 'O(1) extra space'],
  examples: [
    ['nums = [1, 3, 4, 2, 2]', '2', '2 appears twice.'],
    ['nums = [3, 1, 3, 4, 2]', '3', '3 appears twice.'],
  ],
  fn: ['find_duplicate', 'findDuplicate'],
  params: [['nums', 'int[]']],
  returns: 'int',
  understanding: [
    q(
      'Which easy solutions do the constraints rule out?',
      yes('Both sorting (modifies nums) and a set of seen values (extra memory)', 'That is what makes this a pattern problem rather than a hashing one.'),
      no('Only sorting', 'A set grows with n, which breaks the O(1) memory rule.'),
      no('Neither; any approach is allowed', 'Read the constraints again: no modification, constant memory.'),
    ),
    q(
      'Treat each value as "go to that index next": from index i, jump to index nums[i]. With nums = [1, 3, 4, 2, 2], where does 0 → … lead?',
      yes('0 → 1 → 3 → 2 → 4 → 2 → 4 → … (a loop)', 'Two different indexes hold the value 2, so two arrows point at index 2. That is where the cycle is entered.'),
      no('0 → 1 → 3 → 2 → 4 and then it stops', 'nums[4] is 2, so from index 4 you jump back to index 2.'),
      no('It never repeats', 'There are only n + 1 indexes, so some index must be revisited.'),
    ),
  ],
  approach: [
    q(
      'The jumps form a linked list with a cycle, and the duplicate is the entrance of the cycle. How do you find it in O(1) memory?',
      yes('Fast and slow pointers until they meet, then restart one from index 0 and advance both one step at a time until they meet again', 'Phase 1 proves the cycle; phase 2 lands exactly on its entrance.', { time: 'O(n)', space: 'O(1)' }),
      ok('Remember visited indexes in a {{set|HashSet}}', 'Correct answer, but O(n) memory, which is forbidden.', { time: 'O(n)', space: 'O(n)' }),
      ok('Compare every pair of values', 'Constant memory, but quadratic time.', { time: 'O(n²)', space: 'O(1)' }),
    ),
    q(
      'In phase 2, how fast do the two pointers move?',
      yes('Both one step at a time', 'They are the same distance from the entrance (one via the tail, one around the cycle), so equal speed makes them collide there.'),
      no('One moves two steps, the other one', 'That is phase 1. At different speeds they would meet somewhere inside the cycle again, not at its entrance.'),
      no('Only one of them moves', 'Then they meet wherever the stationary one happens to be.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you move fast forward by two jumps?',
      yes('fast = nums[nums[fast]]', 'One jump is nums[fast]; feed that back in for the second.'),
      no('fast = nums[fast + 2]', 'That moves two positions along the array, not two jumps along the chain.'),
      no('fast = nums[fast] * 2', 'Doubling a value is not a jump.'),
    ),
    java: q(
      'How do you move fast forward by two jumps?',
      yes('fast = nums[nums[fast]];', 'One jump is nums[fast]; feed that back in for the second.'),
      no('fast = nums[fast + 2];', 'That moves two positions along the array, not two jumps along the chain.'),
      no('fast += 2;', 'That changes the index arithmetically instead of following the values.'),
    ),
  },
  plan: [
    'Start slow one jump in and fast two jumps in from index 0.',
    'While they differ, move slow one jump and fast two jumps.',
    'Reset slow to index 0.',
    'While they differ, move both one jump.',
    'Return the index where they meet: that is the duplicate value.',
  ],
  hints: ['If every value is an instruction "jump to this index", what shape do the jumps trace when two indexes hold the same value?', 'It is cycle detection: tortoise and hare to meet, then restart one pointer from the beginning to find the cycle entrance.'],
  solution: {
    python: `def find_duplicate(nums):
    slow = nums[0]
    fast = nums[nums[0]]
    while slow != fast:
        slow = nums[slow]
        fast = nums[nums[fast]]
    slow = 0
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow
`,
    java: `class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0];
        int fast = nums[nums[0]];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }
        slow = 0;
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}
`,
  },
  tests: [
    [[[1, 3, 4, 2, 2]], 2],
    [[[3, 1, 3, 4, 2]], 3],
    [[[1, 1]], 1],
    [[[2, 2, 2, 2, 2]], 2],
    [[[1, 4, 6, 3, 2, 5, 6]], 6],
  ],
  reflect: ['Explain how an array of numbers became a linked list with a cycle, and why the cycle entrance is the duplicate.', 'O(n)', 'O(1)'],
});

export const mergeTwoLists = make({
  slug: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists',
  pattern: 'linked-list',
  difficulty: 'Easy',
  leetcode: 21,
  statement: 'You get the heads of two sorted linked lists. Splice their nodes together into one sorted list and return its head.',
  constraints: ['0 ≤ nodes in each list ≤ 50', 'Both lists are sorted ascending', 'Either list may be empty'],
  examples: [
    ['list1 = 1 → 2 → 4, list2 = 1 → 3 → 4', '1 → 1 → 2 → 3 → 4 → 4', 'Always take the smaller front node.'],
    ['list1 = (empty), list2 = 0', '0', 'Nothing to merge with.'],
  ],
  fn: ['merge_two_lists', 'mergeTwoLists'],
  params: [
    ['list1', 'ListNode'],
    ['list2', 'ListNode'],
  ],
  returns: 'ListNode',
  understanding: [
    q(
      'Both lists are sorted. Where is the smallest node overall?',
      yes('At the front of one of the two lists', 'So you only ever need to compare the two front nodes.'),
      no('Anywhere in either list', 'Sorted order puts each list\'s smallest at its head.'),
      no('Always at the front of list1', 'list2 might start lower.'),
    ),
    q(
      'list1 runs out while list2 still has nodes 7 → 9. What do you do with them?',
      yes('Attach the rest of list2 in one step', 'It is already sorted and everything in it is at least as big as what you have placed.'),
      no('Keep comparing them one by one', 'There is nothing left to compare against.'),
      no('Drop them', 'Every node must appear in the result.'),
    ),
  ],
  approach: [
    q(
      'How do you build the merged list?',
      yes('Keep a tail pointer; repeatedly attach the smaller front node and advance in that list', 'No new nodes are created: you only rewire next pointers.', { time: 'O(n + m)', space: 'O(1)' }),
      ok('Copy all values into {{a list|an array}}, sort, and build a new linked list', 'It ignores that the inputs are already sorted, and builds everything anew.', { time: 'O((n + m) log(n + m))', space: 'O(n + m)' }),
      no('Append list2 to the end of list1', 'The result would not be sorted.', { time: 'O(n)', space: 'O(1)' }),
    ),
    q(
      'What is the dummy node for?',
      yes('It gives the tail something to attach to before the real head is known', 'Without it, the first node needs special-case code. At the end the answer is dummy.next.'),
      no('It holds the smallest value', 'Its value is never used.'),
      no('It marks the end of the list', 'It sits before the start, not at the end.'),
    ),
  ],
  langQ: {
    python: q(
      'After the loop, how do you attach whichever list still has nodes?',
      yes('tail.next = list1 if list1 else list2', 'A conditional expression; `list1 or list2` does the same.'),
      no('tail.next = list1 + list2', 'Nodes cannot be added together.'),
      no('tail.next = list1 and list2', '`and` gives list2 only when list1 exists, which is the opposite of what is needed when list1 is empty.'),
    ),
    java: q(
      'After the loop, how do you attach whichever list still has nodes?',
      yes('tail.next = (list1 != null) ? list1 : list2;', 'The ternary operator picks the non-null one.'),
      no('tail.next = list1 || list2;', '|| only works on booleans in Java.'),
      no('tail.next = list1 + list2;', 'Nodes cannot be added together.'),
    ),
  },
  plan: [
    'Create a dummy node and point tail at it.',
    'Repeat while both lists still have nodes.',
    'Attach the smaller front node to tail and advance in that list.',
    'Move tail forward to the node just attached.',
    'When one list runs out, attach the remainder of the other.',
    'Return dummy.next.',
  ],
  hints: ['At any moment, which two nodes are the only candidates for "next in the merged list"?', 'Use a dummy head and a tail pointer. Attach the smaller front node each time, then the leftover list.'],
  solution: {
    python: `def merge_two_lists(list1, list2):
    dummy = ListNode()
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 else list2
    return dummy.next
`,
    java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode();
        ListNode tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }
        tail.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }
}
`,
  },
  tests: [
    [[[1, 2, 4], [1, 3, 4]], [1, 1, 2, 3, 4, 4]],
    [[[], []], []],
    [[[], [0]], [0]],
    [[[5], [1, 2]], [1, 2, 5]],
  ],
  reflect: ['What does the dummy node save you from writing? Why is attaching the leftover list in one step correct?', 'O(n)', 'O(1)'],
});

export const removeNthFromEnd = make({
  slug: 'remove-nth-node-from-end',
  title: 'Remove Nth Node From End of List',
  pattern: 'linked-list',
  difficulty: 'Medium',
  leetcode: 19,
  statement: 'Given the head of a linked list, remove the n-th node counting from the end and return the head. Try to do it in one pass.',
  constraints: ['1 ≤ number of nodes ≤ 30', '1 ≤ n ≤ number of nodes'],
  examples: [
    ['head = 1 → 2 → 3 → 4 → 5, n = 2', '1 → 2 → 3 → 5', 'The 2nd from the end is 4.'],
    ['head = 1, n = 1', '(empty)', 'Removing the only node leaves nothing.'],
  ],
  fn: ['remove_nth_from_end', 'removeNthFromEnd'],
  params: [
    ['head', 'ListNode'],
    ['n', 'int'],
  ],
  returns: 'ListNode',
  understanding: [
    q(
      'head = 1 → 2, n = 2. What is returned?',
      yes('2', 'The 2nd from the end is the head itself, so the new head is node 2.'),
      no('1', 'That removes the last node, which is n = 1.'),
      no('(empty)', 'Only one node is removed.'),
    ),
    q(
      'To remove a node from a singly linked list, which node do you actually need to be standing on?',
      yes('The one just before it', 'You rewire before.next to skip over the target.'),
      no('The node itself', 'From the node you cannot reach back to change the previous node\'s pointer.'),
      no('The one just after it', 'There is no way backwards from there.'),
    ),
  ],
  approach: [
    q(
      'How do you reach the node before the target in a single pass?',
      yes('Two pointers n nodes apart: move the lead n steps ahead, then move both until the lead is on the last node', 'The gap stays fixed, so when the lead is at the end the trailing pointer is exactly before the target.', { time: 'O(n)', space: 'O(1)' }),
      ok('Count the length first, then walk length − n steps', 'Correct and perfectly acceptable, but it is two passes.', { time: 'O(n)', space: 'O(1)' }),
      ok('Reverse the list, remove the n-th node, reverse back', 'It works with a lot of unnecessary rewiring.', { time: 'O(n)', space: 'O(1)' }),
    ),
    q(
      'Why start both pointers on a dummy node placed before the head?',
      yes('So removing the head itself is not a special case', 'With a dummy, even the head has a "node before it".'),
      no('To make the list one node longer for counting', 'The dummy is removed from the answer by returning dummy.next.'),
      no('It is required by the language', 'It is a convenience, not a requirement.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you unlink the node after trail?',
      yes('trail.next = trail.next.next', 'Skip over it; nothing refers to the removed node any more.'),
      no('del trail.next', 'That deletes the attribute from the object rather than relinking the list.'),
      no('trail = trail.next.next', 'That moves your variable; the list itself is unchanged.'),
    ),
    java: q(
      'How do you unlink the node after trail?',
      yes('trail.next = trail.next.next;', 'Skip over it; the garbage collector reclaims the removed node.'),
      no('trail.next = null;', 'That cuts off everything after trail, not just one node.'),
      no('trail = trail.next.next;', 'That moves your variable; the list itself is unchanged.'),
    ),
  },
  plan: [
    'Create a dummy node in front of head; start lead and trail on it.',
    'Move lead forward n nodes.',
    'Move lead and trail together until lead is on the last node.',
    'Skip the node after trail.',
    'Return dummy.next.',
  ],
  hints: ['If two people walk at the same speed n steps apart, where is the second when the first reaches the end?', 'Open a gap of n between two pointers from a dummy head, then slide both to the end.'],
  solution: {
    python: `def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    lead = dummy
    trail = dummy
    for step in range(n):
        lead = lead.next
    while lead.next:
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next
    return dummy.next
`,
    java: `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode lead = dummy;
        ListNode trail = dummy;
        for (int step = 0; step < n; step++) {
            lead = lead.next;
        }
        while (lead.next != null) {
            lead = lead.next;
            trail = trail.next;
        }
        trail.next = trail.next.next;
        return dummy.next;
    }
}
`,
  },
  tests: [
    [[[1, 2, 3, 4, 5], 2], [1, 2, 3, 5]],
    [[[1], 1], []],
    [[[1, 2], 1], [1]],
    [[[1, 2], 2], [2]],
  ],
  reflect: ['Why does a fixed gap between two pointers find "n-th from the end" without knowing the length?', 'O(n)', 'O(1)'],
});
