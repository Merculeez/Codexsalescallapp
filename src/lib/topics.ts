export interface Topic {
  id: string;
  label: string;
  keywords: string[];
  patterns: Array<{ regex: string; label: string; forRate?: number }>;
  color: string;
  bgColor: string;
  borderColor: string;
  missLabel?: string;
  missNeutral?: boolean;
  warnOnPass?: boolean;
}

export interface TopicResult {
  topic: Topic;
  passed: boolean;
  matches: string[];
  positions: Array<{ start: number; end: number; word: string }>;
}

export const DEFAULT_RATES = [185, 169, 219, 250, 249, 329, 399, 419, 460, 523, 583];

const RATE_PATTERNS: Array<{ regex: string; label: string; forRate: number }> = [
  { regex: "\\$?\\b185\\b(?:\\.00)?", label: "$185/hr", forRate: 185 },
  { regex: "\\$?\\b169\\b(?:\\.00)?", label: "$169/hr", forRate: 169 },
  { regex: "\\$?\\b219\\b(?:\\.00)?", label: "$219/hr", forRate: 219 },
  { regex: "\\$?\\b250\\b(?:\\.00)?", label: "$250/hr", forRate: 250 },
  { regex: "\\$?\\b249\\b(?:\\.00)?", label: "$249/hr", forRate: 249 },
  { regex: "\\$?\\b329\\b(?:\\.00)?", label: "$329/hr", forRate: 329 },
  { regex: "\\$?\\b399\\b(?:\\.00)?", label: "$399/hr", forRate: 399 },
  { regex: "\\$?\\b419\\b(?:\\.00)?", label: "$419/hr", forRate: 419 },
  { regex: "\\$?\\b460\\b(?:\\.00)?", label: "$460/hr", forRate: 460 },
  { regex: "\\$?\\b523\\b(?:\\.00)?", label: "$523/hr", forRate: 523 },
  { regex: "\\$?\\b583\\b(?:\\.00)?", label: "$583/hr", forRate: 583 },
];

export const TOPICS: Topic[] = [
  {
    id: "price",
    label: "Hourly Rate Quoted",
    keywords: ["per hour", "hourly rate", "the rate is", "rates are"],
    patterns: [
      ...RATE_PATTERNS,
      { regex: "\\bservice\\s+fee\\b", label: "service fee" },
      { regex: "\\bfuel\\s+surcharge\\b", label: "fuel surcharge" },
    ],
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500",
  },
  {
    id: "minimumhours",
    label: "Minimum Hours",
    keywords: ["minimum", "three hour minimum", "2 hour minimum"],
    patterns: [
      { regex: "\\b(?:two|2)[-\\s]?hour\\s+minimum\\b", label: "2-hour minimum" },
      { regex: "\\b(?:three|3)[-\\s]?hour\\s+minimum\\b", label: "3-hour minimum" },
      { regex: "\\bminimum\\s+charge\\b", label: "minimum charge" },
    ],
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500",
  },
  {
    id: "crewsize",
    label: "Crew Size Quoted",
    keywords: ["movers", "crew", "guys", "team"],
    patterns: [
      { regex: "\\b(?:two|2)\\s+(?:movers?|men|guys|person\\s+crew)\\b", label: "2-person crew" },
      { regex: "\\b(?:three|3)\\s+(?:movers?|men|guys|person\\s+crew)\\b", label: "3-person crew" },
      { regex: "\\b(?:four|4)\\s+(?:movers?|men|guys|person\\s+crew)\\b", label: "4-person crew" },
    ],
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    borderColor: "border-indigo-500",
  },
  {
    id: "flatrate",
    label: "Flat Rate / Guaranteed Price",
    keywords: ["flat rate", "guaranteed price", "not to exceed"],
    patterns: [{ regex: "\\bguarantee(?:d)?\\s+price\\b", label: "guaranteed price" }],
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500",
    missLabel: "N/A",
    missNeutral: true,
  },
  {
    id: "insurance",
    label: "Insurance / Coverage",
    keywords: ["insurance", "coverage", "liability"],
    patterns: [
      { regex: "\\.60\\s*(?:cents?)?\\s*(?:per|/)\\s*(?:pound|lb|lbs?)", label: ".60/lb" },
      { regex: "\\bfull\\s+value\\s+protection\\b", label: "full value protection" },
    ],
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500",
  },
  {
    id: "payment",
    label: "Deposit Collected",
    keywords: ["credit card", "debit card", "card on file"],
    patterns: [
      { regex: "\\bcard\\s+number\\b", label: "card details taken" },
      { regex: "\\bcharg(?:ed|ing)\\s+(?:your\\s+)?card\\b", label: "card charged" },
    ],
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500",
    missLabel: "NOT THIS CALL",
    missNeutral: true,
  },
  {
    id: "multiplestops",
    label: "Multiple Stops",
    keywords: ["second stop", "multiple stops", "extra stop"],
    patterns: [
      { regex: "\\b(?:two|2)\\s+stops?\\b", label: "2 stops" },
      { regex: "\\bstorage\\s+stop\\b", label: "storage stop" },
    ],
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500",
    missLabel: "N/A",
    missNeutral: true,
  },
  {
    id: "redflag",
    label: "Unusual Promise",
    keywords: ["on the house", "make an exception", "free of charge"],
    patterns: [
      { regex: "\\b(?:i['’]?ll|we['’]?ll)\\s+waive\\b", label: "waive fee promise" },
      { regex: "\\bdon['’]?t\\s+worry\\s+about\\s+the\\s+fee\\b", label: "fee waived language" },
      { regex: "\\b(?:i\s+promise|i\s+guarantee)\\s+the\\s+price\\b", label: "price guarantee promise" },
      { regex: "\\b(?:we['’]?ll\\s+eat\\s+the\\s+cost|won['’]?t\\s+charge\\s+for\\s+that)\\b", label: "eat the cost" },
    ],
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500",
    missLabel: "CLEAN",
    missNeutral: true,
    warnOnPass: true,
  },
];

