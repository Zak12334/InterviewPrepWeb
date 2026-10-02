"""Runs learner Python code and records a step-by-step trace for the visualizer.

Reads one JSON request on stdin, writes one JSON response on stdout.
Request: {code, fn, altFn, params: [type], cases: [[arg, ...]], mode: 'trace'|'test', maxSteps}
"""
import collections
import copy
import io
import json
import sys
import traceback
import types

FILE = '<solution>'
MAX_ITEMS = 60
MAX_DEPTH = 4
MAX_HEAP = 300


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class StepLimit(BaseException):
    pass


def is_tree_node(o):
    return hasattr(o, 'val') and hasattr(o, 'left') and hasattr(o, 'right')


def is_list_node(o):
    return hasattr(o, 'val') and hasattr(o, 'next') and not hasattr(o, 'left')


def node_ref(o, heap):
    """Registers a linked-list/tree node (and everything reachable) in the heap."""
    key = str(id(o))
    if key in heap or len(heap) >= MAX_HEAP:
        return {'t': 'ref', 'id': key}
    if is_tree_node(o):
        entry = {'k': 'tree', 'val': None, 'left': None, 'right': None}
        links = ('left', 'right')
    else:
        entry = {'k': 'list', 'val': None, 'next': None}
        links = ('next',)
    heap[key] = entry
    entry['val'] = encode(o.val, heap, MAX_DEPTH - 1)
    for link in links:
        target = getattr(o, link)
        if target is not None and (is_tree_node(target) or is_list_node(target)):
            entry[link] = node_ref(target, heap)['id']
    return {'t': 'ref', 'id': key}


def encode(v, heap, depth=0):
    if v is None or isinstance(v, bool):
        return v
    if isinstance(v, int):
        return v if abs(v) < 2 ** 53 else {'t': 'obj', 'v': str(v)}
    if isinstance(v, float):
        if v != v or v in (float('inf'), float('-inf')):
            return {'t': 'obj', 'v': str(v)}
        return v
    if isinstance(v, str):
        return {'t': 'str', 'v': v[:200]}
    if is_tree_node(v) or is_list_node(v):
        return node_ref(v, heap)
    if depth >= MAX_DEPTH:
        return {'t': 'obj', 'v': '…'}
    if isinstance(v, dict):
        items = list(v.items())[:MAX_ITEMS]
        return {'t': 'map', 'n': len(v),
                'v': [[encode(k, heap, depth + 1), encode(x, heap, depth + 1)] for k, x in items]}
    if isinstance(v, (list, tuple, set, frozenset, collections.deque)):
        items = list(v)
        kind = 'list'
        if isinstance(v, tuple):
            kind = 'tuple'
        elif isinstance(v, collections.deque):
            kind = 'deque'
        elif isinstance(v, (set, frozenset)):
            kind = 'set'
            try:
                items.sort()
            except TypeError:
                pass
        return {'t': 'list', 'kind': kind, 'n': len(items),
                'v': [encode(x, heap, depth + 1) for x in items[:MAX_ITEMS]]}
    return {'t': 'obj', 'v': repr(v)[:80]}


def visible(name, value):
    if name.startswith('__') or name == 'self':
        return False
    return not isinstance(value, (types.FunctionType, types.BuiltinFunctionType,
                                  types.ModuleType, types.MethodType, type))


def short(v):
    if is_tree_node(v) or is_list_node(v):
        return 'node(%s)' % (v.val,)
    if isinstance(v, (list, tuple, set, dict, collections.deque)):
        return '[…]' if not isinstance(v, dict) else '{…}'
    text = repr(v)
    return text if len(text) <= 14 else text[:13] + '…'


def traced(frame):
    return frame.f_code.co_filename == FILE and not frame.f_code.co_name.startswith('<')


def make_tracer(steps, out, max_steps):
    def snap(frame, ev, ret=None):
        if len(steps) >= max_steps:
            raise StepLimit()
        heap = {}
        local = [[k, encode(v, heap)] for k, v in frame.f_locals.items() if visible(k, v)]
        frames = []
        f = frame
        while f is not None:
            if traced(f):
                code = f.f_code
                names = [n for n in code.co_varnames[:code.co_argcount] if n != 'self']
                args = ', '.join('%s=%s' % (n, short(f.f_locals[n])) for n in names if n in f.f_locals)
                refs = []
                for k, v in f.f_locals.items():
                    if visible(k, v) and (is_tree_node(v) or is_list_node(v)):
                        refs.append([k, node_ref(v, heap)['id']])
                frames.append({'fn': code.co_name, 'args': args, 'refs': refs})
            f = f.f_back
        frames.reverse()
        step = {'line': frame.f_lineno, 'fn': frame.f_code.co_name, 'depth': len(frames),
                'ev': ev, 'vars': local, 'frames': frames, 'o': len(out.getvalue())}
        if ev == 'return':
            step['ret'] = encode(ret, heap)
        if heap:
            step['heap'] = heap
        steps.append(step)

    # Frames an exception is currently travelling through. Python reports those as
    # "return None", which would look like a real return in the animation.
    raising = set()

    def tracer(frame, event, arg):
        if not traced(frame):
            return None
        if event == 'line':
            raising.discard(id(frame))
            snap(frame, 'line')
        elif event == 'exception':
            raising.add(id(frame))
        elif event == 'return':
            if id(frame) in raising:
                raising.discard(id(frame))
            else:
                snap(frame, 'return', arg)
        return tracer

    return tracer


