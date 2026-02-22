"use client";

import { TopicResult } from "@/lib/topics";

interface Props {
  results: TopicResult[];
}

export default function ScoreBanner({ results }: Props) {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const pct = Math.round((passed / total) * 100);

  const grade =
    pct === 100 ? { label: "EXCELLENT", color: "text-emerald-400", ring: "ring-emerald-500" }
    : pct >= 67   ? { label: "GOOD", color: "text-blue-400", ring: "ring-blue-500" }
    : pct >= 33   ? { label: "NEEDS WORK", color: "text-amber-400", ring: "ring-amber-500" }
    :               { label: "FAILED", color: "text-red-400", ring: "ring-red-500" };

  return (
    <div className="flex items-center gap-6 rounded-2xl bg-white/5 border border-white/10 px-6 py-5">
      {/* Circle score */}
      <div
        className={`relative flex items-center justify-center w-20 h-20 rounded-full ring-4 ${grade.ring} bg-black/30 shrink-0`}
      >
        <span className={`text-2xl font-black ${grade.color}`}>{pct}%</span>
      </div>

      <div className="flex-1">
        <p className={`text-xs font-bold tracking-widest uppercase ${grade.color} mb-0.5`}>
          {grade.label}
        </p>
        <p className="text-white text-xl font-semibold">
          {passed} of {total} topics covered
        </p>
        <p className="text-white/40 text-sm mt-0.5">
          {results
            .filter((r) => !r.passed)
            .map((r) => r.topic.label)
            .join(", ") || "All topics addressed — great call!"}
        </p>
      </div>

      {/* Progress bar */}
      <div className="hidden sm:block w-40">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              pct === 100 ? "bg-emerald-500" : pct >= 67 ? "bg-blue-500" : pct >= 33 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-white/30 text-xs mt-1 text-right">{pct}% score</p>
      </div>
    </div>
  );
}
