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
        const missNeutral = !passed && topic.missNeutral;
        const isWarn = !!topic.warnOnPass;
        const warningState = isWarn && passed;
        const cleanWarnState = isWarn && !passed;
        const missLabel = topic.missLabel ?? "FAIL";

        return (
          <button
            key={topic.id}
            onClick={() => onTopicClick(topic.id)}
            className={`
              w-full text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-lg
              ${warningState
                ? "bg-red-500/10 border-red-500/30"
                : passed
                  ? `${topic.bgColor} ${topic.borderColor} hover:brightness-125`
                  : missNeutral
                    ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                    : "bg-white/5 border-white/10 hover:bg-white/8"
              }
              ${isActive ? "ring-2 ring-white/30 scale-[1.02]" : ""}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                  warningState
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : cleanWarnState
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : passed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : missNeutral
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                {warningState ? "RED FLAG" : cleanWarnState ? "CLEAN" : passed ? "PASS" : missLabel}
              </span>
              <span className="text-white/30 text-xs">{matches.length} match{matches.length !== 1 ? "es" : ""}</span>
            </div>

            <p className={`font-semibold text-sm mb-1 ${warningState ? "text-red-300" : passed ? topic.color : missNeutral ? "text-amber-400/60" : "text-white/50"}`}>
              {topic.label}
            </p>

            {matches.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {matches.slice(0, 4).map((kw) => (
                  <span key={kw} className={`text-xs px-2 py-0.5 rounded-full ${warningState ? "bg-red-500/20 text-red-200 border border-red-500/40" : `${topic.bgColor} ${topic.color} border ${topic.borderColor}/30`}`}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
