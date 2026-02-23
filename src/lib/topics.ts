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
}

export interface TopicResult {
  topic: Topic;
  passed: boolean;
  matches: string[];
  positions: Array<{ start: number; end: number; word: string }>;
}

// ─── Default hourly rates ────────────────────────────────────────────────────
export const DEFAULT_RATES: number[] = [185, 169, 219, 250, 249, 329, 399, 419, 460, 523, 583];

// ─── Hourly rate patterns ────────────────────────────────────────────────────
// forRate links each pattern to a specific rate number for filtering.
// Patterns without forRate (service fee, fuel surcharge) always apply.
const RATE_PATTERNS: Array<{ regex: string; label: string; forRate?: number }> = [
  // ── $185 ──
  { regex: "\\$?\\b185\\b(?:\\.00)?", label: "$185/hr", forRate: 185 },
  { regex: "\\b1\\.85\\b", label: "$185/hr (alt)", forRate: 185 },
  { regex: "\\bone\\s+eighty[\\s-]five\\b", label: "$185 (spoken)", forRate: 185 },
  { regex: "\\bone\\s+hundred(?:\\s+and)?\\s+eighty[\\s-]five\\b", label: "$185 (spoken)", forRate: 185 },
  // ── $169 ──
  { regex: "\\$?\\b169\\b(?:\\.00)?", label: "$169/hr", forRate: 169 },
  { regex: "\\b1\\.69\\b", label: "$169/hr (alt)", forRate: 169 },
  { regex: "\\bone\\s+sixty[\\s-]nine\\b", label: "$169 (spoken)", forRate: 169 },
  { regex: "\\bone\\s+hundred(?:\\s+and)?\\s+sixty[\\s-]nine\\b", label: "$169 (spoken)", forRate: 169 },
  // ── $219 ──
  { regex: "\\$?\\b219\\b(?:\\.00)?", label: "$219/hr", forRate: 219 },
  { regex: "\\b2\\.19\\b", label: "$219/hr (alt)", forRate: 219 },
  { regex: "\\btwo\\s+nineteen\\b", label: "$219 (spoken)", forRate: 219 },
  { regex: "\\btwo\\s+hundred(?:\\s+and)?\\s+nineteen\\b", label: "$219 (spoken)", forRate: 219 },
  // ── $250 ──
  { regex: "\\$?\\b250\\b(?:\\.00)?", label: "$250/hr", forRate: 250 },
  { regex: "\\b2\\.5(?:0)?\\b", label: "$250/hr (alt)", forRate: 250 },
  { regex: "\\btwo\\s+fifty\\b", label: "$250 (spoken)", forRate: 250 },
  { regex: "\\btwo\\s+hundred(?:\\s+and)?\\s+fifty\\b", label: "$250 (spoken)", forRate: 250 },
  // ── $249 ──
  { regex: "\\$?\\b249\\b(?:\\.00)?", label: "$249/hr", forRate: 249 },
  { regex: "\\b2\\.49\\b", label: "$249/hr (alt)", forRate: 249 },
  { regex: "\\btwo\\s+forty[\\s-]nine\\b", label: "$249 (spoken)", forRate: 249 },
  { regex: "\\btwo\\s+hundred(?:\\s+and)?\\s+forty[\\s-]nine\\b", label: "$249 (spoken)", forRate: 249 },
  // ── $329 ──
  { regex: "\\$?\\b329\\b(?:\\.00)?", label: "$329/hr", forRate: 329 },
  { regex: "\\b3\\.29\\b", label: "$329/hr (alt)", forRate: 329 },
  { regex: "\\bthree\\s+twenty[\\s-]nine\\b", label: "$329 (spoken)", forRate: 329 },
  { regex: "\\bthree\\s+hundred(?:\\s+and)?\\s+twenty[\\s-]nine\\b", label: "$329 (spoken)", forRate: 329 },
  // ── $399 ──
  { regex: "\\$?\\b399\\b(?:\\.00)?", label: "$399/hr", forRate: 399 },
  { regex: "\\b3\\.99\\b", label: "$399/hr (alt)", forRate: 399 },
  { regex: "\\bthree\\s+ninety[\\s-]nine\\b", label: "$399 (spoken)", forRate: 399 },
  { regex: "\\bthree\\s+hundred(?:\\s+and)?\\s+ninety[\\s-]nine\\b", label: "$399 (spoken)", forRate: 399 },
  // ── $419 ──
  { regex: "\\$?\\b419\\b(?:\\.00)?", label: "$419/hr", forRate: 419 },
  { regex: "\\b4\\.19\\b", label: "$419/hr (alt)", forRate: 419 },
  { regex: "\\bfour\\s+nineteen\\b", label: "$419 (spoken)", forRate: 419 },
  { regex: "\\bfour\\s+hundred(?:\\s+and)?\\s+nineteen\\b", label: "$419 (spoken)", forRate: 419 },
  // ── $460 ──
  { regex: "\\$?\\b460\\b(?:\\.00)?", label: "$460/hr", forRate: 460 },
  { regex: "\\b4\\.6(?:0)?\\b", label: "$460/hr (alt)", forRate: 460 },
  { regex: "\\bfour\\s+sixty\\b", label: "$460 (spoken)", forRate: 460 },
  { regex: "\\bfour\\s+hundred(?:\\s+and)?\\s+sixty\\b", label: "$460 (spoken)", forRate: 460 },
  // ── $523 ──
  { regex: "\\$?\\b523\\b(?:\\.00)?", label: "$523/hr", forRate: 523 },
  { regex: "\\b5\\.23\\b", label: "$523/hr (alt)", forRate: 523 },
  { regex: "\\bfive\\s+twenty[\\s-]three\\b", label: "$523 (spoken)", forRate: 523 },
  { regex: "\\bfive\\s+hundred(?:\\s+and)?\\s+twenty[\\s-]three\\b", label: "$523 (spoken)", forRate: 523 },
  // ── $583 ──
  { regex: "\\$?\\b583\\b(?:\\.00)?", label: "$583/hr", forRate: 583 },
  { regex: "\\b5\\.83\\b", label: "$583/hr (alt)", forRate: 583 },
  { regex: "\\bfive\\s+eighty[\\s-]three\\b", label: "$583 (spoken)", forRate: 583 },
  { regex: "\\bfive\\s+hundred(?:\\s+and)?\\s+eighty[\\s-]three\\b", label: "$583 (spoken)", forRate: 583 },
  // ── Fee types (always included) ──
  { regex: "\\bservice\\s+fee\\b", label: "service fee" },
  { regex: "\\bvehicle\\s+maintenance\\b", label: "vehicle maintenance" },
  { regex: "\\bfuel\\s+surcharge\\b", label: "fuel surcharge" },
];

