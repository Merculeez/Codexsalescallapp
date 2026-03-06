"use client";

import { useState } from "react";
import { DEFAULT_RATES, TOPICS, Topic } from "@/lib/topics";

export interface Settings {
  enabledTopicIds: string[];
  failBehavior: "show-missed" | "flag-review";
  trackRep: boolean;
  customKeywords: Record<string, string[]>;
  activeRates: number[];
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

  const toggleTopic = (id: string) => {
    setLocal((prev) => ({
      ...prev,
      enabledTopicIds: prev.enabledTopicIds.includes(id)
        ? prev.enabledTopicIds.filter((t) => t !== id)
        : [...prev.enabledTopicIds, id],
    }));
  };

  const toggleRate = (rate: number) => {
    setLocal((prev) => ({
      ...prev,
      activeRates: prev.activeRates.includes(rate)
        ? prev.activeRates.filter((r) => r !== rate)
        : [...prev.activeRates, rate].sort((a, b) => a - b),
    }));
  };

  const addKeyword = (topicId: string) => {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[#111118] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-sm font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white">✕</button>
        </div>

        <div className="flex border-b border-white/10 shrink-0">
          {(["topics", "keywords", "behavior"] as Tab[]).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2.5 text-xs font-semibold ${tab === id ? "text-white border-b-2 border-white" : "text-white/30"}`}
            >
              {id[0].toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {tab === "topics" && (
            <>
              <p className="text-xs text-white/30">Enable required topics and choose which hourly rates count as valid disclosures.</p>
              <div className="space-y-2">
                {TOPICS.map((topic: Topic) => (
                  <label key={topic.id} className="flex items-center gap-3 text-sm text-white/80 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                    <input type="checkbox" checked={local.enabledTopicIds.includes(topic.id)} onChange={() => toggleTopic(topic.id)} />
                    {topic.label}
                  </label>
                ))}
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-semibold text-white/50 mb-2">Active Rate Tiers</p>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_RATES.map((rate) => (
                    <label key={rate} className="text-xs text-white/70 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5">
                      <input
                        className="mr-1"
                        type="checkbox"
                        checked={local.activeRates.includes(rate)}
                        onChange={() => toggleRate(rate)}
                      />
                      ${rate}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "keywords" && (
            <div className="space-y-4">
              {TOPICS.map((topic) => (
                <div key={topic.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-white mb-2">{topic.label}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(local.customKeywords[topic.id] ?? []).map((kw) => (
                      <button
                        key={kw}
                        onClick={() =>
                          setLocal((prev) => ({
                            ...prev,
                            customKeywords: {
                              ...prev.customKeywords,
                              [topic.id]: (prev.customKeywords[topic.id] ?? []).filter((k) => k !== kw),
                            },
                          }))
                        }
                        className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                      >
                        {kw} ✕
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newKw[topic.id] ?? ""}
                      onChange={(e) => setNewKw((prev) => ({ ...prev, [topic.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addKeyword(topic.id)}
                      placeholder="Add keyword"
                      className="flex-1 rounded-lg bg-black/20 border border-white/10 px-2 py-1 text-xs"
                    />
                    <button onClick={() => addKeyword(topic.id)} className="text-xs px-2 rounded bg-white text-black">
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "behavior" && (
            <div className="space-y-4">
              <label className="block text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={local.trackRep}
                  onChange={() => setLocal((prev) => ({ ...prev, trackRep: !prev.trackRep }))}
                  className="mr-2"
                />
                Track call metadata (rep/customer/date)
              </label>
              <div className="space-y-2 text-sm">
                <label className="block text-white/70">
                  <input
                    type="radio"
                    name="fail"
                    checked={local.failBehavior === "show-missed"}
                    onChange={() => setLocal((prev) => ({ ...prev, failBehavior: "show-missed" }))}
                    className="mr-2"
                  />
                  Show missed topics
                </label>
                <label className="block text-white/70">
                  <input
                    type="radio"
                    name="fail"
                    checked={local.failBehavior === "flag-review"}
                    onChange={() => setLocal((prev) => ({ ...prev, failBehavior: "flag-review" }))}
                    className="mr-2"
                  />
                  Flag for manager review
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2 rounded border border-white/10 text-white/70">Cancel</button>
          <button
            onClick={() => {
              onSave(local);
              onClose();
            }}
            className="flex-1 py-2 rounded bg-white text-black font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
