"use client";

import { useState } from "react";
import { TOPICS, Topic, DEFAULT_RATES } from "@/lib/topics";

export interface Settings {
  enabledTopicIds: string[];
  customKeywords: Record<string, string[]>;
  activeRates: number[];
}

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

type Tab = "topics" | "rates" | "keywords";

export default function SettingsPanel({ settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Settings>(JSON.parse(JSON.stringify(settings)));
  const [tab, setTab] = useState<Tab>("topics");
  const [newKw, setNewKw] = useState<Record<string, string>>({});
  const [newRate, setNewRate] = useState("");

  function toggleTopic(id: string) {
    setLocal((prev) => ({
      ...prev,
      enabledTopicIds: prev.enabledTopicIds.includes(id)
        ? prev.enabledTopicIds.filter((t) => t !== id)
        : [...prev.enabledTopicIds, id],
    }));
  }

  function addKeyword(topicId: string) {
    const kw = (newKw[topicId] ?? "").trim().toLowerCase();
    if (!kw) return;
    setLocal((prev) => ({
      ...prev,
      customKeywords: {
        ...prev.customKeywords,
        [topicId]: [...(prev.customKeywords[topicId] ?? []).filter((k) => k !== kw), kw],
      },
    }));
    setNewKw((prev) => ({ ...prev, [topicId]: "" }));
  }

  function removeKeyword(topicId: string, kw: string) {
    setLocal((prev) => ({
      ...prev,
      customKeywords: {
        ...prev.customKeywords,
        [topicId]: (prev.customKeywords[topicId] ?? []).filter((k) => k !== kw),
      },
    }));
  }

  function addRate() {
    const n = parseInt(newRate.replace(/\D/g, ""), 10);
    if (!n || n < 50 || n > 9999) return;
    setLocal((prev) => ({
      ...prev,
      activeRates: prev.activeRates.includes(n) ? prev.activeRates : [...prev.activeRates, n].sort((a, b) => a - b),
    }));
    setNewRate("");
  }

  function removeRate(rate: number) {
    setLocal((prev) => ({
      ...prev,
      activeRates: prev.activeRates.filter((r) => r !== rate),
    }));
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "topics", label: "Topics" },
    { id: "rates", label: "Hourly Rates" },
    { id: "keywords", label: "Keywords" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-900">Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                tab === t.id
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── Tab: Topics ── */}
          {tab === "topics" && (
            <>
              <p className="text-xs text-gray-400">Select which topics must be covered on a call.</p>
              <div className="space-y-2">
                {TOPICS.map((topic: Topic) => {
                  const enabled = local.enabledTopicIds.includes(topic.id);
                  return (
                    <label
                      key={topic.id}
                      className={`
                        flex items-center gap-4 w-full rounded-xl border px-4 py-3.5 cursor-pointer
                        transition-all duration-150 select-none
                        ${enabled ? `${topic.bgColor} ${topic.borderColor}` : "bg-gray-50 border-gray-200 hover:bg-gray-100"}
                      `}
                    >
                      <input type="checkbox" checked={enabled} onChange={() => toggleTopic(topic.id)} className="sr-only" />
                      <div className={`flex items-center justify-center w-5 h-5 rounded-md border-2 shrink-0 transition-all ${enabled ? topic.borderColor : "border-gray-300"}`}>
                        {enabled && (
                          <svg className={`w-3 h-3 ${topic.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${enabled ? topic.color : "text-gray-400"}`}>{topic.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{topic.keywords.slice(0, 5).join(", ")}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {enabled ? "On" : "Off"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Tab: Rates ── */}
          {tab === "rates" && (
            <>
              <p className="text-xs text-gray-400">
                Manage the hourly rates you charge. The app will detect any of these in a transcript.
                Remove rates you don&apos;t use, or add new ones.
              </p>

              {/* Active rates list */}
              <div className="space-y-1.5">
                {local.activeRates.length === 0 && (
                  <p className="text-xs text-gray-400 italic py-4 text-center">No rates active — add one below.</p>
                )}
                {local.activeRates.map((rate) => {
                  const isDefault = DEFAULT_RATES.includes(rate);
                  return (
                    <div
                      key={rate}
                      className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">${rate}/hr</span>
                        {!isDefault && (
                          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                            Custom
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeRate(rate)}
                        className="text-gray-300 hover:text-red-500 transition"
                        title="Remove rate"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add rate input */}
              <div className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addRate()}
                    placeholder="e.g. 199"
                    min="50"
                    max="9999"
                    className="w-full rounded-xl bg-white border border-gray-200 text-gray-900 text-sm pl-7 pr-3 py-2.5 placeholder-gray-300 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
                <button
                  onClick={addRate}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition"
                >
                  Add
                </button>
              </div>
            </>
          )}

          {/* ── Tab: Keywords ── */}
          {tab === "keywords" && (
            <>
              <p className="text-xs text-gray-400">Add extra trigger words to any topic on top of the built-in ones.</p>
              <div className="space-y-4">
                {TOPICS.map((topic: Topic) => {
                  const custom = local.customKeywords[topic.id] ?? [];
                  return (
                    <div key={topic.id} className="rounded-xl bg-white border border-gray-200 overflow-hidden">
                      <div className={`px-4 py-3 border-b border-gray-100 flex items-center gap-2 ${topic.bgColor}`}>
                        <span className={`text-xs font-bold uppercase tracking-wide ${topic.color}`}>{topic.label}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {custom.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {custom.map((kw) => (
                              <span key={kw} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${topic.bgColor} ${topic.color} border ${topic.borderColor}`}>
                                {kw}
                                <button onClick={() => removeKeyword(topic.id, kw)} className="hover:opacity-70">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newKw[topic.id] ?? ""}
                            onChange={(e) => setNewKw((p) => ({ ...p, [topic.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && addKeyword(topic.id)}
                            placeholder="Add keyword, press Enter"
                            className="flex-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-xs px-3 py-2 placeholder-gray-300 focus:outline-none focus:border-blue-400"
                          />
                          <button
                            onClick={() => addKeyword(topic.id)}
                            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 text-sm font-medium transition">
            Cancel
          </button>
          <button
            onClick={() => { onSave(local); onClose(); }}
            disabled={local.enabledTopicIds.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
