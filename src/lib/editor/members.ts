import type { Language, ValueType } from '@/types/content';

/**
 * What you can write after `x.` for the types that come up in these problems.
 * [name, arguments ('' for a field), what it does]
 */
export type Member = [name: string, args: string, doc: string];

const PY: Record<string, Member[]> = {
  list: [
    ['append', '(x)', 'add x to the end'],
    ['pop', '()', 'remove and return the last item (pop(i) removes position i)'],
    ['insert', '(i, x)', 'put x at position i, shifting the rest right'],
    ['remove', '(x)', 'delete the first item equal to x'],
    ['index', '(x)', 'position of the first item equal to x'],
    ['count', '(x)', 'how many items equal x'],
    ['sort', '()', 'sort in place (sort(reverse=True) for descending)'],
    ['reverse', '()', 'reverse in place'],
    ['extend', '(items)', 'add every item of another list to the end'],
    ['copy', '()', 'a shallow copy of the list'],
    ['clear', '()', 'remove everything'],
  ],
  dict: [
    ['get', '(key, default)', 'value for key, or default if the key is missing'],
    ['keys', '()', 'all the keys'],
    ['values', '()', 'all the values'],
    ['items', '()', '(key, value) pairs, for looping: for k, v in d.items()'],
    ['pop', '(key)', 'remove key and return its value'],
    ['setdefault', '(key, default)', 'value for key, inserting default first if missing'],
    ['update', '(other)', 'copy every key/value from another dict'],
    ['clear', '()', 'remove everything'],
  ],
  set: [
    ['add', '(x)', 'put x in the set (no effect if already there)'],
    ['remove', '(x)', 'take x out (error if it is not there)'],
    ['discard', '(x)', 'take x out if it is there, no error otherwise'],
    ['pop', '()', 'remove and return some item'],
    ['union', '(other)', 'everything in either set'],
    ['intersection', '(other)', 'only what is in both sets'],
    ['difference', '(other)', 'what is in this set but not the other'],
    ['issubset', '(other)', 'is every item also in other?'],
    ['clear', '()', 'remove everything'],
  ],
  str: [
    ['isalnum', '()', 'is it only letters and digits?'],
    ['isalpha', '()', 'is it only letters?'],
    ['isdigit', '()', 'is it only digits?'],
    ['lower', '()', 'a lowercase copy'],
    ['upper', '()', 'an uppercase copy'],
    ['split', '(sep)', 'break into a list of pieces (by whitespace if no sep)'],
    ['join', '(items)', 'glue a list of strings together, with this string between them'],
    ['strip', '()', 'a copy without spaces at both ends'],
    ['startswith', '(prefix)', 'does it begin with prefix?'],
    ['endswith', '(suffix)', 'does it end with suffix?'],
    ['find', '(sub)', 'position of sub, or -1'],
    ['replace', '(old, new)', 'a copy with every old replaced by new'],
    ['count', '(sub)', 'how many times sub appears'],
  ],
  deque: [
    ['append', '(x)', 'add x to the back'],
    ['appendleft', '(x)', 'add x to the front'],
    ['pop', '()', 'remove and return the back item'],
    ['popleft', '()', 'remove and return the front item (queue)'],
    ['extend', '(items)', 'add several items to the back'],
    ['clear', '()', 'remove everything'],
  ],
  heapq: [
    ['heappush', '(heap, x)', 'add x to the heap'],
    ['heappop', '(heap)', 'remove and return the smallest item'],
    ['heapify', '(list)', 'rearrange a list into a heap, in place'],
    ['heappushpop', '(heap, x)', 'push x, then pop the smallest'],
    ['nlargest', '(k, items)', 'the k largest items'],
    ['nsmallest', '(k, items)', 'the k smallest items'],
  ],
  math: [
    ['inf', '', 'infinity (use -math.inf for minus infinity)'],
    ['sqrt', '(x)', 'square root'],
    ['floor', '(x)', 'round down'],
    ['ceil', '(x)', 'round up'],
    ['gcd', '(a, b)', 'greatest common divisor'],
  ],
  ListNode: [
    ['val', '', 'the value stored in this node'],
    ['next', '', 'the next node, or None at the end'],
  ],
  TreeNode: [
    ['val', '', 'the value stored in this node'],
    ['left', '', 'the left child, or None'],
    ['right', '', 'the right child, or None'],
  ],
};

