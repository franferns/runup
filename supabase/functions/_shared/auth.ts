import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function requireSession(
  req: Request,
  sessionId: string | null,
  deviceToken?: string | null,
) {
  const supabase = adminClient();

  if (!sessionId) {
    return { error: "Missing session id", status: 400 as const };
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .select("id, state")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !session) {
    return { error: "Session not found", status: 404 as const };
  }

  if (deviceToken) {
    const { data: device } = await supabase
      .from("devices")
      .select("id")
      .eq("session_id", sessionId)
      .eq("device_token", deviceToken)
      .maybeSingle();

    if (!device) {
      return { error: "Invalid device token", status: 401 as const };
    }
  }

  return { session, supabase };
}

export function readAuthHeaders(req: Request) {
  const url = new URL(req.url);
  return {
    sessionId:
      req.headers.get("x-session-id") ?? url.searchParams.get("sessionId"),
    deviceToken:
      req.headers.get("x-device-token") ?? url.searchParams.get("deviceToken"),
  };
}
