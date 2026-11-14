---
name: youtube-skills
description: 11 yt-* skills (Jakeschincariol/youtube-agent-skill) installed globally; use them for everything published on YouTube
metadata:
  node_type: memory
  type: feedback
  originSessionId: c06d4859-1bbd-4e22-88ca-0cdf712f4c20
  modified: 2026-10-26T23:58:50.568Z
---

Installed 2026-10-26 in `~/.claude/skills/yt-*`: yt-script (21 hook formulas + hookscore.py), yt-package (title+thumbnail lint, title.py), yt-seo, yt-chapters, yt-shorts, yt-retention, yt-edit, yt-viral, yt-comment, yt-plan, yt-audit. Tools run with plain `python` (no deps). Every skill reads `~/.claude/youtube/voice.md`, which is a router to one file per channel in `~/.claude/youtube/channels/` (agente-davis, megagirl, alterbase, amphorus, senior-doggo, flynn-flyers, boy-jesus; 2026-10-26). Each has "Open questions" still to fill. Goal: make all 7 channels viral.
**Why:** the user wants me to act as a YouTube expert for the content we publish there.
**How to apply:** for any YouTube video (e.g. [[agente-davis-guiones]], [[digger-channel]]) run the hook through yt-script/hookscore and the title+thumb through yt-package before delivering; add yt-seo description/tags and chapters. Publishing goes through [[zernio]] with confirmation.
