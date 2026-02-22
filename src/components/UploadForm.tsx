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
    // Small delay for UX
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
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Load Call Transcript</h2>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5 w-fit">
        {(["upload", "paste"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-white text-black"
                : "bg-transparent text-white/50 hover:text-white"
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
            ${dragging ? "border-white/60 bg-white/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"}
          `}
        >
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>

          {loading ? (
            <p className="text-white/60 text-sm">Transcribing with Whisper AI...</p>
          ) : fileName ? (
            <p className="text-emerald-400 text-sm font-medium">{fileName} — ready</p>
          ) : (
            <>
              <p className="text-white/60 text-sm">Drop audio file here or click to browse</p>
              <p className="text-white/30 text-xs">MP3, WAV, M4A, MP4, WebM supported</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste the full call transcript here..."
            className="w-full h-48 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm p-4 resize-none placeholder-white/20 focus:outline-none focus:border-white/30 font-mono leading-relaxed"
          />
          <button
            onClick={handlePaste}
            disabled={loading || !pastedText.trim()}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Analyze Transcript"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2">
          <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
