"use client";

import { getScoreMetrics, TopicResult } from "@/lib/topics";

interface Props {
  results: TopicResult[];
}

export default function ScoreBanner({ results }: Props) {
  const { passed, total, pct } = getScoreMetrics(results);
  const redFlags = results.filter((r) => r.topic.warnOnPass && r.passed);

  const grade =
    pct === 100 ? { label: "EXCELLENT", color: "text-emerald-400", ring: "ring-emerald-500" }
    : pct >= 67 ? { label: "GOOD", color: "text-blue-400", ring: "ring-blue-500" }
    : pct >= 33 ? { label: "NEEDS WORK", color: "text-amber-400", ring: "ring-amber-500" }
    : { label: "FAILED", color: "text-red-400", ring: "ring-red-500" };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-6 rounded-2xl bg-white/5 border border-white/10 px-6 py-5">
        <div className={`relative flex items-center justify-center w-20 h-20 rounded-full ring-4 ${grade.ring} bg-black/30 shrink-0`}>
          <span className={`text-2xl font-black ${grade.color}`}>{pct}%</span>
        </div>

        <div className="flex-1">
          <p className={`text-xs font-bold tracking-widest uppercase ${grade.color} mb-0.5`}>{grade.label}</p>
          <p className="text-white text-xl font-semibold">{passed} of {total} required topics covered</p>
          <p className="text-white/40 text-sm mt-0.5">
            {results
              .filter((r) => !r.passed && !r.topic.warnOnPass && !r.topic.missNeutral)
              .map((r) => r.topic.label)
              .join(", ") || "All required disclosures were covered."}
          </p>
        </div>
      </div>

      {redFlags.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-300 mb-1">Unusual Commitments Detected</p>
          <p className="text-sm text-red-200">{redFlags.map((r) => r.matches.slice(0, 2).join(", ")).join(" • ")}</p>
        </div>
      )}
    </div>
  );
}
