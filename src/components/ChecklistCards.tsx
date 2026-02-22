"use client";

import { TopicResult } from "@/lib/topics";

interface Props {
  results: TopicResult[];
  activeTopicId: string | null;
  onTopicClick: (id: string) => void;
}

export default function ChecklistCards({ results, activeTopicId, onTopicClick }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {results.map((result) => {
        const isActive = activeTopicId === result.topic.id;
        const { topic, passed, matches } = result;
        const missNeutral = !passed && (topic as { missNeutral?: boolean }).missNeutral;
        const missLabel = (topic as { missLabel?: string }).missLabel ?? "FAIL";

        return (
          <button
            key={topic.id}
            onClick={() => onTopicClick(topic.id)}
            className={`
              w-full text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-lg
              ${passed
                ? `${topic.bgColor} ${topic.borderColor} hover:brightness-125 shadow-black/20`
                : missNeutral
                  ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 shadow-black/20"
                  : "bg-white/5 border-white/10 hover:bg-white/8 shadow-black/20"
              }
              ${isActive ? "ring-2 ring-white/30 scale-[1.02]" : ""}
            `}
          >
            {/* Pass/Fail badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                  passed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : missNeutral
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    passed ? "bg-emerald-400" : missNeutral ? "bg-amber-400" : "bg-red-400"
                  }`}
                />
                {passed ? "PASS" : missLabel}
              </span>

              <span className="text-white/30 text-xs">
                {matches.length} match{matches.length !== 1 ? "es" : ""}
              </span>
            </div>

            {/* Topic name */}
            <p
              className={`font-semibold text-sm mb-1 ${
                passed ? topic.color : missNeutral ? "text-amber-400/60" : "text-white/50"
              }`}
            >
              {topic.label}
            </p>

            {/* Keywords / patterns found */}
            {passed && matches.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {matches.slice(0, 4).map((kw) => (
                  <span
                    key={kw}
                    className={`text-xs px-2 py-0.5 rounded-full ${topic.bgColor} ${topic.color} border ${topic.borderColor}/30`}
                  >
                    {kw}
                  </span>
                ))}
                {matches.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                    +{matches.length - 4}
                  </span>
                )}
              </div>
            )}

            {!passed && (
              <p className={`text-xs mt-1 ${missNeutral ? "text-amber-400/40" : "text-white/30"}`}>
                {missNeutral ? "No credit card taken on this call" : "Not detected in transcript"}
              </p>
            )}

            <p className={`text-xs mt-3 ${passed ? "text-white/20" : "text-white/15"}`}>
              {passed ? "Click to highlight in transcript" : missNeutral ? "" : "Topic not covered"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
