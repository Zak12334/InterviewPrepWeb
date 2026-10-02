import type { Language, Mcq } from '@/types/content';

/**
 * The parts of each problem that only make sense in one language: a question about how the
 * chosen approach is actually written, and a fill-in-the-blanks skeleton used as the third hint.
 */
type Extras = { questions: Mcq[]; skeleton: Record<Language, string> };

export const languageSpecific: Record<string, Extras> = {
  'contains-duplicate': {
    questions: [
      {
        lang: 'python',
        prompt: 'How do you create an empty set in Python?',
        options: [
          { label: 'seen = set()', correct: true, feedback: 'set() is the only way to write an empty set.' },
          { label: 'seen = {}', feedback: 'Empty braces make an empty dict, not a set. seen.add(...) would then fail with AttributeError.' },
          { label: 'seen = []', feedback: 'That is a list. `value in seen` still works, but it scans every element, which brings back O(n²).' },
        ],
      },
      {
        lang: 'java',
        prompt: 'seen is a HashSet<Integer>. What does seen.add(value) return when value is already in it?',
        options: [
          { label: 'false', correct: true, feedback: 'add reports whether the set changed. So `if (!seen.add(value)) return true;` checks and inserts in a single call.' },
          { label: 'true', feedback: 'true means the value was new and has just been added.' },
          { label: 'It throws an exception', feedback: 'Adding a duplicate is not an error; the set simply stays the same and add returns false.' },
        ],
      },
    ],
    skeleton: {
      python: 'seen = set()\nfor value in nums:\n    if value in ___:\n        return ___\n    seen.add(___)\nreturn ___',
      java: 'Set<Integer> seen = new HashSet<>();\nfor (int value : nums) {\n    if (seen.contains(___)) {\n        return ___;\n    }\n    seen.add(___);\n}\nreturn ___;',
    },
  },

  'two-sum': {
    questions: [
      {
        lang: 'python',
        prompt: 'Which loop hands you both the index and the value on every trip?',
        options: [
          { label: 'for i, value in enumerate(nums):', correct: true, feedback: 'enumerate pairs each value with its position, which is exactly what you must return.' },
          { label: 'for value in nums:', feedback: 'That gives values only, and the answer needs positions.' },
          { label: 'for i, value in nums:', feedback: 'Python would try to unpack each integer into two names and raise TypeError.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'seen is a HashMap<Integer, Integer>. How do you ask whether the partner is in it?',
        options: [
          { label: 'seen.containsKey(need)', correct: true, feedback: 'Then seen.get(need) gives you the index that was stored with it.' },
          { label: 'seen.contains(need)', feedback: 'Map has no contains method (that is Set and List). This does not compile.' },
          { label: 'seen.get(need) != 0', feedback: 'get returns null for a missing key, and comparing null with 0 throws NullPointerException. Index 0 is also a perfectly valid stored value.' },
        ],
      },
    ],
    skeleton: {
      python: 'seen = {}\nfor i, value in enumerate(nums):\n    need = ___ - value\n    if need in seen:\n        return [seen[___], ___]\n    seen[___] = ___',
      java: 'Map<Integer, Integer> seen = new HashMap<>();\nfor (int i = 0; i < nums.length; i++) {\n    int need = ___ - nums[i];\n    if (seen.containsKey(need)) {\n        return new int[]{seen.get(___), ___};\n    }\n    seen.put(___, ___);\n}\nreturn new int[0];',
    },
  },

  'two-sum-ii-sorted': {
    questions: [
      {
        lang: 'python',
        prompt: 'How do you start right on the last element?',
        options: [
          { label: 'right = len(numbers) - 1', correct: true, feedback: 'Indexes run from 0 to len − 1.' },
          { label: 'right = len(numbers)', feedback: 'That is one past the end, so numbers[right] raises IndexError.' },
          { label: 'right = numbers.length - 1', feedback: 'That is Java. A Python list has no .length; you get AttributeError.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'numbers is an int[]. How do you get its last index?',
        options: [
          { label: 'numbers.length - 1', correct: true, feedback: 'For arrays, length is a field: no parentheses.' },
          { label: 'numbers.length() - 1', feedback: 'length() with parentheses belongs to String. On an array this does not compile.' },
          { label: 'numbers.size() - 1', feedback: 'size() belongs to collections such as ArrayList, not to arrays.' },
        ],
      },
    ],
    skeleton: {
      python: 'left, right = 0, len(numbers) - 1\nwhile left < right:\n    total = numbers[left] + numbers[right]\n    if total == target:\n        return [___, ___]\n    if total < target:\n        ___ += 1\n    else:\n        ___ -= 1',
      java: 'int left = 0, right = numbers.length - 1;\nwhile (left < right) {\n    int total = numbers[left] + numbers[right];\n    if (total == target) {\n        return new int[]{___, ___};\n    }\n    if (total < target) {\n        ___++;\n    } else {\n        ___--;\n    }\n}\nreturn new int[0];',
    },
  },

  'best-time-to-buy-and-sell-stock': {
    questions: [
      {
        lang: 'python',
        prompt: 'In `for price in prices:`, what is price on each trip around the loop?',
        options: [
          { label: 'The price itself: 7, then 2, then 5…', correct: true, feedback: 'Iterating a list gives its values, which is all this problem needs.' },
          { label: 'The index: 0, then 1, then 2…', feedback: 'That would be `for i in range(len(prices))`.' },
          { label: 'An (index, price) pair', feedback: 'Only if you wrap the list in enumerate(...).' },
        ],
      },
      {
        lang: 'java',
        prompt: 'How do you keep the smaller of lowest and price?',
        options: [
          { label: 'lowest = Math.min(lowest, price);', correct: true, feedback: 'min and max live on the Math class.' },
          { label: 'lowest = min(lowest, price);', feedback: 'A bare min(...) is Python. In Java this does not compile without Math.' },
          { label: 'lowest.min(price);', feedback: 'int is a primitive and has no methods.' },
        ],
      },
    ],
    skeleton: {
      python: 'lowest = prices[0]\nbest = 0\nfor price in prices:\n    lowest = min(lowest, ___)\n    best = max(best, ___ - ___)\nreturn ___',
      java: 'int lowest = prices[0];\nint best = 0;\nfor (int price : prices) {\n    lowest = Math.min(lowest, ___);\n    best = Math.max(best, ___ - ___);\n}\nreturn ___;',
    },
  },

  'longest-substring-without-repeating': {
    questions: [
      {
        lang: 'python',
        prompt: 'window is a set. How do you take the character s[left] out of it?',
        options: [
          { label: 'window.remove(s[left])', correct: true, feedback: 'remove deletes exactly that element.' },
          { label: 'window.pop(s[left])', feedback: 'set.pop() takes no argument and removes an arbitrary element. Passing one raises TypeError.' },
          { label: 'del window[s[left]]', feedback: 'Sets cannot be indexed, so this raises TypeError.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'How do you read the character at position right of a String s?',
        options: [
          { label: 's.charAt(right)', correct: true, feedback: 'It returns a char, which is stored in a Set<Character> (generics need the wrapper type, not char).' },
          { label: 's[right]', feedback: 'A String is not an array in Java. This does not compile.' },
          { label: 's.get(right)', feedback: 'get belongs to List. String has no such method.' },
        ],
      },
    ],
    skeleton: {
      python: 'window = set()\nleft = 0\nbest = 0\nfor right in range(len(s)):\n    while s[right] in window:\n        window.remove(s[___])\n        ___ += 1\n    window.add(s[___])\n    best = max(best, ___ - ___ + 1)\nreturn best',
      java: 'Set<Character> window = new HashSet<>();\nint left = 0, best = 0;\nfor (int right = 0; right < s.length(); right++) {\n    while (window.contains(s.charAt(right))) {\n        window.remove(s.charAt(___));\n        ___++;\n    }\n    window.add(s.charAt(___));\n    best = Math.max(best, ___ - ___ + 1);\n}\nreturn best;',
    },
  },

  'valid-parentheses': {
    questions: [
      {
        lang: 'python',
        prompt: 'A Python list is your stack (append to push, pop to pop). How do you look at the top without removing it?',
        options: [
          { label: 'stack[-1]', correct: true, feedback: 'Index −1 is the last element, which is the most recently pushed.' },
          { label: 'stack[0]', feedback: 'That is the bottom of the stack: the first thing pushed.' },
          { label: 'stack.pop()', feedback: 'That returns the top but also removes it.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'Which declaration gives you a stack of characters?',
        options: [
          { label: 'Deque<Character> stack = new ArrayDeque<>();', correct: true, feedback: 'Use push, pop, peek and isEmpty on it.' },
          { label: 'Deque<char> stack = new ArrayDeque<>();', feedback: 'Generics cannot hold primitives. Use the wrapper type Character.' },
          { label: 'char[] stack = new char[0];', feedback: 'An array has a fixed size, and this one has room for nothing.' },
        ],
      },
    ],
    skeleton: {
      python: "pairs = {')': '(', ']': '[', '}': '{'}\nstack = []\nfor ch in s:\n    if ch in pairs:\n        if not stack or stack[-1] != ___:\n            return ___\n        stack.___()\n    else:\n        stack.___(ch)\nreturn ___",
      java: "Deque<Character> stack = new ArrayDeque<>();\nfor (int i = 0; i < s.length(); i++) {\n    char ch = s.charAt(i);\n    if (ch == '(' || ch == '[' || ch == '{') {\n        stack.___(ch);\n    } else {\n        if (stack.isEmpty()) return ___;\n        char open = stack.___();\n        // return false if open is not the partner of ch\n    }\n}\nreturn ___;",
    },
  },

  'binary-search': {
    questions: [
      {
        lang: 'python',
        prompt: 'How do you compute the middle index?',
        options: [
          { label: 'mid = (low + high) // 2', correct: true, feedback: '// is integer division, so mid is always a whole number.' },
          { label: 'mid = (low + high) / 2', feedback: 'A single / produces a float such as 3.5, and nums[3.5] raises TypeError.' },
          { label: 'mid = high // 2', feedback: 'That ignores low, so once low has moved the "middle" is outside the range.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'Why is the middle usually written low + (high - low) / 2 instead of (low + high) / 2?',
        options: [
          { label: 'low + high can overflow int on very large arrays', correct: true, feedback: 'Past about 2.1 billion the sum wraps negative. Subtracting first keeps every value in range.' },
          { label: 'Integer division rounds the other way', feedback: 'Both forms round down to the same index.' },
          { label: 'It runs faster', feedback: 'There is no meaningful speed difference. The point is correctness.' },
        ],
      },
    ],
    skeleton: {
      python: 'low, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] == target:\n        return ___\n    if nums[mid] < target:\n        low = ___\n    else:\n        high = ___\nreturn -1',
      java: 'int low = 0, high = nums.length - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (nums[mid] == target) {\n        return ___;\n    }\n    if (nums[mid] < target) {\n        low = ___;\n    } else {\n        high = ___;\n    }\n}\nreturn -1;',
    },
  },

  'reverse-linked-list': {
    questions: [
      {
        lang: 'python',
        prompt: 'How do you write the loop so it stops when curr runs off the end of the list?',
        options: [
          { label: 'while curr:', correct: true, feedback: 'None is falsy, so the loop ends when curr becomes None. `while curr is not None:` means the same.' },
          { label: 'while curr.next:', feedback: 'That stops one node early, so the last arrow is never flipped. On an empty list it crashes: None has no attribute next.' },
          { label: 'for curr in head:', feedback: 'A ListNode is not iterable; this raises TypeError.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'What happens if your code evaluates curr.next while curr is null?',
        options: [
          { label: 'It throws NullPointerException', correct: true, feedback: 'So the loop must be guarded: while (curr != null).' },
          { label: 'It evaluates to null', feedback: 'Java does not do that. Dereferencing null is a run-time crash.' },
          { label: 'It does not compile', feedback: 'The compiler cannot know curr will be null. It compiles and fails when it runs.' },
        ],
      },
    ],
    skeleton: {
      python: 'prev = None\ncurr = head\nwhile curr:\n    following = curr.___\n    curr.next = ___\n    prev = ___\n    curr = ___\nreturn ___',
      java: 'ListNode prev = null;\nListNode curr = head;\nwhile (curr != null) {\n    ListNode following = curr.___;\n    curr.next = ___;\n    prev = ___;\n    curr = ___;\n}\nreturn ___;',
    },
  },

  'maximum-depth-of-binary-tree': {
    questions: [
      {
        lang: 'python',
        prompt: 'How do you test for an empty subtree?',
        options: [
          { label: 'if root is None:', correct: true, feedback: '`if not root:` also works, because None is falsy.' },
          { label: 'if root == 0:', feedback: 'A node never equals 0, so the check never fires and root.left on None raises AttributeError.' },
          { label: 'if root.val is None:', feedback: 'When root itself is None, reading root.val is already the crash.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'left and right are ints. How do you get the larger one?',
        options: [
          { label: 'Math.max(left, right)', correct: true, feedback: 'max lives on the Math class.' },
          { label: 'max(left, right)', feedback: 'A bare max(...) is Python. In Java this does not compile.' },
          { label: 'left > right', feedback: 'That is a boolean, and you cannot add 1 to a boolean.' },
        ],
      },
    ],
    skeleton: {
      python: 'if root is None:\n    return ___\nleft = max_depth(root.___)\nright = max_depth(root.___)\nreturn 1 + max(___, ___)',
      java: 'if (root == null) {\n    return ___;\n}\nint left = maxDepth(root.___);\nint right = maxDepth(root.___);\nreturn 1 + Math.max(___, ___);',
    },
  },

  'climbing-stairs': {
    questions: [
      {
        lang: 'python',
        prompt: 'What does `prev, curr = curr, prev + curr` do?',
        options: [
          { label: 'Works out both right-hand values first, then assigns them together', correct: true, feedback: 'That is why no temporary variable is needed.' },
          { label: 'Assigns prev first, then uses the new prev to compute curr', feedback: 'If it did, curr would simply double. Python evaluates the whole right side before assigning anything.' },
          { label: 'It is a syntax error', feedback: 'Tuple assignment is ordinary Python.' },
        ],
      },
      {
        lang: 'java',
        prompt: 'n can be as large as 45. Is int big enough to hold the answer?',
        options: [
          { label: 'Yes: the answer for 45 is 1,836,311,903, just under the int limit of 2,147,483,647', correct: true, feedback: 'n = 46 would overflow, which is exactly why the constraint stops at 45.' },
          { label: 'No, it needs long', feedback: 'long would work, but it is not required within these constraints.' },
          { label: 'No, it needs double', feedback: 'These are exact whole-number counts. Floating point would only add rounding risk.' },
        ],
      },
    ],
    skeleton: {
      python: 'if n <= 2:\n    return n\nprev, curr = 1, 2\nfor step in range(3, n + 1):\n    prev, curr = ___, ___ + ___\nreturn ___',
      java: 'if (n <= 2) {\n    return n;\n}\nint prev = 1, curr = 2;\nfor (int step = 3; step <= n; step++) {\n    int next = ___ + ___;\n    prev = ___;\n    curr = ___;\n}\nreturn ___;',
    },
  },
};
