---
title: "Privacy Policy"
description: "How Runup handles your data — local watch progress, optional TV pairing, and what we do not collect."
effectiveDate: "2026-09-08"
disclaimer: "Unofficial fan project. Not affiliated with Marvel Entertainment or The Walt Disney Company."
---

# Privacy Policy

**Effective date:** September 8, 2026

Runup is an unofficial, spoiler-safe catch-up guide for *Avengers: Doomsday*. This policy explains what information the Runup website and Google TV companion app handle, and what we deliberately do not collect.

## Summary

- We do **not** ask you to create an account or provide your name, email, or payment details.
- Your watch progress is stored **on your device** by default.
- If you use **TV pairing**, a copy of your progress is stored temporarily in our cloud backend so your phone and TV stay in sync.
- We do **not** run advertising trackers or sell your data.

## Information we collect

### Watch progress (stored on your device)

When you use Runup, the app saves your catch-up state in your browser or TV app storage. This includes:

- Your chosen starting lane (persona)
- An optional time budget, in hours
- Which titles you marked as already seen or skipped

This data is tied to your browser or device. We do not receive it unless you turn on TV pairing (below).

### TV pairing (optional cloud sync)

If you pair a Google TV device with the web app, Runup creates an anonymous session in our backend (hosted on [Supabase](https://supabase.com)). That session stores the same watch-progress fields listed above, plus:

- A randomly generated session identifier
- Short-lived pairing codes (they expire within minutes)
- A device label you may provide, and a device token used only to keep that TV paired

We use this only to sync your queue between the web app and paired TVs. There is no login, password, or personal profile.

## Information we do not collect

Runup is not built to identify you. We do not intentionally collect:

- Your name, email address, phone number, or postal address
- Payment or billing information (the app is free)
- Precise location
- Contacts, photos, or other files on your device
- Viewing history inside Disney+, Netflix, or other streaming apps

## Third-party services

Some features rely on services outside Runup:

- **Supabase** — hosts optional TV-pairing sessions and realtime sync when that feature is enabled.
- **QR code images** — when you pair a TV, the web app loads a QR code from a third-party image API so your phone can scan it. That request includes the pairing URL only.
- **Google Search** — the "Watch tonight" link opens a Google search for the title name. Google may log that request under its own privacy policy.
- **Streaming apps** — the Google TV app may open Disney+ or other providers using links from our public title catalog. Those apps handle playback under their own terms.
- **Hosting** — the public website is served over HTTPS. Standard server logs (such as IP address and requested page) may be kept by our hosting provider for security and operations.

We do not use third-party advertising or analytics scripts on the Runup website.

## Cookies

The Runup website does not set advertising or tracking cookies. TV pairing may use browser storage (similar to local storage) to remember your anonymous session id on your device.

## Data retention and deletion

- **On your device:** clear Runup's site data in your browser settings, or uninstall the TV app, to remove local progress.
- **Paired sessions:** unpair all devices from the web app to revoke TV access. Session records in our backend are not kept indefinitely; inactive sessions and expired pairing codes are removed on a rolling basis.

## Children's privacy

Runup is a general-audience fan tool. We do not knowingly collect personal information from children. If you believe a child has provided personal information through Runup, please contact us (below) and we will delete associated session data where we can.

## Your choices

- Use Runup without TV pairing — everything stays on your device.
- Unpair individual TVs or all devices from the web app at any time.
- Stop using Runup and clear local storage to remove on-device data.

## Changes to this policy

We may update this page when Runup's features change. The effective date at the top will change when we do. Continued use after an update means you accept the revised policy.

## Contact

Questions about this policy or your data:

- GitHub: [github.com/franferns/runup](https://github.com/franferns/runup) (open an issue)