export function analyzeTranscript(
  transcript: string,
  customKeywords: Record<string, string[]> = {},
  activeRates: number[] = DEFAULT_RATES
): TopicResult[] {
  return TOPICS.map((topic) => {
    const matches: string[] = [];
    const positions: Array<{ start: number; end: number; word: string }> = [];

    const allKeywords = [...topic.keywords, ...(customKeywords[topic.id] ?? [])];
    for (const keyword of allKeywords) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      let m: RegExpExecArray | null;
      while ((m = regex.exec(transcript)) !== null) {
        if (!matches.includes(keyword)) matches.push(keyword);
        positions.push({ start: m.index, end: m.index + m[0].length, word: m[0] });
      }
    }

    for (const { regex: regexStr, label, forRate } of topic.patterns ?? []) {
      if (topic.id === "price" && forRate && !activeRates.includes(forRate)) {
        continue;
      }
      try {
        const regex = new RegExp(regexStr, "gi");
        let m: RegExpExecArray | null;
        while ((m = regex.exec(transcript)) !== null) {
          if (!matches.includes(label)) matches.push(label);
          positions.push({ start: m.index, end: m.index + m[0].length, word: m[0] });
        }
      } catch {
        continue;
      }
    }

    const deduped = positions.filter((p, i, arr) => !arr.slice(0, i).some((q) => q.start === p.start));

    return {
      topic,
      passed: matches.length > 0,
      matches,
      positions: deduped.sort((a, b) => a.start - b.start),
    };
  });
}

export function getScoreMetrics(results: TopicResult[]) {
  const scored = results.filter((r) => !r.topic.warnOnPass && !r.topic.missNeutral);
  const passed = scored.filter((r) => r.passed).length;
  const total = scored.length;
  const pct = total === 0 ? 0 : Math.round((passed / total) * 100);
  return { passed, total, pct };
}

export function detectCallType(transcript: string) {
  const input = transcript.toLowerCase();
  if (/\b(interstate|out of state|cross-country)\b/.test(input)) return "interstate";
  if (/\b(long[-\s]?distance)\b/.test(input)) return "long-distance";
  if (/\b(storage\s+only|storage\s+move)\b/.test(input)) return "storage";
  if (/\b(local|hourly)\b/.test(input)) return "local-hourly";
  return "unknown";
}

export function detectMoveSize(transcript: string) {
  const input = transcript.toLowerCase();
  if (/\b(studio)\b/.test(input)) return "studio";
  if (/\b(one|1)\s*(bed(room)?|br)\b/.test(input)) return "1br";
  if (/\b(two|2)\s*(bed(room)?|br)\b/.test(input)) return "2br";
  if (/\b(three|3)\s*(bed(room)?|br)\b/.test(input)) return "3br";
  if (/\b(four|4|five|5)\s*(bed(room)?|br)\b/.test(input)) return "4br+";
  return "unknown";
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
    segments.push({ text: transcript.slice(span.start, span.end), topicId: span.topicId, word: span.word });
    cursor = span.end;
  }

  if (cursor < transcript.length) {
    segments.push({ text: transcript.slice(cursor), topicId: null, word: null });
  }

  return segments;
}
