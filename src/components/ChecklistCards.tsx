"use client";

import { TopicResult } from "@/lib/topics";

interface Props {
  results: TopicResult[];
  activeTopicId: string | null;
  onTopicClick: (id: string) => void;
}

export default function ChecklistCards({ results, activeTopicId, onTopicClick }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {results.map((result) => {
        const isActive = activeTopicId === result.topic.id;
        const { topic, passed, matches } = result;

        // Red flag topic: inverted — match = warning, no match = clean
        const isRedFlag = topic.warnOnPass && passed;
        const isClean = topic.warnOnPass && !passed;

        // Standard neutral (N/A) — not a red flag topic
        const missNeutral = !passed && topic.missNeutral && !topic.warnOnPass;
        const missLabel = topic.missLabel ?? "FAIL";

        // Determine card background
        const cardBg = isRedFlag
          ? "bg-red-50 border-red-200 hover:bg-red-100"
          : isClean
            ? "bg-green-50 border-green-200"
            : passed
              ? `${topic.bgColor} ${topic.borderColor} hover:shadow-md`
              : missNeutral
                ? "bg-amber-50 border-amber-200 hover:bg-amber-100"
                : "bg-gray-50 border-gray-200 hover:bg-red-50 hover:border-red-200";

        // Determine badge
        const badgeBg = isRedFlag
          ? "bg-red-100 text-red-700 border-red-200"
          : isClean
            ? "bg-green-100 text-green-700 border-green-200"
            : passed
              ? "bg-green-100 text-green-700 border-green-200"
              : missNeutral
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-red-100 text-red-700 border-red-200";

        const dotColor = isRedFlag
          ? "bg-red-500"
          : isClean
            ? "bg-green-500"
            : passed
              ? "bg-green-500"
              : missNeutral
                ? "bg-amber-500"
                : "bg-red-500";

        const badgeLabel = isRedFlag
          ? "RED FLAG"
          : isClean
            ? "CLEAN"
            : passed
              ? "PASS"
              : missLabel;

        const labelColor = isRedFlag
          ? "text-red-600"
          : isClean
            ? "text-green-600"
            : passed
              ? topic.color
              : missNeutral
                ? "text-amber-600"
                : "text-gray-400";

        const subtext = isRedFlag
          ? "Unusual commitment detected — review before move"
          : isClean
            ? "No unusual promises detected"
            : passed
              ? "Click to highlight in transcript"
              : missNeutral
                ? topic.id === "payment"
                  ? "No card taken on this call"
                  : "Not applicable to this call"
                : "Not detected in transcript";

        return (
          <button
            key={topic.id}
            onClick={() => onTopicClick(topic.id)}
            className={`
              w-full text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-sm
              ${cardBg}
              ${isActive ? "ring-2 ring-gray-900/20 scale-[1.02]" : ""}
            `}
          >
            {/* Pass/Fail/Flag badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                {badgeLabel}
              </span>

              <span className="text-gray-400 text-xs">
                {matches.length} match{matches.length !== 1 ? "es" : ""}
              </span>
            </div>

            {/* Topic name */}
            <p className={`font-semibold text-sm mb-1 ${labelColor}`}>
              {topic.label}
            </p>

            {/* Keywords found */}
            {passed && matches.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {matches.slice(0, 4).map((kw) => (
                  <span
                    key={kw}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isRedFlag
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : `${topic.bgColor} ${topic.color} border ${topic.borderColor}`
                    }`}
                  >
                    {kw}
                  </span>
                ))}
                {matches.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    +{matches.length - 4}
                  </span>
                )}
              </div>
            )}

            <p className={`text-xs mt-3 ${isRedFlag ? "text-red-400" : passed ? "text-gray-400" : "text-gray-300"}`}>
              {subtext}
            </p>
          </button>
        );
      })}
    </div>
  );
}
