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
    pct === 100 ? { label: "EXCELLENT", color: "text-green-600",  ring: "ring-green-400",  bar: "bg-green-500" }
    : pct >= 67  ? { label: "GOOD",      color: "text-blue-600",   ring: "ring-blue-400",   bar: "bg-blue-500" }
    : pct >= 33  ? { label: "NEEDS WORK",color: "text-amber-600",  ring: "ring-amber-400",  bar: "bg-amber-500" }
    :              { label: "FAILED",    color: "text-red-600",    ring: "ring-red-400",    bar: "bg-red-500" };

  const missed = results.filter((r) => !r.passed && !r.topic.missNeutral);

  return (
    <div className="flex items-center gap-6 rounded-2xl bg-white border border-gray-200 px-6 py-5 shadow-sm">
      {/* Circle score */}
      <div className={`relative flex items-center justify-center w-20 h-20 rounded-full ring-4 ${grade.ring} bg-gray-50 shrink-0`}>
        <span className={`text-2xl font-black ${grade.color}`}>{pct}%</span>
      </div>

      <div className="flex-1">
        <p className={`text-xs font-bold tracking-widest uppercase ${grade.color} mb-0.5`}>
          {grade.label}
        </p>
        <p className="text-gray-900 text-xl font-semibold">
          {passed} of {total} topics covered
        </p>
        <p className="text-gray-400 text-sm mt-0.5">
          {missed.length === 0
            ? "All required topics addressed"
            : `Missing: ${missed.map((r) => r.topic.label).join(", ")}`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="hidden sm:block w-40">
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${grade.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-gray-400 text-xs mt-1 text-right">{pct}% score</p>
      </div>
    </div>
  );
}
