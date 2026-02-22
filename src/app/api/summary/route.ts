import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();
    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional sales call analyst for a moving company. Write a 2-3 sentence summary of this sales call. Cover: what the customer needed, what was quoted or discussed (pricing, services, coverage), and the outcome or next steps. Be concise, factual, and professional. No bullet points.",
        },
        {
          role: "user",
          content: `Summarize this sales call:\n\n${transcript.slice(0, 4000)}`,
        },
      ],
      max_tokens: 160,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content ?? "Summary unavailable.";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summary error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
