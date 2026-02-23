"use client";

import { useState, useEffect } from "react";
import { TopicResult, CallType, MoveSize, CALL_TYPE_LABELS, MOVE_SIZE_LABELS } from "@/lib/topics";

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

export default function DisputeModal({ results, transcript, repName, callDate, notes, callType, moveSize, onClose }: Props) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function generate() {
    setLoading(true);
    setError("");
    setResponse("");
    try {
      const res = await fetch("/api/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repName, callDate, results, notes, transcript, callType, moveSize }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResponse(data.response);
    } catch {
      setError("Failed to generate response. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
  };

  const passedTopics = results.filter((r) => r.passed && !r.topic.warnOnPass);
  const redFlags = results.filter((r) => r.topic.warnOnPass && r.passed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Dispute Response Generator</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Auto-drafted from call data — review before sending
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Call summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Representative</p>
              <p className="text-gray-900 font-semibold">{repName || "Not specified"}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Call Date</p>
              <p className="text-gray-900 font-semibold">{formatDate(callDate) || "Not specified"}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Move Type</p>
              <p className="text-gray-900 font-semibold">{CALL_TYPE_LABELS[callType]}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Move Size</p>
              <p className="text-gray-900 font-semibold">{moveSize !== "unknown" ? MOVE_SIZE_LABELS[moveSize] : "Not specified"}</p>
            </div>
          </div>

          {/* What was disclosed */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Confirmed disclosures on this call</p>
            {passedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {passedTopics.map((r) => (
                  <span key={r.topic.id} className={`text-xs px-2.5 py-1 rounded-full border ${r.topic.bgColor} ${r.topic.color} ${r.topic.borderColor}`}>
                    {r.topic.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No confirmed disclosures found</p>
            )}
          </div>

          {/* Red flag warning */}
          {redFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Unusual promises will be included in the response</p>
              <p className="text-xs text-red-600">{redFlags.flatMap(r => r.matches).join(", ")}</p>
            </div>
          )}

          {/* Generate button */}
          {!response && !loading && (
            <button
              onClick={generate}
              className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition"
            >
              Generate Dispute Response
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 py-4 justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin" />
              <p className="text-gray-500 text-sm">Drafting response from call data...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={generate} className="mt-2 text-xs text-red-600 underline">Try again</button>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Generated Response</p>
                <span className="text-[10px] text-gray-300 uppercase tracking-wider">AI Generated — Review before use</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">{response}</p>
              </div>
              <button
                onClick={generate}
                className="text-xs text-gray-400 hover:text-gray-600 transition underline"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {response && (
          <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 px-4 hover:bg-gray-50 transition"
            >
              Close
            </button>
            <button
              onClick={copyText}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-gray-900 text-white rounded-xl py-2.5 hover:bg-gray-700 transition"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
