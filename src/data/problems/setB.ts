import { make, no, ok, q, yes } from './builder';

export const evalRpn = make({
  slug: 'evaluate-reverse-polish-notation',
  title: 'Evaluate Reverse Polish Notation',
  pattern: 'stack',
  difficulty: 'Medium',
  leetcode: 150,
  statement:
    'tokens is an arithmetic expression in Reverse Polish Notation: each operator comes after its two operands. Operators are + − * /. Evaluate it and return the result. Division truncates toward zero.',
  constraints: ['1 ≤ tokens.length ≤ 10,000', 'Each token is an integer or one of + - * /', 'The expression is always valid'],
  examples: [
    ['tokens = ["2", "1", "+", "3", "*"]', '9', '(2 + 1) * 3.'],
    ['tokens = ["4", "13", "5", "/", "+"]', '6', '4 + (13 / 5) = 4 + 2.'],
  ],
  fn: ['eval_rpn', 'evalRPN'],
  params: [['tokens', 'String[]']],
  returns: 'int',
  understanding: [
    q(
      'What does ["5", "3", "-"] evaluate to?',
      yes('2', 'The first number written is the left operand: 5 − 3.'),
      no('-2', 'That is 3 − 5. The operand that was written first goes on the left.'),
      no('8', 'The operator is minus.'),
    ),
    q(
      'What is 7 / −2 under "truncate toward zero"?',
      yes('-3', '−3.5 with the fraction dropped.'),
      no('-4', 'That is rounding down (floor), which goes away from zero for negatives.'),
      no('-3.5', 'The result must be an integer.'),
    ),
  ],
  approach: [
    q(
      'An operator applies to the two most recent values. Which structure gives you "most recent" directly?',
      yes('A stack: push numbers, and on an operator pop two, combine, push the result', 'The result becomes an operand for a later operator, so it goes back on the stack.', { time: 'O(n)', space: 'O(n)' }),
      no('A queue: take values from the front', 'A queue gives the oldest values, but an operator needs the newest two.', { time: 'O(n)', space: 'O(n)' }),
      ok('Scan for an operator, compute, rebuild the token list, repeat', 'Correct but each rebuild copies the whole list.', { time: 'O(n²)', space: 'O(n)' }),
    ),
    q(
      'You pop twice for "-". Which popped value is the right-hand operand?',
      yes('The first one popped', 'It was pushed last, so it is the right operand. The second pop is the left.'),
      no('The second one popped', 'Then 5 3 − would compute 3 − 5.'),
      no('It does not matter', 'It matters for − and /.'),
    ),
  ],
  langQ: {
    python: q(
      'Which expression truncates toward zero?',
      yes('int(left / right)', 'True division then int() drops the fraction toward zero.'),
      no('left // right', 'Floor division rounds down: 7 // -2 is -4.'),
      no('left / right', 'That leaves a float such as -3.5.'),
    ),
    java: q(
      'How do you compare a String token with "+"?',
      yes('token.equals("+")', 'equals compares the characters.'),
      no('token == "+"', '== compares object identity; it can be false for two strings with the same text.'),
      no('token = "+"', 'A single = is assignment.'),
    ),
  },
  plan: [
    'Create an empty stack.',
    'Read the tokens in order.',
    'If the token is a number, push it.',
    'Otherwise pop the right operand, then the left operand.',
    'Apply the operator and push the result.',
    'At the end, the single value left on the stack is the answer.',
  ],
  hints: ['When you meet an operator, which values does it need, and where did you last see them?', 'Push numbers on a stack. An operator pops two, computes, and pushes the result back.'],
  solution: {
    python: `def eval_rpn(tokens):
    stack = []
    for token in tokens:
        if token in ('+', '-', '*', '/'):
            right = stack.pop()
            left = stack.pop()
            if token == '+':
                stack.append(left + right)
            elif token == '-':
                stack.append(left - right)
            elif token == '*':
                stack.append(left * right)
            else:
                stack.append(int(left / right))
        else:
            stack.append(int(token))
    return stack.pop()
`,
    java: `class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String token : tokens) {
            if (token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/")) {
                int right = stack.pop();
                int left = stack.pop();
                if (token.equals("+")) {
                    stack.push(left + right);
                } else if (token.equals("-")) {
                    stack.push(left - right);
                } else if (token.equals("*")) {
                    stack.push(left * right);
                } else {
                    stack.push(left / right);
                }
            } else {
                stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }
}
`,
  },
  tests: [
    [[['2', '1', '+', '3', '*']], 9],
    [[['4', '13', '5', '/', '+']], 6],
    [[['7']], 7],
    [[['7', '-2', '/']], -3],
    [[['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], 22],
  ],
  reflect: ['Why does the result of an operation go back on the stack? Why does pop order matter?', 'O(n)', 'O(n)'],
});

export const nextGreaterElement = make({
  slug: 'next-greater-element-i',
  title: 'Next Greater Element I',
  pattern: 'monotonic-stack',
  difficulty: 'Easy',
  leetcode: 496,
  statement:
    'nums2 holds distinct integers and nums1 is a subset of it. For each value in nums1, find the first value to its right in nums2 that is larger. Return those answers in the order of nums1, using −1 when there is no larger value to the right.',
  constraints: ['1 ≤ nums1.length ≤ nums2.length ≤ 1,000', 'All values are distinct', 'Every value of nums1 appears in nums2'],
  examples: [
    ['nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]', '[-1, 3, -1]', 'Nothing right of 4 is bigger; right of 1 comes 3; nothing is right of 2.'],
    ['nums1 = [2, 4], nums2 = [1, 2, 3, 4]', '[3, -1]', 'Right of 2 comes 3; 4 is last.'],
  ],
  fn: ['next_greater_element', 'nextGreaterElement'],
  params: [
    ['nums1', 'int[]'],
    ['nums2', 'int[]'],
  ],
  returns: 'int[]',
  understanding: [
    q(
      'nums2 = [5, 2, 6, 8]. What is the next greater element of 5?',
      yes('6', 'The first value to its right that is larger. 2 is skipped because it is smaller.'),
      no('8', '8 is larger, but 6 comes first.'),
      no('2', '2 is next, but it is not greater.'),
    ),
    q(
      'Walking nums2 left to right you have passed 5 and 2 with no answer yet, and now you reach 6. Whose answer is 6?',
      yes('Both 5 and 2', '6 is the first larger value either of them has seen.'),
      no('Only 2', '5 has not met anything larger before 6 either.'),
      no('Only 5', '2 is also smaller than 6 and still waiting.'),
    ),
  ],
  approach: [
    q(
      'How do you find every value\'s next greater element in nums2?',
      yes('One pass with a stack of values still waiting; each new value pops and answers everything smaller than it', 'Every value is pushed once and popped at most once.', { time: 'O(n)', space: 'O(n)' }),
      ok('For each value, scan to its right until something larger appears', 'Correct, but a decreasing list makes every scan run to the end.', { time: 'O(n²)', space: 'O(1)' }),
      no('Sort nums2 and take the following value', 'Sorting destroys "to the right of", which is what the question is about.', { time: 'O(n log n)', space: 'O(n)' }),
    ),
    q(
      'What is true of the values sitting on the stack at any moment?',
      yes('They are in decreasing order from bottom to top', 'Anything smaller than a newcomer gets popped, so what remains can only go down. That is the "monotonic" in monotonic stack.'),
      no('They are in increasing order', 'A bigger value on top would already have answered the ones below it.'),
      no('They are in no particular order', 'The popping rule forces an order.'),
    ),
  ],
  langQ: {
    python: q(
      'Which loop condition pops everything the new value resolves?',
      yes('while stack and stack[-1] < value:', 'Check the stack is non-empty first, then compare its top.'),
      no('if stack[-1] < value:', 'An `if` pops at most one, and it crashes on an empty stack.'),
      no('while stack[0] < value:', 'stack[0] is the bottom; the top is stack[-1].'),
    ),
    java: q(
      'Which loop condition pops everything the new value resolves?',
      yes('while (!stack.isEmpty() && stack.peek() < value)', 'peek looks at the top without removing it.'),
      no('if (stack.peek() < value)', 'An if pops at most one, and peek on an empty deque returns null, which throws when compared.'),
      no('while (stack.pop() < value)', 'pop removes the element even when the comparison fails.'),
    ),
  },
  plan: [
    'Create an empty stack and a map from value to its next greater value.',
    'Walk through nums2.',
    'While the stack top is smaller than the current value, pop it and record the current value as its answer.',
    'Push the current value.',
    'Build the result by looking up each value of nums1 in the map, using −1 when it is missing.',
  ],
  hints: ['When a big value arrives, which earlier values has it just answered?', 'Keep a stack of values that have no answer yet. A new value resolves every smaller value on top of the stack.'],
  solution: {
    python: `def next_greater_element(nums1, nums2):
    greater = {}
    stack = []
    for value in nums2:
        while stack and stack[-1] < value:
            greater[stack.pop()] = value
        stack.append(value)
    result = []
    for value in nums1:
        result.append(greater.get(value, -1))
    return result
`,
    java: `class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> greater = new HashMap<>();
        Deque<Integer> stack = new ArrayDeque<>();
        for (int value : nums2) {
            while (!stack.isEmpty() && stack.peek() < value) {
                greater.put(stack.pop(), value);
            }
            stack.push(value);
        }
        int[] result = new int[nums1.length];
        for (int i = 0; i < nums1.length; i++) {
            result[i] = greater.getOrDefault(nums1[i], -1);
        }
        return result;
    }
}
`,
  },
  tests: [
    [[[4, 1, 2], [1, 3, 4, 2]], [-1, 3, -1]],
    [[[2, 4], [1, 2, 3, 4]], [3, -1]],
    [[[1], [1]], [-1]],
    [[[2, 1, 3], [2, 1, 3]], [3, 3, -1]],
  ],
  reflect: ['What does the stack hold at any moment, and why is each value pushed and popped at most once?', 'O(n)', 'O(n)'],
});

export const dailyTemperatures = make({
  slug: 'daily-temperatures',
  title: 'Daily Temperatures',
  pattern: 'monotonic-stack',
  difficulty: 'Medium',
  leetcode: 739,
  statement:
    'temperatures[i] is the temperature on day i. For each day, return how many days you have to wait for a warmer temperature. Use 0 when no later day is warmer.',
  constraints: ['1 ≤ temperatures.length ≤ 100,000', '30 ≤ temperatures[i] ≤ 100'],
  examples: [
    ['temperatures = [70, 72, 68, 65, 71, 75]', '[1, 4, 2, 1, 1, 0]', 'Day 1 (72) waits 4 days for 75; day 2 (68) waits 2 days for 71.'],
    ['temperatures = [90, 80, 70]', '[0, 0, 0]', 'It only gets colder.'],
  ],
  fn: ['daily_temperatures', 'dailyTemperatures'],
  params: [['temperatures', 'int[]']],
  returns: 'int[]',
  understanding: [
    q(
      'temperatures = [60, 60, 61]. What is the answer for day 0?',
      yes('2', 'Day 1 is equal, not warmer. The first warmer day is day 2.'),
      no('1', 'Equal does not count as warmer.'),
      no('0', 'Day 2 is warmer, so there is an answer.'),
    ),
    q(
      'The answer is a number of days, not a temperature. What must you remember about each waiting day?',
      yes('Its index', 'The wait is (today\'s index − that day\'s index), and the temperature can be looked up from the index.'),
      no('Its temperature only', 'Then you could not tell how long ago it was.'),
      no('Nothing; one variable is enough', 'Several days can be waiting at once.'),
    ),
  ],
  approach: [
    q(
      'How do you compute all the waits?',
      yes('A stack of indexes of days still waiting; each new day pops and answers every colder day on top', 'Same skeleton as Next Greater Element, storing indexes so you can compute distances.', { time: 'O(n)', space: 'O(n)' }),
      ok('For each day, scan forward to the first warmer day', 'Correct, but a long cooling streak makes each scan long.', { time: 'O(n²)', space: 'O(1)' }),
      no('Sort the days by temperature', 'Sorting loses which day comes after which.', { time: 'O(n log n)', space: 'O(n)' }),
    ),
    q(
      'Days left on the stack when the loop ends have no warmer day. What should their answers be?',
      yes('0, which they already are if the answer list started as all zeros', 'No extra clean-up needed.'),
      no('-1', 'This problem asks for 0, unlike Next Greater Element.'),
      no('The length of the list', 'There is no such rule.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you create the answer list filled with zeros?',
      yes('answer = [0] * len(temperatures)', 'List repetition gives a list of the right length.'),
      no('answer = []', 'Then answer[earlier] = … raises IndexError.'),
      no('answer = 0 * len(temperatures)', 'That is just the number 0.'),
    ),
    java: q(
      'What does a new int[n] contain before you assign anything?',
      yes('All zeros', 'Java initialises int arrays to 0, which is exactly the default answer here.'),
      no('Random values', 'That is C. Java always zero-fills.'),
      no('nulls', 'int is a primitive and cannot be null.'),
    ),
  },
  plan: [
    'Create an answer list of zeros and an empty stack of day indexes.',
    'Visit each day with its index and temperature.',
    'While the stack top is a colder day, pop it and set its answer to today\'s index minus its index.',
    'Push today\'s index.',
    'Return the answers.',
  ],
  hints: ['When a warm day arrives, which earlier days just got their answer?', 'Monotonic stack of indexes: pop every colder day and write the distance to today.'],
  solution: {
    python: `def daily_temperatures(temperatures):
    answer = [0] * len(temperatures)
    stack = []
    for day, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            earlier = stack.pop()
            answer[earlier] = day - earlier
        stack.append(day)
    return answer
`,
    java: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int[] answer = new int[temperatures.length];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int day = 0; day < temperatures.length; day++) {
            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[day]) {
                int earlier = stack.pop();
                answer[earlier] = day - earlier;
            }
            stack.push(day);
        }
        return answer;
    }
}
`,
  },
  tests: [
    [[[70, 72, 68, 65, 71, 75]], [1, 4, 2, 1, 1, 0]],
    [[[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]],
    [[[90, 80, 70]], [0, 0, 0]],
    [[[60, 60, 61]], [2, 1, 0]],
    [[[50]], [0]],
  ],
  reflect: ['Why store indexes on the stack instead of temperatures? How is this the same pattern as Next Greater Element?', 'O(n)', 'O(n)'],
});

export const searchRotated = make({
  slug: 'search-in-rotated-sorted-array',
  title: 'Search in Rotated Sorted Array',
  pattern: 'binary-search',
  difficulty: 'Medium',
  leetcode: 33,
  statement:
    'A sorted {{list|array}} of distinct integers was rotated at some unknown point, e.g. [0, 1, 2, 4, 5, 6, 7] became [4, 5, 6, 7, 0, 1, 2]. Return the index of target, or −1 if it is not there, in O(log n) time.',
  constraints: ['1 ≤ nums.length ≤ 5,000', 'All values are distinct', 'O(log n) required'],
  examples: [
    ['nums = [4, 5, 6, 7, 0, 1, 2], target = 0', '4', '0 is at index 4.'],
    ['nums = [4, 5, 6, 7, 0, 1, 2], target = 3', '-1', '3 is not present.'],
  ],
  fn: ['search_rotated', 'search'],
  params: [
    ['nums', 'int[]'],
    ['target', 'int'],
  ],
  returns: 'int',
  understanding: [
    q(
      'Cut [4, 5, 6, 7, 0, 1, 2] at its middle (index 3, value 7). What can you say about the two halves?',
      yes('At least one half is fully sorted', 'Here [4, 5, 6, 7] is sorted. The rotation point can only be in one half.'),
      no('Both halves are always sorted', 'The half containing the rotation point is not.'),
      no('Neither half is sorted', 'There is only one break, so it cannot spoil both halves.'),
    ),
    q(
      'The left half [4, 5, 6, 7] is sorted and the target is 1. Where do you look?',
      yes('In the right half', '1 is not between 4 and 7, and a sorted half lets you be sure of that.'),
      no('In the left half', 'A sorted half holds exactly the values between its ends, and 1 is not among them.'),
      no('In both', 'The point of binary search is to discard one half.'),
    ),
  ],
  approach: [
    q(
      'How do you keep binary search working on a rotated list?',
      yes('At each step find which half is sorted, check if the target lies inside its range, and go there or to the other half', 'The sorted half is the one you can reason about with certainty.', { time: 'O(log n)', space: 'O(1)' }),
      ok('Scan every element', 'Correct but ignores the structure.', { time: 'O(n)', space: 'O(1)' }),
      no('Sort the list first, then binary search', 'Sorting costs more than scanning and changes the indexes you must return.', { time: 'O(n log n)', space: 'O(n)' }),
    ),
    q(
      'How do you tell that the left half [low..mid] is the sorted one?',
      yes('nums[low] ≤ nums[mid]', 'If the ends are in order there is no break between them.'),
      no('nums[mid] ≤ nums[high]', 'That tells you the right half is sorted.'),
      no('nums[low] ≤ nums[high]', 'That tests the whole range, not a half.'),
    ),
  ],
  langQ: {
    python: q(
      'How can you write "target is at least nums[low] and less than nums[mid]"?',
      yes('nums[low] <= target < nums[mid]', 'Python allows chained comparisons.'),
      no('nums[low] <= target and < nums[mid]', 'The second comparison is missing its left side: syntax error.'),
      no('target in range(nums[low], nums[mid])', 'It happens to work for integers but builds a range each time and hides the intent.'),
    ),
    java: q(
      'How do you write "target is at least nums[low] and less than nums[mid]"?',
      yes('nums[low] <= target && target < nums[mid]', 'Two comparisons joined with &&.'),
      no('nums[low] <= target < nums[mid]', 'Java evaluates the first part to a boolean and then cannot compare a boolean with an int: compile error.'),
      no('nums[low] <= target & < nums[mid]', 'Not valid syntax.'),
    ),
  },
  plan: [
    'Set low and high to the two ends.',
    'Repeat while low ≤ high: compute mid and return it if nums[mid] is the target.',
    'If the left half is sorted: go left when the target is inside its range, otherwise go right.',
    'Otherwise the right half is sorted: go right when the target is inside its range, otherwise go left.',
    'If the range empties, return −1.',
  ],
  hints: ['After cutting at the middle, what is guaranteed about at least one of the two halves?', 'Identify the sorted half with one comparison. A sorted half tells you for certain whether the target is inside it.'],
  solution: {
    python: `def search_rotated(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
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
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[high]) {
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
        }
        return -1;
    }
}
`,
  },
  tests: [
    [[[4, 5, 6, 7, 0, 1, 2], 0], 4],
    [[[4, 5, 6, 7, 0, 1, 2], 3], -1],
    [[[1], 0], -1],
    [[[5, 1, 3], 5], 0],
    [[[6, 7, 8, 1, 2, 3, 4, 5], 3], 5],
    [[[3, 1], 1], 1],
  ],
  reflect: ['Why is one half always sorted, and how does that let you discard half each step?', 'O(log n)', 'O(1)'],
});

export const validateBst = make({
  slug: 'validate-binary-search-tree',
  title: 'Validate Binary Search Tree',
  pattern: 'tree-dfs',
  difficulty: 'Medium',
  leetcode: 98,
  statement:
    'Return {{True|true}} if the tree is a valid binary search tree: for every node, everything in its left subtree is strictly smaller and everything in its right subtree is strictly larger.',
  constraints: ['0 ≤ number of nodes ≤ 10,000', 'Values may be any 32-bit integer', 'Duplicates make the tree invalid'],
  examples: [
    ['root = [2, 1, 3]', '{{True|true}}', '1 < 2 < 3.'],
    ['root = [5, 4, 6, {{None|null}}, {{None|null}}, 3, 7]', '{{False|false}}', '3 sits in the right subtree of 5 but is smaller than 5.'],
  ],
  fn: ['is_valid_bst', 'isValidBST'],
  params: [['root', 'TreeNode']],
  returns: 'boolean',
  understanding: [
    q(
      'In [5, 4, 6, {{None|null}}, {{None|null}}, 3, 7], node 3 is the left child of 6, and 3 < 6. Why is the tree still invalid?',
      yes('3 is in the right subtree of 5, so it must be greater than 5', 'The rule is about whole subtrees, not just parent and child.'),
      no('Because 3 is a leaf', 'Leaves are fine anywhere their value fits.'),
      no('It is actually valid', 'Every ancestor constrains a node, not only its parent.'),
    ),
    q(
      'You walk from the root down: right, then left. What range must the value you land on be in?',
      yes('Greater than the root and less than the root\'s right child', 'Going right sets a lower bound; going left sets an upper bound.'),
      no('Less than the root', 'You went right first, so everything here is greater than the root.'),
      no('Any value smaller than its parent', 'The grandparent still constrains it.'),
    ),
  ],
  approach: [
    q(
      'How do you check the whole-subtree rule?',
      yes('Recurse with an allowed (low, high) range that tightens at every step', 'Going left lowers the upper bound to the node\'s value; going right raises the lower bound.', { time: 'O(n)', space: 'O(h)' }),
      no('At every node, compare it only with its two children', 'That accepts the invalid example above: each parent/child pair looks fine.', { time: 'O(n)', space: 'O(h)' }),
      ok('For every node, scan its entire left and right subtrees', 'Correct, but nodes deep in the tree are rescanned by every ancestor.', { time: 'O(n²)', space: 'O(h)' }),
    ),
    q(
      'What is the allowed range for the root?',
      yes('No limits at all', 'Nothing constrains the root, so both bounds start "open".'),
      no('0 to the largest value in the tree', 'Values can be negative, and you do not know the largest value in advance.'),
      no('Its left child\'s value to its right child\'s value', 'That is the rule the root imposes on others, not a limit on itself.'),
    ),
  ],
  langQ: {
    python: q(
      'How can "no limit yet" be represented for low and high?',
      yes('None, checked with `low is not None` before comparing', 'float("-inf") and float("inf") also work.'),
      no('0', '0 is a real value a node could hold or be compared against.'),
      no('An empty string', 'Comparing a number with "" raises TypeError.'),
    ),
    java: q(
      'Node values can be Integer.MIN_VALUE. How do you represent "no limit yet" safely?',
      yes('Use Integer (the object) parameters and pass null, or use long bounds', 'An int bound of Integer.MIN_VALUE would wrongly reject a node holding exactly that value.'),
      no('Pass Integer.MIN_VALUE and Integer.MAX_VALUE as int bounds', 'A tree containing those exact values would be misjudged.'),
      no('Pass 0 for both', '0 is a real value.'),
    ),
  },
  plan: [
    'Write a check that takes a node and its allowed low and high bounds.',
    'An empty node is valid.',
    'If the node\'s value is not strictly inside the bounds, it is invalid.',
    'Check the left subtree with the high bound tightened to this value.',
    'Check the right subtree with the low bound tightened to this value.',
    'Start from the root with no bounds.',
  ],
  hints: ['A node deep in the tree is limited by more than its parent. What limits it?', 'Pass an allowed range down the recursion and narrow it with every left or right step.'],
  solution: {
    python: `def is_valid_bst(root, low=None, high=None):
    if root is None:
        return True
    if low is not None and root.val <= low:
        return False
    if high is not None and root.val >= high:
        return False
    return is_valid_bst(root.left, low, root.val) and is_valid_bst(root.right, root.val, high)
`,
    java: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return check(root, null, null);
    }

    private boolean check(TreeNode node, Integer low, Integer high) {
        if (node == null) {
            return true;
        }
        if (low != null && node.val <= low) {
            return false;
        }
        if (high != null && node.val >= high) {
            return false;
        }
        return check(node.left, low, node.val) && check(node.right, node.val, high);
    }
}
`,
  },
  tests: [
    [[[5, 4, 6, null, null, 3, 7]], false],
    [[[2, 1, 3]], true],
    [[[]], true],
    [[[1, 1]], false],
    [[[10, 5, 15, null, null, 12, 20]], true],
    [[[5, 1, 4, null, null, 3, 6]], false],
  ],
  reflect: ['Why is comparing a node with only its children not enough? What does the (low, high) range carry?', 'O(n)', 'O(h) — the height of the tree'],
});

