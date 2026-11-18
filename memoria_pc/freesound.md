---
name: freesound
description: Freesound API key (token auth) for searching SFX and downloading HQ mp3 previews; backup/complement to Openverse
metadata:
  node_type: memory
  type: reference
  originSessionId: c06d4859-1bbd-4e22-88ca-0cdf712f4c20
  modified: 2026-10-25T04:40:38.368Z
---

Freesound API key saved in `%USERPROFILE%\.freesound.json` (`api_key`; app `alanleiva-video-sfx`, created 2026-10-25). Manage keys at https://freesound.org/apiv2/apply/ (not /apiv2/apps).
Search: `https://freesound.org/apiv2/search/text/?query=<q>&filter=license:"Creative Commons 0"&fields=id,name,license,duration,previews,username&token=<key>` → `previews.preview-hq-mp3`. Original WAV download needs OAuth2 (not set up).
More results than [[openverse]] (whoosh CC0: 2315 vs 240). Pick the best with [[earshot]]; credit CC-BY authors.
