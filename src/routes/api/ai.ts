import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  mode: z.enum(["planner", "research", "chat"]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(60000) }))
    .min(1)
    .max(60),
  url: z.string().url().optional(),
});

const SYSTEM: Record<string, string> = {
  planner:
    "You are an expert workplace productivity planner. Using ONLY the user's tasks, deadlines and constraints, produce a personalised schedule. Prioritise using urgency, importance (Eisenhower matrix) and deadlines. Output Markdown: a short priority summary table (Task | Priority | Why), then the time-blocked schedule (day by day for weekly plans), then 3 concise tips specific to these tasks. Never invent tasks the user did not give.",
  research:
    "You are a rigorous research assistant. Base your answer strictly on the provided content (article text or fetched page). If only a topic is given, say you are drawing on general knowledge. Output Markdown with sections: ## Summary, ## Key Insights (bullets), ## Recommendations (actionable bullets). Do not fabricate facts or sources.",
  chat: "You are a friendly, concise workplace assistant. Give practical, context-aware answers to workplace questions (communication, productivity, management, careers, tools). Use Markdown when helpful. Ask a clarifying question if the request is ambiguous.",
};

async function fetchPage(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 WorkplaceAssistant" } });
  if (!res.ok) throw new Error(`Could not fetch URL (status ${res.status})`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40000);
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey)
          return Response.json({ error: "AI integration is not configured." }, { status: 503 });
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
        const { mode, messages, url } = parsed.data;

        const input: Record<string, unknown>[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        if (url) {
          try {
            const text = await fetchPage(url);
            input.push({ role: "user", content: `Content fetched from ${url}:\n\n${text}` });
          } catch (e) {
            return Response.json({ error: (e as Error).message }, { status: 422 });
          }
        }

        try {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            signal: request.signal,
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "openai/gpt-6-astra",
              instructions: SYSTEM[mode],
              input,
              stream: true,
              store: false,
              reasoning: { effort: "low", summary: "auto" },
              include: ["reasoning.encrypted_content"],
            }),
          });
          if (!upstream.ok) {
            const t = await upstream.text();
            let msg = "AI service error.";
            try {
              msg = JSON.parse(t)?.error?.message ?? JSON.parse(t)?.message ?? msg;
            } catch {}
            if (upstream.status === 429) msg = "Too many requests — please wait a moment and try again.";
            if (upstream.status === 402) msg = "AI credits are exhausted. Please add credits to continue.";
            return Response.json({ error: msg }, { status: upstream.status });
          }
          return new Response(upstream.body, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform" },
          });
        } catch (e) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          return Response.json({ error: "AI integration is currently unavailable." }, { status: 503 });
        }
      },
    },
  },
});
