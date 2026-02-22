"use client";

import { useState } from "react";
import { TOPICS, Topic } from "@/lib/topics";

export interface Settings {
  enabledTopicIds: string[];
  failBehavior: "show-missed" | "flag-review";
  trackRep: boolean;
  customKeywords: Record<string, string[]>; // topicId → extra keywords
}

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

type Tab = "topics" | "keywords" | "behavior";

export default function SettingsPanel({ settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Settings>(JSON.parse(JSON.stringify(settings)));
  const [tab, setTab] = useState<Tab>("topics");
  const [newKw, setNewKw] = useState<Record<string, string>>({});

  function toggleTopic(id: string) {
    setLocal((prev) => ({
      ...prev,
      enabledTopicIds: prev.enabledTopicIds.includes(id)
        ? prev.enabledTopicIds.filter((t) => t !== id)
        : [...prev.enabledTopicIds, id],
    }));
  }

  function setFailBehavior(v: Settings["failBehavior"]) {
    setLocal((prev) => ({ ...prev, failBehavior: v }));
  }

  function toggleTrackRep() {
    setLocal((prev) => ({ ...prev, trackRep: !prev.trackRep }));
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "topics", label: "Topics" },
    { id: "keywords", label: "Keywords" },
    { id: "behavior", label: "Behavior" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-[#111118] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/10 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                tab === t.id
                  ? "text-white border-b-2 border-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>

          {/* ── Tab: Topics ── */}
          {tab === "topics" && (
            <>
              <p className="text-xs text-white/30">Select which topics a rep must cover for a call to pass.</p>
              <div className="space-y-2">
                {TOPICS.map((topic: Topic) => {
                  const enabled = local.enabledTopicIds.includes(topic.id);
                  return (
                    <label
                      key={topic.id}
                      className={`
                        flex items-center gap-4 w-full rounded-xl border px-4 py-3.5 cursor-pointer
                        transition-all duration-150 select-none
                        ${enabled ? `${topic.bgColor} ${topic.borderColor}` : "bg-white/5 border-white/10 hover:bg-white/8"}
                      `}
                    >
                      <input type="checkbox" checked={enabled} onChange={() => toggleTopic(topic.id)} className="sr-only" />
                      <div className={`flex items-center justify-center w-5 h-5 rounded-md border-2 shrink-0 transition-all ${enabled ? topic.borderColor : "border-white/20"}`}>
                        {enabled && (
                          <svg className={`w-3 h-3 ${topic.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${enabled ? topic.color : "text-white/50"}`}>{topic.label}</p>
                        <p className="text-xs text-white/30 mt-0.5 truncate">{topic.keywords.slice(0, 5).join(", ")}…</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20"}`}>
                        {enabled ? "Required" : "Off"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Tab: Keywords ── */}
          {tab === "keywords" && (
            <>
              <p className="text-xs text-white/30">Add your own trigger words to any topic. These are added on top of the built-in keywords.</p>
              <div className="space-y-4">
                {TOPICS.map((topic: Topic) => {
                  const custom = local.customKeywords[topic.id] ?? [];
                  return (
                    <div key={topic.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      <div className={`px-4 py-3 border-b border-white/10 flex items-center gap-2 ${topic.bgColor}`}>
                        <span className={`text-xs font-bold uppercase tracking-wide ${topic.color}`}>{topic.label}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {/* Custom keyword chips */}
                        {custom.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {custom.map((kw) => (
                              <span key={kw} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${topic.bgColor} ${topic.color} border ${topic.borderColor}/30`}>
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
                        {/* Add input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newKw[topic.id] ?? ""}
                            onChange={(e) => setNewKw((p) => ({ ...p, [topic.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && addKeyword(topic.id)}
                            placeholder="Type a keyword and press Enter"
                            className="flex-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs px-3 py-2 placeholder-white/20 focus:outline-none focus:border-white/30"
                          />
                          <button
                            onClick={() => addKeyword(topic.id)}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
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

          {/* ── Tab: Behavior ── */}
          {tab === "behavior" && (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">When a Call Fails</p>
                <div className="space-y-2">
                  {([
                    { value: "show-missed" as const, label: "Show missed topics", desc: "Highlight which topics were skipped with red fail badges" },
                    { value: "flag-review" as const, label: "Flag for manager review", desc: "Show an amber review-needed banner at the top of the dashboard" },
                  ]).map((opt) => {
                    const selected = local.failBehavior === opt.value;
                    return (
                      <label key={opt.value} className={`flex items-center gap-4 w-full rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-150 select-none ${selected ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/8"}`}>
                        <input type="radio" name="failBehavior" value={opt.value} checked={selected} onChange={() => setFailBehavior(opt.value)} className="sr-only" />
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-all ${selected ? "border-white bg-white" : "border-white/20"}`}>
                          {selected && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${selected ? "text-white" : "text-white/50"}`}>{opt.label}</p>
                          <p className="text-xs text-white/30 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Call Tracking</p>
                <label className={`flex items-center gap-4 w-full rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-150 select-none ${local.trackRep ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/8"}`}>
                  <input type="checkbox" checked={local.trackRep} onChange={toggleTrackRep} className="sr-only" />
                  <div className="relative shrink-0" style={{ width: "40px", height: "22px" }}>
                    <div className={`absolute inset-0 rounded-full transition-colors duration-200 ${local.trackRep ? "bg-white" : "bg-white/20"}`} />
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-transform duration-200 ${local.trackRep ? "translate-x-5 bg-black" : "translate-x-0.5 bg-white/60"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${local.trackRep ? "text-white" : "text-white/50"}`}>Rep name &amp; call date</p>
                    <p className="text-xs text-white/30 mt-0.5">Label results by rep and date before each analysis</p>
                  </div>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition">
            Cancel
          </button>
          <button
            onClick={() => { onSave(local); onClose(); }}
            disabled={local.enabledTopicIds.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
