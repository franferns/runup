import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { mergeState, normalizeState } from "../_shared/state.ts";
import { readAuthHeaders, requireSession } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { sessionId, deviceToken } = readAuthHeaders(req);

  if (req.method === "GET") {
    const auth = await requireSession(req, sessionId, deviceToken);
    if ("error" in auth) {
      return jsonResponse({ error: auth.error }, auth.status);
    }

    return jsonResponse({
      sessionId: auth.session.id,
      state: normalizeState(auth.session.state),
    });
  }

  if (req.method === "PATCH") {
    const auth = await requireSession(req, sessionId, deviceToken ?? null);
    if ("error" in auth) {
      return jsonResponse({ error: auth.error }, auth.status);
    }

    const patch = await req.json().catch(() => ({}));
    const current = normalizeState(auth.session.state);
    const next = mergeState(current, patch);

    const { error } = await auth.supabase
      .from("sessions")
      .update({ state: next })
      .eq("id", auth.session.id);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ sessionId: auth.session.id, state: next });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});
