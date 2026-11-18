---
name: pov3d-hd-niche
description: "pov3d-hd = long 16:9 \"What If X and Couldn't Stop?\" (8:30); niche mostly no voice; rocket-speedup piece started 2026-11-03"
metadata:
  node_type: memory
  type: project
  originSessionId: b662f66c-2701-43c1-aa76-70b98041d80b
  modified: 2026-11-04T14:07:39.384Z
---

pov3d-hd is the long-form YouTube variant of [[pov3d-style]] (16:9, 30 fps, 8:30; pieces wave-grew, luckier, rocket-speedup). Style kit lives in styles/pov3d-hd/kit.js (synced via git pull from the Mac).

Research 2026-11-03 (yt-dlp, vidIQ had no credits): 12 of 15 "couldn't stop" channels have no narration (Minute Zero, What If Sim, All Answers…); only The Readout / The Frame One / What If narrate. User chose no voice. Taken topics list is long; free ones then: rocket accelerating (chosen), snowball rolling, crack spreading, skyscraper growing.

User notes on rocket-speedup v1 (2026-11-03), apply to every pov3d-hd piece:
- The first 5 s teaser must be insane, with heavy motion and never-seen things.
- No visual glitches or flicker.
- Clouds must look volumetric, not painted.
- Suspense music in the style of Interstellar (organ, ostinato), original or licensed, predominant at the climaxes.
- Bodies never pass through the camera.
- Planets arrive gradually (dot → grow → sweep → recede), never popping in or out.
- First-person look-arounds (left, right, the photo) between events.
- Chaos in the long late sections.
- They liked the cockpit and its interior lighting.

Thumbnails (user's refs: Whatfinity, Edgecount, Elapsed): a clean frame (HUD off) fills the thumbnail, hero on the right, darker left side, with a serif left column: a small spaced-caps label ("YOUR SPEED"), a huge number ("99.99% c") and an italic line. Never Impact or the YouTuber-bold look. Script: pieces/rocket-speedup/tools/thumb2.py.

**Why:** user wants topics nobody has done and to follow what the big channels do.
**How to apply:** for each new pov3d-hd piece, re-check the topic with yt-dlp searches before the story check; default to no voice.
