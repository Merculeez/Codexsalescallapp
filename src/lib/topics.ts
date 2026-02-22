export interface Topic {
  id: string;
  label: string;
  keywords: string[];
  patterns: Array<{ regex: string; label: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  missLabel?: string;    // shown in UI when not detected
  missNeutral?: boolean; // amber instead of red when missed
}

export interface TopicResult {
  topic: Topic;
  passed: boolean;
  matches: string[];
  positions: Array<{ start: number; end: number; word: string }>;
}

// ─── Hourly rate patterns ───────────────────────────────────────────────────
// Handles: exact numbers ($185, 185), Whisper decimal errors (1.85),
// and verbal forms ("one eighty five") for each known rate.
const RATE_PATTERNS: Array<{ regex: string; label: string }> = [
  // Exact numeric: 185, $185, 185.00
  { regex: "\\$?\\b185\\b(?:\\.00)?", label: "$185/hr" },
  { regex: "\\$?\\b169\\b(?:\\.00)?", label: "$169/hr" },
  { regex: "\\$?\\b219\\b(?:\\.00)?", label: "$219/hr" },
  { regex: "\\$?\\b250\\b(?:\\.00)?", label: "$250/hr" },
  { regex: "\\$?\\b249\\b(?:\\.00)?", label: "$249/hr" },
  { regex: "\\$?\\b329\\b(?:\\.00)?", label: "$329/hr" },
  { regex: "\\$?\\b399\\b(?:\\.00)?", label: "$399/hr" },
  { regex: "\\$?\\b419\\b(?:\\.00)?", label: "$419/hr" },
  { regex: "\\$?\\b460\\b(?:\\.00)?", label: "$460/hr" },
  { regex: "\\$?\\b523\\b(?:\\.00)?", label: "$523/hr" },
  { regex: "\\$?\\b583\\b(?:\\.00)?", label: "$583/hr" },

  // Whisper decimal transcription errors (e.g. 1.85 instead of $185)
  { regex: "\\b1\\.85\\b", label: "$185/hr (alt)" },
  { regex: "\\b1\\.69\\b", label: "$169/hr (alt)" },
  { regex: "\\b2\\.19\\b", label: "$219/hr (alt)" },
  { regex: "\\b2\\.5(?:0)?\\b", label: "$250/hr (alt)" },
  { regex: "\\b2\\.49\\b", label: "$249/hr (alt)" },
  { regex: "\\b3\\.29\\b", label: "$329/hr (alt)" },
  { regex: "\\b3\\.99\\b", label: "$399/hr (alt)" },
  { regex: "\\b4\\.19\\b", label: "$419/hr (alt)" },
  { regex: "\\b4\\.6(?:0)?\\b", label: "$460/hr (alt)" },
  { regex: "\\b5\\.23\\b", label: "$523/hr (alt)" },
  { regex: "\\b5\\.83\\b", label: "$583/hr (alt)" },

  // Verbal forms — spoken numbers Whisper might transcribe as words
  { regex: "\\bone\\s+eighty[\\s-]five\\b", label: "$185 (spoken)" },
  { regex: "\\bone\\s+hundred(?:\\s+and)?\\s+eighty[\\s-]five\\b", label: "$185 (spoken)" },
  { regex: "\\bone\\s+sixty[\\s-]nine\\b", label: "$169 (spoken)" },
  { regex: "\\bone\\s+hundred(?:\\s+and)?\\s+sixty[\\s-]nine\\b", label: "$169 (spoken)" },
  { regex: "\\btwo\\s+nineteen\\b", label: "$219 (spoken)" },
  { regex: "\\btwo\\s+hundred(?:\\s+and)?\\s+nineteen\\b", label: "$219 (spoken)" },
  { regex: "\\btwo\\s+fifty\\b", label: "$250 (spoken)" },
  { regex: "\\btwo\\s+hundred(?:\\s+and)?\\s+fifty\\b", label: "$250 (spoken)" },
  { regex: "\\btwo\\s+forty[\\s-]nine\\b", label: "$249 (spoken)" },
  { regex: "\\btwo\\s+hundred(?:\\s+and)?\\s+forty[\\s-]nine\\b", label: "$249 (spoken)" },
  { regex: "\\bthree\\s+twenty[\\s-]nine\\b", label: "$329 (spoken)" },
  { regex: "\\bthree\\s+hundred(?:\\s+and)?\\s+twenty[\\s-]nine\\b", label: "$329 (spoken)" },
  { regex: "\\bthree\\s+ninety[\\s-]nine\\b", label: "$399 (spoken)" },
  { regex: "\\bthree\\s+hundred(?:\\s+and)?\\s+ninety[\\s-]nine\\b", label: "$399 (spoken)" },
  { regex: "\\bfour\\s+nineteen\\b", label: "$419 (spoken)" },
  { regex: "\\bfour\\s+hundred(?:\\s+and)?\\s+nineteen\\b", label: "$419 (spoken)" },
  { regex: "\\bfour\\s+sixty\\b", label: "$460 (spoken)" },
  { regex: "\\bfour\\s+hundred(?:\\s+and)?\\s+sixty\\b", label: "$460 (spoken)" },
  { regex: "\\bfive\\s+twenty[\\s-]three\\b", label: "$523 (spoken)" },
  { regex: "\\bfive\\s+hundred(?:\\s+and)?\\s+twenty[\\s-]three\\b", label: "$523 (spoken)" },
  { regex: "\\bfive\\s+eighty[\\s-]three\\b", label: "$583 (spoken)" },
  { regex: "\\bfive\\s+hundred(?:\\s+and)?\\s+eighty[\\s-]three\\b", label: "$583 (spoken)" },

  // Fee types mentioned in pricing context
  { regex: "\\bservice\\s+fee\\b", label: "service fee" },
  { regex: "\\bvehicle\\s+maintenance\\b", label: "vehicle maintenance" },
  { regex: "\\bfuel\\s+surcharge\\b", label: "fuel surcharge" },
];

// ─── Insurance / coverage patterns ──────────────────────────────────────────
const COVERAGE_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\badded\\s+coverage\\b", label: "added coverage" },
  { regex: "\\bfull\\s+coverage\\b", label: "full coverage" },
  { regex: "\\bcoverage\\b", label: "coverage" },
  // .60/lb or "sixty cents per pound" — weight-based valuation pricing
  { regex: "\\.60\\s*(?:cents?)?\\s*(?:per|to\\s+the)\\s*(?:pound|lb|lbs?)\\b", label: ".60/lb" },
  { regex: "\\bsixty\\s+cents?\\s*(?:per|to\\s+the)\\s*(?:pound|lb|lbs?)\\b", label: ".60/lb" },
  { regex: "\\b60\\s+cents?\\s*(?:per|to\\s+the)\\s*(?:pound|lb|lbs?)\\b", label: ".60/lb" },
];