export const minDepth = make({
  slug: 'minimum-depth-of-binary-tree',
  title: 'Minimum Depth of Binary Tree',
  pattern: 'tree-bfs',
  difficulty: 'Easy',
  leetcode: 111,
  statement: 'Return the number of nodes on the shortest path from the root down to the nearest leaf. A leaf is a node with no children.',
  constraints: ['0 ≤ number of nodes ≤ 100,000', 'An empty tree has depth 0'],
  examples: [
    ['root = [3, 9, 20, {{None|null}}, {{None|null}}, 15, 7]', '2', '3 → 9, and 9 is a leaf.'],
    ['root = [2, {{None|null}}, 3, {{None|null}}, 4]', '3', 'The root has one child, so it is not a leaf; the only leaf is 4.'],
  ],
  fn: ['min_depth', 'minDepth'],
  params: [['root', 'TreeNode']],
  returns: 'int',
  understanding: [
    q(
      'root = [1, 2] (the root has only a left child). What is the minimum depth?',
      yes('2', 'The root is not a leaf because it has a child. The nearest leaf is node 2.'),
      no('1', 'A missing right child is not a leaf; the path must end on a real node with no children.'),
      no('0', 'The tree is not empty.'),
    ),
    q(
      'You want the nearest leaf. Which way of exploring reaches it first?',
      yes('Level by level from the top', 'The first leaf you meet that way is on the shallowest level, so you can stop immediately.'),
      no('All the way down the left side first', 'The left side might be a long chain while a leaf sits right under the root on the other side.'),
      no('Bottom up', 'You would have to visit everything before knowing which leaf is nearest.'),
    ),
  ],
  approach: [
    q(
      'How do you explore level by level?',
      yes('A queue: take a node from the front, add its children to the back; process one whole level per round', 'The first leaf dequeued gives the answer without touching deeper levels.', { time: 'O(n)', space: 'O(w)' }),
      ok('Recursion into left and right, taking the smaller result', 'It can be made to work, but it visits the whole tree even when a leaf is near the top, and it needs care when a child is missing.', { time: 'O(n)', space: 'O(h)' }),
      no('A stack', 'A stack dives deep first (DFS), which is the opposite of nearest-first.', { time: 'O(n)', space: 'O(h)' }),
    ),
    q(
      'How do you know when one level ends and the next begins?',
      yes('Record the queue size at the start of the round and process exactly that many nodes', 'Children added during the round belong to the next level.'),
      no('When the queue is empty', 'It only empties when the whole tree is done.'),
      no('After every two nodes', 'Levels have varying sizes.'),
    ),
  ],
  langQ: {
    python: q(
      'Which removes from the front of the queue in O(1)?',
      yes('queue.popleft() on a collections.deque', 'deque is built for adding and removing at both ends.'),
      no('queue.pop(0) on a list', 'It works but shifts every remaining element, costing O(n) each time.'),
      no('queue.pop() on a list', 'That removes from the back: a stack, not a queue.'),
    ),
    java: q(
      'Which pair of calls makes a Deque behave as a queue?',
      yes('queue.add(x) to enqueue, queue.poll() to dequeue', 'add appends at the back, poll takes from the front.'),
      no('queue.push(x) and queue.pop()', 'Those work on the front only: that is a stack.'),
      no('queue.add(x) and queue.pop()', 'pop also takes from the front, so it works, but poll is the queue method and returns null instead of throwing when empty.'),
    ),
  },
  plan: [
    'If the tree is empty, return 0.',
    'Put the root in a queue and set depth to 1.',
    'While the queue is not empty, process the nodes of the current level one at a time.',
    'If a node has no children, return the current depth.',
    'Otherwise add its existing children to the queue.',
    'After finishing a level, increase depth by 1.',
  ],
  hints: ['Which exploration order guarantees that the first leaf you see is the nearest one?', 'Breadth-first search with a queue, one level per round; return at the first leaf.'],
  solution: {
    python: `from collections import deque

def min_depth(root):
    if root is None:
        return 0
    queue = deque([root])
    depth = 1
    while queue:
        for step in range(len(queue)):
            node = queue.popleft()
            if node.left is None and node.right is None:
                return depth
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        depth += 1
    return depth
`,
    java: `class Solution {
    public int minDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        int depth = 1;
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (node.left == null && node.right == null) {
                    return depth;
                }
                if (node.left != null) {
                    queue.add(node.left);
                }
                if (node.right != null) {
                    queue.add(node.right);
                }
            }
            depth++;
        }
        return depth;
    }
}
`,
  },
  tests: [
    [[[3, 9, 20, null, null, 15, 7]], 2],
    [[[2, null, 3, null, 4, null, 5, null, 6]], 5],
    [[[]], 0],
    [[[1]], 1],
    [[[1, 2, 3, 4, 5]], 2],
  ],
  reflect: ['Why does BFS let you stop early here while DFS cannot?', 'O(n)', 'O(n)'],
});

