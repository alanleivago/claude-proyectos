---
name: sonido-pro
description: "sonido pro" = the user's name for the full SFX stack (earshot + real-sfx + Openverse + Freesound); installed on both this Windows PC and the user's Mac
metadata:
  type: project
---

When the user says "sonido pro", use the whole stack: [[earshot]] (listen, bank, critique), [[real-sfx]] (real library sounds on the events), [[openverse]] and [[freesound]] (sourcing), plus the real-sound skill.
Code-made sounds are allowed too (earshot bank/forge or own synthesis) when they fit and don't sound bad — check them with earshot first (e.g. realness, match, no artifacts) before using them.
The user set up the same stack on their Mac too (2026-10-25). Tools, skills and keys live OUTSIDE the repo (F:\earshot, ~/.claude/skills, ~/.openverse.json, ~/.freesound.json), so git push/pull between the machines does not carry them; each machine has its own install and paths.
**Why:** the user works on both machines and syncs projects via git.
**How to apply:** after a pull, don't expect tool paths or keys from the Mac in the repo; never commit keys to make them sync.
