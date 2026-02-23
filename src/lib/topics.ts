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
  /** When true: a match means a WARNING (red flag), no match means clean/good */
  warnOnPass?: boolean;
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

// ─── Minimum hours patterns ──────────────────────────────────────────────────
const MIN_HOURS_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\b([2-9]|\\d{2,})[\\s-]hour[s]?\\s+minimum\\b", label: "X-hour minimum" },
  { regex: "\\bminimum\\s+of\\s+([2-9]|\\d{2,})\\s+hours?\\b", label: "minimum of X hours" },
  { regex: "\\b([2-9]|\\d{2,})[\\s-]hour[s]?\\s+min\\b", label: "X-hour min" },
  { regex: "\\bhour[s]?\\s+minimum\\b", label: "hour minimum" },
  { regex: "\\bminimum\\s+hours?\\b", label: "minimum hours" },
  { regex: "\\b(two|three|four)[\\s-]hour[s]?\\s+minimum\\b", label: "X-hour minimum (spoken)" },
  { regex: "\\b(two|three|four)[\\s-]hour[s]?\\s+min\\b", label: "X-hour min (spoken)" },
  { regex: "\\bmin(?:imum)?\\s+(?:is\\s+)?([2-9])\\s+hours?\\b", label: "minimum X hours" },
];

// ─── Crew size patterns ──────────────────────────────────────────────────────
const CREW_SIZE_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\b([2-6])[\\s-]man\\s+crew\\b", label: "X-man crew" },
  { regex: "\\b(two|three|four|five|six)[\\s-]man\\s+crew\\b", label: "X-man crew (spoken)" },
  { regex: "\\b([2-6])\\s+movers?\\b", label: "X movers" },
  { regex: "\\b(two|three|four|five|six)\\s+movers?\\b", label: "X movers (spoken)" },
  { regex: "\\bcrew\\s+of\\s+([2-6])\\b", label: "crew of X" },
  { regex: "\\bcrew\\s+of\\s+(two|three|four|five|six)\\b", label: "crew of X (spoken)" },
  { regex: "\\b([2-6])\\s+guys?\\s+(?:will|on|for)\\b", label: "X guys on the job" },
  { regex: "\\b(two|three|four|five|six)\\s+guys?\\s+(?:will|on|for)\\b", label: "X guys (spoken)" },
  { regex: "\\b([2-6])\\s+men\\b", label: "X men" },
  { regex: "\\b(two|three|four|five|six)\\s+men\\b", label: "X men (spoken)" },
  { regex: "\\b([2-6])\\s+man\\s+team\\b", label: "X man team" },
  { regex: "\\bcrew\\s+size\\b", label: "crew size" },
];

// ─── Multiple stops patterns ─────────────────────────────────────────────────
const MULTI_STOP_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\bmultiple\\s+stops?\\b", label: "multiple stops" },
  { regex: "\\b(extra|additional|second|another)\\s+stop\\b", label: "extra stop" },
  { regex: "\\btwo\\s+(?:locations?|stops?|addresses?)\\b", label: "two locations" },
  { regex: "\\b2\\s+(?:locations?|stops?|addresses?)\\b", label: "2 locations" },
  { regex: "\\bpickup\\s+(?:location|address|stop|at|from)\\b", label: "pickup location" },
  { regex: "\\bstorage\\s+(?:unit|facility|stop)\\b", label: "storage stop" },
  { regex: "\\bdrop\\s+off\\s+(?:at|to)\\b", label: "drop off at..." },
  { regex: "\\bsecond\\s+(?:location|address|stop|destination)\\b", label: "second location" },
];

