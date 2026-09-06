import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { adminClient } from "../_shared/auth.ts";

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = await req.json().catch(() => ({}));
  const sessionId = body.sessionId as string | undefined;

  if (!sessionId) {
    return jsonResponse({ error: "sessionId required" }, 400);
  }

  const supabase = adminClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) {
    return jsonResponse({ error: "Session not found" }, 404);
  }

  await supabase.from("pairing_codes").delete().eq("session_id", sessionId);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  let code = randomCode();
  let attempts = 0;

  while (attempts < 5) {
    const { error } = await supabase.from("pairing_codes").insert({
      code,
      session_id: sessionId,
      expires_at: expiresAt,
    });

    if (!error) {
      return jsonResponse({ code, expiresAt, sessionId });
    }

    code = randomCode();
    attempts += 1;
  }

  return jsonResponse({ error: "Could not generate code" }, 500);
});
