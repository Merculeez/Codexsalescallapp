"use client";

import { useState, useEffect } from "react";
import { TopicResult, buildHighlightedSegments, CallType, MoveSize, CALL_TYPE_LABELS, MOVE_SIZE_LABELS } from "@/lib/topics";

interface Props {
  results: TopicResult[];
  transcript: string;
  repName: string;
  callDate: string;
  notes: string;
  callType: CallType;
  moveSize: MoveSize;
  onClose: () => void;
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  price:         "#dbeafe",
  minimumhours:  "#ede9fe",
  crewsize:      "#e0e7ff",
  flatrate:      "#ffedd5",
  insurance:     "#ccfbf1",
  payment:       "#dcfce7",
  multiplestops: "#cffafe",
  redflag:       "#fee2e2",
};

export default function PdfModal({ results, transcript, repName, callDate, notes, callType, moveSize, onClose }: Props) {
  // Default: check topics that passed or are red flags that fired
  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(
    () => new Set(results.filter((r) => r.passed).map((r) => r.topic.id))
  );
  const [includeTranscript, setIncludeTranscript] = useState(true);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function toggleTopic(id: string) {
    setCheckedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePrint() {
    const checkedResults = results.filter((r) => checkedTopics.has(r.topic.id));
    const scored = results.filter((r) => !r.topic.warnOnPass && !r.topic.missNeutral);
    const passedCount = scored.filter((r) => r.passed).length;
    const scoreVal = scored.length > 0 ? Math.round((passedCount / scored.length) * 100) : 100;

    const redFlags = results.filter((r) => r.topic.warnOnPass && r.passed);

    // Build highlighted transcript HTML
    const highlightedHtml = buildTranscriptHtml(transcript, checkedResults);

    const formatDate = (iso: string) => {
      if (!iso) return "";
      const [y, m, d] = iso.split("-");
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
    };

    const checklist = results.map((r) => {
      const isRedFlag = r.topic.warnOnPass;
      const status = isRedFlag
        ? (r.passed ? "RED FLAG" : "Clean")
        : r.topic.missNeutral
          ? (r.passed ? "Noted" : "N/A")
          : (r.passed ? "Pass" : "Not Covered");
      const statusColor = isRedFlag && r.passed ? "#dc2626"
        : r.passed ? "#16a34a"
        : r.topic.missNeutral ? "#d97706"
        : "#dc2626";
      return `
        <tr>
          <td style="padding:10px 14px; border-bottom:1px solid #f3f4f6; font-size:13px; color:#111827; font-weight:500;">${r.topic.label}</td>
          <td style="padding:10px 14px; border-bottom:1px solid #f3f4f6; text-align:center;">
            <span style="display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; color:${statusColor}; background:${statusColor}18; border:1px solid ${statusColor}40;">${status}</span>
          </td>
          <td style="padding:10px 14px; border-bottom:1px solid #f3f4f6; font-size:12px; color:#6b7280;">${
            r.passed ? r.matches.slice(0, 3).join(", ") : "—"
          }</td>
        </tr>`;
    }).join("");

    const redFlagSection = redFlags.length > 0 ? `
      <div style="margin-top:24px; padding:16px 20px; background:#fff1f2; border:1px solid #fecdd3; border-radius:10px;">
        <p style="font-size:12px; font-weight:700; color:#dc2626; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.05em;">Unusual Commitments Detected</p>
        <p style="font-size:12px; color:#9f1239; margin:0; line-height:1.6;">
          The following phrases were detected that may represent commitments outside standard company policy:
          <strong>${redFlags.flatMap(r => r.matches).join(", ")}</strong>.
          Review with the representative before the move date.
        </p>
      </div>` : "";

    const transcriptSection = includeTranscript ? `
      <div style="margin-top:32px; page-break-before:always;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
          <div style="width:3px; height:18px; background:#111827; border-radius:2px;"></div>
          <h2 style="margin:0; font-size:14px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:0.08em;">Call Transcript</h2>
        </div>
        ${checkedResults.length > 0 ? `
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
            ${checkedResults.map(r => `
              <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; padding:3px 10px; border-radius:20px; background:${HIGHLIGHT_COLORS[r.topic.id] ?? "#f3f4f6"}; color:#374151; border:1px solid rgba(0,0,0,0.08);">
                <span style="display:inline-block; width:8px; height:8px; border-radius:2px; background:${HIGHLIGHT_COLORS[r.topic.id] ?? "#9ca3af"};"></span>
                ${r.topic.label}
              </span>`).join("")}
          </div>` : ""}
        <div style="font-family:monospace; font-size:12px; line-height:1.9; color:#374151; padding:20px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; white-space:pre-wrap;">
          ${highlightedHtml}
        </div>
      </div>` : "";

    const notesSection = notes ? `
      <div style="margin-top:24px; padding:16px 20px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px;">
        <p style="font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 8px;">Review Notes</p>
        <p style="font-size:13px; color:#374151; margin:0; line-height:1.6;">${notes}</p>
      </div>` : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CYA Move Review — Call Record</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: white; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print {
      body { background: white; }
      @page { margin: 0.75in; size: letter; }
    }
  </style>
</head>
<body style="max-width:780px; margin:0 auto; padding:40px 32px;">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:24px; border-bottom:2px solid #111827; margin-bottom:28px;">
    <div>
      <p style="font-size:10px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:4px;">CYA Move Review</p>
      <h1 style="font-size:22px; font-weight:800; color:#111827; margin-bottom:2px;">Sales Call Record</h1>
      <p style="font-size:12px; color:#6b7280;">Call Compliance &amp; Dispute Documentation</p>
    </div>
    <div style="text-align:right;">
      ${scoreVal === 100
        ? `<div style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;">
            <span style="width:8px; height:8px; border-radius:50%; background:#16a34a; display:inline-block;"></span>
            <span style="font-size:12px; font-weight:700; color:#15803d;">All Topics Covered</span>
           </div>`
        : `<div style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#fff7ed; border:1px solid #fed7aa; border-radius:8px;">
            <span style="width:8px; height:8px; border-radius:50%; background:#ea580c; display:inline-block;"></span>
            <span style="font-size:12px; font-weight:700; color:#c2410c;">${scoreVal}% — Review Required</span>
           </div>`}
    </div>
  </div>

  <!-- Call Details -->
  <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:28px;">
    <div style="padding:14px 16px; border-right:1px solid #e5e7eb;">
      <p style="font-size:10px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px;">Representative</p>
      <p style="font-size:13px; font-weight:600; color:#111827;">${repName || "Not specified"}</p>
    </div>
    <div style="padding:14px 16px; border-right:1px solid #e5e7eb;">
      <p style="font-size:10px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px;">Call Date</p>
      <p style="font-size:13px; font-weight:600; color:#111827;">${formatDate(callDate)}</p>
    </div>
    <div style="padding:14px 16px; border-right:1px solid #e5e7eb;">
      <p style="font-size:10px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px;">Move Type</p>
      <p style="font-size:13px; font-weight:600; color:#111827;">${CALL_TYPE_LABELS[callType]}</p>
    </div>
    <div style="padding:14px 16px;">
      <p style="font-size:10px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px;">Move Size</p>
      <p style="font-size:13px; font-weight:600; color:#111827;">${moveSize !== "unknown" ? MOVE_SIZE_LABELS[moveSize] : "Not specified"}</p>
    </div>
  </div>

  <!-- Score summary line -->
  <div style="margin-bottom:20px; padding:14px 18px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; display:flex; align-items:center; gap:16px;">
    <div style="width:52px; height:52px; border-radius:50%; background:white; border:3px solid ${scoreVal===100?"#16a34a":scoreVal>=67?"#2563eb":scoreVal>=33?"#d97706":"#dc2626"}; display:flex; align-items:center; justify-content:center; shrink:0; flex-shrink:0;">
      <span style="font-size:14px; font-weight:800; color:${scoreVal===100?"#16a34a":scoreVal>=67?"#2563eb":scoreVal>=33?"#d97706":"#dc2626"};">${scoreVal}%</span>
    </div>
    <div>
      <p style="font-size:12px; font-weight:700; color:${scoreVal===100?"#15803d":scoreVal>=67?"#1d4ed8":scoreVal>=33?"#b45309":"#b91c1c"}; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px;">
        ${scoreVal===100?"Excellent":scoreVal>=67?"Good":scoreVal>=33?"Needs Review":"Failed"} — ${passedCount} of ${scored.length} required topics covered
      </p>
      <p style="font-size:12px; color:#6b7280;">
        ${scored.filter(r=>!r.passed).length === 0
          ? "All required disclosures were addressed during this call."
          : `Missing topics: ${scored.filter(r=>!r.passed).map(r=>r.topic.label).join(", ")}`}
      </p>
    </div>
  </div>

  <!-- Checklist table -->
  <div style="margin-bottom:4px;">
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
      <div style="width:3px; height:18px; background:#111827; border-radius:2px;"></div>
      <h2 style="font-size:14px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:0.08em;">Disclosure Checklist</h2>
    </div>
    <table style="width:100%; border-collapse:collapse; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid #e5e7eb;">Topic</th>
          <th style="padding:10px 14px; text-align:center; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid #e5e7eb;">Status</th>
          <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid #e5e7eb;">Detected Language</th>
        </tr>
      </thead>
      <tbody>${checklist}</tbody>
    </table>
  </div>

  ${redFlagSection}
  ${notesSection}
  ${transcriptSection}

  <!-- Footer -->
  <div style="margin-top:40px; padding-top:16px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
    <p style="font-size:10px; color:#9ca3af;">Generated by CYA Move Review · ${new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</p>
    <p style="font-size:10px; color:#9ca3af;">This document is for internal dispute resolution purposes only.</p>
  </div>

</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Generate PDF Report</h2>
            <p className="text-xs text-gray-400 mt-0.5">Choose which topics to highlight in the transcript</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition rounded-lg p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Topic checkboxes */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Topics to Highlight</p>
          {results.map((r) => {
            const checked = checkedTopics.has(r.topic.id);
            const isWarn = r.topic.warnOnPass && r.passed;
            return (
              <label
                key={r.topic.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? isWarn
                      ? "bg-red-50 border-red-200"
                      : `${r.topic.bgColor} ${r.topic.borderColor}`
                    : "bg-gray-50 border-gray-200 opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTopic(r.topic.id)}
                  className="w-4 h-4 rounded accent-gray-900"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isWarn ? "text-red-700" : r.topic.color}`}>
                    {r.topic.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {r.passed
                      ? r.matches.slice(0, 2).join(", ")
                      : r.topic.missNeutral ? "Not applicable" : "Not detected"}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isWarn ? "bg-red-100 text-red-700"
                  : r.passed ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
                }`}>
                  {isWarn ? "FLAG" : r.passed ? "PASS" : r.topic.missNeutral ? "N/A" : "MISS"}
                </span>
              </label>
            );
          })}

          {/* Transcript toggle */}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={includeTranscript}
                onChange={(e) => setIncludeTranscript(e.target.checked)}
                className="w-4 h-4 rounded accent-gray-900"
              />
              <div>
                <p className="text-sm font-semibold text-gray-700">Include full transcript</p>
                <p className="text-xs text-gray-400">Appends highlighted transcript to the PDF</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 text-sm text-white bg-gray-900 rounded-xl py-2.5 hover:bg-gray-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Generate & Print
          </button>
        </div>
      </div>
    </div>
  );
}

/** Build an HTML string of the transcript with inline highlight spans */
function buildTranscriptHtml(transcript: string, checkedResults: TopicResult[]): string {
  const segments = buildHighlightedSegments(transcript, checkedResults);
  return segments
    .map((seg) => {
      if (!seg.topicId) return escapeHtml(seg.text);
      const bg = HIGHLIGHT_COLORS[seg.topicId] ?? "#fef9c3";
      return `<mark style="background:${bg}; border-radius:3px; padding:1px 2px; border-bottom:2px solid ${darken(bg)};">${escapeHtml(seg.text)}</mark>`;
    })
    .join("");
}

function escapeHtml(str: string): string {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function darken(hex: string): string {
  // Simple: lighten the color to a border version
  const map: Record<string, string> = {
    "#dbeafe": "#93c5fd",
    "#ede9fe": "#c4b5fd",
    "#e0e7ff": "#a5b4fc",
    "#ffedd5": "#fdba74",
    "#ccfbf1": "#5eead4",
    "#dcfce7": "#86efac",
    "#cffafe": "#67e8f9",
    "#fee2e2": "#fca5a5",
  };
  return map[hex] ?? "#9ca3af";
}