// ─── Red flag / unusual promise patterns ─────────────────────────────────────
const RED_FLAG_PATTERNS: Array<{ regex: string; label: string }> = [
  { regex: "\\bi'?ll\\s+waive\\b", label: "I'll waive..." },
  { regex: "\\bwaive(?:d|ing)?\\s+(?:the\\s+)?(?:fee|charge|surcharge|cost)\\b", label: "waived fee" },
  { regex: "\\bdon'?t\\s+worry\\s+about\\s+(?:the\\s+)?(?:fee|charge|cost|that)\\b", label: "don't worry about fee" },
  { regex: "\\bi\\s+can\\s+make\\s+an\\s+exception\\b", label: "I can make an exception" },
  { regex: "\\bi'?ll\\s+throw\\s+that\\s+in\\b", label: "I'll throw that in" },
  { regex: "\\bon\\s+(?:the\\s+)?(?:house|me)\\b", label: "on the house" },
  { regex: "\\bno\\s+charge\\s+for\\b", label: "no charge for..." },
  { regex: "\\bfree\\s+of\\s+charge\\b", label: "free of charge" },
  { regex: "\\bi\\s+promise\\s+(?:you\\s+)?(?:that\\s+)?(?:the\\s+|your\\s+)?(?:price|rate|cost|total)\\b", label: "I promise the price" },
  { regex: "\\bi\\s+guarantee\\s+(?:you\\s+)?(?:that\\s+)?(?:the\\s+|your\\s+)?(?:price|rate|cost|total)\\b", label: "I guarantee the price" },
  { regex: "\\bwe'?ll\\s+eat\\s+(?:the\\s+)?(?:cost|charge|fee)\\b", label: "we'll eat the cost" },
  { regex: "\\btake\\s+care\\s+of\\s+(?:the\\s+)?(?:fee|charge|cost)\\b", label: "take care of the fee" },
  { regex: "\\bnot\\s+(?:going\\s+to|gonna)\\s+charge\\s+(?:you\\s+)?(?:for\\s+)?(?:the\\s+)?(?:fee|that|those)\\b", label: "won't charge for that" },
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
    id: "minimumhours",
    label: "Minimum Hours",
    keywords: ["minimum", "minimum hours", "hour minimum"],
    patterns: MIN_HOURS_PATTERNS,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    id: "crewsize",
    label: "Crew Size Quoted",
    keywords: ["man crew", "man team", "movers", "crew size"],
    patterns: CREW_SIZE_PATTERNS,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
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
  {
    id: "multiplestops",
    label: "Multiple Stops",
    keywords: ["multiple stops", "extra stop", "second location", "pickup location"],
    patterns: MULTI_STOP_PATTERNS,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    missLabel: "N/A",
    missNeutral: true,
  },
  {
    id: "redflag",
    label: "Unusual Promise",
    keywords: [],
    patterns: RED_FLAG_PATTERNS,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    missLabel: "CLEAN",
    missNeutral: true,
    warnOnPass: true,
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
      const filteredBase = RATE_PATTERNS.filter(
        (p) => p.forRate === undefined || activeRates.includes(p.forRate)
      );
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

// ─── Call type auto-classification ──────────────────────────────────────────
export type CallType = "local-hourly" | "long-distance" | "interstate" | "storage" | "unknown";

export function detectCallType(transcript: string): CallType {
  const t = transcript.toLowerCase();
  if (/\bstorage[- ]only\b|\bstore[- ]only\b|\bjust\s+storage\b/.test(t)) return "storage";
  if (/\binterstate\b|\bacross\s+state(?:\s+lines?)?\b|\bout[- ]of[- ]state\b/.test(t)) return "interstate";
  if (/\blong[- ]distance\b|\blong\s+haul\b|\bcross[- ]country\b/.test(t)) return "long-distance";
  return "local-hourly";
}

export const CALL_TYPE_LABELS: Record<CallType, string> = {
  "local-hourly": "Local Hourly",
  "long-distance": "Long Distance",
  "interstate": "Interstate",
  "storage": "Storage Only",
  "unknown": "Unknown",
};

// ─── Move size detection ─────────────────────────────────────────────────────
export type MoveSize = "studio" | "1br" | "2br" | "3br" | "4br+" | "unknown";

export function detectMoveSize(transcript: string): MoveSize {
  const t = transcript.toLowerCase();
  if (/\bstudio\b/.test(t)) return "studio";
  if (/\b(?:one|1)[- ]bed(?:room)?\b|\b1\s*br\b/.test(t)) return "1br";
  if (/\b(?:two|2)[- ]bed(?:room)?\b|\b2\s*br\b/.test(t)) return "2br";
  if (/\b(?:three|3)[- ]bed(?:room)?\b|\b3\s*br\b/.test(t)) return "3br";
  if (/\b(?:four|five|six|4|5|6)[- ]bed(?:room)?\b|\b[456]\s*br\b/.test(t)) return "4br+";
  return "unknown";
}

export const MOVE_SIZE_LABELS: Record<MoveSize, string> = {
  studio: "Studio",
  "1br": "1-Bedroom",
  "2br": "2-Bedroom",
  "3br": "3-Bedroom",
  "4br+": "4+ Bedroom",
  unknown: "Unknown Size",
};
