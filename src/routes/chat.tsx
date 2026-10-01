import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { loadThreads, saveThreads, createThread, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace Productivity Assistant" },
      { name: "description", content: "Chat with an AI workplace assistant for practical, context-aware answers." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Chat with an AI workplace assistant for practical, context-aware answers." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };

  useEffect(() => {
    const sync = () => setThreads(loadThreads());
    sync();
    window.addEventListener("wpa-threads", sync);
    return () => window.removeEventListener("wpa-threads", sync);
  }, []);

  const newThread = () => navigate({ to: "/chat/$threadId", params: { threadId: createThread().id } });
  const remove = (id: string) => {
    const rest = loadThreads().filter((t) => t.id !== id);
    saveThreads(rest);
    if (params.threadId === id) navigate({ to: "/chat" });
  };

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col md:flex-row lg:h-screen">
      <aside className="flex max-h-48 shrink-0 flex-col border-b bg-card md:max-h-none md:w-64 md:border-b-0 md:border-r">
        <div className="p-3">
          <button onClick={newThread} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-red px-4 py-2 text-sm font-semibold text-accent-red-foreground hover:opacity-90"><Plus className="h-4 w-4" /> New chat</button>
        </div>
        <ul className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {threads.map((t) => (
            <li key={t.id} className={`group flex items-center rounded-lg text-sm ${params.threadId === t.id ? "bg-secondary text-primary" : "hover:bg-secondary"}`}>
              <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
                <MessageSquare className="h-4 w-4 shrink-0" /><span className="truncate">{t.title}</span>
              </Link>
              <button aria-label="Delete conversation" onClick={() => remove(t.id)} className="px-2 text-muted-foreground opacity-60 hover:text-accent-red group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
          {!threads.length && <li className="px-3 py-2 text-sm text-muted-foreground">No conversations yet.</li>}
        </ul>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col"><Outlet /></div>
    </div>
  );
}
