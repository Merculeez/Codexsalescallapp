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

        return (
          <button
            key={topic.id}
            onClick={() => onTopicClick(topic.id)}
            className={`
              w-full text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer
              ${passed
                ? `${topic.bgColor} ${topic.borderColor} hover:brightness-125`
                : "bg-white/5 border-white/10 hover:bg-white/10"
              }
              ${isActive ? "ring-2 ring-white/40 scale-[1.02]" : ""}
            `}
          >
            {/* Pass/Fail badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                  passed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${passed ? "bg-emerald-400" : "bg-red-400"}`} />
                {passed ? "PASS" : "FAIL"}
              </span>

              <span className="text-white/30 text-xs">
                {matches.length} mention{matches.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Topic name */}
            <p className={`font-semibold text-sm mb-1 ${passed ? topic.color : "text-white/50"}`}>
              {topic.label}
            </p>

            {/* Keywords found */}
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
              <p className="text-white/30 text-xs mt-1">Not detected in transcript</p>
            )}

            {/* Click hint */}
            <p className="text-white/20 text-xs mt-3">
              {passed ? "Click to highlight in transcript" : "Topic not covered"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
