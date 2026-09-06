import { createClient } from "@supabase/supabase-js";
import { defaultState, loadState, saveState } from "./storage.js";

const SESSION_META_KEY = "runup.session";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const pairingEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function functionsUrl(path) {
  return `${SUPABASE_URL}/functions/v1/${path}`;
}

function getSupabase() {
  if (!pairingEnabled) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function loadSessionMeta() {
  try {
    const raw = localStorage.getItem(SESSION_META_KEY);
    if (!raw) {
      return { sessionId: null };
    }
    const parsed = JSON.parse(raw);
    return { sessionId: parsed.sessionId ?? null };
  } catch {
    return { sessionId: null };
  }
}

export function saveSessionMeta(meta) {
  localStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
}

async function apiFetch(path, options = {}) {
  const { sessionId } = loadSessionMeta();
  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
    ...options.headers,
  };

  const response = await fetch(functionsUrl(path), {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  return body;
}

export async function ensureSession() {
  if (!pairingEnabled) {
    return null;
  }

  const meta = loadSessionMeta();
  if (meta.sessionId) {
    return meta.sessionId;
  }

  const localState = loadState();
  const result = await apiFetch("session-bootstrap", {
    method: "POST",
    body: JSON.stringify({ state: localState }),
  });

  saveSessionMeta({ sessionId: result.sessionId });
  return result.sessionId;
}

export async function createPairingCode() {
  const sessionId = await ensureSession();
  return apiFetch("pairing-code", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export async function listDevices() {
  await ensureSession();
  return apiFetch("devices", { method: "GET" });
}

export async function unpairDevice(deviceId) {
  await ensureSession();
  return apiFetch(`devices?deviceId=${encodeURIComponent(deviceId)}`, {
    method: "DELETE",
  });
}

export async function unpairAllDevices() {
  await ensureSession();
  return apiFetch("devices", { method: "DELETE" });
}

export async function fetchRemoteState() {
  await ensureSession();
  return apiFetch("state", { method: "GET" });
}

export async function patchRemoteState(patch) {
  await ensureSession();
  return apiFetch("state", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function mergeRunupState(local, remote) {
  const base = remote ?? defaultState();
  return {
    v: 1,
    personaId: base.personaId ?? local.personaId,
    budgetHours: base.budgetHours ?? local.budgetHours,
    watchedIds: [...new Set([...local.watchedIds, ...base.watchedIds])],
    skippedIds: [...new Set([...local.skippedIds, ...base.skippedIds])],
  };
}

export async function hydrateFromRemote() {
  if (!pairingEnabled) {
    return loadState();
  }

  try {
    const { state: remote } = await fetchRemoteState();
    const local = loadState();
    const merged = mergeRunupState(local, remote);
    saveState(merged);
    return merged;
  } catch {
    return loadState();
  }
}

export async function syncStateToRemote(state) {
  if (!pairingEnabled) {
    return;
  }

  await patchRemoteState({
    personaId: state.personaId,
    budgetHours: state.budgetHours,
    watchedIds: state.watchedIds,
    skippedIds: state.skippedIds,
  });
}

export function pairQrUrl(code) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://runup.app";
  const pairUrl = `${origin}/pair?code=${code}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pairUrl)}`;
}

export function subscribeToSession(onUpdate) {
  const supabase = getSupabase();
  const { sessionId } = loadSessionMeta();

  if (!supabase || !sessionId) {
    return () => {};
  }

  const channel = supabase
    .channel(`session:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        onUpdate(payload.new.state);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
