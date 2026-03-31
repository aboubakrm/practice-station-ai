import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SYSTEM_PROMPT = `You are a senior medical registrar giving private coaching feedback to a junior colleague after observing their PACES communication station practice. Your tone is honest, specific, warm, and constructive.

You receive a TRANSCRIPT and a CASE RUBRIC (JSON).

## Instructions

### Case-specific checkpoints
For each point in must_cover, should_cover, and could_cover:
- Determine status: "covered" (clearly addressed), "partially" (touched on but incomplete), or "missed"
- If covered/partially: provide brief evidence (paraphrase from transcript, max 20 words)
- If missed/partially: use the hint_if_missed from the rubric — do NOT name the point directly

### Communication competencies
For each CC1-CC7: rate as "strong", "adequate", or "developing"
Only comment on "strong" or "developing" — skip "adequate" unless genuinely useful

### Strengths
2-3 specific things done well. Be concrete, not generic. At least one about communication technique.

### Areas to develop
1-3 areas. Frame constructively. Most impactful first. Never more than 3.

### Phrasing example
Pick the single highest-impact moment. Show context, what was said, and a better alternative that feels natural.

### One thing to try next time
Single, concrete, physically actionable technique. Not "be more empathetic" — something like "count to three silently after delivering difficult news."

### Summary
2-3 sentences. Lead with strongest positive, then main development area.

## Output
Respond with valid JSON only. No markdown fences, no preamble.

{
  "summary": "string",
  "case_specific_checkpoints": [
    { "id": "M1", "point": "string", "status": "covered|partially|missed", "evidence": "string or null", "hint": "string or null" }
  ],
  "communication_assessment": [
    { "id": "CC1", "competency": "string", "rating": "strong|adequate|developing", "comment": "string or null" }
  ],
  "strengths": ["string"],
  "areas_to_develop": ["string"],
  "phrasing_example": { "context": "string", "what_you_said": "string", "alternative": "string" },
  "one_thing_to_try_next_time": "string"
}

## Rules
- No scores, percentages, or pass/fail predictions
- No comments on body language (transcript only)
- Don't fabricate evidence
- Don't be sycophantic — if performance was weak, say so constructively`;

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const message = body?.message;

  if (!message || message.type !== "end-of-call-report") {
    return new Response("OK — ignored", { status: 200 });
  }

  const vapiCallId: string | undefined = message?.call?.id;
  const sessionId: string | undefined = message?.call?.metadata?.session_id;
  const messages: any[] = message?.messages ?? [];
  const durationSeconds: number = message?.durationSeconds ?? 0;

  if (!sessionId) {
    console.error("No session_id in call metadata");
    return new Response("Missing session_id", { status: 400 });
  }

  if (!vapiCallId) {
    console.error("No call ID in payload");
    return new Response("Missing call ID", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Format transcript
  const transcript = messages
    .filter((m) => m.role === "assistant" || m.role === "user")
    .map((m) => ({ role: m.role, content: m.content ?? "" }));

  // Save transcript and mark processing
  const { data: sessionData, error: updateError } = await supabase
    .from("sessions")
    .update({
      vapi_call_id: vapiCallId,
      transcript: transcript,
      duration_seconds: Math.round(durationSeconds),
      status: "processing",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select("case_id")
    .single();

  if (updateError) {
    console.error("Failed to update session:", updateError.message);
    return new Response("DB update failed", { status: 500 });
  }

  console.log(`Session ${sessionId} updated — transcript has ${transcript.length} messages`);

  // Fetch case rubric
  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select("feedback_rubric")
    .eq("id", sessionData.case_id)
    .single();

  if (caseError || !caseData?.feedback_rubric) {
    console.error("Failed to fetch case rubric:", caseError?.message);
    await supabase
      .from("sessions")
      .update({ status: "failed" })
      .eq("id", sessionId);
    return new Response("OK", { status: 200 });
  }

  // Format transcript for OpenAI
  const transcriptText = transcript
    .map((m) => `${m.role === "assistant" ? "Patient" : "Doctor"}: ${m.content}`)
    .join("\n");

  // Call OpenAI
  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `## TRANSCRIPT\n\n${transcriptText}\n\n## CASE RUBRIC\n\n${JSON.stringify(caseData.feedback_rubric)}`,
          },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const openaiData = await openaiResponse.json();
    const feedbackText = openaiData.choices[0].message.content;
    const feedback = JSON.parse(feedbackText);

    // Save report
    const { error: reportError } = await supabase
      .from("reports")
      .insert({
        session_id: sessionId,
        feedback: feedback,
      });

    if (reportError) {
      throw new Error(`Failed to insert report: ${reportError.message}`);
    }

    // Mark session completed
    await supabase
      .from("sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    console.log(`Feedback generated and saved for session ${sessionId}`);

  } catch (err) {
    console.error("Feedback generation failed:", err);
    await supabase
      .from("sessions")
      .update({ status: "failed" })
      .eq("id", sessionId);
  }

  return new Response("OK", { status: 200 });
});
