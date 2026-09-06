import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { adminClient } from "../_shared/auth.ts";

function deviceToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim();
  const deviceLabel = body.deviceLabel ? String(body.deviceLabel) : null;

  if (!/^\d{6}$/.test(code)) {
    return jsonResponse({ error: "Invalid code" }, 400);
  }

  const supabase = adminClient();

  const { data: pairing } = await supabase
    .from("pairing_codes")
    .select("session_id, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (!pairing) {
    return jsonResponse({ error: "Code not found" }, 404);
  }

  if (new Date(pairing.expires_at).getTime() < Date.now()) {
    return jsonResponse({ error: "Code expired" }, 410);
  }

  const token = deviceToken();
  const { data: device, error } = await supabase
    .from("devices")
    .insert({
      session_id: pairing.session_id,
      device_token: token,
      label: deviceLabel,
    })
    .select("id, label, paired_at")
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({
    sessionId: pairing.session_id,
    deviceToken: token,
    deviceId: device.id,
    label: device.label,
    pairedAt: device.paired_at,
  });
});
