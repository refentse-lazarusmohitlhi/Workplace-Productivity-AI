import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Loader2, Square, Briefcase } from "lucide-react";
import { Markdown, ErrorBox } from "@/components/Shared";
import { streamAI, type Msg } from "@/lib/ai-client";
import { loadThreads, saveThreads } from "@/lib/threads";

export const Route = createFileRoute("/chat/$threadId")({ component: ChatPage });

function ChatPage() {
  const { threadId } = Route.useParams();
  return <ChatWindow key={threadId} threadId={threadId} />;
}

function persist(id: string, messages: Msg[]) {
  const all = loadThreads();
  const i = all.findIndex((t) => t.id === id);
  const firstUser = messages.find((m) => m.role === "user")?.content ?? "New conversation";
  const t = { id, messages, updatedAt: Date.now(), title: firstUser.slice(0, 40) };
  if (i >= 0) all.splice(i, 1);
  saveThreads([t, ...all]);
}

function ChatWindow({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = loadThreads().find((x) => x.id === threadId);
    if (t) setMessages(t.messages);
    else persist(threadId, []);
    ta.current?.focus();
  }, [threadId]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const q = text.trim();
    if (!q || busy) return;
    const base: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(base); setText(""); setErr(""); setBusy(true);
    persist(threadId, base);
    const ac = new AbortController(); abort.current = ac;
    let answer = "";
    try {
      await streamAI({ mode: "chat", messages: base }, (d) => {
        answer += d;
        setMessages([...base, { role: "assistant", content: answer }]);
      }, ac.signal);
    } catch (e) {
      if (!ac.signal.aborted) setErr((e as Error).message);
    }
    if (answer) persist(threadId, [...base, { role: "assistant", content: answer + (ac.signal.aborted ? "\n\n_(stopped)_" : "") }]);
    setBusy(false);
    ta.current?.focus();
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {!messages.length && <p className="pt-10 text-center text-muted-foreground">Ask me anything about your work — e.g. "How do I politely decline a meeting?"</p>}
          {messages.map((m, i) => m.role === "user" ? (
            <div key={i} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div></div>
          ) : (
            <div key={i} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-red text-accent-red-foreground"><Briefcase className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1 pt-1"><Markdown>{m.content}</Markdown></div>
            </div>
          ))}
          {busy && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</div>
          )}
          {err && <ErrorBox message={err} />}
          <div ref={bottom} />
        </div>
      </div>
      <div className="border-t bg-card p-3 md:p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border bg-background p-2 focus-within:border-primary">
          <textarea ref={ta} rows={1} value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message the workplace assistant…" className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none" />
          {busy ? (
            <button aria-label="Stop" onClick={() => abort.current?.abort()} className="grid h-9 w-9 place-items-center rounded-lg bg-accent-red text-accent-red-foreground"><Square className="h-4 w-4" /></button>
          ) : (
            <button aria-label="Send" onClick={send} disabled={!text.trim()} className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"><SendHorizontal className="h-4 w-4" /></button>
          )}
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">AI responses may contain errors — review before professional use.</p>
      </div>
    </>
  );
}
