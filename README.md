# CYA Move Review

CYA Move Review is a Next.js app for moving companies to document sales calls and protect against billing disputes.

## What it does

- Upload call audio or paste transcript text.
- Transcribe audio with Whisper (`/api/transcribe`).
- Analyze required disclosures client-side with regex (instant + no per-call AI cost).
- Detect call type and move size automatically.
- Highlight transcript evidence by topic.
- Generate a short AI summary (`/api/summary`).
- Save call history in `localStorage`.
- Persist user settings in `localStorage`.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- OpenAI (Whisper + GPT-4o-mini)
- localStorage persistence

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with:

```bash
OPENAI_API_KEY=your_openai_api_key
```

3. Run dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Notes

- Analysis scoring only counts required topics (`!warnOnPass && !missNeutral`).
- Red flags are shown separately and do not reduce the compliance score.
- History is capped to the newest 100 calls.
