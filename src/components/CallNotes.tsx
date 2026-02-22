"use client";

interface Props {
  notes: string;
  onChange: (v: string) => void;
}

export default function CallNotes({ notes, onChange }: Props) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
          Coaching Notes
        </h3>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add coaching feedback or notes about this call..."
        className="w-full h-28 bg-transparent text-white/70 text-sm p-4 resize-none placeholder-white/20 focus:outline-none leading-relaxed"
      />
    </div>
  );
}
