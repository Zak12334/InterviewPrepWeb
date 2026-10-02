import type { Language } from '@/types/content';
import type { Step, Value } from '@/types/trace';
import { show } from './scene';

/**
 * Tells the story of the learner's code, line by line, in plain words: "you create an empty
 * list called result, then a total set to 0, then you walk through nums…". Sentences use `code`
 * spans (backticks) for names and expressions. Facts from the run are attached to each line.
 */

export type StoryLine = {
  line: number;
  depth: number;
  sentence: string;
  /** How many times this line ran; undefined when there is no run to report on. */
  ran?: number;
  /** Variable whose values are listed, and the values it took right after this line ran. */
  variable?: string;
  values?: string[];
};

type Kind = 'def' | 'loop' | 'if' | 'elif' | 'else' | 'stmt';
type Phrase = { kind: Kind; text: string; targets?: string[] };

const c = (s: string) => '`' + s.trim() + '`';

/** Splits on a separator that is not inside brackets, parentheses or quotes (or <generics>, if asked). */
function splitTop(s: string, sep = ',', generics = false): string[] {
  const opens = generics ? '([{<' : '([{';
  const closes = generics ? ')]}>' : ')]}';
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote && s[i - 1] !== '\\') quote = '';
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (opens.includes(ch)) depth++;
    else if (closes.includes(ch)) depth--;
    else if (depth === 0 && s.startsWith(sep, i)) {
      out.push(s.slice(start, i).trim());
      start = i + sep.length;
      i += sep.length - 1;
    }
  }
  out.push(s.slice(start).trim());
  return out.filter(Boolean);
}

const listing = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

// ---- conditions --------------------------------------------------------------------------

const COMPARE: [string, string][] = [
  ['==', 'equals'],
  ['!=', 'is not equal to'],
  ['<=', 'is at most'],
  ['>=', 'is at least'],
  ['<', 'is less than'],
  ['>', 'is greater than'],
];

let lang: Language = 'python';

function readCondition(raw: string): string {
  let cond = raw.trim();
  while (cond.startsWith('(') && cond.endsWith(')') && splitTop(cond.slice(1, -1), ')(').length === 1 && balanced(cond.slice(1, -1))) {
    cond = cond.slice(1, -1).trim();
  }
  for (const [sep, word] of [[' and ', 'and'], ['&&', 'and'], [' or ', 'or'], ['||', 'or']] as const) {
    const parts = splitTop(cond, sep);
    if (parts.length > 1) return parts.map(readCondition).join(` ${word} `);
  }
  let m: RegExpMatchArray | null;
  if ((m = cond.match(/^not (\w+)$/))) return `${c(m[1])} is empty`;
  if ((m = cond.match(/^!\s*(\w+)\.isEmpty\(\)$/))) return `${c(m[1])} is not empty`;
  if ((m = cond.match(/^(\w+)\.isEmpty\(\)$/))) return `${c(m[1])} is empty`;
  if ((m = cond.match(/^(!?)\s*(\w+)\.containsKey\((.+)\)$/))) return `${c(m[2])} ${m[1] ? 'does not have' : 'has'} the key ${c(m[3])}`;
  if ((m = cond.match(/^(!?)\s*(\w+)\.contains\((.+)\)$/))) return `${c(m[2])} ${m[1] ? 'does not contain' : 'contains'} ${c(m[3])}`;
  if ((m = cond.match(/^(.+) not in (.+)$/))) return `${c(m[1])} is not in ${c(m[2])} yet`;
  if ((m = cond.match(/^(.+) in (.+)$/))) return `${c(m[1])} is already in ${c(m[2])}`;
  if ((m = cond.match(/^(.+) is not None$/))) return `${c(m[1])} is not None (there is something there)`;
  if ((m = cond.match(/^(.+) is None$/))) return `${c(m[1])} is None (nothing there)`;
  if ((m = cond.match(/^(.+?)\s*!=\s*null$/))) return `${c(m[1])} is not null (there is something there)`;
  if ((m = cond.match(/^(.+?)\s*==\s*null$/))) return `${c(m[1])} is null (nothing there)`;
  if ((m = cond.match(/^not (.+)$/))) return `it is not true that ${readCondition(m[1])}`;
  for (const [op, word] of COMPARE) {
    const parts = splitTop(cond, op);
    if (parts.length === 2 && !/[=<>!]$/.test(parts[0]) && !/^[=<>]/.test(parts[1])) return `${c(parts[0])} ${word} ${c(parts[1])}`;
  }
  if (/^[\w.\[\]]+$/.test(cond)) return lang === 'python' ? `${c(cond)} has a value (it is not None, empty, 0 or False)` : `${c(cond)} is true`;
  return c(cond);
}

