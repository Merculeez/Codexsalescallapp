"use client";

import { useEffect, useRef } from "react";
import { TopicResult, buildHighlightedSegments } from "@/lib/topics";

interface Props {
  transcript: string;
  results: TopicResult[];
  activeTopicId: string | null;
}

const TOPIC_HIGHLIGHT: Record<string, { bg: string; text: string; border: string }> = {
  price:     { bg: "bg-blue-500/30",    text: "text-blue-200",   border: "border-blue-400" },
  insurance: { bg: "bg-purple-500/30",  text: "text-purple-200", border: "border-purple-400" },
  payment:   { bg: "bg-emerald-500/30", text: "text-emerald-200",border: "border-emerald-400" },
};

export default function TranscriptViewer({ transcript, results, activeTopicId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const segments = buildHighlightedSegments(transcript, results);

  // Scroll to first match of active topic
  useEffect(() => {
    if (!activeTopicId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-topic="${activeTopicId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeTopicId]);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase">
          Call Transcript
        </h3>
        <div className="flex items-center gap-3">
          {results.map((r) => (
            r.passed && (
              <span key={r.topic.id} className={`flex items-center gap-1.5 text-xs ${r.topic.color}`}>
                <span className={`inline-block w-2 h-2 rounded-sm ${TOPIC_HIGHLIGHT[r.topic.id]?.bg}`} />
                {r.topic.label}
              </span>
            )
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="p-5 text-sm leading-7 text-white/80 font-mono whitespace-pre-wrap max-h-[480px] overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {segments.map((seg, i) => {
          if (!seg.topicId) {
            return <span key={i}>{seg.text}</span>;
          }

          const style = TOPIC_HIGHLIGHT[seg.topicId];
          const isActive = activeTopicId === seg.topicId || activeTopicId === null;

          return (
            <mark
              key={i}
              data-topic={seg.topicId}
              className={`
                relative rounded px-0.5 py-0.5 border-b-2 transition-all duration-300
                ${style?.bg ?? "bg-white/20"} ${style?.text ?? "text-white"} ${style?.border ?? "border-white"}
                ${isActive ? "opacity-100" : "opacity-30"}
              `}
              title={seg.topicId}
            >
              {seg.text}
            </mark>
          );
        })}
      </div>
    </div>
  );
}
