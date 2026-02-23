"use client";

import { TopicResult } from "@/lib/topics";

interface Props {
  summary: string;
  loading: boolean;
  results: TopicResult[];
}

export default function CallSummary({ summary, loading, results }: Props) {
  const priceResult    = results.find((r) => r.topic.id === "price");
  const flatrateResult = results.find((r) => r.topic.id === "flatrate");
  const insuranceResult= results.find((r) => r.topic.id === "insurance");
  const paymentResult  = results.find((r) => r.topic.id === "payment");

  const rateLabel =
    priceResult?.matches.find((m) => m.startsWith("$")) ??
    priceResult?.matches[0] ??
    null;

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gray-300" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Call Overview
          </h3>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-300 uppercase tracking-wider">AI Generated</span>
      </div>

      {/* Summary text */}
      <div className="px-5 py-4 border-b border-gray-100 min-h-[64px] flex items-center">
        {loading ? (
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin shrink-0" />
            <p className="text-gray-400 text-sm italic">Generating summary...</p>
          </div>
        ) : summary ? (
          <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
        ) : (
          <p className="text-gray-300 text-sm italic">No summary available</p>
        )}
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
        {/* Hourly Rate */}
        <div className="px-4 py-3.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Rate Quoted
          </p>
          {priceResult?.passed ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <p className="text-blue-700 text-sm font-bold truncate">{rateLabel ?? "Detected"}</p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
              <p className="text-gray-400 text-sm">Not mentioned</p>
            </div>
          )}
        </div>

        {/* Flat Rate */}
        <div className="px-4 py-3.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Flat Rate
          </p>
          {flatrateResult?.passed ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              <p className="text-orange-700 text-sm font-bold truncate">
                {flatrateResult.matches[0] ?? "Discussed"}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
              <p className="text-gray-400 text-sm">Not this call</p>
            </div>
          )}
        </div>

        {/* Coverage */}
        <div className="px-4 py-3.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Coverage
          </p>
          {insuranceResult?.passed ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              <p className="text-teal-700 text-sm font-bold truncate">
                {insuranceResult.matches[0] ?? "Discussed"}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
              <p className="text-gray-400 text-sm">Not discussed</p>
            </div>
          )}
        </div>

        {/* Deposit */}
        <div className="px-4 py-3.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Deposit
          </p>
          {paymentResult?.passed ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <p className="text-green-700 text-sm font-bold">Card taken</p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-amber-600 text-sm">Not this call</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
