import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, CalendarClock, BookOpenText, MessagesSquare, Menu, X, ShieldAlert, Briefcase } from "lucide-react";
import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research", label: "Research Assistant", icon: BookOpenText },
  { to: "/chat", label: "AI Chatbot", icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const active = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <div className="min-h-screen bg-background lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
        <Brand />
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-secondary">
          <Menu className="h-5 w-5" />
        </button>
      </header>
      {open && <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Brand light />
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${active(to) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="m-4 rounded-lg bg-sidebar-accent p-4 text-xs leading-relaxed">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-sidebar-primary">
            <ShieldAlert className="h-3.5 w-3.5" /> Responsible AI
          </div>
          AI-generated content may contain errors. Review it before professional use.
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function Brand({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Briefcase className="h-4.5 w-4.5" />
      </span>
      <span className={`font-display text-sm font-bold leading-tight ${light ? "" : "text-foreground"}`}>
        Workplace
        <br />
        <span className="text-primary">Productivity AI</span>
      </span>
    </Link>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm text-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-red" />
      <span>
        <strong>Disclaimer:</strong> AI-generated information may contain errors or omissions. Please review and verify it before professional use.
      </span>
    </div>
  );
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:font-display prose-a:text-primary prose-table:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <strong>AI unavailable:</strong> {message} No simulated response has been shown.
    </div>
  );
}
