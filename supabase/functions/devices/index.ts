import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { adminClient, readAuthHeaders } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { sessionId } = readAuthHeaders(req);

  if (!sessionId) {
    return jsonResponse({ error: "sessionId required" }, 400);
  }

  const supabase = adminClient();
  const url = new URL(req.url);
  const deviceId = url.searchParams.get("deviceId");

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("devices")
      .select("id, label, paired_at")
      .eq("session_id", sessionId)
      .order("paired_at", { ascending: true });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ devices: data ?? [] });
  }

  if (req.method === "DELETE") {
    if (deviceId) {
      const { error } = await supabase
        .from("devices")
        .delete()
        .eq("id", deviceId)
        .eq("session_id", sessionId);

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ ok: true, deviceId });
    }

    const { error } = await supabase
      .from("devices")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ ok: true, unpairedAll: true });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});