export const levelOrder = make({
  slug: 'binary-tree-level-order-traversal',
  title: 'Binary Tree Level Order Traversal',
  pattern: 'tree-bfs',
  difficulty: 'Medium',
  leetcode: 102,
  statement: 'Return the values of the tree level by level, top to bottom, each level listed left to right as its own list.',
  constraints: ['0 ≤ number of nodes ≤ 2,000', 'An empty tree gives an empty list'],
  examples: [
    ['root = [3, 9, 20, {{None|null}}, {{None|null}}, 15, 7]', '[[3], [9, 20], [15, 7]]', 'Three levels.'],
    ['root = [1]', '[[1]]', 'One level with one node.'],
  ],
  fn: ['level_order', 'levelOrder'],
  params: [['root', 'TreeNode']],
  returns: 'List<List<Integer>>',
  understanding: [
    q(
      'root = [1, 2, 3, 4, {{None|null}}, {{None|null}}, 5]. What is the last level?',
      yes('[4, 5]', '4 is under 2 and 5 is under 3; both are on level three, left to right.'),
      no('[4]', '5 is on the same level, under node 3.'),
      no('[5, 4]', 'Levels are listed left to right.'),
    ),
    q(
      'What should be returned for an empty tree?',
      yes('An empty list: []', 'There are no levels at all.'),
      no('[[]]', 'That is one level containing nothing, which is different.'),
      no('{{None|null}}', 'The return type is a list.'),
    ),
  ],
  approach: [
    q(
      'How do you keep the levels separate?',
      yes('BFS with a queue; at the start of each round note the queue size, and collect exactly that many nodes into one list', 'Whatever gets enqueued during the round is the next level.', { time: 'O(n)', space: 'O(n)' }),
      no('BFS with a queue, appending every value to one flat list', 'The order is right, but you lose where each level ends.', { time: 'O(n)', space: 'O(n)' }),
      no('Visit left subtree fully, then right subtree', 'That is depth-first; values of the same level end up far apart.', { time: 'O(n)', space: 'O(h)' }),
    ),
    q(
      'Why read the queue size before the inner loop instead of checking it during the loop?',
      yes('The queue grows while you add children, so the live size no longer means "this level"', 'The snapshot is the level boundary.'),
      no('Reading the size is slow', 'It is O(1). The reason is correctness.'),
      no('It makes no difference', 'Without the snapshot the loop would swallow the next levels too.'),
    ),
  ],
  langQ: {
    python: q(
      'Why is `for step in range(len(queue)):` safe even though the queue changes inside the loop?',
      yes('range(len(queue)) is computed once, before the loop starts', 'So it counts exactly the nodes of the current level.'),
      no('Python re-evaluates len(queue) every iteration', 'It does not; range is built once.'),
      no('It is not safe', 'It is the standard way to take a level snapshot.'),
    ),
    java: q(
      'Why write `int size = queue.size();` before the for loop rather than `i < queue.size()` in it?',
      yes('The loop condition is re-evaluated every iteration, and the queue is growing', 'The saved size is the level boundary.'),
      no('queue.size() cannot be called in a condition', 'It can; it would just give the wrong boundary.'),
      no('For speed only', 'The reason is correctness.'),
    ),
  },
  plan: [
    'If the tree is empty, return an empty list.',
    'Put the root in a queue.',
    'While the queue is not empty, note how many nodes are in it: that is the current level.',
    'Dequeue exactly that many nodes, collecting their values and enqueueing their children.',
    'Append the collected values as one level.',
    'Return all the levels.',
  ],
  hints: ['When you start a round, which nodes are in the queue?', 'BFS, but take a snapshot of the queue length each round so you know where the level ends.'],
  solution: {
    python: `from collections import deque

def level_order(root):
    levels = []
    if root is None:
        return levels
    queue = deque([root])
    while queue:
        level = []
        for step in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels
`,
    java: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> levels = new ArrayList<>();
        if (root == null) {
            return levels;
        }
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) {
                    queue.add(node.left);
                }
                if (node.right != null) {
                    queue.add(node.right);
                }
            }
            levels.add(level);
        }
        return levels;
    }
}
`,
  },
  tests: [
    [[[3, 9, 20, null, null, 15, 7]], [[3], [9, 20], [15, 7]]],
    [[[1]], [[1]]],
    [[[]], []],
    [[[1, 2, 3, 4, null, null, 5]], [[1], [2, 3], [4, 5]]],
  ],
  reflect: ['What is in the queue at the start of each round, and why does a size snapshot separate the levels?', 'O(n)', 'O(n)'],
});

export const lastStoneWeight = make({
  slug: 'last-stone-weight',
  title: 'Last Stone Weight',
  pattern: 'heap',
  difficulty: 'Easy',
  leetcode: 1046,
  statement:
    'Each turn, take the two heaviest stones and smash them together. If they weigh the same both are destroyed; otherwise the lighter is destroyed and the heavier loses that much weight. Return the weight of the last stone, or 0 if none is left.',
  constraints: ['1 ≤ stones.length ≤ 30', '1 ≤ stones[i] ≤ 1,000'],
  examples: [
    ['stones = [2, 7, 4, 1, 8, 1]', '1', '8 & 7 → 1; 4 & 2 → 2; 2 & 1 → 1; 1 & 1 → gone; one stone of weight 1 remains.'],
    ['stones = [3, 3]', '0', 'Equal stones destroy each other.'],
  ],
  fn: ['last_stone_weight', 'lastStoneWeight'],
  params: [['stones', 'int[]']],
  returns: 'int',
  understanding: [
    q(
      'stones = [10, 4, 2]. What is left at the end?',
      yes('4', '10 & 4 → 6; then 6 & 2 → 4.'),
      no('8', 'You must take the two heaviest each turn: 10 and 4 first.'),
      no('0', 'The last smash leaves a remainder of 4.'),
    ),
    q(
      'After a smash leaves a new stone of weight 6, what has to happen to it?',
      yes('It goes back among the stones and competes to be one of the two heaviest', 'The collection changes every turn, and you need its maximum again and again.'),
      no('It is set aside as the answer', 'It can still be smashed later.'),
      no('It is smashed with the next stone in the original order', 'Order of input is irrelevant; only weight matters.'),
    ),
  ],
  approach: [
    q(
      'You repeatedly need the largest item from a collection that keeps changing. What fits?',
      yes('A max-heap: take the top two, push back the difference', 'Both removing the maximum and inserting cost O(log n).', { time: 'O(n log n)', space: 'O(n)' }),
      ok('Re-sort the list after every smash', 'Correct, but each sort redoes work: n sorts of n log n.', { time: 'O(n² log n)', space: 'O(1)' }),
      ok('Scan for the two largest every turn', 'Correct, with a linear scan per turn.', { time: 'O(n²)', space: 'O(1)' }),
    ),
    q(
      'When does the loop stop?',
      yes('When fewer than two stones remain', 'A smash needs two stones.'),
      no('When the heap is empty', 'With exactly one stone left you cannot take two.'),
      no('After n turns', 'The number of turns depends on the weights.'),
    ),
  ],
  langQ: {
    python: q(
      'heapq only provides a min-heap. How do you get the largest stone out first?',
      yes('Store the weights negated and negate again when you pop', 'The most negative number is the smallest, so it comes out first.'),
      no('Call heapq.heappop(heap, max=True)', 'There is no such argument.'),
      no('Use heap[-1]', 'The last list slot is not the maximum in a heap.'),
    ),
    java: q(
      'PriorityQueue is a min-heap by default. How do you make it give the largest first?',
      yes('new PriorityQueue<>(Collections.reverseOrder())', 'A reversed comparator turns it into a max-heap.'),
      no('new PriorityQueue<>(true)', 'There is no such constructor.'),
      no('Call heap.pollLast()', 'PriorityQueue has no pollLast.'),
    ),
  },
  plan: [
    'Put every stone into a max-heap.',
    'Repeat while at least two stones remain.',
    'Remove the heaviest stone, then the next heaviest.',
    'If they differ, push the difference back.',
    'Return the remaining stone\'s weight, or 0 if there is none.',
  ],
  hints: ['Each turn you need the two largest of a changing collection. What gives you the largest quickly, over and over?', 'Max-heap: pop two, push the difference if it is not zero.'],
  solution: {
    python: `import heapq

