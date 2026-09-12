# Android App Launch Strategy

## Recommendation

For the current situation, the better route is to make the app a **normal Android mobile app first**, complete Google Play's closed-testing requirement, release it publicly, and then add proper Android TV support.

Google supports apps that work on both mobile and TV.

## Phase 1 — Make it a normal Android app

- Make the app available for Android phones/tablets.
- Do not make TV support required at this stage.
- Recruit at least 12 Android testers.
- Have the testers opt into the closed test.
- Keep at least 12 testers continuously opted in for 14 days.
- Use the testing period to find and fix bugs.
- Apply for production access after the required testing period.

## Phase 2 — Release publicly

Once production access is granted, release the mobile version publicly.

## Phase 3 — Add Android TV support

After the mobile version is released, add proper Android TV support, including:

- TV/remote-friendly navigation
- Larger UI elements
- Android TV launcher/banner
- Leanback/TV support where appropriate
- Touchscreen not required for TV
- A TV-specific interface rather than simply displaying the phone layout on a TV

Google supports an architecture where the same app can be available on both:

- Android Phone/Tablet
- Android TV/Google TV

## Important consideration

If the app is fundamentally a TV app — for example, it is designed only for watching/streaming content on a TV and has little or no useful purpose on a phone — do not artificially turn it into a phone app just to satisfy the testing requirement.

Instead, first determine whether the existing app can reasonably be adapted into a dual-platform app.

## Suggested architecture

Current:

Android TV only → App

Potential future:

Android Phone/Tablet → App
Android TV/Google TV → App

## Testing strategy

Do not recruit TV owners yet.

First determine whether the existing app can be changed from:

**TV-only → Android mobile + TV**

with a relatively small development effort.

Once the mobile version is ready, recruit genuine Android phone testers for the closed test.

After production access is granted, TV support can be developed and released as an update.

## Key point

The goal is not to bypass Google's testing requirements. The goal is to make the app genuinely useful on Android phones/tablets first, use real testers, complete the required testing, and then expand the app to Android TV properly.
