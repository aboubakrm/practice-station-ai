import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  const transcript = messages
    .filter((m) => m.role === "assistant" || m.role === "user")
    .map((m) => ({
      role: m.role,
      content: m.content ?? "",
    }));

  const { error } = await supabase
    .from("sessions")
    .update({
      vapi_call_id: vapiCallId,
      transcript: transcript,
      duration_seconds: Math.round(durationSeconds),
      status: "processing",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to update session:", error.message);
    return new Response("DB update failed", { status: 500 });
  }

  console.log(`Session ${sessionId} updated — transcript has ${transcript.length} messages`);

  return new Response("OK", { status: 200 });
});
