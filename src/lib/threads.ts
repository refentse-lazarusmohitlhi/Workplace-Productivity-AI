import type { Msg } from "./ai-client";

export type Thread = { id: string; title: string; updatedAt: number; messages: Msg[] };
const KEY = "wpa-threads";

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function saveThreads(t: Thread[]) {
  localStorage.setItem(KEY, JSON.stringify(t));
  window.dispatchEvent(new Event("wpa-threads"));
}
export function createThread(): Thread {
  const t: Thread = { id: crypto.randomUUID().slice(0, 8), title: "New conversation", updatedAt: Date.now(), messages: [] };
  saveThreads([t, ...loadThreads()]);
  return t;
}
