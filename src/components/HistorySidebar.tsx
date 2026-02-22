"use client";

import { CallRecord, deleteCall } from "@/lib/history";
import { useState } from "react";

interface Props {
  history: CallRecord[];
  onSelect: (record: CallRecord) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function HistorySidebar({ history, onSelect, onDelete, onClose }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleDelete(id: string) {
    deleteCall(id);
    onDelete(id);
    setConfirmDelete(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar */}
      <div className="relative ml-auto w-full max-w-sm h-full bg-[#111118] border-l border-white/10 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">Call History</h2>
            <p className="text-xs text-white/30">{history.length} call{history.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 px-3"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-white/20 text-sm">No calls saved yet</p>
            </div>
          ) : (
            history.map((record) => {
              const pct = record.score;
              const grade =
                pct === 100 ? "text-emerald-400"
                : pct >= 67  ? "text-blue-400"
                : pct >= 33  ? "text-amber-400"
                : "text-red-400";

              return (
                <div
                  key={record.id}
                  className="group relative rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all overflow-hidden"
                >
                  <button
                    className="w-full text-left px-4 py-3.5"
                    onClick={() => { onSelect(record); onClose(); }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {record.repName || "Unknown Rep"}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">
                          {record.callDate || new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${grade}`}>
                        {pct}%
                      </span>
                    </div>

                    {/* Topic pills */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {record.results.map((r) => (
                        <span
                          key={r.topic.id}
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            r.passed
                              ? `${r.topic.bgColor} ${r.topic.color} ${r.topic.borderColor}/30`
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {r.passed ? "✓" : "✗"} {r.topic.label}
                        </span>
                      ))}
                    </div>

                    {record.notes && (
                      <p className="text-xs text-white/30 mt-2 italic truncate">
                        "{record.notes}"
                      </p>
                    )}
                  </button>

                  {/* Delete button */}
                  {confirmDelete === record.id ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                      <p className="text-xs text-red-400 flex-1">Delete this call?</p>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-xs text-red-400 font-semibold hover:text-red-300"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-white/30 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(record.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-white/20 hover:text-red-400"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