def build_list(values):
    head = None
    for v in reversed(values or []):
        head = ListNode(v, head)
    return head


def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = collections.deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        if values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root


def to_input(value, kind):
    if kind == 'ListNode':
        return build_list(value)
    if kind == 'TreeNode':
        return build_tree(value)
    return copy.deepcopy(value)


def to_json(v):
    if is_list_node(v):
        out, seen = [], 0
        while v is not None and seen < 10000:
            out.append(to_json(v.val))
            v = v.next
            seen += 1
        return out
    if is_tree_node(v):
        out, queue = [], collections.deque([v])
        while queue:
            node = queue.popleft()
            if node is None:
                out.append(None)
                continue
            out.append(to_json(node.val))
            queue.append(node.left)
            queue.append(node.right)
        while out and out[-1] is None:
            out.pop()
        return out
    if isinstance(v, (set, frozenset)):
        return sorted(to_json(x) for x in v)
    if isinstance(v, (list, tuple, collections.deque)):
        return [to_json(x) for x in v]
    if isinstance(v, dict):
        return {str(k): to_json(x) for k, x in v.items()}
    if v is None or isinstance(v, (bool, int, float, str)):
        return v
    return repr(v)


def describe(exc):
    line = None
    for frame in traceback.extract_tb(exc.__traceback__):
        if frame.filename == FILE:
            line = frame.lineno
    if isinstance(exc, SyntaxError) and exc.filename == FILE:
        line = exc.lineno
        return {'message': 'SyntaxError: %s' % exc.msg, 'line': line}
    return {'message': '%s: %s' % (type(exc).__name__, exc), 'line': line}


def find_function(namespace, names):
    for name in names:
        if callable(namespace.get(name)):
            return namespace[name]
    solution = namespace.get('Solution')
    if isinstance(solution, type):
        instance = solution()
        for name in names:
            if hasattr(instance, name):
                return getattr(instance, name)
    return None


def main():
    sys.stdin.reconfigure(encoding='utf-8')
    request = json.load(sys.stdin)
    real_stdout = sys.stdout
    out = io.StringIO()
    sys.stdout = out
    response = {}
    try:
        response = run(request, out)
    finally:
        sys.stdout = real_stdout
    real_stdout.reconfigure(encoding='utf-8')
    json.dump(response, real_stdout)


def run(request, out):
    namespace = {'__name__': '__solution__', 'ListNode': ListNode, 'TreeNode': TreeNode}
    try:
        exec(compile(request['code'], FILE, 'exec'), namespace)
    except BaseException as exc:  # noqa: BLE001 - learner code can raise anything
        return {'compileError': describe(exc)}

    names = [request['fn'], request.get('altFn') or request['fn']]
    fn = find_function(namespace, names)
    if fn is None:
        return {'compileError': {'message': 'Define a function named %s(...)' % request['fn'], 'line': None}}

    params = request['params']
    if request['mode'] == 'trace':
        steps = []
        result = {'steps': steps, 'limit': False}
        args = [to_input(a, t) for a, t in zip(request['cases'][0], params)]
        sys.settrace(make_tracer(steps, out, request.get('maxSteps', 2000)))
        try:
            value = fn(*args)
            sys.settrace(None)
            result['result'] = to_json(value)
        except StepLimit:
            sys.settrace(None)
            result['limit'] = True
        except BaseException as exc:  # noqa: BLE001
            sys.settrace(None)
            result['error'] = describe(exc)
        result['stdout'] = out.getvalue()
        return result

    results = []
    for i, case in enumerate(request['cases']):
        start = len(out.getvalue())
        entry = {'i': i}
        try:
            entry['got'] = to_json(fn(*[to_input(a, t) for a, t in zip(case, params)]))
        except BaseException as exc:  # noqa: BLE001
            entry['error'] = describe(exc)
        entry['stdout'] = out.getvalue()[start:]
        results.append(entry)
    return {'results': results}


if __name__ == '__main__':
    main()
