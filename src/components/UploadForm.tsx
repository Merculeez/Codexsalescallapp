"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface Props {
  onTranscript: (transcript: string, file?: File) => void;
  onAnalyzing: (v: boolean) => void;
}

type Mode = "upload" | "paste";

export default function UploadForm({ onTranscript, onAnalyzing }: Props) {
  const [mode, setMode] = useState<Mode>("upload");
  const [pastedText, setPastedText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);
    setLoading(true);
    onAnalyzing(true);

    try {
      const form = new FormData();
      form.append("audio", file);
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      onTranscript(data.transcript, file);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      onAnalyzing(false);
    }
  }

  async function handlePaste() {
    if (!pastedText.trim()) return setError("Please paste a transcript first.");
    setError(null);
    setLoading(true);
    onAnalyzing(true);
    await new Promise((r) => setTimeout(r, 400));
    onTranscript(pastedText.trim());
    setLoading(false);
    onAnalyzing(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Load Call Transcript</h2>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5 w-fit">
        {(["upload", "paste"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 hover:text-gray-900"
            }`}
          >
            {m === "upload" ? "Upload Audio" : "Paste Transcript"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            relative flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all
            ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"}
          `}
        >
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Transcribing with Whisper AI...</p>
          ) : fileName ? (
            <p className="text-green-600 text-sm font-medium">{fileName} — ready</p>
          ) : (
            <>
              <p className="text-gray-500 text-sm">Drop audio file here or click to browse</p>
              <p className="text-gray-400 text-xs">MP3, WAV, M4A, MP4, WebM supported</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste the full call transcript here..."
            className="w-full h-48 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm p-4 resize-none placeholder-gray-300 focus:outline-none focus:border-blue-400 font-mono leading-relaxed transition"
          />
          <button
            onClick={handlePaste}
            disabled={loading || !pastedText.trim()}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Analyze Transcript"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
