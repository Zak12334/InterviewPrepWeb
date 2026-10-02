import com.sun.jdi.*;
import com.sun.jdi.connect.Connector;
import com.sun.jdi.connect.LaunchingConnector;
import com.sun.jdi.event.*;
import com.sun.jdi.request.*;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

/**
 * Launches `Main <case>` from the working directory under the debugger, single-steps
 * through the learner's Solution class and writes the same trace JSON as tracer.py.
 *
 * Usage: java Tracer <caseArg> <maxSteps> <outFile>
 */
public class Tracer {
    static final int MAX_ITEMS = 60, MAX_DEPTH = 4, MAX_HEAP = 300;
    static final String USER = "Solution";

    static Map<String, String> heap;
    static final StringBuffer stdout = new StringBuffer();
    static final StringBuffer stderr = new StringBuffer();

    public static void main(String[] argv) throws Exception {
        int maxSteps = Integer.parseInt(argv[1]);

        LaunchingConnector connector = Bootstrap.virtualMachineManager().defaultConnector();
        Map<String, Connector.Argument> args = connector.defaultArguments();
        args.get("main").setValue("Main " + argv[0]);
        args.get("options").setValue("-cp . -Dfile.encoding=UTF-8");
        VirtualMachine vm = connector.launch(args);

        Thread outPump = pump(vm.process().getInputStream(), stdout);
        Thread errPump = pump(vm.process().getErrorStream(), stderr);

        EventRequestManager requests = vm.eventRequestManager();
        MethodEntryRequest entry = requests.createMethodEntryRequest();
        entry.addClassFilter(USER + "*");
        entry.enable();
        MethodExitRequest exit = requests.createMethodExitRequest();
        exit.addClassFilter(USER + "*");
        exit.enable();

        List<String> steps = new ArrayList<>();
        boolean limit = false;
        StepRequest stepping = null;
        try {
            loop:
            while (true) {
                EventSet set = vm.eventQueue().remove();
                for (Event e : set) {
                    if (e instanceof VMDeathEvent || e instanceof VMDisconnectEvent) break loop;
                    if (e instanceof MethodEntryEvent) {
                        MethodEntryEvent me = (MethodEntryEvent) e;
                        if (hidden(me.method()) || stepping != null) continue;
                        stepping = requests.createStepRequest(me.thread(), StepRequest.STEP_LINE, StepRequest.STEP_INTO);
                        stepping.addClassFilter(USER + "*");
                        stepping.enable();
                        entry.disable();
                        steps.add(snap(me.thread(), "line", null));
                    } else if (e instanceof StepEvent) {
                        StepEvent se = (StepEvent) e;
                        if (hidden(se.location().method())) continue;
                        steps.add(snap(se.thread(), "line", null));
                    } else if (e instanceof MethodExitEvent) {
                        MethodExitEvent xe = (MethodExitEvent) e;
                        if (stepping == null || hidden(xe.method())) continue;
                        steps.add(snap(xe.thread(), "return", xe.returnValue()));
                    }
                }
                if (steps.size() >= maxSteps) {
                    limit = true;
                    vm.exit(0);
                    break;
                }
                set.resume();
            }
        } catch (VMDisconnectedException ignored) {
            // the program finished
        }

        vm.process().waitFor();
        outPump.join(2000);
        errPump.join(2000);

        StringBuilder json = new StringBuilder("{\"steps\":[");
        for (int i = 0; i < steps.size(); i++) {
            if (i > 0) json.append(',');
            json.append(steps.get(i));
        }
        json.append("],\"limit\":").append(limit)
            .append(",\"stdout\":").append(quote(stdout.toString()))
            .append(",\"stderr\":").append(quote(stderr.toString())).append('}');
        Files.write(Paths.get(argv[2]), json.toString().getBytes(StandardCharsets.UTF_8));
    }

    static Thread pump(InputStream in, StringBuffer into) {
        Thread t = new Thread(() -> {
            try (Reader r = new InputStreamReader(in, StandardCharsets.UTF_8)) {
                char[] buf = new char[4096];
                int n;
                while ((n = r.read(buf)) > 0) into.append(buf, 0, n);
            } catch (Exception ignored) {
                // stream closed with the process
            }
        });
        t.setDaemon(true);
        t.start();
        return t;
    }

