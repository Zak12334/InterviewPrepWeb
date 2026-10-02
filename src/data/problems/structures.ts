import type { Problem } from '@/types/content';

const BIG_O = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];

export const validParentheses: Problem = {
  slug: 'valid-parentheses',
  title: 'Valid Parentheses',
  pattern: 'stack',
  difficulty: 'Easy',
  leetcode: 20,
  statement:
    'A string contains only the characters ( ) [ ] { }. It is valid when every opening bracket is closed by the same kind of bracket, and brackets close in the correct order. Return whether the string is valid.',
  constraints: ['1 ≤ s.length ≤ 10,000', 's contains only ()[]{}'],
  examples: [
    { input: 's = "{[()]}"', output: '{{True|true}}', explanation: 'Each bracket is closed by its own kind, innermost first.' },
    { input: 's = "([)]"', output: '{{False|false}}', explanation: 'The ) arrives while [ is still the most recent open bracket.' },
  ],
  signature: { python: 'is_valid', java: 'isValid', params: [{ name: 's', type: 'String' }], returns: 'boolean' },
  understanding: [
    {
      prompt: 'Is "(((" valid?',
      options: [
        { label: 'No', correct: true, feedback: 'Nothing is mismatched, but three brackets are left open at the end.' },
        { label: 'Yes', feedback: 'Every opening bracket has to be closed. These three never are.' },
      ],
    },
    {
      prompt: 'You have read "{[(" and the next character is a closing bracket. Which one keeps the string valid?',
      options: [
        { label: ')', correct: true, feedback: 'A closer must match the most recently opened bracket that is still open.' },
        { label: '}', feedback: 'The { was opened first, so it must be closed last.' },
        { label: 'Any of them', feedback: 'Only the closer for the most recent open bracket is allowed.' },
      ],
    },
  ],
  approach: [
    {
      prompt: '"Most recently opened, still unclosed" — which structure hands you that in one step?',
      options: [
        {
          label: 'A stack of open brackets',
          correct: true,
          feedback: 'Last in, first out: the top of the stack is always the bracket that must close next.',
          complexity: { time: 'O(n)', space: 'O(n)' },
          demo: `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack`,
        },
        {
          label: 'Three counters, one per bracket type',
          feedback: 'Counters approve "([)]": every count returns to zero even though the order is wrong.',
          complexity: { time: 'O(n)', space: 'O(1)' },
        },
        {
          label: 'Keep deleting "()", "[]" and "{}" until nothing changes',
          valid: true,
          feedback: 'Correct, but every pass re-reads and rebuilds the whole string just to remove a few characters.',
          complexity: { time: 'O(n²)', space: 'O(n)' },
        },
      ],
    },
    {
      prompt: 'A closing bracket arrives and the stack is empty. What now?',
      options: [
        { label: 'Return {{False|false}} immediately', correct: true, feedback: 'There is nothing for it to close, as in ")(".' },
        { label: 'Ignore it and continue', feedback: 'Then ")" alone would be reported as valid.' },
        { label: 'Push it on the stack', feedback: 'The stack holds brackets waiting to be closed. A closer never waits.' },
      ],
    },
    {
      prompt: 'You reach the end of the string without a mismatch. What do you return?',
      options: [
        { label: '{{True|true}} only if the stack is empty', correct: true, feedback: 'Anything still on the stack was opened and never closed.' },
        { label: '{{True|true}}', feedback: 'That would accept "(((".' },
      ],
    },
  ],
  planSteps: [
    'Create an empty stack and a lookup from each closer to its opener.',
    'Read the string one character at a time.',
    'If the character is an opener, push it and move to the next character.',
    'Otherwise it is a closer: if the stack is empty or its top is not the matching opener, return {{False|false}}.',
    'Pop the matched opener off the stack.',
    'At the end, return whether the stack is empty.',
  ],
  hints: [
    'When a closer arrives, which one earlier character does it have to agree with?',
    'Push openers on a stack. A closer must match the top of the stack, then remove it.',
    'for each ch:\n    opener → push\n    closer → if stack empty or top != matching opener: return {{False|false}}; else pop\nreturn stack is empty',
  ],
  starter: {
    python: `def is_valid(s):
    pass
`,
    java: `class Solution {
    public boolean isValid(String s) {
        return false;
    }
}
`,
  },
  solution: {
    python: `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack
`,
    java: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '(' || ch == '[' || ch == '{') {
                stack.push(ch);
            } else {
                if (stack.isEmpty()) {
                    return false;
                }
                char open = stack.pop();
                if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{')) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }
}
`,
  },
  tests: [
    { args: ['{[()]}()'], expected: true },
    { args: ['([)]'], expected: false },
    { args: ['((('], expected: false },
    { args: [')('], expected: false },
    { args: ['()[]{}'], expected: true },
    { args: [']'], expected: false },
  ],
  demoArgs: ['{[()()]}[]'],
  reflect: {
    prompt: 'Why does a stack fit this problem and counters do not? Use "([)]" in your explanation.',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(n)' },
  },
};

export const reverseList: Problem = {
  slug: 'reverse-linked-list',
  title: 'Reverse Linked List',
  pattern: 'linked-list',
  difficulty: 'Easy',
  leetcode: 206,
  statement:
    'You are given the head of a singly linked list. Reverse the list so every arrow points the other way, and return the new head. Each node has a value (val) and a pointer to the next node (next).',
  constraints: ['0 ≤ number of nodes ≤ 5,000', 'The list may be empty (head is {{None|null}})'],
  examples: [
    { input: 'head = 1 → 2 → 3 → 4', output: '4 → 3 → 2 → 1', explanation: 'The old tail becomes the head.' },
    { input: 'head = (empty)', output: '(empty)', explanation: 'Nothing to reverse.' },
  ],
  signature: { python: 'reverse_list', java: 'reverseList', params: [{ name: 'head', type: 'ListNode' }], returns: 'ListNode' },
  understanding: [
    {
      prompt: 'After reversing 1 → 2 → 3, where does node 1 point?',
      options: [
        { label: 'Nowhere ({{None|null}})', correct: true, feedback: 'The old head becomes the tail, and a tail points to nothing.' },
        { label: 'To node 2', feedback: 'That is the original direction. After reversal, 2 points to 1.' },
        { label: 'To node 3', feedback: 'Node 3 becomes the head; nothing points from 1 to it.' },
      ],
    },
    {
      prompt: 'You are on node 2 of 1 → 2 → 3 and you set its next pointer to node 1. What just happened to node 3?',
      options: [
        { label: 'You can no longer reach it, unless you saved it first', correct: true, feedback: 'Node 2\'s next was your only road to node 3. Overwriting it burns the bridge.' },
        { label: 'Nothing, you can still walk to it', feedback: 'The only link to 3 was 2.next, and you just replaced it.' },
        { label: 'It was deleted', feedback: 'It still exists; you just have no pointer that leads to it.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'How do you reverse the arrows?',
      options: [
        {
          label: 'Walk the list once, flipping each arrow as you pass',
          correct: true,
          feedback: 'No copies, no new nodes: you just redirect each next pointer to the node behind.',
          complexity: { time: 'O(n)', space: 'O(1)' },
          demo: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        following = curr.next
        curr.next = prev
        prev = curr
        curr = following
    return prev`,
        },
        {
          label: 'Copy the values into an array, then write them back in reverse',
          valid: true,
          feedback: 'It produces the right values but needs a full extra copy and two passes. Interviewers want the pointers rewired.',
          complexity: { time: 'O(n)', space: 'O(n)' },
          demo: `def reverse_list(head):
    values = []
    node = head
    while node:
        values.append(node.val)
        node = node.next
    node = head
    while node:
        node.val = values.pop()
        node = node.next
    return head`,
        },
        {
          label: 'Swap the head and tail, then work inward',
          feedback: 'In a singly linked list you cannot step backwards from the tail, so "work inward" means re-walking from the head every time.',
          complexity: { time: 'O(n²)', space: 'O(1)' },
        },
      ],
    },
    {
      prompt: 'How many pointers do you need to hold while flipping one arrow?',
      options: [
        { label: 'Three: the node behind, the current node, and the node ahead', correct: true, feedback: 'prev is the new target, curr is being rewired, and the saved next is how you keep moving.' },
        { label: 'One: the current node', feedback: 'Then you have nothing to point it back at and no way forward after the flip.' },
        { label: 'Two: current and previous', feedback: 'Close, but the moment you flip curr.next the rest of the list is lost unless you saved it.' },
      ],
    },
    {
      prompt: 'The loop ends when curr runs off the end. What is the new head?',
      options: [
        { label: 'prev', correct: true, feedback: 'prev is the last real node you visited, which is the old tail.' },
        { label: 'curr', feedback: 'curr is {{None|null}} at that point; that is why the loop stopped.' },
        { label: 'head', feedback: 'head still refers to the original first node, which is now the tail.' },
      ],
    },
  ],
  planSteps: [
    'Set prev to {{None|null}} and curr to head.',
    'Repeat while curr is not {{None|null}}.',
    'Save curr.next in a temporary variable.',
    'Point curr.next back at prev.',
    'Move prev forward to curr.',
    'Move curr forward to the saved node.',
    'When the loop ends, return prev.',
  ],
  hints: [
    'Before you overwrite curr.next, what information are you about to lose?',
    'Carry three pointers: prev, curr and a saved next. Flip one arrow per loop.',
    'prev = {{None|null}}; curr = head\nwhile curr:\n    saved = curr.next\n    curr.next = prev\n    prev = curr\n    curr = saved\nreturn prev',
  ],
  starter: {
    python: `# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverse_list(head):
    pass
`,
    java: `// class ListNode { int val; ListNode next; }

class Solution {
    public ListNode reverseList(ListNode head) {
        return head;
    }
}
`,
  },
  solution: {
    python: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        following = curr.next
        curr.next = prev
        prev = curr
        curr = following
    return prev
`,
    java: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode following = curr.next;
            curr.next = prev;
            prev = curr;
            curr = following;
        }
        return prev;
    }
}
`,
  },
  tests: [
    { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
    { args: [[]], expected: [] },
    { args: [[7]], expected: [7] },
    { args: [[1, 2]], expected: [2, 1] },
  ],
  demoArgs: [[1, 2, 3, 4, 5]],
  reflect: {
    prompt: 'Describe one trip around the loop in plain words. Why does the order of the four lines matter?',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: BIG_O, answer: 'O(1)' },
  },
};

