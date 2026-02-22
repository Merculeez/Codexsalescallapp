export interface Topic {
  id: string;
  label: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface TopicResult {
  topic: Topic;
  passed: boolean;
  matches: string[];
  positions: Array<{ start: number; end: number; word: string }>;
}

export const TOPICS: Topic[] = [
  {
    id: "price",
    label: "Price / Pricing",
    keywords: [
      "price", "pricing", "cost", "costs", "rate", "rates", "charge", "charges",
      "fee", "fees", "quote", "estimate", "dollar", "dollars", "payment",
      "monthly", "annual", "total", "budget", "investment", "afford", "expensive",
      "cheap", "discount", "deal", "offer", "package"
    ],
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500",
  },
  {
    id: "insurance",
    label: "Insurance",
    keywords: [
      "insurance", "insured", "insure", "coverage", "covered", "cover",
      "policy", "policies", "deductible", "claim", "claims", "liability",
      "premium", "carrier", "provider", "adjuster", "homeowner", "homeowners",
      "property", "damage", "loss", "protect", "protection"
    ],
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500",
  },
  {
    id: "payment",
    label: "Payment Collected",
    keywords: [
      "paid", "pay", "payment", "collected", "collect", "collection",
      "charged", "charge", "credit card", "debit card", "cash", "check",
      "receipt", "invoice", "deposit", "down payment", "ran the card",
      "processed", "transaction", "authorize", "authorized", "sign", "signed",
      "contract", "agreement", "finalized", "confirmed"
    ],
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500",
  },
];

export function analyzeTranscript(
  transcript: string,
  customKeywords: Record<string, string[]> = {}
): TopicResult[] {
  return TOPICS.map((topic) => {
    const allKeywords = [
      ...topic.keywords,
      ...(customKeywords[topic.id] ?? []),
    ];
    const matches: string[] = [];
    const positions: Array<{ start: number; end: number; word: string }> = [];

    for (const keyword of allKeywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      let match;
      while ((match = regex.exec(transcript)) !== null) {
        if (!matches.includes(keyword)) matches.push(keyword);
        positions.push({ start: match.index, end: match.index + match[0].length, word: match[0] });
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
  // Merge all positions with topic info
  type Span = { start: number; end: number; topicId: string; word: string };
  const spans: Span[] = [];

  for (const result of results) {
    for (const pos of result.positions) {
      spans.push({ ...pos, topicId: result.topic.id });
    }
  }

  // Sort by start, resolve overlaps by keeping first
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
