"use client";

import { useState } from "react";

interface Props {
  notes: string;
  onChange: (v: string) => void;
  onSave?: () => void;
}

export default function CallNotes({ notes, onChange, onSave }: Props) {
  const [savedFeedback, setSavedFeedback] = useState(false);

  function handleSave() {
    if (!onSave) return;
    onSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  }

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 shadow-xl shadow-black/20 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">
            Coaching Notes
          </h3>
        </div>

        {onSave && (
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
              savedFeedback
                ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 cursor-default"
                : "text-white/50 border-white/15 hover:text-white hover:border-white/30 hover:bg-white/5 active:scale-95"
            }`}
          >
            {savedFeedback ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Note
              </>
            )}
          </button>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add coaching feedback or notes about this call... These will be saved and attached to this call in history."
        className="w-full h-32 bg-transparent text-white/75 text-sm p-5 resize-none placeholder-white/20 focus:outline-none leading-relaxed"
      />
    </div>
  );
}
