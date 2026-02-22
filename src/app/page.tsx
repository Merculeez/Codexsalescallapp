"use client";

import { useState, useCallback } from "react";
import UploadForm from "@/components/UploadForm";
import ChecklistCards from "@/components/ChecklistCards";
import TranscriptViewer from "@/components/TranscriptViewer";
import ScoreBanner from "@/components/ScoreBanner";
import SettingsPanel, { Settings } from "@/components/SettingsPanel";
import HistorySidebar from "@/components/HistorySidebar";
import CallNotes from "@/components/CallNotes";
import AudioPlayer from "@/components/AudioPlayer";
import { analyzeTranscript, TopicResult, TOPICS } from "@/lib/topics";
import { saveCall, loadHistory, CallRecord, makeId } from "@/lib/history";

const DEFAULT_SETTINGS: Settings = {
  enabledTopicIds: TOPICS.map((t) => t.id),
  failBehavior: "show-missed",
  trackRep: false,
  customKeywords: {},
};

export default function Home() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [results, setResults] = useState<TopicResult[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [notes, setNotes] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<CallRecord[]>(() => loadHistory());

  // Rep tracking fields
  const [repName, setRepName] = useState("");
  const [callDate, setCallDate] = useState(new Date().toISOString().slice(0, 10));

  const handleTranscript = useCallback((text: string, file?: File) => {
    setTranscript(text);
    if (file) setAudioFile(file);
    const allResults = analyzeTranscript(text, settings.customKeywords);
    const filtered = allResults.filter((r) => settings.enabledTopicIds.includes(r.topic.id));
    setResults(filtered);
    setActiveTopicId(null);
    setNotes("");
    setSaved(false);
  }, [settings]);

  function handleTopicClick(id: string) {
    setActiveTopicId((prev) => (prev === id ? null : id));
  }

  function handleReset() {
    setTranscript(null);
    setResults([]);
    setActiveTopicId(null);
    setAudioFile(null);
    setNotes("");
    setSaved(false);
  }

  function handleSaveCall() {
    if (!transcript) return;
    const passed = results.filter((r) => r.passed).length;
    const score = Math.round((passed / results.length) * 100);
    const record: CallRecord = {
      id: makeId(),
      date: new Date().toISOString(),
      repName,
      callDate,
      transcript,
      results,
      notes,
      score,
      passed: score === 100,
    };
    saveCall(record);
    setHistory(loadHistory());
    setSaved(true);
  }

  function handleSelectHistory(record: CallRecord) {
    setTranscript(record.transcript);
    setResults(record.results);
    setNotes(record.notes);
    setRepName(record.repName);
    setCallDate(record.callDate);
    setActiveTopicId(null);
    setSaved(true);
    setAudioFile(null);
  }

  function handleDeleteHistory(id: string) {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }

  function copySummary() {
    if (!results.length) return;
    const passed = results.filter((r) => r.passed).length;
    const score = Math.round((passed / results.length) * 100);
    const lines = [
      `CodeX Sales Call Review`,
      repName ? `Rep: ${repName}` : "",
      callDate ? `Date: ${callDate}` : "",
      `Score: ${score}% (${passed}/${results.length} topics)`,
      "",
      ...results.map((r) => `${r.passed ? "✓" : "✗"} ${r.topic.label}${r.passed ? ` — ${r.matches.slice(0, 3).join(", ")}` : " — NOT COVERED"}`),
      notes ? `\nNotes: ${notes}` : "",
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function printReport() {
    window.print();
  }

  const failedTopics = results.filter((r) => !r.passed);
  const showFlagBanner = settings.failBehavior === "flag-review" && failedTopics.length > 0 && !!transcript;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {showSettings && (
        <SettingsPanel settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)} />
      )}
      {showHistory && (
        <HistorySidebar
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
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

        <div className="flex items-center gap-2">
          {transcript && (
            <button onClick={handleReset} className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition">
              New Call
            </button>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="relative flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </header>

      {/* Flag banner */}
      {showFlagBanner && (
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 print:hidden">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          <p className="text-amber-400 text-xs font-medium">
            Flagged for manager review — {failedTopics.map((r) => r.topic.label).join(", ")} not covered.
          </p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!transcript ? (
          /* ── Upload screen ── */
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Call Quality Dashboard</h2>
              <p className="text-white/40 text-sm">
                Upload a recording or paste a transcript to check compliance across all required topics.
              </p>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              {TOPICS.filter((t) => settings.enabledTopicIds.includes(t.id)).map((topic) => (
                <div key={topic.id} className={`flex items-center gap-2 text-xs ${topic.color}`}>
                  <span className={`w-2 h-2 rounded-full ${topic.bgColor} border ${topic.borderColor}`} />
                  {topic.label}
                </div>
              ))}
            </div>

            {settings.trackRep && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Call Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Rep Name</label>
                    <input type="text" value={repName} onChange={(e) => setRepName(e.target.value)} placeholder="e.g. John Smith"
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 placeholder-white/20 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Call Date</label>
                    <input type="date" value={callDate} onChange={(e) => setCallDate(e.target.value)}
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-white/30" />
                  </div>
                </div>
              </div>
            )}

            <UploadForm
              onTranscript={(text, file) => handleTranscript(text, file)}
              onAnalyzing={setAnalyzing}
            />

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
            {/* Rep badge */}
            {(repName || callDate) && (
              <div className="flex items-center gap-3 flex-wrap">
                {repName && (
                  <span className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    Rep: <span className="text-white font-medium">{repName}</span>
                  </span>
                )}
                {callDate && (
                  <span className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    Date: <span className="text-white font-medium">{callDate}</span>
                  </span>
                )}
              </div>
            )}

            {/* Score banner */}
            <ScoreBanner results={results} />

            {/* Action bar */}
            <div className="flex items-center gap-2 flex-wrap print:hidden">
              <button
                onClick={copySummary}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Summary
                  </>
                )}
              </button>

              <button
                onClick={printReport}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / PDF
              </button>

              <button
                onClick={handleSaveCall}
                disabled={saved}
                className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition ${
                  saved
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 cursor-default"
                    : "text-white/50 hover:text-white border-white/10 hover:border-white/20"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saved ? "Saved to History" : "Save to History"}
              </button>
            </div>

            {/* Audio player */}
            {audioFile && <AudioPlayer file={audioFile} />}

            {/* Checklist cards */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3 print:hidden">
                Click a card to highlight in transcript
              </p>
              <ChecklistCards results={results} activeTopicId={activeTopicId} onTopicClick={handleTopicClick} />
            </div>

            {/* Transcript */}
            <TranscriptViewer transcript={transcript} results={results} activeTopicId={activeTopicId} />

            {/* Notes */}
            <CallNotes notes={notes} onChange={setNotes} />

            <p className="text-center text-white/20 text-xs pb-4 print:hidden">
              Click any card above to jump to those keywords in the transcript
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
