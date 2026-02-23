"use client";

import { useEffect, useRef } from "react";
import { TopicResult, buildHighlightedSegments } from "@/lib/topics";

interface Props {
  transcript: string;
  results: TopicResult[];
  activeTopicId: string | null;
}

const TOPIC_HIGHLIGHT: Record<string, { bg: string; text: string; border: string }> = {
  price:         { bg: "bg-blue-100",   text: "text-blue-900",   border: "border-blue-400" },
  minimumhours:  { bg: "bg-violet-100", text: "text-violet-900", border: "border-violet-400" },
  crewsize:      { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-400" },
  flatrate:      { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-400" },
  insurance:     { bg: "bg-teal-100",   text: "text-teal-900",   border: "border-teal-400" },
  payment:       { bg: "bg-green-100",  text: "text-green-900",  border: "border-green-400" },
  multiplestops: { bg: "bg-cyan-100",   text: "text-cyan-900",   border: "border-cyan-400" },
  redflag:       { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-400" },
};

export default function TranscriptViewer({ transcript, results, activeTopicId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const segments = buildHighlightedSegments(transcript, results);

  useEffect(() => {
    if (!activeTopicId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-topic="${activeTopicId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeTopicId]);

  return (
    <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
          Call Transcript
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          {results.map((r) =>
            r.passed ? (
              <span key={r.topic.id} className={`flex items-center gap-1.5 text-xs ${r.topic.color}`}>
                <span
                  className={`inline-block w-2 h-2 rounded-sm ${TOPIC_HIGHLIGHT[r.topic.id]?.bg ?? "bg-gray-200"}`}
                />
                {r.topic.label}
              </span>
            ) : null
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="p-5 text-sm leading-7 text-gray-700 font-mono whitespace-pre-wrap max-h-[480px] overflow-y-auto bg-gray-50"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.1) transparent" }}
      >
        {segments.map((seg, i) => {
          if (!seg.topicId) return <span key={i}>{seg.text}</span>;

          const style = TOPIC_HIGHLIGHT[seg.topicId];
          const isActive = activeTopicId === seg.topicId || activeTopicId === null;

          return (
            <mark
              key={i}
              data-topic={seg.topicId}
              className={`
                relative rounded px-0.5 py-0.5 border-b-2 transition-all duration-300
                ${style?.bg ?? "bg-yellow-100"} ${style?.text ?? "text-gray-900"} ${style?.border ?? "border-gray-400"}
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
