import type { Language, PatternId } from '@/types/content';

export type Pattern = {
  id: PatternId;
  name: string;
  /** The whole idea in one sentence. */
  idea: string;
  /** Wording in a problem statement that should make you think of this pattern. */
  spot: string[];
  /** The shape almost every solution in this pattern takes. */
  template: Record<Language, string>;
  /** More LeetCode problems of this pattern to try afterwards: [number, title, difficulty]. */
  more: [number, string, 'Easy' | 'Medium' | 'Hard'][];
};

/** In the order they are best learned: each one leans on the ones before it. */
export const patterns: Pattern[] = [
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    idea: 'Trade memory for speed: remember what you have seen in a hash map or set so you never search for it again.',
    spot: ['"Have I seen this before?" / duplicates', 'Count how often things occur', 'Find a partner or complement for each element', 'Group items that share a property (anagrams)'],
    template: {
      python: 'seen = {}                      # or set()\nfor i, x in enumerate(nums):\n    if want(x) in seen:\n        return answer\n    seen[x] = i',
      java: 'Map<Integer, Integer> seen = new HashMap<>();\nfor (int i = 0; i < nums.length; i++) {\n    if (seen.containsKey(want(nums[i]))) return answer;\n    seen.put(nums[i], i);\n}',
    },
    more: [[242, 'Valid Anagram', 'Easy'], [347, 'Top K Frequent Elements', 'Medium'], [128, 'Longest Consecutive Sequence', 'Medium']],
  },
  {
    id: 'prefix-sum',
    name: 'Prefix Sum',
    idea: 'Precompute running totals so the sum of any stretch is one subtraction instead of a loop.',
    spot: ['Sum of a subarray / range, asked many times', '"Number of subarrays that sum to K"', 'Anything about totals between two positions', 'Negative numbers present, so a sliding window will not work'],
    template: {
      python: 'prefix = [0]\nfor x in nums:\n    prefix.append(prefix[-1] + x)\n# sum of nums[i..j] = prefix[j + 1] - prefix[i]',
      java: 'int[] prefix = new int[nums.length + 1];\nfor (int i = 0; i < nums.length; i++) {\n    prefix[i + 1] = prefix[i] + nums[i];\n}\n// sum of nums[i..j] = prefix[j + 1] - prefix[i]',
    },
    more: [[303, 'Range Sum Query - Immutable', 'Easy'], [238, 'Product of Array Except Self', 'Medium'], [525, 'Contiguous Array', 'Medium']],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    idea: 'Walk two indexes toward each other (or in the same direction) so each step rules out part of the input for good.',
    spot: ['The input is sorted (or sorting it is allowed)', 'Find a pair or triplet with a target sum', 'Palindrome checks', '"In place" / constant extra space'],
    template: {
      python: 'left, right = 0, len(nums) - 1\nwhile left < right:\n    if good(left, right):\n        return answer\n    if need_bigger:\n        left += 1\n    else:\n        right -= 1',
      java: 'int left = 0, right = nums.length - 1;\nwhile (left < right) {\n    if (good(left, right)) return answer;\n    if (needBigger) left++;\n    else right--;\n}',
    },
    more: [[15, '3Sum', 'Medium'], [11, 'Container With Most Water', 'Medium'], [283, 'Move Zeroes', 'Easy']],
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    idea: 'Keep a window over a contiguous stretch; grow it on the right, shrink it from the left when it breaks the rule.',
    spot: ['"Longest / shortest substring or subarray that…"', 'Contiguous elements with a condition', 'A fixed window size k', '"At most K distinct…"'],
    template: {
      python: 'left = 0\nfor right in range(len(s)):\n    add(s[right])\n    while window_is_invalid():\n        remove(s[left])\n        left += 1\n    best = max(best, right - left + 1)',
      java: 'int left = 0;\nfor (int right = 0; right < s.length(); right++) {\n    add(s.charAt(right));\n    while (windowIsInvalid()) {\n        remove(s.charAt(left));\n        left++;\n    }\n    best = Math.max(best, right - left + 1);\n}',
    },
    more: [[424, 'Longest Repeating Character Replacement', 'Medium'], [567, 'Permutation in String', 'Medium'], [76, 'Minimum Window Substring', 'Hard']],
  },
  {
    id: 'fast-slow',
    name: 'Fast & Slow Pointers',
    idea: 'Move one pointer twice as fast as the other: they meet if there is a cycle, and the slow one marks the middle when the fast one finishes.',
    spot: ['Detect a cycle (linked list, or a sequence that repeats)', 'Find the middle of a linked list in one pass', 'O(1) memory is demanded, so no set of visited nodes', 'Values that act as "next" pointers'],
    template: {
      python: 'slow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        return True        # cycle\n# here slow is the middle',
      java: 'ListNode slow = head, fast = head;\nwhile (fast != null && fast.next != null) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow == fast) return true;   // cycle\n}\n// here slow is the middle',
    },
    more: [[141, 'Linked List Cycle', 'Easy'], [142, 'Linked List Cycle II', 'Medium'], [234, 'Palindrome Linked List', 'Easy']],
  },
  {
    id: 'linked-list',
    name: 'Linked List Rewiring',
    idea: 'Change next pointers in place, holding on to every node you still need before you overwrite the link to it.',
    spot: ['Reverse, merge or reorder a linked list', 'Remove a node', '"Do it in place"', 'A dummy head makes the first node an ordinary case'],
    template: {
      python: 'dummy = ListNode(0, head)\nprev, curr = dummy, head\nwhile curr:\n    nxt = curr.next          # save before rewiring\n    ...                      # change pointers\n    prev, curr = curr, nxt\nreturn dummy.next',
      java: 'ListNode dummy = new ListNode(0, head);\nListNode prev = dummy, curr = head;\nwhile (curr != null) {\n    ListNode nxt = curr.next;   // save before rewiring\n    // change pointers\n    prev = curr;\n    curr = nxt;\n}\nreturn dummy.next;',
    },
    more: [[92, 'Reverse Linked List II', 'Medium'], [143, 'Reorder List', 'Medium'], [25, 'Reverse Nodes in k-Group', 'Hard']],
  },
  {
    id: 'stack',
    name: 'Stack',
    idea: 'When the most recent unfinished thing must be handled first, push it and pop it back when its partner arrives.',
    spot: ['Matching pairs: brackets, tags', 'Nested structure', 'Evaluate an expression', '"Undo" / backtrack to the previous state'],
    template: {
      python: 'stack = []\nfor x in items:\n    if opens(x):\n        stack.append(x)\n    else:\n        top = stack.pop()\n        ...\nreturn not stack',
      java: 'Deque<Character> stack = new ArrayDeque<>();\nfor (char x : s.toCharArray()) {\n    if (opens(x)) stack.push(x);\n    else {\n        char top = stack.pop();\n        // ...\n    }\n}\nreturn stack.isEmpty();',
    },
    more: [[155, 'Min Stack', 'Medium'], [394, 'Decode String', 'Medium'], [71, 'Simplify Path', 'Medium']],
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    idea: 'Keep a stack of elements still waiting for their answer; a new element resolves everything on the stack that it beats.',
    spot: ['"Next greater / next smaller element"', '"How many days until a warmer one"', 'Nearest bigger or smaller value to the left or right', 'Histogram / span problems'],
    template: {
      python: 'stack = []                     # indexes still waiting\nfor i, x in enumerate(nums):\n    while stack and nums[stack[-1]] < x:\n        j = stack.pop()\n        answer[j] = ...        # x resolves j\n    stack.append(i)',
      java: 'Deque<Integer> stack = new ArrayDeque<>();   // indexes still waiting\nfor (int i = 0; i < nums.length; i++) {\n    while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {\n        int j = stack.pop();\n        answer[j] = ...;      // nums[i] resolves j\n    }\n    stack.push(i);\n}',
    },
    more: [[503, 'Next Greater Element II', 'Medium'], [901, 'Online Stock Span', 'Medium'], [84, 'Largest Rectangle in Histogram', 'Hard']],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    idea: 'If one check tells you which half the answer is in, throw the other half away and repeat.',
    spot: ['Sorted input', 'O(log n) is demanded', '"Minimum value such that…" (search the answer itself)', 'Rotated sorted array'],
    template: {
      python: 'low, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] == target:\n        return mid\n    if nums[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nreturn -1',
      java: 'int low = 0, high = nums.length - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (nums[mid] == target) return mid;\n    if (nums[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}\nreturn -1;',
    },
    more: [[35, 'Search Insert Position', 'Easy'], [875, 'Koko Eating Bananas', 'Medium'], [4, 'Median of Two Sorted Arrays', 'Hard']],
  },
  {
    id: 'tree-dfs',
    name: 'Tree DFS (Recursion)',
    idea: 'Solve the problem for a node by trusting the answers from its left and right subtrees.',
    spot: ['Depth, height, path or diameter of a tree', '"Is this tree valid / balanced / symmetric?"', 'The answer for a node depends on its children', 'Root-to-leaf paths'],
    template: {
      python: 'def dfs(node):\n    if node is None:\n        return base\n    left = dfs(node.left)\n    right = dfs(node.right)\n    return combine(node, left, right)',
      java: 'int dfs(TreeNode node) {\n    if (node == null) return base;\n    int left = dfs(node.left);\n    int right = dfs(node.right);\n    return combine(node, left, right);\n}',
    },
    more: [[226, 'Invert Binary Tree', 'Easy'], [543, 'Diameter of Binary Tree', 'Easy'], [124, 'Binary Tree Maximum Path Sum', 'Hard']],
  },
  {
    id: 'tree-bfs',
    name: 'Tree BFS (Level Order)',
    idea: 'Use a queue to visit the tree one level at a time, from the top down.',
    spot: ['"Level by level" / level order', 'Nearest leaf, minimum depth', 'Right side view, or anything per level', 'Shortest number of steps in a tree'],
    template: {
      python: 'queue = deque([root])\nwhile queue:\n    for _ in range(len(queue)):      # one level\n        node = queue.popleft()\n        if node.left:\n            queue.append(node.left)\n        if node.right:\n            queue.append(node.right)',
      java: 'Deque<TreeNode> queue = new ArrayDeque<>();\nqueue.add(root);\nwhile (!queue.isEmpty()) {\n    int size = queue.size();          // one level\n    for (int i = 0; i < size; i++) {\n        TreeNode node = queue.poll();\n        if (node.left != null) queue.add(node.left);\n        if (node.right != null) queue.add(node.right);\n    }\n}',
    },
    more: [[199, 'Binary Tree Right Side View', 'Medium'], [103, 'Binary Tree Zigzag Level Order Traversal', 'Medium'], [637, 'Average of Levels in Binary Tree', 'Easy']],
  },
  {
    id: 'heap',
    name: 'Heap / Top K',
    idea: 'A heap hands you the smallest (or largest) item instantly, so keep one of size K instead of sorting everything.',
    spot: ['"K largest / K smallest / K most frequent"', '"Kth largest element"', 'Repeatedly take the biggest or smallest', 'Merge K sorted things'],
    template: {
      python: 'import heapq\nheap = []\nfor x in nums:\n    heapq.heappush(heap, x)\n    if len(heap) > k:\n        heapq.heappop(heap)      # drop the smallest\nreturn heap[0]                   # kth largest',
      java: 'PriorityQueue<Integer> heap = new PriorityQueue<>();\nfor (int x : nums) {\n    heap.add(x);\n    if (heap.size() > k) heap.poll();   // drop the smallest\n}\nreturn heap.peek();                     // kth largest',
    },
    more: [[347, 'Top K Frequent Elements', 'Medium'], [973, 'K Closest Points to Origin', 'Medium'], [23, 'Merge k Sorted Lists', 'Hard']],
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    idea: 'Build a candidate one choice at a time; after exploring a choice, undo it and try the next.',
    spot: ['"All subsets / permutations / combinations"', '"Generate every valid…"', 'Small input sizes (n ≤ 20)', 'Choices that can be undone: place, explore, remove'],
    template: {
      python: 'def backtrack(start, path):\n    result.append(path[:])\n    for i in range(start, len(nums)):\n        path.append(nums[i])      # choose\n        backtrack(i + 1, path)    # explore\n        path.pop()                # undo',
      java: 'void backtrack(int start, List<Integer> path) {\n    result.add(new ArrayList<>(path));\n    for (int i = start; i < nums.length; i++) {\n        path.add(nums[i]);                 // choose\n        backtrack(i + 1, path);            // explore\n        path.remove(path.size() - 1);      // undo\n    }\n}',
    },
    more: [[39, 'Combination Sum', 'Medium'], [79, 'Word Search', 'Medium'], [51, 'N-Queens', 'Hard']],
  },
  {
    id: 'graphs',
    name: 'Graphs & Grids (DFS / BFS)',
    idea: 'Visit everything reachable from a start, marking cells or nodes as seen so you never loop.',
    spot: ['A grid of cells with "islands", "regions" or "connected"', 'Nodes and edges, "is there a path"', 'Shortest path with equal step costs (use BFS)', 'Flood fill / spreading'],
    template: {
      python: 'def dfs(r, c):\n    if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != target:\n        return\n    grid[r][c] = seen\n    dfs(r + 1, c); dfs(r - 1, c)\n    dfs(r, c + 1); dfs(r, c - 1)',
      java: 'void dfs(int r, int c) {\n    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != target) return;\n    grid[r][c] = seen;\n    dfs(r + 1, c); dfs(r - 1, c);\n    dfs(r, c + 1); dfs(r, c - 1);\n}',
    },
    more: [[695, 'Max Area of Island', 'Medium'], [994, 'Rotting Oranges', 'Medium'], [127, 'Word Ladder', 'Hard']],
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    idea: 'When some things must come before others, repeatedly take whatever has no remaining prerequisites.',
    spot: ['Prerequisites / dependencies', '"Can all courses or tasks be finished?"', '"Find a valid order"', 'A directed graph where a cycle means impossible'],
    template: {
      python: 'queue = deque(n for n in range(count) if indegree[n] == 0)\ndone = 0\nwhile queue:\n    node = queue.popleft()\n    done += 1\n    for nxt in graph[node]:\n        indegree[nxt] -= 1\n        if indegree[nxt] == 0:\n            queue.append(nxt)\nreturn done == count',
      java: 'Deque<Integer> queue = new ArrayDeque<>();\nfor (int n = 0; n < count; n++) if (indegree[n] == 0) queue.add(n);\nint done = 0;\nwhile (!queue.isEmpty()) {\n    int node = queue.poll();\n    done++;\n    for (int nxt : graph.get(node)) {\n        if (--indegree[nxt] == 0) queue.add(nxt);\n    }\n}\nreturn done == count;',
    },
    more: [[210, 'Course Schedule II', 'Medium'], [2115, 'Find All Possible Recipes from Given Supplies', 'Medium'], [269, 'Alien Dictionary', 'Hard']],
  },
  {
    id: 'union-find',
    name: 'Union Find',
    idea: 'Give every item a group leader; joining two items merges their groups, and two items are connected when they share a leader.',
    spot: ['"Number of connected components / groups / provinces"', 'Edges arrive one at a time, "are these connected yet?"', 'Detect the edge that creates a cycle', 'Merging accounts or sets'],
    template: {
      python: 'parent = list(range(n))\n\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]   # shorten the path\n        x = parent[x]\n    return x\n\ndef union(a, b):\n    parent[find(a)] = find(b)',
      java: 'int[] parent = new int[n];\nfor (int i = 0; i < n; i++) parent[i] = i;\n\nint find(int x) {\n    while (parent[x] != x) {\n        parent[x] = parent[parent[x]];   // shorten the path\n        x = parent[x];\n    }\n    return x;\n}\n\nvoid union(int a, int b) { parent[find(a)] = find(b); }',
    },
    more: [[684, 'Redundant Connection', 'Medium'], [721, 'Accounts Merge', 'Medium'], [323, 'Number of Connected Components in an Undirected Graph', 'Medium']],
  },
  {
    id: 'dp-1d',
    name: 'Dynamic Programming (1-D)',
    idea: 'The answer for position i is built from a few earlier answers, so compute them in order and reuse them.',
    spot: ['"How many ways…"', '"Minimum / maximum cost to reach…"', 'A choice at every step: take it or skip it', 'Plain recursion would recompute the same sub-answers'],
    template: {
      python: 'dp = [0] * (n + 1)\ndp[0] = base\nfor i in range(1, n + 1):\n    dp[i] = best_of(dp[i - 1], dp[i - 2], ...)\nreturn dp[n]',
      java: 'int[] dp = new int[n + 1];\ndp[0] = base;\nfor (int i = 1; i <= n; i++) {\n    dp[i] = bestOf(dp[i - 1], dp[i - 2]);\n}\nreturn dp[n];',
    },
    more: [[746, 'Min Cost Climbing Stairs', 'Easy'], [300, 'Longest Increasing Subsequence', 'Medium'], [139, 'Word Break', 'Medium']],
  },
  {
    id: 'dp-2d',
    name: 'Dynamic Programming (2-D)',
    idea: 'When the state needs two numbers (row and column, or a position in each of two strings), fill a table cell by cell from its neighbours.',
    spot: ['Paths through a grid', 'Two strings compared: common subsequence, edit distance', 'Items and a capacity (knapsack)', 'The sub-answer depends on two indexes'],
    template: {
      python: 'dp = [[0] * (cols + 1) for _ in range(rows + 1)]\nfor r in range(1, rows + 1):\n    for c in range(1, cols + 1):\n        dp[r][c] = combine(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1])\nreturn dp[rows][cols]',
      java: 'int[][] dp = new int[rows + 1][cols + 1];\nfor (int r = 1; r <= rows; r++) {\n    for (int c = 1; c <= cols; c++) {\n        dp[r][c] = combine(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);\n    }\n}\nreturn dp[rows][cols];',
    },
    more: [[64, 'Minimum Path Sum', 'Medium'], [416, 'Partition Equal Subset Sum', 'Medium'], [72, 'Edit Distance', 'Medium']],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    idea: 'Make the choice that looks best right now and never revisit it; it works when a local best can be shown to be safe.',
    spot: ['"Maximum / minimum" with one pass feeling possible', '"Can you reach the end?"', 'A running best that you reset when it turns harmful', 'Sorting first makes the right choice obvious'],
    template: {
      python: 'best = current = nums[0]\nfor x in nums[1:]:\n    current = max(x, current + x)   # keep going or restart\n    best = max(best, current)\nreturn best',
      java: 'int best = nums[0], current = nums[0];\nfor (int i = 1; i < nums.length; i++) {\n    current = Math.max(nums[i], current + nums[i]);   // keep going or restart\n    best = Math.max(best, current);\n}\nreturn best;',
    },
    more: [[45, 'Jump Game II', 'Medium'], [134, 'Gas Station', 'Medium'], [455, 'Assign Cookies', 'Easy']],
  },
  {
    id: 'intervals',
    name: 'Intervals',
    idea: 'Sort by start time; then each interval only needs comparing with the one before it.',
    spot: ['Meetings, bookings, ranges with a start and an end', '"Merge overlapping…"', '"Do any overlap?" / "how many rooms?"', 'Insert a range into sorted ranges'],
    template: {
      python: 'intervals.sort()\nmerged = [intervals[0]]\nfor start, end in intervals[1:]:\n    if start <= merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], end)   # overlap: extend\n    else:\n        merged.append([start, end])',
      java: 'Arrays.sort(intervals, (a, b) -> a[0] - b[0]);\nList<int[]> merged = new ArrayList<>();\nfor (int[] cur : intervals) {\n    int[] last = merged.isEmpty() ? null : merged.get(merged.size() - 1);\n    if (last != null && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);   // overlap: extend\n    else merged.add(cur);\n}',
    },
    more: [[57, 'Insert Interval', 'Medium'], [435, 'Non-overlapping Intervals', 'Medium'], [253, 'Meeting Rooms II', 'Medium']],
  },
];

export const getPattern = (id: PatternId) => patterns.find((p) => p.id === id)!;
