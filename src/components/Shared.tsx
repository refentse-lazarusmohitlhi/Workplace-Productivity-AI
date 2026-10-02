import { ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
