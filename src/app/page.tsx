"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ChecklistCards from "@/components/ChecklistCards";
import TranscriptViewer from "@/components/TranscriptViewer";
import ScoreBanner from "@/components/ScoreBanner";
import { analyzeTranscript, TopicResult } from "@/lib/topics";

export default function Home() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [results, setResults] = useState<TopicResult[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function handleTranscript(text: string) {
    setTranscript(text);
    const r = analyzeTranscript(text);
    setResults(r);
    setActiveTopicId(null);
  }

  function handleTopicClick(id: string) {
    setActiveTopicId((prev) => (prev === id ? null : id));
  }

  function handleReset() {
    setTranscript(null);
    setResults([]);
    setActiveTopicId(null);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">CodeX Sales Call Analyzer</h1>
            <p className="text-xs text-white/40">Compliance &amp; quality review</p>
          </div>
        </div>

        {transcript && (
          <button
            onClick={handleReset}
            className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition"
          >
            New Call
          </button>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!transcript ? (
          /* ── Upload / Paste screen ── */
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Call Quality Dashboard</h2>
              <p className="text-white/40 text-sm">
                Upload a call recording or paste a transcript to check if the rep covered
                pricing, insurance, and payment collection.
              </p>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 flex-wrap">
              {[
                { label: "Price / Pricing", color: "bg-blue-500" },
                { label: "Insurance", color: "bg-purple-500" },
                { label: "Payment Collected", color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-white/50">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>

            <UploadForm onTranscript={handleTranscript} onAnalyzing={setAnalyzing} />

            {analyzing && (
              <div className="flex items-center justify-center gap-3 py-6">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-white/50 text-sm">Transcribing and analyzing...</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Results screen ── */
          <div className="space-y-5">
            {/* Score banner */}
            <ScoreBanner results={results} />

            {/* Checklist cards */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                Click a card to highlight in transcript
              </p>
              <ChecklistCards
                results={results}
                activeTopicId={activeTopicId}
                onTopicClick={handleTopicClick}
              />
            </div>

            {/* Transcript viewer */}
            <TranscriptViewer
              transcript={transcript}
              results={results}
              activeTopicId={activeTopicId}
            />

            <p className="text-center text-white/20 text-xs pb-4">
              Click any card above to jump to those keywords in the transcript
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
