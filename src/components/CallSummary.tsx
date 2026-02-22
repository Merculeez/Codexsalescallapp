"use client";

import { TopicResult } from "@/lib/topics";

interface Props {
  summary: string;
  loading: boolean;
  results: TopicResult[];
}

export default function CallSummary({ summary, loading, results }: Props) {
  const priceResult = results.find((r) => r.topic.id === "price");
  const insuranceResult = results.find((r) => r.topic.id === "insurance");
  const paymentResult = results.find((r) => r.topic.id === "payment");

  // Find the best rate label to display (prefer one with a $ sign)
  const rateLabel =
    priceResult?.matches.find((m) => m.startsWith("$")) ??
    priceResult?.matches[0] ??
    null;

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 shadow-xl shadow-black/20 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-400 to-blue-500" />
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">
            Call Overview
          </h3>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-white/25 uppercase tracking-wider">AI Generated</span>
      </div>

      {/* Summary text */}
      <div className="px-5 py-4 border-b border-white/10 min-h-[64px] flex items-center">
        {loading ? (
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-violet-400 animate-spin shrink-0" />
            <p className="text-white/40 text-sm italic">Generating summary...</p>
          </div>
        ) : summary ? (
          <p className="text-white/80 text-sm leading-relaxed">{summary}</p>
        ) : (
          <p className="text-white/25 text-sm italic">No summary available</p>
        )}
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-3 divide-x divide-white/10">
        {/* Rate */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1.5">
            Rate Quoted
          </p>
          {priceResult?.passed ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <p className="text-blue-300 text-sm font-bold truncate">{rateLabel ?? "Detected"}</p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
              <p className="text-white/30 text-sm">Not mentioned</p>
            </div>
          )}
        </div>

        {/* Coverage */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1.5">
            Coverage
          </p>
          {insuranceResult?.passed ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
              <p className="text-purple-300 text-sm font-bold truncate">
                {insuranceResult.matches[0] ?? "Discussed"}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
              <p className="text-white/30 text-sm">Not discussed</p>
            </div>
          )}
        </div>

        {/* Deposit */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1.5">
            Deposit
          </p>
          {paymentResult?.passed ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-sm font-bold">Card taken</p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400/50 shrink-0" />
              <p className="text-amber-400/70 text-sm">Not this call</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
