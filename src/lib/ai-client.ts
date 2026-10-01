export type Msg = { role: "user" | "assistant"; content: string };

export async function streamAI(
  body: { mode: "planner" | "research" | "chat"; messages: Msg[]; url?: string | undefined },
  onDelta: (text: string) => void,
  signal?: AbortSignal | undefined,
) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? "AI integration is currently unavailable.");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let got = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      for (const line of part.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === "response.output_text.delta" && ev.delta) {
            got = true;
            onDelta(ev.delta);
          } else if (ev.type === "response.failed" || ev.type === "error") {
            throw new Error(ev.response?.error?.message ?? ev.message ?? "AI request failed.");
          } else if (ev.type === "response.refusal.delta" && ev.delta) {
            got = true;
            onDelta(ev.delta);
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }
  if (!got) throw new Error("The AI returned no answer. Please try again.");
}
