---
name: openverse
description: Openverse API (CC audio/images search) works anonymously; endpoint and useful filters for sourcing SFX/music
metadata:
  node_type: memory
  type: reference
  originSessionId: c06d4859-1bbd-4e22-88ca-0cdf712f4c20
  modified: 2026-10-25T04:34:25.867Z
---

Openverse API: `https://api.openverse.org/v1/audio/?q=<term>&license_type=commercial&page_size=N` (also `/v1/images/`). Works with no key (anonymous rate limit). Results give `title`, `license` (cc0, by...), `duration` (ms), `url` (often freesound HQ mp3 preview), `creator`, `foreign_landing_url` for credits.
Registered 2026-10-25 as app `alanleiva-video-sfx` (email alanleivago@gmail.com); client_id/secret in `%USERPROFILE%\.openverse.json`. Token: POST `/v1/auth_tokens/token/` with client_id, client_secret, grant_type=client_credentials (lasts 12 h) → header `Authorization: Bearer <token>`. The email verification link returns HTTP 500 "Invalid verification code" (Openverse bug) and `verified` stays false, but the token already gets 100/min and 10000/day (anon: 20/min, 200/day). Always send the token. Use with [[earshot]] (`rank`/`realness`) to pick the best download.
