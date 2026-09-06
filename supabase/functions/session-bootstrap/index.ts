import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { defaultState } from "../_shared/state.ts";
import { adminClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabase = adminClient();
  const body = await req.json().catch(() => ({}));
  const initialState = body.state ?? defaultState();

  const { data, error } = await supabase
    .from("sessions")
    .insert({ state: initialState })
    .select("id, state, created_at")
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ sessionId: data.id, state: data.state });
});