function balanced(s: string) {
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')' && --depth < 0) return false;
  }
  return depth === 0;
}

// ---- values ------------------------------------------------------------------------------

const ROLE: [RegExp, string][] = [
  [/^(total|sum|running)/i, 'which will keep a running total'],
  [/^(count|cnt|num)/i, 'which will count things'],
  [/^(best|ans|answer|max|min|longest|shortest)/i, 'which will remember the best answer so far'],
  [/^(left|right|lo|hi|low|high|start|end|i|j|l|r)$/i, 'which will act as a pointer to a position'],
];

const role = (name: string) => {
  const hit = ROLE.find(([re]) => re.test(name));
  return hit ? `, ${hit[1]}` : '';
};

/** "the larger of a and b" style readings for common built-ins; null when nothing fits. */
function readValue(v: string): string | null {
  let m: RegExpMatchArray | null;
  if ((m = v.match(/^(?:Math\.)?max\((.+)\)$/))) return `the larger of ${listing(splitTop(m[1]).map(c))}`;
  if ((m = v.match(/^(?:Math\.)?min\((.+)\)$/))) return `the smaller of ${listing(splitTop(m[1]).map(c))}`;
  if ((m = v.match(/^len\((.+)\)$/)) || (m = v.match(/^(\w+)\.(?:length\(\)|length|size\(\))$/))) return `the length of ${c(m[1])}`;
  if ((m = v.match(/^(\w+)\.pop\(\)$/))) return `the item taken off the top/end of ${c(m[1])}`;
  if ((m = v.match(/^(\w+)\.(?:popleft|poll|pollFirst|removeFirst)\(\)$/))) return `the item taken off the front of ${c(m[1])}`;
  if ((m = v.match(/^heapq\.heappop\((\w+)\)$/))) return `the smallest item, taken off the heap ${c(m[1])}`;
  if ((m = v.match(/^(\w+)\.peek\(\)$/))) return `the item at the top/front of ${c(m[1])} (without removing it)`;
  if ((m = v.match(/^(\w+)\.get\((.+)\)$/))) return `what ${c(m[1])} holds for ${c(m[2])}`;
  if ((m = v.match(/^(\w+)\.getOrDefault\((.+),\s*(.+)\)$/))) return `what ${c(m[1])} holds for ${c(m[2])} (or ${c(m[3])} if nothing)`;
  if ((m = v.match(/^(\w+)\.get\((.+),\s*(.+)\)$/))) return `what ${c(m[1])} holds for ${c(m[2])} (or ${c(m[3])} if nothing)`;
  if ((m = v.match(/^(.+) if (.+) else (.+)$/))) return `${c(m[1])} if ${readCondition(m[2])}, otherwise ${c(m[3])}`;
  if ((m = v.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/))) return `${c(m[2])} if ${readCondition(m[1])}, otherwise ${c(m[3])}`;
  return null;
}

