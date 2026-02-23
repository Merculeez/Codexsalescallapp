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
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? history.filter((r) =>
        (r.repName ?? "").toLowerCase().includes(search.trim().toLowerCase())
      )
    : history;

  function handleDelete(id: string) {
    deleteCall(id);
    onDelete(id);
    setConfirmDelete(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar */}
      <div className="relative ml-auto w-full max-w-sm h-full bg-white border-l border-gray-200 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Call History</h2>
            <p className="text-xs text-gray-400">{history.length} call{history.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search by salesman */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by salesman..."
              className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm pl-9 pr-3 py-2 placeholder-gray-300 focus:outline-none focus:border-blue-400 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-gray-400 mt-1.5 pl-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 px-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">
                {search ? "No matching calls" : "No calls saved yet"}
              </p>
            </div>
          ) : (
            filtered.map((record) => {
              const pct = record.score;
              const grade =
                pct === 100 ? "text-green-600"
                : pct >= 67  ? "text-blue-600"
                : pct >= 33  ? "text-amber-600"
                : "text-red-600";

              return (
                <div
                  key={record.id}
                  className="group relative rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden"
                >
                  <button
                    className="w-full text-left px-4 py-3.5"
                    onClick={() => { onSelect(record); onClose(); }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {record.repName || "Unknown Salesman"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
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
                              ? `${r.topic.bgColor} ${r.topic.color} ${r.topic.borderColor}`
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {r.passed ? "✓" : "✗"} {r.topic.label}
                        </span>
                      ))}
                    </div>

                    {record.notes && (
                      <p className="text-xs text-gray-400 mt-2 italic truncate">
                        &ldquo;{record.notes}&rdquo;
                      </p>
                    )}
                  </button>

                  {/* Delete button */}
                  {confirmDelete === record.id ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100">
                      <p className="text-xs text-red-600 flex-1">Delete this call?</p>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-xs text-red-600 font-semibold hover:text-red-800"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(record.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-500"
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