def last_stone_weight(stones):
    heap = [-stone for stone in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        first = -heapq.heappop(heap)
        second = -heapq.heappop(heap)
        if first != second:
            heapq.heappush(heap, -(first - second))
    return -heap[0] if heap else 0
`,
    java: `class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int stone : stones) {
            heap.add(stone);
        }
        while (heap.size() > 1) {
            int first = heap.poll();
            int second = heap.poll();
            if (first != second) {
                heap.add(first - second);
            }
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }
}
`,
  },
  tests: [
    [[[2, 7, 4, 1, 8, 1]], 1],
    [[[1]], 1],
    [[[3, 3]], 0],
    [[[10, 4, 2]], 4],
    [[[5, 5, 5]], 5],
  ],
  reflect: ['Why a heap rather than sorting once? What does the heap guarantee after each push and pop?', 'O(n log n)', 'O(n)'],
});

export const kthLargest = make({
  slug: 'kth-largest-element-in-an-array',
  title: 'Kth Largest Element in an Array',
  pattern: 'heap',
  difficulty: 'Medium',
  leetcode: 215,
  statement: 'Return the k-th largest value in nums. That is the k-th value in sorted descending order, counting duplicates (not the k-th distinct value).',
  constraints: ['1 ≤ k ≤ nums.length ≤ 100,000', 'Values can repeat and can be negative'],
  examples: [
    ['nums = [3, 2, 1, 5, 6, 4], k = 2', '5', 'Descending: 6, 5, 4, … The 2nd is 5.'],
    ['nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4', '4', 'Descending: 6, 5, 5, 4. Duplicates each take a place.'],
  ],
  fn: ['find_kth_largest', 'findKthLargest'],
  params: [
    ['nums', 'int[]'],
    ['k', 'int'],
  ],
  returns: 'int',
  understanding: [
    q(
      'nums = [7, 7, 7], k = 2. What is the answer?',
      yes('7', 'Duplicates count separately: the 2nd largest is the second 7.'),
      no('There is no 2nd largest', 'It is the k-th in sorted order, not the k-th distinct value.'),
    ),
    q(
      'Suppose you are holding the k largest values seen so far. Which one of them is the k-th largest overall so far?',
      yes('The smallest of the k you are holding', 'Among the top k, the k-th largest is the one at the bottom.'),
      no('The largest of them', 'That is the 1st largest.'),
      no('The middle one', 'Only when k happens to be such that the middle is k-th; in general it is the smallest of the group.'),
    ),
  ],
  approach: [
    q(
      'How do you find the k-th largest without fully sorting?',
      yes('Keep a min-heap of size k: push each value, and when the heap exceeds k remove the smallest', 'The heap always holds the k largest so far, and its top is the k-th largest.', { time: 'O(n log k)', space: 'O(k)' }),
      ok('Sort everything and index from the end', 'Correct and short. It does more ordering work than needed when k is small.', { time: 'O(n log n)', space: 'O(1)' }),
      ok('Find the maximum k times, removing it each time', 'Correct, but each pass is a full scan.', { time: 'O(n · k)', space: 'O(1)' }),
    ),
    q(
      'Why a MIN-heap when you want something LARGE?',
      yes('Because the thing you keep throwing away is the smallest of your k candidates', 'A min-heap puts exactly that one on top, ready to be removed.'),
      no('Min-heaps are faster than max-heaps', 'They cost the same.'),
      no('It is a mistake; it should be a max-heap', 'A max-heap of everything also works (pop k times) but holds all n values.'),
    ),
  ],
  langQ: {
    python: q(
      'After pushing, how do you shrink the heap back to k items?',
      yes('if len(heap) > k: heapq.heappop(heap)', 'heappop removes and returns the smallest.'),
      no('heap.pop()', 'list.pop removes the last slot, which is not the smallest and breaks the heap.'),
      no('heap.remove(min(heap))', 'It works but scans the whole list each time, losing the point of the heap.'),
    ),
    java: q(
      'How do you look at the smallest value in a PriorityQueue without removing it?',
      yes('heap.peek()', 'peek returns the head; poll would also remove it.'),
      no('heap.get(0)', 'PriorityQueue has no index access.'),
      no('heap.first()', 'first belongs to sorted sets, not PriorityQueue.'),
    ),
  },
  plan: [
    'Create an empty min-heap.',
    'Visit each value and push it onto the heap.',
    'If the heap now holds more than k values, remove the smallest.',
    'After all values, the top of the heap is the answer.',
  ],
  hints: ['If you only kept k values at any time, which k would you keep, and which would you discard when a new one arrives?', 'A min-heap capped at size k holds the k largest; its smallest is the k-th largest.'],
  solution: {
    python: `import heapq

def find_kth_largest(nums, k):
    heap = []
    for value in nums:
        heapq.heappush(heap, value)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]
`,
    java: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int value : nums) {
            heap.add(value);
            if (heap.size() > k) {
                heap.poll();
            }
        }
        return heap.peek();
    }
}
`,
  },
  tests: [
    [[[3, 2, 1, 5, 6, 4], 2], 5],
    [[[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], 4],
    [[[1], 1], 1],
    [[[7, 7, 7], 2], 7],
    [[[-1, -5, -3], 1], -1],
  ],
  reflect: ['Explain why a min-heap of size k ends up with the k-th largest on top.', 'O(n log k)', 'O(k)'],
});
