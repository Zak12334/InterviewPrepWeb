import { make, no, ok, q, yes } from './builder';

export const subsets = make({
  slug: 'subsets',
  title: 'Subsets',
  pattern: 'backtracking',
  difficulty: 'Medium',
  leetcode: 78,
  statement: 'Given {{a list|an array}} of distinct integers, return every possible subset (including the empty one and the full one). The order of the subsets does not matter.',
  constraints: ['1 ≤ nums.length ≤ 10', 'All values are distinct'],
  examples: [
    ['nums = [1, 2, 3]', '[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]', '2³ = 8 subsets.'],
    ['nums = [0]', '[[], [0]]', 'Take it or leave it.'],
  ],
  fn: ['subsets', 'subsets'],
  params: [['nums', 'int[]']],
  returns: 'List<List<Integer>>',
  anyOrder: true,
  understanding: [
    q(
      'How many subsets does a list of 4 distinct numbers have?',
      yes('16', 'Each number is either in or out: 2 × 2 × 2 × 2.'),
      no('8', 'That is for 3 numbers. Each extra number doubles the count.'),
      no('24', 'That is 4!, the number of orderings, not subsets.'),
    ),
    q(
      'Are [1, 2] and [2, 1] different subsets?',
      yes('No, they are the same subset', 'A subset is about which elements, not their order. So you must avoid producing both.'),
      no('Yes', 'Order does not matter in a subset; listing both would be a duplicate.'),
    ),
  ],
  approach: [
    q(
      'How do you generate every subset exactly once?',
      yes('Backtracking: record the current path, then for each later element add it, recurse, and remove it again', 'Only looking at later elements (a start index) is what prevents [2, 1] after [1, 2].', { time: 'O(n · 2ⁿ)', space: 'O(n)' }),
      no('Nested loops, one per element', 'The number of loops would have to change with the input length.', { time: 'O(2ⁿ)', space: 'O(n)' }),
      no('Try every ordering of the elements and cut each at every point', 'That produces each subset many times over.', { time: 'O(n · n!)', space: 'O(n)' }),
    ),
    q(
      'After the recursive call returns, why remove the element you just added?',
      yes('So the path is back to what it was, ready for the next choice', 'Choose, explore, un-choose. The shared path must be clean before trying a different element.'),
      no('To save memory', 'The point is correctness: otherwise later subsets would contain leftovers.'),
      no('It is optional', 'Without it [1, 2] would still be in the path when you try 3, giving [1, 2, 3] where [1, 3] was due.'),
    ),
  ],
  langQ: {
    python: q(
      'Why `result.append(path[:])` and not `result.append(path)`?',
      yes('path[:] is a copy; without it every entry would be the same list object, which ends up empty', 'The path keeps being modified, so you must snapshot it.'),
      no('path[:] is faster', 'It is slower (it copies). It is needed for correctness.'),
      no('They are equivalent', 'Appending path itself stores a reference to the one list you keep changing.'),
    ),
    java: q(
      'Why `result.add(new ArrayList<>(path))` and not `result.add(path)`?',
      yes('It stores a copy; otherwise every entry refers to the one list you keep changing', 'At the end they would all look identical (and empty).'),
      no('Java requires new for every add', 'It does not; this is about taking a snapshot.'),
      no('They are equivalent', 'add(path) stores a reference, not the contents.'),
    ),
  },
  plan: [
    'Create the result list and an empty path.',
    'Define a function that takes the index to start choosing from.',
    'Record a copy of the current path as one subset.',
    'For each index from start onward: add that element to the path.',
    'Recurse with the next index, then remove the element again.',
    'Call the function from index 0 and return the result.',
  ],
  hints: ['For each element there are two options. How could a recursive function walk through all combinations of options?', 'Choose → explore → un-choose, with a start index so you only ever add elements that come later.'],
  solution: {
    python: `def subsets(nums):
    result = []
    path = []

    def backtrack(start):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()

    backtrack(0)
    return result
`,
    java: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
        result.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
}
`,
  },
  tests: [
    [[[1, 2, 3]], [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]],
    [[[0]], [[], [0]]],
    [[[5, 9]], [[], [5], [5, 9], [9]]],
  ],
  reflect: ['Describe choose / explore / un-choose in your own words. What does the start index prevent?', 'O(n · 2ⁿ)', 'O(n)'],
});

export const permutations = make({
  slug: 'permutations',
  title: 'Permutations',
  pattern: 'backtracking',
  difficulty: 'Medium',
  leetcode: 46,
  statement: 'Given {{a list|an array}} of distinct integers, return every possible ordering of them. The order of the orderings does not matter.',
  constraints: ['1 ≤ nums.length ≤ 6', 'All values are distinct'],
  examples: [
    ['nums = [1, 2, 3]', '[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]', '3! = 6 orderings.'],
    ['nums = [0, 1]', '[[0, 1], [1, 0]]', 'Two orderings.'],
  ],
  fn: ['permute', 'permute'],
  params: [['nums', 'int[]']],
  returns: 'List<List<Integer>>',
  anyOrder: true,
  understanding: [
    q(
      'How many orderings do 4 distinct numbers have?',
      yes('24', '4 choices for the first slot, 3 for the second, 2, then 1.'),
      no('16', 'That is the number of subsets (2⁴).'),
      no('12', 'Multiply all the way down: 4 × 3 × 2 × 1.'),
    ),
    q(
      'How does this differ from Subsets?',
      yes('Every result uses all the elements, and order matters', '[1, 2] and [2, 1] are now different, so you can no longer restrict yourself to "later elements only".'),
      no('It is the same problem', 'Subsets ignore order and vary in size.'),
      no('Results may repeat an element', 'Each element is used exactly once per ordering.'),
    ),
  ],
  approach: [
    q(
      'How do you build every ordering?',
      yes('Backtracking: for each slot try every element not already used, recurse, then un-use it', 'A "used" marker replaces the start index from Subsets.', { time: 'O(n · n!)', space: 'O(n)' }),
      no('Backtracking with a start index, as in Subsets', 'A start index only ever looks forward, so [2, 1, 3] could never be produced.', { time: 'O(2ⁿ)', space: 'O(n)' }),
      no('Shuffle randomly until all orderings have appeared', 'No guarantee of ever finishing.', { time: 'unbounded', space: 'O(n!)' }),
    ),
    q(
      'When is the path recorded as a result?',
      yes('When its length equals the length of nums', 'Only a full ordering counts, unlike Subsets where every partial path counted.'),
      no('At every call', 'That would also record incomplete orderings such as [1] and [1, 2].'),
      no('When the loop finishes', 'By then elements have been removed again.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you create the list of "used" flags?',
      yes('used = [False] * len(nums)', 'One flag per element, all starting False.'),
      no('used = []', 'used[i] would raise IndexError.'),
      no('used = False', 'One boolean cannot track each element separately.'),
    ),
    java: q(
      'What does `new boolean[nums.length]` contain initially?',
      yes('All false', 'boolean arrays are initialised to false, which is what "nothing used yet" needs.'),
      no('All true', 'The default is false.'),
      no('nulls', 'boolean is a primitive and cannot be null.'),
    ),
  },
  plan: [
    'Create the result, an empty path, and a used flag per element.',
    'Define the recursive function.',
    'If the path is as long as nums, record a copy and return.',
    'For each element that is not used: mark it used and add it to the path.',
    'Recurse, then remove it from the path and mark it unused.',
    'Start the recursion and return the result.',
  ],
  hints: ['For the first slot any element will do. What about the second slot?', 'Backtracking over slots with a used[] array: choose an unused element, recurse, undo both the path and the flag.'],
  solution: {
    python: `def permute(nums):
    result = []
    path = []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return result
`,
    java: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) {
                continue;
            }
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, result);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}
`,
  },
  tests: [
    [[[1, 2, 3]], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]],
    [[[0, 1]], [[0, 1], [1, 0]]],
    [[[1]], [[1]]],
  ],
  reflect: ['What two things must be undone after each recursive call, and why both?', 'O(n · n!)', 'O(n)'],
});