// ─── Insurance / coverage patterns ──────────────────────────────────────────
const COVERAGE_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\badded\\s+coverage\\b", label: "added coverage" },
  { regex: "\\bfull\\s+coverage\\b", label: "full coverage" },
  { regex: "\\bcoverage\\b", label: "coverage" },
  { regex: "\\.60\\s*(?:cents?)?\\s*(?:per|to\\s+the)\\s*(?:pound|lb|lbs?)\\b", label: ".60/lb" },
  { regex: "\\bsixty\\s+cents?\\s*(?:per|to\\s+the)\\s*(?:pound|lb|lbs?)\\b", label: ".60/lb" },
  { regex: "\\b60\\s+cents?\\s*(?:per|to\\s+the)\\s*(?:pound|lb|lbs?)\\b", label: ".60/lb" },
];

// ─── Flat rate / guaranteed price patterns ───────────────────────────────────
const FLAT_RATE_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\bflat\\s+rate\\b", label: "flat rate" },
  { regex: "\\bflat\\s+rate\\s+move\\b", label: "flat rate move" },
  { regex: "\\bflat\\s+rate\\s+guaranteed\\b", label: "flat rate guaranteed" },
  { regex: "\\bflat\\s+price\\b", label: "flat price" },
  { regex: "\\bguaranteed\\s+price\\b", label: "guaranteed price" },
  { regex: "\\bguaranteed\\s+pricing\\b", label: "guaranteed pricing" },
  { regex: "\\bguaranteed\\s+rate\\b", label: "guaranteed rate" },
  { regex: "\\bguaranteed\\s+quote\\b", label: "guaranteed quote" },
  { regex: "\\bbinding\\s+estimate\\b", label: "binding estimate" },
  { regex: "\\bbinding\\s+quote\\b", label: "binding quote" },
  { regex: "\\bprice\\s+(?:won't|will\\s+not|cannot|can't)\\s+change\\b", label: "price won't change" },
  { regex: "\\bprice\\s+is\\s+locked\\b", label: "price locked" },
  { regex: "\\bno\\s+hidden\\s+fees?\\b", label: "no hidden fees" },
];