/** What gets created when a fresh variable is made; null when it is just an ordinary value. */
function readNew(name: string, v: string): string | null {
  const x = c(name);
  let m: RegExpMatchArray | null;
  if (v === '[]') return `create an empty list called ${x}`;
  if (v === '{}') return `create an empty dictionary called ${x}`;
  if (v === 'set()') return `create an empty set called ${x}`;
  if ((m = v.match(/^\{(.+)\}$/))) return `create a dictionary called ${x} holding ${c(m[1])}`;
  if ((m = v.match(/^\[(.+)\]\s*\*\s*(.+)$/))) return `create a list called ${x} holding ${c(m[2])} copies of ${c(m[1])}`;
  if (/^\[\[.*\bfor\b/.test(v)) return `build a table (a list of lists) called ${x}`;
  if (/^\[.*\bfor\b.*\bin\b/.test(v)) return `build a list called ${x} from ${c(v)}`;
  if ((m = v.match(/^list\(range\((.+)\)\)$/))) return `create a list called ${x} holding the numbers 0 up to ${c(m[1])} − 1`;
  if ((m = v.match(/^deque\((.*)\)$/))) return `create a queue (deque) called ${x}${m[1] ? ` starting with ${c(m[1])}` : ''}`;
  if ((m = v.match(/^new (\w+)\[(.+?)\]\[(.+?)\]$/))) return `create a table of ${m[1]}s called ${x} with ${c(m[2])} rows and ${c(m[3])} columns (all zero)`;
  if ((m = v.match(/^new (\w+)\[(.+)\]$/))) return `create ${m[1] === 'boolean' ? 'a boolean' : `an ${m[1]}`} array called ${x} with room for ${c(m[2])} values (all ${m[1] === 'boolean' ? 'false' : '0'})`;
  if ((m = v.match(/^new (\w+)\[\]\s*\{(.*)\}$/))) return `create an ${m[1]} array called ${x} holding ${c(m[2])}`;
  if ((m = v.match(/^new (HashMap|TreeMap|LinkedHashMap)<.*>\(\)$/))) return `create an empty ${m[1]} called ${x}`;
  if ((m = v.match(/^new (HashSet|TreeSet|LinkedHashSet)<.*>\(\)$/))) return `create an empty ${m[1]} called ${x}`;
  if ((m = v.match(/^new (ArrayList|LinkedList)<.*>\((.*)\)$/))) return `create ${m[2] ? 'an' : 'an empty'} ${m[1]} called ${x}${m[2] ? ` copied from ${c(m[2])}` : ''}`;
  if (/^new ArrayDeque<.*>\(\)$/.test(v)) return `create an empty ArrayDeque called ${x} (it can be used as a stack or a queue)`;
  if (/^new PriorityQueue<.*>\(Collections\.reverseOrder\(\)\)$/.test(v)) return `create an empty max-heap called ${x} (biggest item comes out first)`;
  if (/^new PriorityQueue<.*>\(\)$/.test(v)) return `create an empty min-heap called ${x} (smallest item comes out first)`;
  if ((m = v.match(/^(?:new )?(ListNode|TreeNode)\((.*)\)$/))) return `create a new node called ${x}${m[2] ? ` holding ${c(m[2])}` : ''}`;
  if ((m = v.match(/^new String\((.+)\)$/))) return `turn ${c(m[1])} into a String called ${x}`;
  if ((m = v.match(/^(\w+)\.toCharArray\(\)$/))) return `copy the characters of ${c(m[1])} into a char array called ${x}`;
  if (/^-?\d+(\.\d+)?$/.test(v)) return `create ${x} and set it to ${c(v)}${role(name)}`;
  if (v === 'None' || v === 'null') return `create ${x} and set it to ${v} (nothing yet)`;
  if (/^(True|False|true|false)$/.test(v)) return `create ${x} and set it to ${c(v)}`;
  return null;
}

function assign(target: string, value: string, seen: Set<string>, java: boolean): Phrase {
  const targets = splitTop(target);
  const values = splitTop(value);
  if (targets.length > 1) {
    if (targets.length === values.length) {
      targets.forEach((t) => seen.add(t));
      return { kind: 'stmt', targets, text: `set ${listing(targets.map((t, i) => `${c(t)} to ${c(values[i])}`))}, all at the same time` };
    }
    targets.forEach((t) => seen.add(t));
    return { kind: 'stmt', targets, text: `unpack ${c(value)} into ${listing(targets.map(c))}` };
  }
  let m: RegExpMatchArray | null;
  if ((m = target.match(/^(\w+)\[(.+)\]$/))) {
    return { kind: 'stmt', targets: [m[1]], text: `store ${c(value)} in ${c(m[1])} at ${c(m[2])}` };
  }
  if ((m = target.match(/^(\w+)\.(\w+)$/))) {
    return { kind: 'stmt', text: `point ${c(target)} at ${c(value)} (so ${c(m[1])}'s ${m[2]} is now ${c(value)})` };
  }
  const fresh = !seen.has(target);
  seen.add(target);
  if (fresh) {
    const made = readNew(target, value);
    if (made) return { kind: 'stmt', targets: [target], text: made };
  }
  if (fresh && /^[\w.]+$/.test(value)) return { kind: 'stmt', targets: [target], text: `create ${c(target)} and set it to ${c(value)}${role(target)}` };
  const reading = readValue(value);
  if (reading) return { kind: 'stmt', targets: [target], text: `${fresh ? 'set' : 'update'} ${c(target)} to ${reading}` };
  return {
    kind: 'stmt',
    targets: [target],
    text: fresh ? `work out ${c(value)} and store it in a new variable ${c(target)}${role(target)}` : `update ${c(target)} to ${c(value)}`,
  };
}

/** Reads `x.method(args)` / `f(args)` statements. */
function call(text: string): Phrase | null {
  let m: RegExpMatchArray | null;
  if ((m = text.match(/^(\w+)\.(append|add|offer|addLast)\((.+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `add ${c(m[3])} to ${c(m[1])}${m[2] === 'append' ? ' (at the end)' : ''}` };
  if ((m = text.match(/^(\w+)\.(appendleft|addFirst)\((.+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `add ${c(m[3])} to the front of ${c(m[1])}` };
  if ((m = text.match(/^(\w+)\.push\((.+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `push ${c(m[2])} on top of the stack ${c(m[1])}` };
  if ((m = text.match(/^(\w+)\.put\((.+)\)$/))) {
    const [k, v] = splitTop(m[2]);
    return { kind: 'stmt', targets: [m[1]], text: `store ${c(v ?? '')} in ${c(m[1])} under the key ${c(k)}` };
  }
  if ((m = text.match(/^(\w+)\.pop\(\)$/))) return { kind: 'stmt', targets: [m[1]], text: `remove the top/last item of ${c(m[1])}` };
  if ((m = text.match(/^(\w+)\.(popleft|poll|pollFirst|removeFirst)\(\)$/))) return { kind: 'stmt', targets: [m[1]], text: `remove the front item of ${c(m[1])}` };
  if ((m = text.match(/^(\w+)\.remove\((.+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `remove ${c(m[2])} from ${c(m[1])}` };
  if ((m = text.match(/^(\w+)\.sort\(.*\)$/)) || (m = text.match(/^Arrays\.sort\((\w+).*\)$/))) return { kind: 'stmt', targets: [m[1]], text: `sort ${c(m[1])} into increasing order` };
  if ((m = text.match(/^Arrays\.fill\((\w+),\s*(.+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `fill every slot of ${c(m[1])} with ${c(m[2])}` };
  if ((m = text.match(/^heapq\.heappush\((\w+),\s*(.+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `push ${c(m[2])} onto the heap ${c(m[1])}` };
  if ((m = text.match(/^heapq\.heappop\((\w+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `remove the smallest item from the heap ${c(m[1])}` };
  if ((m = text.match(/^heapq\.heapify\((\w+)\)$/))) return { kind: 'stmt', targets: [m[1]], text: `rearrange ${c(m[1])} into a heap` };
  if ((m = text.match(/^(?:print|System\.out\.println|System\.out\.print)\((.*)\)$/))) return { kind: 'stmt', text: `print ${c(m[1] || '""')}` };
  if ((m = text.match(/^([\w.]+)\((.*)\)$/))) {
    return { kind: 'stmt', text: m[2] ? `call ${c(m[1])} with ${listing(splitTop(m[2]).map(c))}` : `call ${c(m[1])}` };
  }
  return null;
}

function ret(value: string | undefined, top: boolean): Phrase {
  if (!value) return { kind: 'stmt', text: 'stop and leave the function here' };
  let m: RegExpMatchArray | null;
  if ((m = value.match(/^new \w+\[\]\s*\{(.*)\}$/))) return { kind: 'stmt', text: `hand back a new array holding ${listing(splitTop(m[1]).map(c))}` };
  if (/^not |\.isEmpty\(\)|\.contains|==|!=|<=|>=|\s<\s|\s>\s/.test(value)) {
    return { kind: 'stmt', text: `hand back whether ${readCondition(value)}${top ? ' (that is the answer)' : ''}` };
  }
  const reading = readValue(value);
  return { kind: 'stmt', text: `hand back ${reading ?? c(value)}${top ? ' as the answer' : ''}` };
}

// ---- one line ----------------------------------------------------------------------------

function python(text: string, seen: Set<string>, top: boolean): Phrase | null {
  let m: RegExpMatchArray | null;
  if ((m = text.match(/^def (\w+)\((.*)\):$/))) {
    const params = splitTop(m[2]).map((p) => p.split('=')[0].trim()).filter((p) => p !== 'self');
    params.forEach((p) => seen.add(p));
    return { kind: 'def', text: `define a function ${c(m[1])}${params.length ? ` that takes ${listing(params.map(c))}` : ''}` };
  }
  if ((m = text.match(/^class (\w+)/))) return { kind: 'def', text: `wrap everything in a class called ${c(m[1])}` };
  if ((m = text.match(/^(?:from (\S+) )?import (.+)$/))) return { kind: 'stmt', text: `bring in ${c(m[2])}${m[1] ? ` from ${c(m[1])}` : ''} (part of Python's standard library)` };
  if ((m = text.match(/^for (\w+), (\w+) in enumerate\((.+)\):$/))) {
    seen.add(m[1]);
    seen.add(m[2]);
    return { kind: 'loop', targets: [m[2], m[1]], text: `start a loop that walks through ${c(m[3])}, giving you each position as ${c(m[1])} and the value there as ${c(m[2])}` };
  }
  if ((m = text.match(/^for (\w+) in range\((.+)\):$/))) {
    seen.add(m[1]);
    const args = splitTop(m[2]);
    const i = c(m[1]);
    let how: string;
    const whole = args[0].match(/^len\((.+)\)$/);
    if (args.length === 1 && whole) how = `goes through every position ${i} of ${c(whole[1])}, from 0 to the last one`;
    else if (args.length === 1) how = `counts ${i} from 0 up to ${c(args[0])} − 1`;
    else if (args.length === 2) how = `counts ${i} from ${c(args[0])} up to ${c(args[1])} − 1`;
    else how = `counts ${i} from ${c(args[0])} towards ${c(args[1])} in steps of ${c(args[2])}`;
    return { kind: 'loop', targets: [m[1]], text: `start a loop that ${how}` };
  }
  if ((m = text.match(/^for (.+?) in (.+):$/))) {
    const vars = splitTop(m[1]);
    vars.forEach((v) => seen.add(v));
    return vars.length > 1
      ? { kind: 'loop', targets: vars, text: `start a loop that goes through each item of ${c(m[2])}, unpacking it into ${listing(vars.map(c))}` }
      : { kind: 'loop', targets: vars, text: `start a loop that goes through ${c(m[2])} one item at a time, calling the current item ${c(vars[0])}` };
  }
  if ((m = text.match(/^while (.+):$/))) return { kind: 'loop', text: `start a loop that keeps repeating as long as ${readCondition(m[1])}` };
  if ((m = text.match(/^if (.+):$/))) return { kind: 'if', text: `check whether ${readCondition(m[1])}` };
  if ((m = text.match(/^elif (.+):$/))) return { kind: 'elif', text: `if not, check instead whether ${readCondition(m[1])}` };
  if (text === 'else:') return { kind: 'else', text: 'if none of that was true' };
  if (text === 'return') return ret(undefined, top);
  if ((m = text.match(/^return (.+)$/))) return ret(m[1], top);
  if (text === 'break') return { kind: 'stmt', text: 'jump out of the loop straight away' };
  if (text === 'continue') return { kind: 'stmt', text: 'skip the rest of this round and go to the next one' };
  if (text === 'pass') return { kind: 'stmt', text: 'do nothing yet (this is just a placeholder)' };
  if ((m = text.match(/^(nonlocal|global) (.+)$/))) return { kind: 'stmt', text: `say that ${c(m[2])} belongs to the outer function` };
  if ((m = text.match(/^(.+?)\s*(\+=|-=|\*=|\/\/=|\/=)\s*(.+)$/))) return compound(m[1], m[2], m[3]);
  if ((m = text.match(/^([^=]+?)\s*=(?!=)\s*(.+)$/))) return assign(m[1].trim(), m[2].trim(), seen, false);
  return call(text);
}

function compound(target: string, op: string, value: string): Phrase {
  const t = c(target);
  const v = c(value);
  const text =
    op === '+=' ? `add ${v} to ${t}` : op === '-=' ? `take ${v} away from ${t}` : op === '*=' ? `multiply ${t} by ${v}` : `divide ${t} by ${v}`;
  return { kind: 'stmt', targets: [target.replace(/\[.*$/, '')], text };
}

const JAVA_TYPE = /^(?:final\s+)?([A-Za-z][\w.]*(?:<[^=]*>)?(?:\[\])*)\s+(\w+)\s*(?:=\s*(.+))?$/;

function java(text: string, seen: Set<string>, top: boolean): Phrase | null {
  let m: RegExpMatchArray | null;
  if ((m = text.match(/^(?:public |private |protected )?(?:static )?class (\w+)/))) return { kind: 'def', text: `wrap everything in a class called ${c(m[1])}` };
  if ((m = text.match(/^(?:public |private |protected )(?:static )?(.+?)\s+(\w+)\((.*)\)$/))) {
    const params = splitTop(m[3], ',', true).map((p) => {
      const parts = p.trim().split(/\s+/);
      const name = parts.pop()!;
      seen.add(name);
      return `${c(name)} (${parts.join(' ')})`;
    });
    return {
      kind: 'def',
      text: `define the method ${c(m[2])}${params.length ? `, which takes ${listing(params)}` : ''}, and ${m[1] === 'void' ? 'gives nothing back' : `gives back ${c(m[1])}`}`,
    };
  }
  if ((m = text.match(/^for\s*\((?:final\s+)?([\w<>\[\]]+)\s+(\w+)\s*:\s*(.+)\)$/))) {
    seen.add(m[2]);
    return { kind: 'loop', targets: [m[2]], text: `start a loop that goes through ${c(m[3])} one item at a time, calling the current item ${c(m[2])}` };
  }
  if ((m = text.match(/^for\s*\((?:int\s+)?(\w+)\s*=\s*(.+?);\s*(.+?);\s*(.+)\)$/))) {
    seen.add(m[1]);
    const step = /\+\+|\+= ?1$/.test(m[4]) ? 'adding 1 each time' : /--|-= ?1$/.test(m[4]) ? 'taking away 1 each time' : `doing ${c(m[4])} each time`;
    return { kind: 'loop', targets: [m[1]], text: `start a loop that counts ${c(m[1])} starting at ${c(m[2])}, ${step}, for as long as ${readCondition(m[3])}` };
  }
  if ((m = text.match(/^while\s*\((.+)\)$/))) return { kind: 'loop', text: `start a loop that keeps repeating as long as ${readCondition(m[1])}` };
  if ((m = text.match(/^if\s*\((.+)\)$/))) return { kind: 'if', text: `check whether ${readCondition(m[1])}` };
  if ((m = text.match(/^else if\s*\((.+)\)$/))) return { kind: 'elif', text: `if not, check instead whether ${readCondition(m[1])}` };
  if (text === 'else') return { kind: 'else', text: 'if none of that was true' };
  if (text === 'return') return ret(undefined, top);
  if ((m = text.match(/^return (.+)$/))) return ret(m[1], top);
  if (text === 'break') return { kind: 'stmt', text: 'jump out of the loop straight away' };
  if (text === 'continue') return { kind: 'stmt', text: 'skip the rest of this round and go to the next one' };
  if ((m = text.match(/^(\w+)\+\+$/)) || (m = text.match(/^\+\+(\w+)$/))) return { kind: 'stmt', targets: [m[1]], text: `add 1 to ${c(m[1])}` };
  if ((m = text.match(/^(\w+)--$/)) || (m = text.match(/^--(\w+)$/))) return { kind: 'stmt', targets: [m[1]], text: `take 1 away from ${c(m[1])}` };
  if ((m = text.match(/^(.+?)\s*(\+=|-=|\*=|\/=)\s*(.+)$/))) return compound(m[1], m[2], m[3]);

  // Declarations, possibly several at once: int left = 0, right = n - 1
  const declared = splitTop(text, ',', true);
  const first = declared[0].match(JAVA_TYPE);
  if (first && !['return', 'new', 'else'].includes(first[1])) {
    const type = first[1];
    const parts = [first[2] + (first[3] ? ` = ${first[3]}` : ''), ...declared.slice(1)];
    const phrases = parts.map((part) => {
      const [name, ...rest] = part.split('=');
      const value = rest.join('=').trim();
      if (!value) {
        seen.add(name.trim());
        return { kind: 'stmt' as Kind, targets: [name.trim()], text: `declare ${c(name)} as ${/^[aeiou]/i.test(type) ? 'an' : 'a'} ${type}, with no value yet` };
      }
      const made = assign(name.trim(), value, seen, true);
      // "work out x and store it" reads better with the type for ordinary declarations
      return /^work out/.test(made.text) ? { ...made, text: `declare ${c(name)} as ${/^[aeiou]/i.test(type) ? 'an' : 'a'} ${type} and set it to ${readValue(value) ?? c(value)}${role(name.trim())}` } : made;
    });
    return { kind: 'stmt', targets: phrases.flatMap((p) => p.targets ?? []), text: listing(phrases.map((p) => p.text)) };
  }
  if ((m = text.match(/^([^=]+?)\s*=(?!=)\s*(.+)$/))) return assign(m[1].trim(), m[2].trim(), seen, true);
  return call(text);
}

// ---- the whole story ---------------------------------------------------------------------

const CONNECT: Record<Kind, string> = {
  def: 'Inside it, you',
  loop: 'Each time round the loop, you',
  if: 'If so, you',
  elif: 'If so, you',
  else: 'In that case, you',
  stmt: 'Then you',
};

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function narrate(code: string, language: Language, steps?: Step[]): StoryLine[] {
  lang = language;
  const seen = new Set<string>();
  const story: StoryLine[] = [];
  // Open blocks, innermost last: their kind, indentation, and whether a child was told yet.
  const open: { kind: Kind; indent: number; told: boolean; isClass?: boolean }[] = [];
  let lastIndent = -1;
  let functions = 0;

  code.split('\n').forEach((raw, index) => {
    let text = raw.replace(lang === 'python' ? /\s+#.*$/ : /\s*\/\/.*$/, '').trim();
    if (lang === 'java') text = text.replace(/^\}\s*/, '').replace(/\s*\{$/, '').replace(/;$/, '').replace(/\s*\{\s*\}$/, '').trim();
    if (!text || text.startsWith('#') || text.startsWith('//') || text === '{' || text === '}') return;
    if (text.startsWith('@')) return;

    const indent = raw.length - raw.trimStart().length;
    const phrase = (lang === 'python' ? python : java)(text, seen, functions <= 1);
    if (!phrase) return;
    if (phrase.kind === 'def') functions++;

    // Close the blocks this line has stepped out of. elif/else stay level with their if.
    while (open.length && (indent < open[open.length - 1].indent || (indent === open[open.length - 1].indent && !['elif', 'else'].includes(phrase.kind)))) {
      open.pop();
    }
    if (['elif', 'else'].includes(phrase.kind)) {
      while (open.length && open[open.length - 1].indent >= indent && !['if', 'elif'].includes(open[open.length - 1].kind)) open.pop();
      if (open.length && open[open.length - 1].indent === indent) open.pop();
    }

    const parent = open[open.length - 1];
    let sentence: string;
    if (phrase.kind === 'elif' || phrase.kind === 'else') {
      sentence = capital(phrase.text) + (phrase.kind === 'else' ? ':' : '.');
    } else if (phrase.kind === 'def' && !parent) {
      sentence = `You ${phrase.text}.`;
    } else if (!parent) {
      sentence = story.length === 0 ? `First, you ${phrase.text}.` : `${indent < lastIndent ? 'After that, you' : 'Then you'} ${phrase.text}.`;
    } else if (!parent.told) {
      sentence = parent.kind === 'def' && !parent.isClass ? `First, you ${phrase.text}.` : `${CONNECT[parent.kind]} ${phrase.text}.`;
      parent.told = true;
    } else {
      sentence = `${indent < lastIndent ? 'After that, you' : 'Then you'} ${phrase.text}.`;
    }
    lastIndent = indent;

    const entry: StoryLine = { line: index + 1, depth: open.length, sentence };
    // Function headers and `else` are never reported as steps of their own, so no run count for them.
    if (steps && phrase.kind !== 'def' && phrase.kind !== 'else') {
      entry.ran = steps.filter((s) => s.line === index + 1 && s.ev === 'line').length;
      const variable = phrase.targets?.[0];
      if (variable && entry.ran > 0) {
        entry.variable = variable;
        entry.values = valuesAfter(steps, index + 1, variable, lang);
      }
    }
    story.push(entry);
    if (phrase.kind !== 'stmt') open.push({ kind: phrase.kind, indent, told: false, isClass: phrase.text.startsWith('wrap everything') });
  });
  return story;
}

/** The values a variable held right after each time a line ran, without repeats in a row. */
function valuesAfter(steps: Step[], line: number, name: string, lang: Language): string[] {
  const out: string[] = [];
  for (let i = 0; i < steps.length - 1 && out.length < 7; i++) {
    const step = steps[i];
    if (step.line !== line || step.ev !== 'line') continue;
    // The next step in the same call shows the effect of this line.
    const next = steps.slice(i + 1).find((s) => s.depth <= step.depth);
    if (!next || next.depth !== step.depth) continue;
    const found = next.vars.find(([n]) => n === name);
    if (!found) continue;
    const text = show(found[1] as Value, lang, next.heap);
    if (out[out.length - 1] !== text) out.push(text.length > 40 ? text.slice(0, 39) + '…' : text);
  }
  return out;
}
