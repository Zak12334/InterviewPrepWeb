import type { Problem, ValueType } from '@/types/content';

export const LIST_NODE = `public class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
`;

export const TREE_NODE = `public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
`;

const charLiteral = (c: unknown) => `'${String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** Turns a JSON test argument into a Java expression of the given type. */
export function javaLiteral(value: unknown, type: ValueType): string {
  const items = (inner: ValueType) => (value as unknown[]).map((v) => javaLiteral(v, inner)).join(', ');
  switch (type) {
    case 'int':
    case 'double':
    case 'boolean':
      return String(value);
    case 'long':
      return `${value}L`;
    case 'char':
      return charLiteral(value);
    case 'String':
      return JSON.stringify(value);
    case 'int[]':
      return `new int[]{${items('int')}}`;
    case 'char[]':
      return `new char[]{${items('char')}}`;
    case 'String[]':
      return `new String[]{${items('String')}}`;
    case 'int[][]':
      return `new int[][]{${items('int[]')}}`;
    case 'char[][]':
      return `new char[][]{${items('char[]')}}`;
    case 'List<Integer>':
      return `new ArrayList<Integer>(Arrays.asList(${items('int')}))`;
    case 'List<String>':
      return `new ArrayList<String>(Arrays.asList(${items('String')}))`;
    case 'List<List<Integer>>':
      return `new ArrayList<List<Integer>>(Arrays.asList(${items('List<Integer>')}))`;
    case 'List<List<String>>':
      return `new ArrayList<List<String>>(Arrays.asList(${items('List<String>')}))`;
    case 'ListNode':
      return `list(new int[]{${items('int')}})`;
    case 'TreeNode':
      return `tree(new Integer[]{${(value as unknown[]).map((v) => (v === null ? 'null' : String(v))).join(', ')}})`;
  }
}

/** Main.java: calls the learner's method for each case and prints one marker line per result. */
export function mainSource(problem: Problem, cases: unknown[][]): string {
  const { java, params } = problem.signature;
  const calls = cases
    .map((args, i) => {
      const list = params.map((p, j) => javaLiteral(args[j], p.type)).join(', ');
      return `            case ${i}: return new Solution().${java}(${list});`;
    })
    .join('\n');

  return `import java.util.*;

public class Main {
    static Object run(int i) throws Throwable {
        switch (i) {
${calls}
        }
        return null;
    }

    public static void main(String[] args) {
        int from = 0, to = ${cases.length};
        if (!args[0].equals("all")) { from = Integer.parseInt(args[0]); to = from + 1; }
        for (int i = from; i < to; i++) {
            String line;
            try {
                line = "{\\"i\\":" + i + ",\\"got\\":" + json(run(i)) + "}";
            } catch (Throwable t) {
                int at = -1;
                for (StackTraceElement el : t.getStackTrace()) {
                    if ("Solution.java".equals(el.getFileName())) { at = el.getLineNumber(); break; }
                }
                String message = t.getClass().getSimpleName() + (t.getMessage() == null ? "" : ": " + t.getMessage());
                line = "{\\"i\\":" + i + ",\\"error\\":{\\"message\\":" + quote(message) + ",\\"line\\":" + (at < 0 ? "null" : at) + "}}";
            }
            System.out.println("\\n@@TF@@" + line);
        }
    }

    static ListNode list(int[] values) {
        ListNode head = null;
        for (int i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);
        return head;
    }

    static TreeNode tree(Integer[] values) {
        if (values.length == 0 || values[0] == null) return null;
        TreeNode root = new TreeNode(values[0]);
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        int i = 1;
        while (!queue.isEmpty() && i < values.length) {
            TreeNode node = queue.poll();
            if (values[i] != null) { node.left = new TreeNode(values[i]); queue.add(node.left); }
            i++;
            if (i < values.length && values[i] != null) { node.right = new TreeNode(values[i]); queue.add(node.right); }
            i++;
        }
        return root;
    }

    static String quote(String s) {
        StringBuilder sb = new StringBuilder("\\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\\\') sb.append('\\\\').append(c);
            else if (c == '\\n') sb.append("\\\\n");
            else if (c < 0x20) sb.append(' ');
            else sb.append(c);
        }
        return sb.append('"').toString();
    }

    static String json(Object o) {
        if (o == null) return "null";
        if (o instanceof String || o instanceof Character) return quote(o.toString());
        if (o instanceof Number || o instanceof Boolean) return o.toString();
        List<Object> items = new ArrayList<>();
        if (o instanceof int[]) { for (int x : (int[]) o) items.add(x); }
        else if (o instanceof long[]) { for (long x : (long[]) o) items.add(x); }
        else if (o instanceof double[]) { for (double x : (double[]) o) items.add(x); }
        else if (o instanceof boolean[]) { for (boolean x : (boolean[]) o) items.add(x); }
        else if (o instanceof char[]) { for (char x : (char[]) o) items.add(x); }
        else if (o instanceof Object[]) { items.addAll(Arrays.asList((Object[]) o)); }
        else if (o instanceof Collection) { items.addAll((Collection<?>) o); }
        else if (o instanceof ListNode) {
            int guard = 0;
            for (ListNode n = (ListNode) o; n != null && guard++ < 10000; n = n.next) items.add(n.val);
        } else if (o instanceof TreeNode) {
            LinkedList<TreeNode> queue = new LinkedList<>();
            queue.add((TreeNode) o);
            while (!queue.isEmpty()) {
                TreeNode n = queue.poll();
                items.add(n == null ? null : n.val);
                if (n != null) { queue.add(n.left); queue.add(n.right); }
            }
            while (!items.isEmpty() && items.get(items.size() - 1) == null) items.remove(items.size() - 1);
        } else {
            return quote(o.toString());
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < items.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(json(items.get(i)));
        }
        return sb.append(']').toString();
    }
}
`;
}
