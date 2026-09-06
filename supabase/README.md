# Supabase — Slice 7 TV pairing

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
3. Link and push migrations:

```bash
supabase link --project-ref YOUR_REF
supabase db push
supabase functions deploy session-bootstrap
supabase functions deploy pairing-code
supabase functions deploy pair
supabase functions deploy state
supabase functions deploy devices
```

4. Copy project URL + anon key into the web `.env` and Android `local.properties` (see `.env.example` and `android/local.properties.example`).

## API (edge functions)

| Function | Method | Auth headers | Body |
|----------|--------|--------------|------|
| `session-bootstrap` | POST | anon | `{ state? }` → `{ sessionId, state }` |
| `pairing-code` | POST | anon + `X-Session-Id` | `{ sessionId }` → `{ code, expiresAt }` |
| `pair` | POST | anon | `{ code, deviceLabel? }` → `{ sessionId, deviceToken }` |
| `state` | GET/PATCH | `X-Session-Id`, optional `X-Device-Token` | PATCH merges `runup.v1` fields |
| `devices` | GET/DELETE | `X-Session-Id` | DELETE `?deviceId=` or unpair all |

Realtime is enabled on `sessions` — clients subscribe to `UPDATE` filtered by session id.

## Manual test (curl)

```bash
# Bootstrap
curl -X POST "$SUPABASE_URL/functions/v1/session-bootstrap" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" -d '{}'

# Pairing code (use sessionId from above)
curl -X POST "$SUPABASE_URL/functions/v1/pairing-code" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "X-Session-Id: SESSION_ID" \
  -H "Content-Type: application/json" -d '{"sessionId":"SESSION_ID"}'

# TV pair
curl -X POST "$SUPABASE_URL/functions/v1/pair" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" -d '{"code":"123456"}'
```
