import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { repName, callDate, results, notes, transcript, callType, moveSize } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Build the facts summary for the prompt
    const passedTopics = results
      .filter((r: { passed: boolean; topic: { warnOnPass?: boolean } }) => r.passed && !r.topic.warnOnPass)
      .map((r: { topic: { label: string }; matches: string[] }) => `${r.topic.label}: ${r.matches.slice(0, 3).join(", ")}`)
      .join("\n");

    const missedTopics = results
      .filter((r: { passed: boolean; topic: { warnOnPass?: boolean; missNeutral?: boolean } }) => !r.passed && !r.topic.missNeutral && !r.topic.warnOnPass)
      .map((r: { topic: { label: string } }) => r.topic.label)
      .join(", ");

    const redFlags = results
      .filter((r: { passed: boolean; topic: { warnOnPass?: boolean } }) => r.topic.warnOnPass && r.passed)
      .map((r: { matches: string[] }) => r.matches.join(", "))
      .join("; ");

    const formatDate = (iso: string) => {
      if (!iso) return "the call date";
      const [y, m, d] = iso.split("-");
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
    };

    const callTypeLabel: Record<string, string> = {
      "local-hourly": "local hourly",
      "long-distance": "long-distance",
      "interstate": "interstate regulated",
      "storage": "storage-only",
      "unknown": "",
    };

    const prompt = `You are a professional dispute resolution specialist for a moving company. Write a formal, professional dispute response letter based on the following sales call record. The letter should be addressed generically (no specific customer name needed) and is for internal use or submission to a dispute resolution body or credit card company.

CALL DETAILS:
- Representative: ${repName || "our sales representative"}
- Call Date: ${formatDate(callDate)}
- Move Type: ${callTypeLabel[callType] || "local"} move
- Move Size: ${moveSize !== "unknown" ? moveSize : "unspecified"}

TOPICS DISCLOSED ON THE CALL:
${passedTopics || "None confirmed"}

TOPICS NOT DETECTED:
${missedTopics || "None — all required topics covered"}

${redFlags ? `UNUSUAL COMMITMENTS DETECTED:\n${redFlags}\n` : ""}

${notes ? `REVIEWER NOTES:\n${notes}\n` : ""}

TRANSCRIPT EXCERPT (first 1500 chars):
${transcript?.slice(0, 1500) || "Not available"}

Write a 3-5 paragraph professional dispute response. Cover: (1) what disclosures were made on the call and when, (2) what the customer was told regarding pricing and terms, (3) a firm but professional statement that the company fulfilled its obligations. Do NOT make up specifics not in the data above. Use formal business letter language. Do not include salutation lines or signature blocks — just the body paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional business dispute response writer for a moving company. Write formal, factual, legally sound dispute responses." },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.2,
    });

    const response = completion.choices[0]?.message?.content ?? "Unable to generate response.";
    return NextResponse.json({ response });
  } catch (err) {
    console.error("Dispute response error:", err);
    return NextResponse.json({ error: "Failed to generate dispute response" }, { status: 500 });
  }
}
