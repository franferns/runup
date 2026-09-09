import { createClient } from "@supabase/supabase-js";
import { defaultState, loadState, saveState, resetProgress } from "./storage.js";

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
  const localEpoch = local.progressEpoch ?? 0;
  const remoteEpoch = base.progressEpoch ?? 0;

  let watchedIds;
  let skippedIds;
  if (remoteEpoch > localEpoch) {
    watchedIds = base.watchedIds;
    skippedIds = base.skippedIds;
  } else if (remoteEpoch < localEpoch) {
    watchedIds = local.watchedIds;
    skippedIds = local.skippedIds;
  } else {
    watchedIds = [...new Set([...local.watchedIds, ...base.watchedIds])];
    skippedIds = [...new Set([...local.skippedIds, ...base.skippedIds])];
  }

  return {
    v: 1,
    personaId: base.personaId ?? local.personaId,
    budgetHours: base.budgetHours ?? local.budgetHours,
    watchedIds,
    skippedIds,
    progressEpoch: Math.max(localEpoch, remoteEpoch),
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
    return null;
  }

  return apiFetch("state", {
    method: "PATCH",
    body: JSON.stringify({
      personaId: state.personaId,
      budgetHours: state.budgetHours,
      watchedIds: state.watchedIds,
      skippedIds: state.skippedIds,
    }),
  });
}

export async function resetProgressAndSync(state) {
  const cleared = resetProgress(state);

  if (!pairingEnabled) {
    return cleared;
  }

  try {
    const { state: remote } = await apiFetch("state", {
      method: "PATCH",
      body: JSON.stringify({ resetProgress: true }),
    });
    const merged = mergeRunupState(cleared, remote);
    saveState(merged);
    return merged;
  } catch {
    return cleared;
  }
}

export function pairPageUrl(code) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://runup.app";
  return `${origin}/pair?code=${code}`;
}

export function pairQrUrl(code) {
  const pairUrl = pairPageUrl(code);
  const params = new URLSearchParams({
    size: "220x220",
    data: pairUrl,
    bgcolor: "ffffff",
    color: "000000",
    margin: "12",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
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
