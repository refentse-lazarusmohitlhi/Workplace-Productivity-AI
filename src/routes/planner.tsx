import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { PageHeader, Disclaimer, Markdown, ErrorBox } from "@/components/Shared";
import { streamAI } from "@/lib/ai-client";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace Productivity Assistant" },
      { name: "description", content: "Generate prioritised daily or weekly schedules from your tasks with AI." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Generate prioritised daily or weekly schedules from your tasks with AI." },
    ],
  }),
  component: Planner,
});

type Task = { id: string; title: string; deadline: string; urgency: string; importance: string; hours: string };
const KEY = "wpa-planner";
const input = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

function Planner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState({ title: "", deadline: "", urgency: "Medium", importance: "Medium", hours: "1" });
  const [range, setRange] = useState<"daily" | "weekly">("daily");
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (s.tasks) setTasks(s.tasks);
      if (s.notes) setNotes(s.notes);
      if (s.out) setOut(s.out);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ tasks, notes, out }));
  }, [tasks, notes, out, loaded]);

  const add = () => {
    if (!draft.title.trim()) return;
    setTasks((t) => [...t, { ...draft, id: crypto.randomUUID() }]);
    setDraft({ ...draft, title: "", deadline: "" });
  };

  const generate = async () => {
    setBusy(true); setErr(""); setOut("");
    const list = tasks.map((t, i) => `${i + 1}. ${t.title} — deadline: ${t.deadline || "none"}, urgency: ${t.urgency}, importance: ${t.importance}, estimated ${t.hours}h`).join("\n");
    const prompt = `Create a ${range} schedule. Today is ${new Date().toDateString()}.\n\nTasks:\n${list}\n\nWorking preferences / constraints: ${notes || "standard 9:00–17:00 working day"}`;
    try {
      await streamAI({ mode: "planner", messages: [{ role: "user", content: prompt }] }, (d) => setOut((o) => o + d));
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <PageHeader title="AI Task Planner" subtitle="Add your tasks and let AI build a prioritised schedule." />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="font-display font-semibold">Your tasks</h2>
          <input className={input} placeholder="Task, e.g. Prepare Q3 report" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-muted-foreground">Deadline<input type="date" className={input} value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} /></label>
            <label className="text-xs font-medium text-muted-foreground">Hours<input type="number" min="0.25" step="0.25" className={input} value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} /></label>
            {(["urgency", "importance"] as const).map((k) => (
              <label key={k} className="text-xs font-medium capitalize text-muted-foreground">{k}
                <select className={input} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </label>
            ))}
          </div>
          <button onClick={add} disabled={!draft.title.trim()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary disabled:opacity-50"><Plus className="h-4 w-4" /> Add task</button>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
                <div><div className="font-medium">{t.title}</div><div className="text-xs text-muted-foreground">{t.deadline || "No deadline"} · {t.urgency} urgency · {t.importance} importance · {t.hours}h</div></div>
                <button aria-label="Remove task" onClick={() => setTasks((x) => x.filter((y) => y.id !== t.id))} className="text-muted-foreground hover:text-accent-red"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
            {!tasks.length && <li className="text-sm text-muted-foreground">No tasks yet.</li>}
          </ul>
          <textarea className={input} rows={2} placeholder="Constraints (optional): e.g. meetings 10–11am, prefer deep work mornings" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex rounded-lg bg-secondary p-1 text-sm font-medium">
            {(["daily", "weekly"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`flex-1 rounded-md py-1.5 capitalize ${range === r ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>{r}</button>
            ))}
          </div>
          <button onClick={generate} disabled={busy || !tasks.length} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-red px-4 py-2.5 text-sm font-semibold text-accent-red-foreground hover:opacity-90 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate {range} schedule
          </button>
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <h2 className="mb-3 font-display font-semibold">Your schedule</h2>
          {err && <ErrorBox message={err} />}
          {busy && !out && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Planning your {range}…</p>}
          {out ? <Markdown>{out}</Markdown> : !busy && !err && <p className="text-sm text-muted-foreground">Your AI-generated schedule will appear here.</p>}
        </section>
      </div>
      <div className="mt-6"><Disclaimer /></div>
    </div>
  );
}