const JAVA: Record<string, Member[]> = {
  array: [['length', '', 'number of slots (a field: no parentheses)']],
  String: [
    ['length', '()', 'number of characters'],
    ['charAt', '(int i)', 'the char at position i'],
    ['substring', '(int start, int end)', 'characters from start up to (not including) end'],
    ['indexOf', '(String s)', 'position of s, or -1'],
    ['equals', '(Object other)', 'same characters? (never use == on Strings)'],
    ['toCharArray', '()', 'a char[] copy, e.g. to sort it'],
    ['toLowerCase', '()', 'a lowercase copy'],
    ['toUpperCase', '()', 'an uppercase copy'],
    ['isEmpty', '()', 'is the length 0?'],
    ['contains', '(CharSequence s)', 'does it contain s?'],
    ['split', '(String regex)', 'break into a String[] of pieces'],
    ['trim', '()', 'a copy without spaces at both ends'],
    ['startsWith', '(String prefix)', 'does it begin with prefix?'],
  ],
  Map: [
    ['put', '(K key, V value)', 'store value under key (replaces any old value)'],
    ['get', '(Object key)', 'value for key, or null if missing'],
    ['getOrDefault', '(Object key, V fallback)', 'value for key, or fallback if missing'],
    ['containsKey', '(Object key)', 'is key in the map?'],
    ['containsValue', '(Object value)', 'is value stored under any key?'],
    ['remove', '(Object key)', 'delete key and its value'],
    ['size', '()', 'number of keys'],
    ['isEmpty', '()', 'no keys at all?'],
    ['keySet', '()', 'all the keys, for looping'],
    ['values', '()', 'all the values, for looping'],
    ['entrySet', '()', 'key/value pairs: for (Map.Entry<K, V> e : map.entrySet())'],
    ['merge', '(K key, V value, BiFunction f)', 'e.g. merge(x, 1, Integer::sum) to count'],
    ['putIfAbsent', '(K key, V value)', 'store only if key is not there yet'],
    ['clear', '()', 'remove everything'],
  ],
  Set: [
    ['add', '(E e)', 'put e in the set; returns false if it was already there'],
    ['contains', '(Object o)', 'is o in the set?'],
    ['remove', '(Object o)', 'take o out'],
    ['size', '()', 'number of items'],
    ['isEmpty', '()', 'no items at all?'],
    ['clear', '()', 'remove everything'],
  ],
  List: [
    ['add', '(E e)', 'add e to the end (add(int i, E e) inserts at i)'],
    ['get', '(int i)', 'the item at position i'],
    ['set', '(int i, E e)', 'replace the item at position i'],
    ['remove', '(int i)', 'remove the item at position i'],
    ['size', '()', 'number of items'],
    ['isEmpty', '()', 'no items at all?'],
    ['contains', '(Object o)', 'is o in the list? (scans, so O(n))'],
    ['indexOf', '(Object o)', 'position of o, or -1'],
    ['clear', '()', 'remove everything'],
  ],
  Deque: [
    ['push', '(E e)', 'stack: put e on top'],
    ['pop', '()', 'stack: remove and return the top'],
    ['peek', '()', 'look at the top / front without removing it'],
    ['add', '(E e)', 'queue: add e to the back'],
    ['offer', '(E e)', 'queue: add e to the back'],
    ['poll', '()', 'queue: remove and return the front (null if empty)'],
    ['addFirst', '(E e)', 'add e to the front'],
    ['addLast', '(E e)', 'add e to the back'],
    ['pollFirst', '()', 'remove and return the front'],
    ['pollLast', '()', 'remove and return the back'],
    ['peekFirst', '()', 'look at the front'],
    ['peekLast', '()', 'look at the back'],
    ['size', '()', 'number of items'],
    ['isEmpty', '()', 'no items at all?'],
  ],
  PriorityQueue: [
    ['add', '(E e)', 'put e in the heap'],
    ['offer', '(E e)', 'put e in the heap'],
    ['poll', '()', 'remove and return the smallest (or largest, with reverseOrder)'],
    ['peek', '()', 'look at the smallest without removing it'],
    ['size', '()', 'number of items'],
    ['isEmpty', '()', 'no items at all?'],
  ],
  StringBuilder: [
    ['append', '(x)', 'add x to the end'],
    ['insert', '(int i, x)', 'put x at position i'],
    ['deleteCharAt', '(int i)', 'remove the char at position i'],
    ['reverse', '()', 'reverse in place'],
    ['length', '()', 'number of characters'],
    ['charAt', '(int i)', 'the char at position i'],
    ['setCharAt', '(int i, char c)', 'replace the char at position i'],
    ['toString', '()', 'the finished String'],
  ],
  Math: [
    ['max', '(a, b)', 'the larger of a and b'],
    ['min', '(a, b)', 'the smaller of a and b'],
    ['abs', '(x)', 'distance from zero'],
    ['pow', '(double a, double b)', 'a to the power b (returns double)'],
    ['sqrt', '(double x)', 'square root (returns double)'],
    ['floorMod', '(int a, int b)', 'remainder that is never negative'],
  ],
  Arrays: [
    ['sort', '(array)', 'sort in place; sort(arr, (a, b) -> a[0] - b[0]) with a rule'],
    ['fill', '(array, value)', 'set every slot to value'],
    ['asList', '(a, b, ...)', 'a fixed-size List of the items'],
    ['toString', '(array)', 'readable text like [1, 2, 3], for printing'],
    ['copyOfRange', '(array, int from, int to)', 'a copy of part of an array'],
    ['equals', '(a, b)', 'same contents?'],
  ],
  Collections: [
    ['sort', '(List list)', 'sort a list in place'],
    ['reverse', '(List list)', 'reverse a list in place'],
    ['reverseOrder', '()', 'a comparator for descending order (max-heaps)'],
    ['max', '(Collection c)', 'largest item'],
    ['min', '(Collection c)', 'smallest item'],
    ['swap', '(List list, int i, int j)', 'swap two positions'],
  ],
  Character: [
    ['isLetterOrDigit', '(char c)', 'letter or digit?'],
    ['isLetter', '(char c)', 'letter?'],
    ['isDigit', '(char c)', 'digit?'],
    ['toLowerCase', '(char c)', 'lowercase version'],
    ['toUpperCase', '(char c)', 'uppercase version'],
    ['getNumericValue', '(char c)', "the digit's value: '7' gives 7"],
  ],
  Integer: [
    ['parseInt', '(String s)', 'turn "42" into 42'],
    ['MAX_VALUE', '', 'the largest int, 2147483647'],
    ['MIN_VALUE', '', 'the smallest int, -2147483648'],
    ['valueOf', '(int i)', 'an Integer object'],
    ['toString', '(int i)', 'turn 42 into "42"'],
  ],
  ListNode: [
    ['val', '', 'the value stored in this node'],
    ['next', '', 'the next node, or null at the end'],
  ],
  TreeNode: [
    ['val', '', 'the value stored in this node'],
    ['left', '', 'the left child, or null'],
    ['right', '', 'the right child, or null'],
  ],
};

