import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { createThread } from "@/lib/threads";

export const Route = createFileRoute("/chat/")({ component: Empty });

function Empty() {
  const navigate = useNavigate();
  return (
    <div className="grid flex-1 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary"><MessagesSquare className="h-7 w-7" /></span>
        <h1 className="mt-4 font-display text-2xl font-bold">AI Workplace Chatbot</h1>
        <p className="mt-2 text-muted-foreground">Ask about emails, meetings, management, productivity and more.</p>
        <button onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: createThread().id } })} className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Start a conversation</button>
      </div>
    </div>
  );
}
