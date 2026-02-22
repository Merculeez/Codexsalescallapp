"use client";

import { useState, useCallback } from "react";
import UploadForm from "@/components/UploadForm";
import ChecklistCards from "@/components/ChecklistCards";
import TranscriptViewer from "@/components/TranscriptViewer";
import ScoreBanner from "@/components/ScoreBanner";
import SettingsPanel, { Settings } from "@/components/SettingsPanel";
import HistorySidebar from "@/components/HistorySidebar";
import CallNotes from "@/components/CallNotes";
import CallSummary from "@/components/CallSummary";
import AudioPlayer from "@/components/AudioPlayer";
import { analyzeTranscript, TopicResult, TOPICS } from "@/lib/topics";
import { saveCall, loadHistory, updateCallNotes, CallRecord, makeId } from "@/lib/history";

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
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [repName, setRepName] = useState("");
  const [callDate, setCallDate] = useState(new Date().toISOString().slice(0, 10));

  const handleTranscript = useCallback(
    async (text: string, file?: File) => {
      setTranscript(text);
      if (file) setAudioFile(file);
      const allResults = analyzeTranscript(text, settings.customKeywords);
      const filtered = allResults.filter((r) => settings.enabledTopicIds.includes(r.topic.id));
      setResults(filtered);
      setActiveTopicId(null);
      setNotes("");
      setSaved(false);
      setCurrentCallId(null);
      setSummary("");

      // Generate AI summary in background
      setSummaryLoading(true);
      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text }),
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary ?? "");
        }
      } catch {
        // Summary is non-critical; silently fail
      } finally {
        setSummaryLoading(false);
      }
    },
    [settings]
  );

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
    setCurrentCallId(null);
    setSummary("");
    setSummaryLoading(false);
  }

  function handleSaveCall(): string | null {
    if (!transcript) return null;
    const passed = results.filter((r) => r.passed).length;
    const score = Math.round((passed / (results.length || 1)) * 100);
    const id = makeId();
    const record: CallRecord = {
      id,
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
    setCurrentCallId(id);
    return id;
  }

  function handleSaveNotes() {
    if (!transcript) return;
    if (currentCallId) {
      // Call already in history — just update notes
      updateCallNotes(currentCallId, notes);
      setHistory(loadHistory());
    } else {
      // Not saved yet — save full call (which includes current notes)
      handleSaveCall();
    }
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
    setCurrentCallId(record.id);
    setSummary("");
    setSummaryLoading(false);
  }

  function handleDeleteHistory(id: string) {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    if (currentCallId === id) setCurrentCallId(null);
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
      ...results.map(
        (r) =>
          `${r.passed ? "✓" : "✗"} ${r.topic.label}${
            r.passed ? ` — ${r.matches.slice(0, 3).join(", ")}` : " — NOT COVERED"
          }`
      ),
      notes ? `\nNotes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function printReport() {
    window.print();
  }

  const failedTopics = results.filter((r) => !r.passed);
  const showFlagBanner =
    settings.failBehavior === "flag-review" && failedTopics.length > 0 && !!transcript;

  return (
    <main className="min-h-screen bg-[#08080f] text-white">
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showHistory && (
        <HistorySidebar
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* ── Gradient Header ── */}
      <header className="relative border-b border-white/8 px-4 sm:px-6 py-4 flex items-center justify-between print:hidden overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/70 via-slate-900/80 to-indigo-950/70 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

        {/* Logo + title */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">CodeX Sales Analyzer</h1>
            <p className="text-xs text-white/40">Compliance &amp; quality review</p>
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex items-center gap-2">
          {transcript && (
            <button
              onClick={handleReset}
              className="text-xs text-white/40 hover:text-white/80 border border-white/10 hover:border-violet-500/40 rounded-lg px-3 py-1.5 transition-all duration-150"
            >
              New Call
            </button>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="relative flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 border border-white/10 hover:border-violet-500/40 rounded-lg px-3 py-1.5 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold shadow shadow-violet-500/40">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 border border-white/10 hover:border-violet-500/40 rounded-lg px-3 py-1.5 transition-all duration-150"
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
            Flagged for manager review —{" "}
            {failedTopics.map((r) => r.topic.label).join(", ")} not covered.
          </p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!transcript ? (
          /* ── Upload screen ── */
          <div className="max-w-xl mx-auto space-y-8">
            {/* Hero */}
            <div className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 text-xs text-violet-400/70 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                AI-Powered Call Analysis
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">
                Sales Call{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Quality Review
                </span>
              </h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
                Upload a recording or paste a transcript. We&apos;ll analyze rate disclosure,
                coverage discussion, and deposit collection in seconds.
              </p>
            </div>

            {/* Topic chips */}
            <div className="flex justify-center gap-3 flex-wrap">
              {TOPICS.filter((t) => settings.enabledTopicIds.includes(t.id)).map((topic) => (
                <div
                  key={topic.id}
                  className={`flex items-center gap-2 text-xs ${topic.color} bg-white/5 border border-white/10 rounded-full px-3 py-1.5`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${topic.bgColor} border ${topic.borderColor}`} />
                  {topic.label}
                </div>
              ))}
            </div>

            {/* Rep tracking fields */}
            {settings.trackRep && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 shadow-lg shadow-black/20">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Call Info
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Rep Name</label>
                    <input
                      type="text"
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Call Date</label>
                    <input
                      type="date"
                      value={callDate}
                      onChange={(e) => setCallDate(e.target.value)}
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-violet-500/50 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            <UploadForm
              onTranscript={(text, file) => handleTranscript(text, file)}
              onAnalyzing={setAnalyzing}
            />

            {analyzing && (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-violet-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-white/50 text-sm">Transcribing and analyzing...</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Results screen ── */
          <div className="space-y-5 animate-fade-in-up">
            {/* Rep badge */}
            {(repName || callDate) && (
              <div className="flex items-center gap-3 flex-wrap">
                {repName && (
                  <span className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    Rep:{" "}
                    <span className="text-white font-semibold">{repName}</span>
                  </span>
                )}
                {callDate && (
                  <span className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    Date:{" "}
                    <span className="text-white font-semibold">{callDate}</span>
                  </span>
                )}
                {saved && (
                  <span className="text-xs text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                    ✓ Saved to history
                  </span>
                )}
              </div>
            )}

            {/* Score banner */}
            <ScoreBanner results={results} />

            {/* AI Call Summary + Key Metrics */}
            <CallSummary summary={summary} loading={summaryLoading} results={results} />

            {/* Action bar */}
            <div className="flex items-center gap-2 flex-wrap print:hidden">
              <button
                onClick={copySummary}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Summary
                  </>
                )}
              </button>

              <button
                onClick={printReport}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / PDF
              </button>

              <button
                onClick={handleSaveCall}
                disabled={saved}
                className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition ${
                  saved
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 cursor-default"
                    : "text-white/50 hover:text-white border-white/10 hover:border-white/25"
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
              <p className="text-xs text-white/25 uppercase tracking-widest mb-3 font-semibold print:hidden">
                Compliance Checklist — click any card to highlight
              </p>
              <ChecklistCards
                results={results}
                activeTopicId={activeTopicId}
                onTopicClick={handleTopicClick}
              />
            </div>

            {/* Transcript */}
            <TranscriptViewer
              transcript={transcript}
              results={results}
              activeTopicId={activeTopicId}
            />

            {/* Coaching notes with save button */}
            <CallNotes notes={notes} onChange={setNotes} onSave={handleSaveNotes} />

            <p className="text-center text-white/15 text-xs pb-4 print:hidden">
              Click any checklist card to jump to matching keywords in the transcript
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