const JAVA_ALIAS: Record<string, string> = {
  HashMap: 'Map',
  TreeMap: 'Map',
  LinkedHashMap: 'Map',
  HashSet: 'Set',
  TreeSet: 'Set',
  LinkedHashSet: 'Set',
  ArrayList: 'List',
  LinkedList: 'Deque',
  ArrayDeque: 'Deque',
  Queue: 'Deque',
  Stack: 'Deque',
};

/** How the problem's parameter types read in Python. */
function pythonParam(type: ValueType): string {
  if (type === 'String') return 'str';
  if (type === 'ListNode' || type === 'TreeNode') return type;
  if (type.endsWith('[]') || type.startsWith('List')) return 'list';
  return '';
}

/** The type of a variable, worked out from the code (and the problem's parameters). */
function typeOf(name: string, code: string, lang: Language, params: { name: string; type: ValueType }[]): string {
  const esc = name.replace(/[$]/g, '\\$');
  if (lang === 'java') {
    if (JAVA[name]) return name; // Math., Arrays., Character. …
    const decl = new RegExp(`([A-Za-z][\\w.]*)\\s*(<[^;=()]*>)?\\s*((?:\\[\\])*)\\s+${esc}\\s*[=;,):]`).exec(code);
    if (decl) {
      if (decl[3]) return 'array';
      return JAVA_ALIAS[decl[1]] ?? decl[1];
    }
    const param = params.find((p) => p.name === name);
    if (param) return param.type.endsWith('[]') ? 'array' : param.type === 'String' ? 'String' : param.type;
    return '';
  }
  if (PY[name] && (name === 'heapq' || name === 'math')) return name;
  // Last assignment before the cursor wins; scan them all and keep the last recognisable one.
  let found = '';
  for (const m of code.matchAll(new RegExp(`(?:^|\\n)\\s*${esc}\\s*=\\s*([^\\n]+)`, 'g'))) {
    const v = m[1].trim();
    if (/^\{\s*\}$|^dict\(|^defaultdict\(|^Counter\(|^\{[^}]*:/.test(v)) found = 'dict';
    else if (/^set\(|^\{[^:}]+\}$/.test(v)) found = 'set';
    else if (/^\[|^list\(|^sorted\(/.test(v)) found = 'list';
    else if (/^(collections\.)?deque\(/.test(v)) found = 'deque';
    else if (/^(['"]|str\(|''\.join|"".join)/.test(v)) found = 'str';
    else if (/^(ListNode|TreeNode)\(/.test(v)) found = v.slice(0, v.indexOf('('));
  }
  if (found) return found;
  const param = params.find((p) => p.name === name);
  return param ? pythonParam(param.type) : '';
}

export type Suggestion = { type: string; members: Member[] };

/**
 * What to offer after `expr.`: the members of the expression's type, or, when the type is
 * unknown, the common types grouped so the right method is still easy to find.
 */
export function membersFor(expression: string, code: string, lang: Language, params: { name: string; type: ValueType }[]): Suggestion[] {
  const catalog = lang === 'java' ? JAVA : PY;
  // nums[i]. → an element of nums; node.next. → another node
  const indexed = /\]$/.test(expression);
  const base = expression.replace(/\[[^\]]*\]/g, '').split('.')[0];
  const nodeField = /\.(next|left|right)$/.test(expression);

  let type = indexed ? '' : typeOf(base, code, lang, params);
  if (nodeField) type = /left|right/.test(expression) ? 'TreeNode' : 'ListNode';
  if (lang === 'java' && type === 'array' && indexed) type = '';
  if (type && catalog[type]) return [{ type, members: catalog[type] }];

  const usesNodes = params.some((p) => p.type === 'ListNode' || p.type === 'TreeNode');
  const fallback = lang === 'java' ? ['String', 'Map', 'Set', 'List', 'Deque'] : ['list', 'dict', 'set', 'str'];
  const guesses = usesNodes ? [params.some((p) => p.type === 'TreeNode') ? 'TreeNode' : 'ListNode', ...fallback] : fallback;
  return guesses.map((t) => ({ type: t, members: catalog[t] }));
}
