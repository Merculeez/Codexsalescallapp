"use client";

import { TopicResult } from "@/lib/topics";

interface Props {
  results: TopicResult[];
}

export default function ScoreBanner({ results }: Props) {
  // Scored topics: exclude warnOnPass (red flag) and missNeutral (optional) from the compliance score
  const scored = results.filter((r) => !r.topic.warnOnPass && !r.topic.missNeutral);
  const passed = scored.filter((r) => r.passed).length;
  const total = scored.length;
  const pct = total === 0 ? 100 : Math.round((passed / total) * 100);

  // Red flag alert count (separate from score)
  const redFlags = results.filter((r) => r.topic.warnOnPass && r.passed);

  const grade =
    pct === 100 ? { label: "EXCELLENT", color: "text-green-600",  ring: "ring-green-400",  bar: "bg-green-500" }
    : pct >= 67  ? { label: "GOOD",      color: "text-blue-600",   ring: "ring-blue-400",   bar: "bg-blue-500" }
    : pct >= 33  ? { label: "NEEDS WORK",color: "text-amber-600",  ring: "ring-amber-400",  bar: "bg-amber-500" }
    :              { label: "FAILED",    color: "text-red-600",    ring: "ring-red-400",    bar: "bg-red-500" };

  const missed = scored.filter((r) => !r.passed);

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-6 px-6 py-5">
        {/* Circle score */}
        <div className={`relative flex items-center justify-center w-20 h-20 rounded-full ring-4 ${grade.ring} bg-gray-50 shrink-0`}>
          <span className={`text-2xl font-black ${grade.color}`}>{pct}%</span>
        </div>

        <div className="flex-1">
          <p className={`text-xs font-bold tracking-widest uppercase ${grade.color} mb-0.5`}>
            {grade.label}
          </p>
          <p className="text-gray-900 text-xl font-semibold">
            {passed} of {total} required topics covered
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            {missed.length === 0
              ? "All required disclosures addressed"
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

      {/* Red flag alert bar */}
      {redFlags.length > 0 && (
        <div className="flex items-center gap-2.5 px-6 py-3 bg-red-50 border-t border-red-100">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="text-red-700 text-xs font-semibold">
            {redFlags.length} unusual promise{redFlags.length > 1 ? "s" : ""} detected —{" "}
            <span className="font-normal text-red-600">
              {redFlags.flatMap((r) => r.matches).slice(0, 3).join(", ")}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