export const maxDepth: Problem = {
  slug: 'maximum-depth-of-binary-tree',
  title: 'Maximum Depth of Binary Tree',
  pattern: 'tree-dfs',
  difficulty: 'Easy',
  leetcode: 104,
  statement:
    'Given the root of a binary tree, return its depth: the number of nodes on the longest path from the root down to a leaf. Each node has val, left and right.',
  constraints: ['0 ≤ number of nodes ≤ 10,000', 'An empty tree has depth 0'],
  examples: [
    { input: 'root = [3, 9, 20, {{None|null}}, {{None|null}}, 15, 7]', output: '3', explanation: 'The path 3 → 20 → 15 has three nodes.' },
    { input: 'root = [1, {{None|null}}, 2]', output: '2', explanation: 'Only a right child, still two nodes deep.' },
  ],
  signature: { python: 'max_depth', java: 'maxDepth', params: [{ name: 'root', type: 'TreeNode' }], returns: 'int' },
  understanding: [
    {
      prompt: 'What is the depth of a tree with a single node?',
      options: [
        { label: '1', correct: true, feedback: 'Depth counts nodes on the path, and the path is just the root.' },
        { label: '0', feedback: '0 is the depth of an empty tree. One node is one level.' },
      ],
    },
    {
      prompt: 'A node\'s left subtree has depth 2 and its right subtree has depth 5. What is the depth of the tree rooted at that node?',
      options: [
        { label: '6', correct: true, feedback: 'The deeper side, plus one for the node itself.' },
        { label: '7', feedback: 'You do not add both sides; a path goes down only one of them.' },
        { label: '5', feedback: 'Do not forget to count the node itself.' },
      ],
    },
  ],
  approach: [
    {
      prompt: 'How do you compute the depth?',
      options: [
        {
          label: 'Recursion: depth(node) = 1 + the larger of depth(left) and depth(right)',
          correct: true,
          feedback: 'Each node asks its children and adds itself. Every node is visited exactly once.',
          complexity: { time: 'O(n)', space: 'O(h)' },
          demo: `def max_depth(root):
    if root is None:
        return 0
    left = max_depth(root.left)
    right = max_depth(root.right)
    return 1 + max(left, right)`,
        },
        {
          label: 'Always follow the left child and count',
          feedback: 'The deepest leaf may be down a right branch. On [1, {{None|null}}, 2] this answers 1 instead of 2.',
          complexity: { time: 'O(h)', space: 'O(1)' },
          demo: `def max_depth(root):
    depth = 0
    node = root
    while node:
        depth += 1
        node = node.left
    return depth`,
        },
        {
          label: 'Count all the nodes',
          feedback: 'Node count and depth are different things: a full tree of 7 nodes has depth 3.',
          complexity: { time: 'O(n)', space: 'O(h)' },
        },
      ],
    },
    {
      prompt: 'What is the base case that stops the recursion?',
      options: [
        { label: 'The node is {{None|null}} → return 0', correct: true, feedback: 'An empty tree has depth 0. This also handles missing children and an empty input in one rule.' },
        { label: 'The node is a leaf → return 1', feedback: 'Workable, but then you must separately guard nodes with only one child, and the empty tree. The {{None|null}} case covers everything.' },
        { label: 'The node is the root → return 1', feedback: 'The root is where you start, not where you stop.' },
      ],
    },
  ],
  planSteps: [
    'If the node is {{None|null}}, return 0.',
    'Recursively compute the depth of both subtrees, left and right.',
    'Take the larger of the two depths.',
    'Add 1 for the current node and return the result.',
  ],
  hints: [
    'If a friend told you the depth of the left and right subtrees, how would you get the answer for this node?',
    'Write it recursively. The smallest tree is an empty one with depth 0.',
    'if node is {{None|null}}: return 0\nleft = depth(node.left)\nright = depth(node.right)\nreturn 1 + max(left, right)',
  ],
  starter: {
    python: `# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def max_depth(root):
    pass
`,
    java: `// class TreeNode { int val; TreeNode left; TreeNode right; }

class Solution {
    public int maxDepth(TreeNode root) {
        return 0;
    }
}
`,
  },
  solution: {
    python: `def max_depth(root):
    if root is None:
        return 0
    left = max_depth(root.left)
    right = max_depth(root.right)
    return 1 + max(left, right)
`,
    java: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int left = maxDepth(root.left);
        int right = maxDepth(root.right);
        return 1 + Math.max(left, right);
    }
}
`,
  },
  tests: [
    { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
    { args: [[1, null, 2]], expected: 2 },
    { args: [[]], expected: 0 },
    { args: [[5]], expected: 1 },
    { args: [[1, 2, 3, 4, null, null, null, 5]], expected: 4 },
  ],
  demoArgs: [[3, 9, 20, null, null, 15, 7]],
  reflect: {
    prompt: 'Trace the recursion on a three-node tree in words. What does each call wait for, and what does it hand back?',
    time: { options: BIG_O, answer: 'O(n)' },
    space: { options: ['O(1)', 'O(log n)', 'O(h) — the height of the tree', 'O(n²)'], answer: 'O(h) — the height of the tree' },
  },
};
