import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, BookOpenText, MessagesSquare, ArrowRight } from "lucide-react";
import { PageHeader, Disclaimer } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Plan tasks, research faster and get workplace answers with AI." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Plan tasks, research faster and get workplace answers with AI." },
    ],
  }),
  component: Index,
});

const CARDS = [
  { to: "/planner", icon: CalendarClock, title: "AI Task Planner", text: "Turn your task list into a prioritised daily or weekly schedule based on urgency, importance and deadlines." },
  { to: "/research", icon: BookOpenText, title: "AI Research Assistant", text: "Paste an article, share a URL or enter a topic to get a summary, key insights and recommendations." },
  { to: "/chat", icon: MessagesSquare, title: "AI Chatbot", text: "Ask workplace questions and get practical, context-aware answers. Conversations are saved in your browser." },
] as const;

function Index() {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <section className="mb-8 overflow-hidden rounded-2xl bg-hero p-6 text-primary-foreground md:p-10">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Welcome</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Your AI workplace productivity assistant</h1>
        <p className="mt-3 max-w-2xl opacity-90">Plan smarter, understand information faster and get answers instantly — all powered by AI that responds to exactly what you give it.</p>
        <Link to="/planner" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-2.5 text-sm font-semibold text-accent-red-foreground shadow-lg transition hover:opacity-90">
          Plan my day <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
      <PageHeader title="Tools" subtitle="Choose a tool to get started." />
      <div className="grid gap-5 md:grid-cols-3">
        {CARDS.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="group rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary"><Icon className="h-5 w-5" /></span>
            <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-red">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
      <div className="mt-8"><Disclaimer /></div>
    </div>
  );
}