// ─── Credit card / deposit patterns ─────────────────────────────────────────
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
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "flatrate",
    label: "Flat Rate / Guaranteed Price",
    keywords: ["flat rate", "guaranteed price", "guaranteed pricing", "binding estimate"],
    patterns: FLAT_RATE_PATTERNS,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    missLabel: "N/A",
    missNeutral: true,
  },
  {
    id: "insurance",
    label: "Insurance / Coverage",
    keywords: ["insurance", "insured", "liability"],
    patterns: COVERAGE_PATTERNS,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    id: "payment",
    label: "Deposit Collected",
    keywords: [],
    patterns: CARD_PATTERNS,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    missLabel: "NOT THIS CALL",
    missNeutral: true,
  },
];

/** Build numeric + decimal patterns for a custom rate not in DEFAULT_RATES */
function buildCustomRatePatterns(rate: number): Array<{ regex: string; label: string; forRate: number }> {
  const d = (rate / 100).toFixed(2);
  const decimalRegex = d.replace(".", "\\.");
  return [
    { regex: `\\$?\\b${rate}\\b(?:\\.00)?`, label: `$${rate}/hr`, forRate: rate },
    { regex: `\\b${decimalRegex}\\b`, label: `$${rate}/hr (alt)`, forRate: rate },
  ];
}

export function analyzeTranscript(
  transcript: string,
  customKeywords: Record<string, string[]> = {},
  activeRates: number[] = DEFAULT_RATES
): TopicResult[] {
  return TOPICS.map((topic) => {
    const matches: string[] = [];
    const positions: Array<{ start: number; end: number; word: string }> = [];

    // 1. Keyword matching
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

    // 2. Pattern matching — for the price topic, filter by activeRates + add custom rates
    let effectivePatterns = topic.patterns;
    if (topic.id === "price") {
      // Filter existing patterns to only active rates (keep patterns with no forRate always)
      const filteredBase = RATE_PATTERNS.filter(
        (p) => p.forRate === undefined || activeRates.includes(p.forRate)
      );
      // Add patterns for custom rates not in DEFAULT_RATES
      const customRatePatterns = activeRates
        .filter((r) => !DEFAULT_RATES.includes(r))
        .flatMap(buildCustomRatePatterns);
      effectivePatterns = [...filteredBase, ...customRatePatterns];
    }

    for (const { regex: regexStr, label } of effectivePatterns) {
      try {
        const regex = new RegExp(regexStr, "gi");
        let m;
        while ((m = regex.exec(transcript)) !== null) {
          if (!matches.includes(label)) matches.push(label);
          positions.push({ start: m.index, end: m.index + m[0].length, word: m[0] });
        }
      } catch {
        // Skip invalid regex
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