// ─── Credit card / deposit patterns ─────────────────────────────────────────
// ONLY triggers if an actual credit card was given on the call.
const CARD_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\bcredit\\s+card\\b", label: "credit card" },
  { regex: "\\bdebit\\s+card\\b", label: "debit card" },
  { regex: "\\bran\\s+(?:the\\s+|your\\s+)?card\\b", label: "ran the card" },
  { regex: "\\bcard\\s+on\\s+file\\b", label: "card on file" },
  { regex: "\\bput\\s+(?:your\\s+|the\\s+)?card\\b", label: "put card on file" },
  { regex: "\\bprocess(?:ed|ing)?\\s+(?:your\\s+|the\\s+)?card\\b", label: "card processed" },
  { regex: "\\bcard\\s+number\\b", label: "card number given" },
  { regex: "\\bcharg(?:ed|ing)\\s+(?:your\\s+|the\\s+)?card\\b", label: "card charged" },
  { regex: "\\bswipe[ds]?\\s+(?:your\\s+|the\\s+)?card\\b", label: "card swiped" },
];

export const TOPICS: Topic[] = [
  {
    id: "price",
    label: "Hourly Rate Quoted",
    keywords: ["per hour", "hourly rate", "our rate", "the rate is", "rates are"],
    patterns: RATE_PATTERNS,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500",
  },
  {
    id: "insurance",
    label: "Insurance / Coverage",
    keywords: ["insurance", "insured", "liability"],
    patterns: COVERAGE_PATTERNS,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500",
  },
  {
    id: "payment",
    label: "Deposit Collected",
    keywords: [],
    patterns: CARD_PATTERNS,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500",
    missLabel: "NOT THIS CALL",
    missNeutral: true,
  },
];

export function analyzeTranscript(
  transcript: string,
  customKeywords: Record<string, string[]> = {}
): TopicResult[] {
  return TOPICS.map((topic) => {
    const matches: string[] = [];
    const positions: Array<{ start: number; end: number; word: string }> = [];

    // 1. Keyword matching (word-boundary safe)
    const allKeywords = [...topic.keywords, ...(customKeywords[topic.id] ?? [])];
    for (const keyword of allKeywords) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      let m;
      while ((m = regex.exec(transcript)) !== null) {
        if (!matches.includes(keyword)) matches.push(keyword);
        positions.push({ start: m.index, end: m.index + m[0].length, word: m[0] });
      }
    }

    // 2. Pattern matching (custom regex with friendly labels)
    for (const { regex: regexStr, label } of topic.patterns ?? []) {
      try {
        const regex = new RegExp(regexStr, "gi");
        let m;
        while ((m = regex.exec(transcript)) !== null) {
          if (!matches.includes(label)) matches.push(label);
          positions.push({ start: m.index, end: m.index + m[0].length, word: m[0] });
        }
      } catch {
        // Skip invalid regex patterns
      }
    }

    const deduped = positions.filter(
      (p, i, arr) => !arr.slice(0, i).some((q) => q.start === p.start)
    );

    return {
      topic,
      passed: matches.length > 0,
      matches,
      positions: deduped.sort((a, b) => a.start - b.start),
    };
  });
}

export function buildHighlightedSegments(
  transcript: string,
  results: TopicResult[]
): Array<{ text: string; topicId: string | null; word: string | null }> {
  type Span = { start: number; end: number; topicId: string; word: string };
  const spans: Span[] = [];

  for (const result of results) {
    for (const pos of result.positions) {
      spans.push({ ...pos, topicId: result.topic.id });
    }
  }

  spans.sort((a, b) => a.start - b.start);
  const merged: Span[] = [];
  for (const span of spans) {
    if (merged.length === 0 || span.start >= merged[merged.length - 1].end) {
      merged.push(span);
    }
  }

  const segments: Array<{ text: string; topicId: string | null; word: string | null }> = [];
  let cursor = 0;

  for (const span of merged) {
    if (span.start > cursor) {
      segments.push({ text: transcript.slice(cursor, span.start), topicId: null, word: null });
    }
    segments.push({
      text: transcript.slice(span.start, span.end),
      topicId: span.topicId,
      word: span.word,
    });
    cursor = span.end;
  }

  if (cursor < transcript.length) {
    segments.push({ text: transcript.slice(cursor), topicId: null, word: null });
  }

  return segments;
}
