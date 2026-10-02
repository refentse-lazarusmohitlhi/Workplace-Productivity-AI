import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { PageHeader, Disclaimer, Markdown, ErrorBox } from "@/components/Shared";
import { streamAI } from "@/lib/ai-client";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace Productivity Assistant" },
      { name: "description", content: "Summarise articles, URLs and topics into key insights and recommendations." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Summarise articles, URLs and topics into key insights and recommendations." },
    ],
  }),
  component: Research,
});

type Mode = "topic" | "article" | "url";
const field = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

function Research() {
  const [mode, setMode] = useState<Mode>("article");
  const [text, setText] = useState("");
  const [focus, setFocus] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const normUrl = (t: string) => (/^https?:\/\//i.test(t.trim()) ? t.trim() : "https://" + t.trim());
  const valid = mode === "url" ? /^https?:\/\/\S+\.\S+/.test(normUrl(text)) : text.trim().length > 2;

  const run = async () => {
    setBusy(true); setErr(""); setOut("");
    const goal = focus ? `\nMy focus / goal: ${focus}` : "";
    const content =
      mode === "topic" ? `Research topic: ${text}${goal}` :
      mode === "article" ? `Analyse this article:\n\n${text}${goal}` :
      `Analyse the web page at ${text.trim()} (its content follows).${goal}`;
    try {
      await streamAI({ mode: "research", messages: [{ role: "user", content }], url: mode === "url" ? normUrl(text) : undefined }, (d) => setOut((o) => o + d));
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <PageHeader title="AI Research Assistant" subtitle="Get summaries, key insights and recommendations from your content." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex rounded-lg bg-secondary p-1 text-sm font-medium">
            {([["article", "Paste article"], ["url", "URL"], ["topic", "Topic"]] as const).map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setText(""); }} className={`flex-1 rounded-md py-1.5 ${mode === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
          {mode === "article" ? (
            <textarea className={field} rows={12} placeholder="Paste article or document text here…" value={text} onChange={(e) => setText(e.target.value)} />
          ) : (
            <input className={field} placeholder={mode === "url" ? "https://example.com/article" : "e.g. Hybrid work best practices"} value={text} onChange={(e) => setText(e.target.value)} />
          )}
          <input className={field} placeholder="Focus (optional): e.g. implications for HR managers" value={focus} onChange={(e) => setFocus(e.target.value)} />
          <button onClick={run} disabled={busy || !valid} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-red px-4 py-2.5 text-sm font-semibold text-accent-red-foreground hover:opacity-90 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyse
          </button>
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-display font-semibold">Results</h2>
          {err && <ErrorBox message={err} />}
          {busy && !out && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</p>}
          {out ? <Markdown>{out}</Markdown> : !busy && !err && <p className="text-sm text-muted-foreground">Summary, insights and recommendations will appear here.</p>}
        </section>
      </div>
      <div className="mt-6"><Disclaimer /></div>
    </div>
  );
}