export const floodFill = make({
  slug: 'flood-fill',
  title: 'Flood Fill',
  pattern: 'graphs',
  difficulty: 'Easy',
  leetcode: 733,
  statement:
    'image is a grid of colour numbers. Starting from the pixel at (sr, sc), repaint it and every pixel connected to it (up, down, left, right) that has the same original colour with the new colour. Return the image.',
  constraints: ['1 ≤ rows, columns ≤ 50', 'Diagonal neighbours are not connected'],
  examples: [
    ['image = [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr = 1, sc = 1, color = 2', '[[2, 2, 2], [2, 2, 0], [2, 0, 1]]', 'The bottom-right 1 is only diagonal to the region, so it stays.'],
    ['image = [[0, 0, 0], [0, 0, 0]], sr = 0, sc = 0, color = 0', '[[0, 0, 0], [0, 0, 0]]', 'New colour equals the old one: nothing changes.'],
  ],
  fn: ['flood_fill', 'floodFill'],
  params: [
    ['image', 'int[][]'],
    ['sr', 'int'],
    ['sc', 'int'],
    ['color', 'int'],
  ],
  returns: 'int[][]',
  understanding: [
    q(
      'In the first example, why does the pixel at the bottom-right stay 1?',
      yes('It touches the region only diagonally', 'Only up, down, left and right count as connected.'),
      no('Because it is on the edge', 'Edge pixels are repainted like any other if they are connected.'),
      no('It should have been repainted', 'Diagonals do not connect.'),
    ),
    q(
      'The start pixel already has the new colour. What can go wrong if you do not handle that?',
      yes('The fill never stops: repainted pixels still look like "original colour", so they are visited forever', 'Normally repainting is what marks a pixel as done. Here it marks nothing.'),
      no('Nothing; it just runs a little longer', 'It recurses until the stack overflows.'),
      no('It paints the wrong colour', 'The colour is right; the problem is that visited pixels are indistinguishable.'),
    ),
  ],
  approach: [
    q(
      'How do you reach every connected pixel?',
      yes('DFS from the start: repaint the pixel, then recurse into its four neighbours', 'Repainting doubles as the "visited" mark, so no pixel is handled twice.', { time: 'O(rows · cols)', space: 'O(rows · cols)' }),
      no('Loop over the whole grid and repaint every pixel of the original colour', 'That also repaints same-coloured pixels that are not connected to the start.', { time: 'O(rows · cols)', space: 'O(1)' }),
      no('Repaint the start pixel\'s row and column', 'Connected regions can have any shape.', { time: 'O(rows + cols)', space: 'O(1)' }),
    ),
    q(
      'When should a recursive call stop immediately?',
      yes('When the position is outside the grid or its colour is not the original colour', 'That covers walls, other regions, and pixels already repainted.'),
      no('Only when it is outside the grid', 'Then the fill would spread through every colour.'),
      no('Only when all four neighbours are done', 'A call cannot know that; it just checks its own cell.'),
    ),
  ],
  langQ: {
    python: q(
      'Which check stops the recursion from leaving the grid?',
      yes('if r < 0 or c < 0 or r >= len(image) or c >= len(image[0]): return', 'All four edges are covered before image[r][c] is read.'),
      no('if image[r][c] is None: return', 'Out-of-range indexes raise IndexError (and −1 silently wraps to the other side).'),
      no('try/except around everything', 'A negative index does not raise in Python; it wraps around, giving wrong fills.'),
    ),
    java: q(
      'How do you get the number of columns of int[][] image?',
      yes('image[0].length', 'A 2-D array is an array of rows; a row\'s length is the column count.'),
      no('image.length', 'That is the number of rows.'),
      no('image.width', 'Arrays have no width field.'),
    ),
  },
  plan: [
    'Remember the original colour of the start pixel.',
    'If it already equals the new colour, return the image unchanged.',
    'Define a fill function for a position (r, c).',
    'Stop if the position is off the grid or its colour is not the original colour.',
    'Repaint the pixel, then call fill on its four neighbours.',
    'Call fill on the start position and return the image.',
  ],
  hints: ['After you repaint one pixel, which pixels might need repainting because of it?', 'DFS over four neighbours; the repaint itself marks a pixel as visited. Guard the case where old and new colours are equal.'],
  solution: {
    python: `def flood_fill(image, sr, sc, color):
    start = image[sr][sc]
    if start == color:
        return image

    def fill(r, c):
        if r < 0 or c < 0 or r >= len(image) or c >= len(image[0]):
            return
        if image[r][c] != start:
            return
        image[r][c] = color
        fill(r + 1, c)
        fill(r - 1, c)
        fill(r, c + 1)
        fill(r, c - 1)

    fill(sr, sc)
    return image
`,
    java: `class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int start = image[sr][sc];
        if (start != color) {
            fill(image, sr, sc, start, color);
        }
        return image;
    }

    private void fill(int[][] image, int r, int c, int start, int color) {
        if (r < 0 || c < 0 || r >= image.length || c >= image[0].length) {
            return;
        }
        if (image[r][c] != start) {
            return;
        }
        image[r][c] = color;
        fill(image, r + 1, c, start, color);
        fill(image, r - 1, c, start, color);
        fill(image, r, c + 1, start, color);
        fill(image, r, c - 1, start, color);
    }
}
`,
  },
  tests: [
    [[[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], [[2, 2, 2], [2, 2, 0], [2, 0, 1]]],
    [[[[0, 0, 0], [0, 0, 0]], 0, 0, 0], [[0, 0, 0], [0, 0, 0]]],
    [[[[1]], 0, 0, 5], [[5]]],
    [[[[1, 2], [2, 1]], 0, 0, 3], [[3, 2], [2, 1]]],
  ],
  reflect: ['What plays the role of the "visited" set here, and what breaks when old and new colours are equal?', 'O(rows · cols)', 'O(rows · cols)'],
});

export const numIslands = make({
  slug: 'number-of-islands',
  title: 'Number of Islands',
  pattern: 'graphs',
  difficulty: 'Medium',
  leetcode: 200,
  statement: 'grid is a map of "1" (land) and "0" (water). An island is a group of land cells connected up, down, left or right. Return the number of islands.',
  constraints: ['1 ≤ rows, columns ≤ 300', 'Cells are the characters "1" and "0"', 'Diagonals do not connect'],
  examples: [
    ['grid = [["1","1","0","0"], ["1","0","0","1"], ["0","0","1","1"]]', '2', 'One island top-left, one bottom-right.'],
    ['grid = [["1","0"], ["0","1"]]', '2', 'The two land cells touch only diagonally.'],
  ],
  fn: ['num_islands', 'numIslands'],
  params: [['grid', 'char[][]']],
  returns: 'int',
  understanding: [
    q(
      'grid = [["1","0","1","0","1"]]. How many islands?',
      yes('3', 'Each land cell is separated by water.'),
      no('1', 'Water between them keeps them apart.'),
      no('5', 'Only land cells can form islands.'),
    ),
    q(
      'You are scanning the grid and step on a land cell. When does it mean "a new island"?',
      yes('Only if it has not already been reached as part of an earlier island', 'So you need a way to mark every cell of an island the moment you discover it.'),
      no('Every time', 'A 5-cell island would be counted 5 times.'),
      no('Only if it is on the edge of the grid', 'Islands can be anywhere.'),
    ),
  ],
  approach: [
    q(
      'How do you count each island exactly once?',
      yes('Scan every cell; on unvisited land, add 1 and flood the whole island (DFS) so its cells are marked', 'It is Flood Fill, launched once per island.', { time: 'O(rows · cols)', space: 'O(rows · cols)' }),
      no('Count the land cells', 'That is the total area, not the number of islands.', { time: 'O(rows · cols)', space: 'O(1)' }),
      no('Count land cells with no land neighbour above or to the left', 'An island shaped like a U or a staircase has several such cells.', { time: 'O(rows · cols)', space: 'O(1)' }),
    ),
    q(
      'What is a cheap way to mark a land cell as visited?',
      yes('Overwrite it with "0" (sink it)', 'No extra structure needed, as long as modifying the input is acceptable.'),
      no('Remove it from the grid', 'Cells cannot be removed from a 2-D array without breaking the coordinates.'),
      no('Nothing; DFS never revisits cells', 'Without a mark, neighbours call each other back and forth forever.'),
    ),
  ],
  langQ: {
    python: q(
      'The cells are strings. Which comparison finds land?',
      yes("grid[r][c] == '1'", 'Compare with the string "1".'),
      no('grid[r][c] == 1', 'The string "1" is not equal to the integer 1, so this is always False.'),
      no('grid[r][c]', '"0" is a non-empty string and therefore truthy, so water would count as land.'),
    ),
    java: q(
      'The cells are chars. Which comparison finds land?',
      yes("grid[r][c] == '1'", 'Single quotes make a char literal.'),
      no('grid[r][c] == 1', 'The char \'1\' has the numeric code 49, not 1.'),
      no('grid[r][c] == "1"', 'Double quotes make a String, which cannot be compared with a char.'),
    ),
  },
  plan: [
    'Set the island count to 0.',
    'Define a sink function: stop if the cell is off the grid or not land; otherwise turn it to water and sink its four neighbours.',
    'Scan every cell of the grid.',
    'When a cell is land, add 1 to the count.',
    'Sink that whole island so none of its cells is counted again.',
    'Return the count.',
  ],
  hints: ['How do you avoid counting the same island again when you later walk onto another of its cells?', 'Outer scan + DFS flood. Each flood erases one island; the number of floods is the answer.'],
  solution: {
    python: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    count = 0

    def sink(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                sink(r, c)
    return count
`,
    java: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    sink(grid, r, c);
                }
            }
        }
        return count;
    }

    private void sink(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') {
            return;
        }
        grid[r][c] = '0';
        sink(grid, r + 1, c);
        sink(grid, r - 1, c);
        sink(grid, r, c + 1);
        sink(grid, r, c - 1);
    }
}
`,
  },
  tests: [
    [[[['1', '1', '0', '0'], ['1', '0', '0', '1'], ['0', '0', '1', '1']]], 2],
    [[[['1', '1', '1'], ['0', '1', '0'], ['1', '1', '1']]], 1],
    [[[['0']]], 0],
    [[[['1', '0', '1', '0', '1']]], 3],
    [[[['1', '0'], ['0', '1']]], 2],
  ],
  reflect: ['Why is the answer "the number of times DFS is started"? What stops a cell being counted twice?', 'O(rows · cols)', 'O(rows · cols)'],
});

export const courseSchedule = make({
  slug: 'course-schedule',
  title: 'Course Schedule',
  pattern: 'topological-sort',
  difficulty: 'Medium',
  leetcode: 207,
  statement:
    'There are numCourses courses numbered from 0. prerequisites[i] = [a, b] means you must finish course b before course a. Return {{True|true}} if it is possible to finish every course.',
  constraints: ['1 ≤ numCourses ≤ 2,000', '0 ≤ prerequisites.length ≤ 5,000', 'Pairs are distinct'],
  examples: [
    ['numCourses = 2, prerequisites = [[1, 0]]', '{{True|true}}', 'Take 0, then 1.'],
    ['numCourses = 2, prerequisites = [[1, 0], [0, 1]]', '{{False|false}}', 'Each needs the other first.'],
  ],
  fn: ['can_finish', 'canFinish'],
  params: [
    ['numCourses', 'int'],
    ['prerequisites', 'int[][]'],
  ],
  returns: 'boolean',
  understanding: [
    q(
      'In the pair [3, 1], which course comes first?',
      yes('Course 1', '[a, b] means b before a.'),
      no('Course 3', 'The second number is the prerequisite.'),
      no('Either', 'The pair has a direction.'),
    ),
    q(
      'What exactly makes finishing impossible?',
      yes('A cycle: a chain of prerequisites that leads back to where it started', 'Every course on the loop waits for another course on the loop.'),
      no('A course with more than one prerequisite', 'That is fine; take them all first.'),
      no('A course with no prerequisites', 'Those are the ones you can start with.'),
    ),
  ],
  approach: [
    q(
      'How do you decide whether everything can be finished?',
      yes('Count each course\'s unmet prerequisites; repeatedly take a course with zero and reduce the count of the courses that depended on it', 'If you manage to take all of them there was no cycle. Courses on a cycle never reach zero.', { time: 'O(V + E)', space: 'O(V + E)' }),
      no('Try every possible order of the courses', 'There are n! orders.', { time: 'O(n!)', space: 'O(n)' }),
      no('Check that no pair appears reversed, like [1, 0] and [0, 1]', 'That only catches cycles of length two; 0 → 1 → 2 → 0 slips through.', { time: 'O(E)', space: 'O(E)' }),
    ),
    q(
      'Which courses go into the queue at the very start?',
      yes('Those with zero prerequisites', 'They are the only ones you can take right now.'),
      no('Course 0 only', 'Course 0 might have prerequisites, and others might not.'),
      no('All of them', 'A course is only ready when its count is zero.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you create an empty list of neighbours for each course?',
      yes('graph = [[] for _ in range(numCourses)]', 'The comprehension builds a separate list per course.'),
      no('graph = [[]] * numCourses', 'That repeats ONE list: appending to graph[0] changes every entry.'),
      no('graph = [] * numCourses', 'That is just an empty list.'),
    ),
    java: q(
      'How do you build the adjacency list?',
      yes('List<List<Integer>> graph = new ArrayList<>(); then add a new ArrayList<>() for each course', 'Each course needs its own inner list before you can add to it.'),
      no('List<List<Integer>> graph = new ArrayList<>(numCourses); and use graph.get(i) right away', 'The argument is only a capacity hint; the list is still empty, so get(i) throws.'),
      no('int[][] graph = new int[numCourses][];', 'The inner arrays would be null and cannot grow.'),
    ),
  },
  plan: [
    'Build, for every course, the list of courses that depend on it, and count each course\'s prerequisites.',
    'Put every course with a count of zero into a queue.',
    'Take a course from the queue and count it as done.',
    'For each course that depended on it, reduce its count; if the count reaches zero, add it to the queue.',
    'Repeat until the queue is empty.',
    'Return whether the number done equals numCourses.',
  ],
  hints: ['Which courses can you take right now? After taking them, which new ones become available?', 'Track how many prerequisites each course still needs (its in-degree). Process zero-count courses from a queue; a cycle leaves courses unprocessed.'],
  solution: {
    python: `from collections import deque

def can_finish(numCourses, prerequisites):
    graph = [[] for course in range(numCourses)]
    indegree = [0] * numCourses
    for course, before in prerequisites:
        graph[before].append(course)
        indegree[course] += 1
    queue = deque([c for c in range(numCourses) if indegree[c] == 0])
    done = 0
    while queue:
        course = queue.popleft()
        done += 1
        for nxt in graph[course]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return done == numCourses
`,
    java: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }
        int[] indegree = new int[numCourses];
        for (int[] pair : prerequisites) {
            graph.get(pair[1]).add(pair[0]);
            indegree[pair[0]]++;
        }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int c = 0; c < numCourses; c++) {
            if (indegree[c] == 0) {
                queue.add(c);
            }
        }
        int done = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            done++;
            for (int nxt : graph.get(course)) {
                indegree[nxt]--;
                if (indegree[nxt] == 0) {
                    queue.add(nxt);
                }
            }
        }
        return done == numCourses;
    }
}
`,
  },
  tests: [
    [[4, [[1, 0], [2, 0], [3, 1], [3, 2]]], true],
    [[2, [[1, 0]]], true],
    [[2, [[1, 0], [0, 1]]], false],
    [[3, []], true],
    [[3, [[0, 1], [1, 2], [2, 0]]], false],
  ],
  reflect: ['Why do courses on a cycle never enter the queue? What does comparing done with numCourses detect?', 'O(V + E)', 'O(V + E)'],
});

export const validPath = make({
  slug: 'find-if-path-exists-in-graph',
  title: 'Find if Path Exists in Graph',
  pattern: 'union-find',
  difficulty: 'Easy',
  leetcode: 1971,
  statement:
    'There are n nodes numbered 0 to n − 1 and a list of undirected edges [a, b]. Return {{True|true}} if there is some path from source to destination.',
  constraints: ['1 ≤ n ≤ 200,000', '0 ≤ edges.length ≤ 200,000', 'Edges work in both directions'],
  examples: [
    ['n = 5, edges = [[0, 1], [1, 2], [3, 4]], source = 0, destination = 2', '{{True|true}}', '0 — 1 — 2.'],
    ['n = 4, edges = [[0, 1], [2, 3]], source = 1, destination = 2', '{{False|false}}', 'Two separate groups.'],
  ],
  fn: ['valid_path', 'validPath'],
  params: [
    ['n', 'int'],
    ['edges', 'int[][]'],
    ['source', 'int'],
    ['destination', 'int'],
  ],
  returns: 'boolean',
  understanding: [
    q(
      'n = 1, no edges, source = 0, destination = 0. What is the answer?',
      yes('{{True|true}}', 'You are already there.'),
      no('{{False|false}}', 'No edge is needed to reach the node you start on.'),
    ),
    q(
      'The question never asks for the path itself. What is it really asking?',
      yes('Whether source and destination are in the same connected group', 'That reframing is what makes Union Find fit: it tracks groups, not routes.'),
      no('For the shortest path', 'Only existence is asked.'),
      no('For the number of edges', 'Not asked.'),
    ),
  ],
  approach: [
    q(
      'How do you decide whether two nodes are in the same group?',
      yes('Union Find: every node starts as its own group leader; each edge merges two groups; then compare the leaders of source and destination', 'Near-constant work per edge.', { time: 'O(E · α(n))', space: 'O(n)' }),
      ok('DFS or BFS from the source over an adjacency list', 'Also correct and also linear. Union Find is the tool to practise here because it handles edges arriving one at a time.', { time: 'O(V + E)', space: 'O(V + E)' }),
      no('Check whether an edge [source, destination] exists', 'A path may pass through other nodes.', { time: 'O(E)', space: 'O(1)' }),
    ),
    q(
      'find(x) follows parent links until it reaches a node that is its own parent. What is that node?',
      yes('The leader (root) that represents x\'s whole group', 'Two nodes are connected exactly when find gives the same leader for both.'),
      no('The node x was most recently joined with', 'The direct parent may itself have a parent; you must go all the way up.'),
      no('Always node 0', 'Each group has its own leader.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you make every node its own parent to begin with?',
      yes('parent = list(range(n))', 'parent[i] == i for every i.'),
      no('parent = [0] * n', 'That would put everything in node 0\'s group from the start.'),
      no('parent = range(n)', 'A range cannot be assigned into; parent[x] = … would fail.'),
    ),
    java: q(
      'A new int[n] is all zeros. What must you do before using it as the parent array?',
      yes('Set parent[i] = i in a loop', 'Otherwise every node would appear to belong to node 0\'s group.'),
      no('Nothing; zeros are correct', 'Zeros mean "my leader is node 0" for everyone.'),
      no('Fill it with -1 and leave it', 'A −1 convention is possible but then find must treat −1 specially; i = i is the simple form.'),
    ),
  },
  plan: [
    'Make every node its own parent.',
    'Define find(x): follow parents until reaching a node that is its own parent, shortening the path on the way.',
    'For each edge [a, b], set the leader of a to point at the leader of b.',
    'Return whether find(source) equals find(destination).',
  ],
  hints: ['Do you need the route, or only to know whether two nodes ended up in the same group?', 'Union Find: parent array, find with path shortening, union per edge, compare leaders.'],
  solution: {
    python: `def valid_path(n, edges, source, destination):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        parent[find(a)] = find(b)
    return find(source) == find(destination)
`,
    java: `class Solution {
    public boolean validPath(int n, int[][] edges, int source, int destination) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
        for (int[] edge : edges) {
            parent[find(parent, edge[0])] = find(parent, edge[1]);
        }
        return find(parent, source) == find(parent, destination);
    }

    private int find(int[] parent, int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}
`,
  },
  tests: [
    [[5, [[0, 1], [1, 2], [3, 4]], 0, 2], true],
    [[3, [[0, 1], [1, 2], [2, 0]], 0, 2], true],
    [[6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], false],
    [[1, [], 0, 0], true],
    [[4, [[0, 1], [2, 3]], 1, 2], false],
  ],
  reflect: ['What does the parent array represent, and why do equal leaders mean "connected"?', 'O(n)', 'O(n)'],
});

export const numProvinces = make({
  slug: 'number-of-provinces',
  title: 'Number of Provinces',
  pattern: 'union-find',
  difficulty: 'Medium',
  leetcode: 547,
  statement:
    'There are n cities. isConnected[a][b] = 1 means cities a and b are directly connected. A province is a group of cities connected directly or through other cities. Return the number of provinces.',
  constraints: ['1 ≤ n ≤ 200', 'isConnected is n × n and symmetric', 'isConnected[i][i] = 1'],
  examples: [
    ['isConnected = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]', '2', 'Cities 0 and 1 form one province; city 2 is alone.'],
    ['isConnected = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]', '3', 'No connections: every city is its own province.'],
  ],
  fn: ['find_circle_num', 'findCircleNum'],
  params: [['isConnected', 'int[][]']],
  returns: 'int',
  understanding: [
    q(
      'City 0 is connected to 1, and 1 is connected to 2, but 0 is not directly connected to 2. How many provinces?',
      yes('1', 'Connection through other cities counts.'),
      no('2', '0 and 2 are linked through city 1.'),
      no('3', 'They are all reachable from each other.'),
    ),
    q(
      'You start with n provinces (every city alone). When does that number go down?',
      yes('Each time a connection joins two cities that were in different provinces', 'A connection inside one province changes nothing.'),
      no('For every 1 in the matrix', 'Many 1s link cities that are already in the same province (and the diagonal links a city to itself).'),
      no('Never', 'Merging two provinces leaves one fewer.'),
    ),
  ],
  approach: [
    q(
      'How do you count the groups?',
      yes('Union Find: start the count at n; for each connected pair with different leaders, merge them and subtract one', 'The count tracks the number of groups as they merge.', { time: 'O(n² · α(n))', space: 'O(n)' }),
      no('Count the 1s in the matrix', 'That counts connections, not groups.', { time: 'O(n²)', space: 'O(1)' }),
      no('Count the rows that contain a single 1', 'That counts only isolated cities and misses every larger province.', { time: 'O(n²)', space: 'O(1)' }),
    ),
    q(
      'The matrix is symmetric. Which pairs do you need to look at?',
      yes('Only pairs with b > a (the upper triangle)', 'isConnected[a][b] and isConnected[b][a] say the same thing, and the diagonal is always 1.'),
      no('Every cell', 'It works but does twice the work and revisits each pair.'),
      no('Only the diagonal', 'The diagonal only says each city is connected to itself.'),
    ),
  ],
  langQ: {
    python: q(
      'How do you loop over each pair of cities only once?',
      yes('for a in range(n): for b in range(a + 1, n):', 'Starting b after a skips the diagonal and the mirrored half.'),
      no('for a in range(n): for b in range(n):', 'That visits each pair twice plus the diagonal.'),
      no('for a, b in isConnected:', 'Rows have n values, not two; this fails to unpack.'),
    ),
    java: q(
      'How do you loop over each pair of cities only once?',
      yes('for (int a = 0; a < n; a++) for (int b = a + 1; b < n; b++)', 'Starting b after a skips the diagonal and the mirrored half.'),
      no('for (int a = 0; a < n; a++) for (int b = 0; b < n; b++)', 'That visits each pair twice plus the diagonal.'),
      no('for (int[] pair : isConnected)', 'That iterates rows of the matrix, not pairs.'),
    ),
  },
  plan: [
    'Make every city its own parent and set the province count to n.',
    'Define find(x) to return the leader of x\'s group.',
    'Look at every pair of cities a < b.',
    'If they are connected, find both leaders.',
    'If the leaders differ, point one at the other and subtract 1 from the count.',
    'Return the count.',
  ],
  hints: ['If every city starts as its own province, what event reduces the number of provinces by one?', 'Union Find with a counter: a successful union (two different leaders) means one group fewer.'],
  solution: {
    python: `def find_circle_num(isConnected):
    n = len(isConnected)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    provinces = n
    for a in range(n):
        for b in range(a + 1, n):
            if isConnected[a][b] == 1:
                root_a = find(a)
                root_b = find(b)
                if root_a != root_b:
                    parent[root_a] = root_b
                    provinces -= 1
    return provinces
`,
    java: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
        int provinces = n;
        for (int a = 0; a < n; a++) {
            for (int b = a + 1; b < n; b++) {
                if (isConnected[a][b] == 1) {
                    int rootA = find(parent, a);
                    int rootB = find(parent, b);
                    if (rootA != rootB) {
                        parent[rootA] = rootB;
                        provinces--;
                    }
                }
            }
        }
        return provinces;
    }

    private int find(int[] parent, int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}
`,
  },
  tests: [
    [[[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], 2],
    [[[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], 3],
    [[[[1]]], 1],
    [[[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], 1],
    [[[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1]]], 1],
  ],
  reflect: ['Why does the count only drop when the two leaders differ?', 'O(n²)', 'O(n)'],
});
