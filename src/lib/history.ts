import { TopicResult } from "./topics";

export interface CallRecord {
  id: string;
  date: string;         // ISO string
  repName: string;
  callDate: string;     // user-selected date
  transcript: string;
  results: TopicResult[];
  notes: string;
  score: number;        // 0-100
  passed: boolean;
}

const KEY = "codex_call_history";

export function loadHistory(): CallRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCall(record: CallRecord): void {
  const history = loadHistory();
  history.unshift(record); // newest first
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 100))); // keep last 100
}

export function deleteCall(id: string): void {
  const history = loadHistory().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}

export function updateCallNotes(id: string, notes: string): void {
  const history = loadHistory();
  const idx = history.findIndex((r) => r.id === id);
  if (idx !== -1) {
    history[idx] = { ...history[idx], notes };
    localStorage.setItem(KEY, JSON.stringify(history));
  }
}

export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