    /** Constructors, static initialisers and lambda bodies (e.g. sort comparators) are not shown as steps. */
    static boolean hidden(Method m) {
        return m.name().startsWith("<") || m.name().startsWith("lambda$");
    }

    static boolean isUser(StackFrame f) {
        Location loc = f.location();
        return loc.declaringType().name().startsWith(USER) && !hidden(loc.method());
    }

    static List<LocalVariable> locals(StackFrame f) {
        try {
            List<LocalVariable> vars = new ArrayList<>(f.visibleVariables());
            Collections.sort(vars);
            return vars;
        } catch (AbsentInformationException e) {
            return Collections.emptyList();
        }
    }

    static String snap(ThreadReference thread, String ev, Value ret) throws Exception {
        heap = new LinkedHashMap<>();
        List<StackFrame> all = thread.frames();
        StackFrame top = all.get(0);

        StringBuilder vars = new StringBuilder();
        List<LocalVariable> topVars = locals(top);
        Map<LocalVariable, Value> values = top.getValues(topVars);
        for (LocalVariable v : topVars) {
            if (vars.length() > 0) vars.append(',');
            vars.append('[').append(quote(v.name())).append(',').append(val(values.get(v), 0)).append(']');
        }

        StringBuilder frames = new StringBuilder();
        int depth = 0;
        for (int i = all.size() - 1; i >= 0; i--) {
            StackFrame f = all.get(i);
            if (!isUser(f)) continue;
            depth++;
            List<LocalVariable> fv = locals(f);
            Map<LocalVariable, Value> fvals = f.getValues(fv);
            StringBuilder argText = new StringBuilder();
            StringBuilder refs = new StringBuilder();
            for (LocalVariable v : fv) {
                Value x = fvals.get(v);
                if (v.isArgument()) {
                    if (argText.length() > 0) argText.append(", ");
                    argText.append(v.name()).append('=').append(brief(x));
                }
                if (x instanceof ObjectReference && nodeKind((ObjectReference) x) != null) {
                    if (refs.length() > 0) refs.append(',');
                    refs.append('[').append(quote(v.name())).append(',').append(quote(node((ObjectReference) x))).append(']');
                }
            }
            if (frames.length() > 0) frames.append(',');
            frames.append("{\"fn\":").append(quote(f.location().method().name()))
                  .append(",\"args\":").append(quote(argText.toString()))
                  .append(",\"refs\":[").append(refs).append("]}");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("{\"line\":").append(top.location().lineNumber())
          .append(",\"fn\":").append(quote(top.location().method().name()))
          .append(",\"depth\":").append(depth)
          .append(",\"ev\":").append(quote(ev))
          .append(",\"vars\":[").append(vars).append(']')
          .append(",\"frames\":[").append(frames).append(']')
          .append(",\"o\":").append(stdout.length());
        if (ev.equals("return") && ret != null && !(ret instanceof VoidValue)) {
            sb.append(",\"ret\":").append(val(ret, 0));
        }
        if (!heap.isEmpty()) {
            sb.append(",\"heap\":{");
            boolean first = true;
            for (Map.Entry<String, String> h : heap.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                sb.append(quote(h.getKey())).append(':').append(h.getValue());
            }
            sb.append('}');
        }
        return sb.append('}').toString();
    }

    // ---- value encoding -------------------------------------------------------------

    static Value field(ObjectReference o, String name) {
        Field f = o.referenceType().fieldByName(name);
        return f == null ? null : o.getValue(f);
    }

    static int intField(ObjectReference o, String name) {
        Value v = field(o, name);
        return v instanceof PrimitiveValue ? ((PrimitiveValue) v).intValue() : 0;
    }

    /** "list" / "tree" when the object looks like a linked-list or binary-tree node. */
    static String nodeKind(ObjectReference o) {
        if (o instanceof StringReference || o instanceof ArrayReference) return null;
        ReferenceType t = o.referenceType();
        if (t.name().startsWith("java.")) return null;
        if (t.fieldByName("val") == null) return null;
        if (t.fieldByName("left") != null && t.fieldByName("right") != null) return "tree";
        if (t.fieldByName("next") != null) return "list";
        return null;
    }

    static String node(ObjectReference o) {
        String id = Long.toString(o.uniqueID());
        if (heap.containsKey(id) || heap.size() >= MAX_HEAP) return id;
        heap.put(id, "null");
        String kind = nodeKind(o);
        StringBuilder sb = new StringBuilder("{\"k\":").append(quote(kind))
            .append(",\"val\":").append(val(field(o, "val"), MAX_DEPTH - 1));
        String[] links = kind.equals("tree") ? new String[]{"left", "right"} : new String[]{"next"};
        for (String link : links) {
            Value target = field(o, link);
            sb.append(",\"").append(link).append("\":");
            if (target instanceof ObjectReference && nodeKind((ObjectReference) target) != null) {
                sb.append(quote(node((ObjectReference) target)));
            } else {
                sb.append("null");
            }
        }
        heap.put(id, sb.append('}').toString());
        return id;
    }

    static String brief(Value v) {
        if (v == null) return "null";
        if (v instanceof StringReference) {
            String s = ((StringReference) v).value();
            return '"' + (s.length() > 12 ? s.substring(0, 11) + "…" : s) + '"';
        }
        if (v instanceof PrimitiveValue) return v.toString();
        if (v instanceof ArrayReference) return "[…]";
        ObjectReference o = (ObjectReference) v;
        if (nodeKind(o) != null) {
            Value x = field(o, "val");
            return "node(" + (x == null ? "null" : brief(x)) + ")";
        }
        String cn = o.referenceType().name();
        if (cn.startsWith("java.lang.") && o.referenceType().fieldByName("value") != null) return brief(field(o, "value"));
        return cn.contains("Map") ? "{…}" : "[…]";
    }

    static String obj(String text) {
        return "{\"t\":\"obj\",\"v\":" + quote(text) + "}";
    }

    static String str(String text) {
        return "{\"t\":\"str\",\"v\":" + quote(text.length() > 200 ? text.substring(0, 200) : text) + "}";
    }

    static String list(String kind, List<Value> items, int depth) {
        StringBuilder sb = new StringBuilder("{\"t\":\"list\",\"kind\":").append(quote(kind))
            .append(",\"n\":").append(items.size()).append(",\"v\":[");
        for (int i = 0; i < items.size() && i < MAX_ITEMS; i++) {
            if (i > 0) sb.append(',');
            sb.append(val(items.get(i), depth + 1));
        }
        return sb.append("]}").toString();
    }

    static String map(List<Value[]> entries, int depth) {
        StringBuilder sb = new StringBuilder("{\"t\":\"map\",\"n\":").append(entries.size()).append(",\"v\":[");
        for (int i = 0; i < entries.size() && i < MAX_ITEMS; i++) {
            if (i > 0) sb.append(',');
            sb.append('[').append(val(entries.get(i)[0], depth + 1)).append(',')
              .append(val(entries.get(i)[1], depth + 1)).append(']');
        }
        return sb.append("]}").toString();
    }

    static List<Value> slice(Value array, int from, int to) {
        if (!(array instanceof ArrayReference) || to <= from) return new ArrayList<>();
        ArrayReference a = (ArrayReference) array;
        to = Math.min(to, a.length());
        return to <= from ? new ArrayList<>() : new ArrayList<>(a.getValues(from, to - from));
    }

    static void treeEntries(Value entry, List<Value[]> into) {
        if (!(entry instanceof ObjectReference) || into.size() > MAX_ITEMS) return;
        ObjectReference e = (ObjectReference) entry;
        treeEntries(field(e, "left"), into);
        into.add(new Value[]{field(e, "key"), field(e, "value")});
        treeEntries(field(e, "right"), into);
    }

    static List<Value[]> mapEntries(ObjectReference m) {
        List<Value[]> entries = new ArrayList<>();
        String cn = m.referenceType().name();
        if (cn.equals("java.util.TreeMap")) {
            treeEntries(field(m, "root"), entries);
        } else if (cn.equals("java.util.LinkedHashMap")) {
            Value e = field(m, "head");
            while (e instanceof ObjectReference && entries.size() <= MAX_ITEMS) {
                ObjectReference n = (ObjectReference) e;
                entries.add(new Value[]{field(n, "key"), field(n, "value")});
                e = field(n, "after");
            }
        } else {
            Value table = field(m, "table");
            if (table instanceof ArrayReference) {
                for (Value bucket : ((ArrayReference) table).getValues()) {
                    Value e = bucket;
                    while (e instanceof ObjectReference && entries.size() <= MAX_ITEMS) {
                        ObjectReference n = (ObjectReference) e;
                        entries.add(new Value[]{field(n, "key"), field(n, "value")});
                        e = field(n, "next");
                    }
                }
            }
        }
        return entries;
    }

    static String val(Value v, int depth) {
        if (v == null) return "null";
        if (v instanceof BooleanValue) return Boolean.toString(((BooleanValue) v).value());
        if (v instanceof CharValue) return str(String.valueOf(((CharValue) v).value()));
        if (v instanceof FloatValue || v instanceof DoubleValue) {
            double d = ((PrimitiveValue) v).doubleValue();
            return Double.isNaN(d) || Double.isInfinite(d) ? obj(Double.toString(d)) : Double.toString(d);
        }
        if (v instanceof PrimitiveValue) return Long.toString(((PrimitiveValue) v).longValue());
        if (v instanceof StringReference) return str(((StringReference) v).value());

        ObjectReference o = (ObjectReference) v;
        if (nodeKind(o) != null) return "{\"t\":\"ref\",\"id\":" + quote(node(o)) + "}";
        if (depth >= MAX_DEPTH) return obj("…");
        if (v instanceof ArrayReference) return list("list", ((ArrayReference) v).getValues(), depth);

        String cn = o.referenceType().name();
        switch (cn) {
            case "java.lang.Integer": case "java.lang.Long": case "java.lang.Short": case "java.lang.Byte":
            case "java.lang.Double": case "java.lang.Float": case "java.lang.Boolean": case "java.lang.Character":
                return val(field(o, "value"), depth);
            case "java.util.ArrayList":
                return list("list", slice(field(o, "elementData"), 0, intField(o, "size")), depth);
            case "java.util.Stack": case "java.util.Vector":
                return list("stack", slice(field(o, "elementData"), 0, intField(o, "elementCount")), depth);
            case "java.util.PriorityQueue":
                return list("heap", slice(field(o, "queue"), 0, intField(o, "size")), depth);
            case "java.util.ArrayDeque": {
                List<Value> items = new ArrayList<>();
                Value elements = field(o, "elements");
                if (elements instanceof ArrayReference) {
                    ArrayReference a = (ArrayReference) elements;
                    int tail = intField(o, "tail");
                    for (int i = intField(o, "head"); i != tail && a.length() > 0; i = (i + 1) % a.length()) {
                        items.add(a.getValue(i));
                    }
                }
                return list("deque", items, depth);
            }
            case "java.util.LinkedList": {
                List<Value> items = new ArrayList<>();
                Value n = field(o, "first");
                while (n instanceof ObjectReference && items.size() <= MAX_ITEMS) {
                    items.add(field((ObjectReference) n, "item"));
                    n = field((ObjectReference) n, "next");
                }
                return list("deque", items, depth);
            }
            case "java.util.HashMap": case "java.util.LinkedHashMap": case "java.util.TreeMap":
                return map(mapEntries(o), depth);
            case "java.util.HashSet": case "java.util.LinkedHashSet": case "java.util.TreeSet": {
                Value backing = field(o, cn.equals("java.util.TreeSet") ? "m" : "map");
                List<Value> keys = new ArrayList<>();
                if (backing instanceof ObjectReference) {
                    for (Value[] e : mapEntries((ObjectReference) backing)) keys.add(e[0]);
                }
                return list("set", keys, depth);
            }
            case "java.lang.StringBuilder": case "java.lang.StringBuffer": {
                List<Value> bytes = slice(field(o, "value"), 0, Integer.MAX_VALUE);
                int count = intField(o, "count"), coder = intField(o, "coder");
                StringBuilder text = new StringBuilder();
                for (int i = 0; i < count; i++) {
                    if (coder == 0) {
                        text.append((char) (((PrimitiveValue) bytes.get(i)).byteValue() & 0xff));
                    } else {
                        int lo = ((PrimitiveValue) bytes.get(2 * i)).byteValue() & 0xff;
                        int hi = ((PrimitiveValue) bytes.get(2 * i + 1)).byteValue() & 0xff;
                        text.append((char) (lo | (hi << 8)));
                    }
                }
                return str(text.toString());
            }
            default:
                return obj(cn.substring(cn.lastIndexOf('.') + 1));
        }
    }

    static String quote(String s) {
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.append('"').toString();
    }
}
