# ¿Tu celular te escucha? — brief

**Style:** scroll3d. **Format:** 9:16, 1080×1920, 30 fps, 63.5 s (voice 62.3 s + 1.2 s tail).
**Source:** Spanish remake of `Ref Scroll animations/9.mp4` (61.2 s): its 15 shots and camera moves, re-timed to the user's voice (`ANCH`). New world: `src/world.js` (living room at night, phones with code-drawn screens, router, app field, ad network).

## Changes from the reference
- An AirChef air fryer (invented brand) instead of the coffee machine; friends in mustard and teal (reference: red and blue); new room (wall, sofa, lamp, plant, city-light window instead of the moon).
- Everything animated (user, 2026-10-20): people breathe, blink, look at each other, talk (mouth + hands), nod; pops on springs; the phone vibrates; the app field lifts in a scan wave; the camera always drifts.
- Every shot boundary is a 0.5 s dissolve with both cameras moving (no hard cuts; user: "todas las transiciones seamless").

## Sound
User's documentary track (0 dB, voice.music −4), silent 0.8 s before "para una empresa de anuncios", +6 dB on it; code SFX ×3.5; 17 quiet recordings (`sound/layer.py`). Master high (piece.json loudness −7.5, ceiling −3).

## Claims and sources
- 17,260 Android apps checked, none found secretly sending audio (Northeastern University, 2018) — https://gizmodo.com/these-academics-spent-the-last-year-testing-whether-your-phone-is-secretly-listening-to-you-1826961188 · https://interestingengineering.com/innovation/no-your-phone-probably-isnt-recording-you-study-concludes
- Android and iOS show an indicator while the mic is in use — same sources.
- Ad platforms link devices sharing a public IP as one household (FTC cross-device tracking report, 2017) — https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/ftc-staff-issues-long-awaited-cross-device-tracking-report · https://digitalcontentnext.org/blog/2017/02/01/ftc-recommendations-cross-device-tracking/
- Battery drain, "3 h 12 min", IP 84.112.7.20: illustrative.
