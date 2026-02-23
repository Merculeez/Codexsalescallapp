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
import { analyzeTranscript, TopicResult, TOPICS, DEFAULT_RATES } from "@/lib/topics";
import { saveCall, loadHistory, updateCallNotes, CallRecord, makeId } from "@/lib/history";

const DEFAULT_SETTINGS: Settings = {
  enabledTopicIds: TOPICS.map((t) => t.id),
  customKeywords: {},
  activeRates: [...DEFAULT_RATES],
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
      const allResults = analyzeTranscript(text, settings.customKeywords, settings.activeRates);
      const filtered = allResults.filter((r) => settings.enabledTopicIds.includes(r.topic.id));
      setResults(filtered);
      setActiveTopicId(null);
      setNotes("");
      setSaved(false);
      setCurrentCallId(null);
      setSummary("");

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
      updateCallNotes(currentCallId, notes);
      setHistory(loadHistory());
    } else {
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
      `CYA Move Review`,
      repName ? `Salesman: ${repName}` : "",
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

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900">
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

      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between print:hidden sticky top-0 z-10">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">CYA Move Review</h1>
            <p className="text-xs text-gray-400">Call compliance &amp; dispute review</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {transcript && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5 transition-all duration-150 bg-white"
            >
              New Call
            </button>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="relative flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5 transition-all duration-150 bg-white"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5 transition-all duration-150 bg-white"
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

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!transcript ? (
          /* ── Upload screen ── */
          <div className="max-w-xl mx-auto space-y-6">
            {/* Hero */}
            <div className="text-center space-y-2 pt-2">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Call Compliance Review
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                Upload a recording or paste a transcript to verify rate disclosure,
                coverage, deposit collection, and flat rate pricing.
              </p>
            </div>

            {/* Topic chips */}
            <div className="flex justify-center gap-2 flex-wrap">
              {TOPICS.filter((t) => settings.enabledTopicIds.includes(t.id)).map((topic) => (
                <div
                  key={topic.id}
                  className={`flex items-center gap-1.5 text-xs ${topic.color} ${topic.bgColor} border ${topic.borderColor} rounded-full px-3 py-1.5`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                  {topic.label}
                </div>
              ))}
            </div>

            {/* Salesman + call date — always visible */}
            <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Call Info
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Salesman</label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3 py-2.5 placeholder-gray-300 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Call Date</label>
                  <input
                    type="date"
                    value={callDate}
                    onChange={(e) => setCallDate(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3 py-2.5 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
              </div>
            </div>

            <UploadForm
              onTranscript={(text, file) => handleTranscript(text, file)}
              onAnalyzing={setAnalyzing}
            />

            {analyzing && (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
                <p className="text-gray-400 text-sm">Transcribing and analyzing...</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Results screen ── */
          <div className="space-y-5 animate-fade-in-up">
            {/* Rep badge */}
            {(repName || callDate) && (
              <div className="flex items-center gap-2 flex-wrap">
                {repName && (
                  <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                    Salesman:{" "}
                    <span className="text-gray-900 font-semibold">{repName}</span>
                  </span>
                )}
                {callDate && (
                  <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                    Date:{" "}
                    <span className="text-gray-900 font-semibold">{callDate}</span>
                  </span>
                )}
                {saved && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                    ✓ Saved
                  </span>
                )}
              </div>
            )}

            {/* Score banner */}
            <ScoreBanner results={results} />

            {/* AI Call Summary */}
            <CallSummary summary={summary} loading={summaryLoading} results={results} />

            {/* Action bar */}
            <div className="flex items-center gap-2 flex-wrap print:hidden">
              <button
                onClick={copySummary}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5 transition bg-white shadow-sm"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
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
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5 transition bg-white shadow-sm"
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
                className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition shadow-sm ${
                  saved
                    ? "text-green-700 border-green-200 bg-green-50 cursor-default"
                    : "text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-400 bg-white"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saved ? "Saved" : "Save to History"}
              </button>
            </div>

            {/* Audio player */}
            {audioFile && <AudioPlayer file={audioFile} />}

            {/* Checklist cards */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold print:hidden">
                Compliance Checklist — click any card to highlight in transcript
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

            {/* Manager notes */}
            <CallNotes notes={notes} onChange={setNotes} onSave={handleSaveNotes} />

            <p className="text-center text-gray-300 text-xs pb-4 print:hidden">
              Click any checklist card to jump to matching keywords in the transcript
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
