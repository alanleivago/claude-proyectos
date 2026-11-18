---
name: vmos-cloud
description: VMOS Cloud (cloud phones) controlled via OpenAPI with tools/vmos.py; keys VMOS_AK/VMOS_SK in root .env; phone Pixel 10 Pro APP6958QPXXF8LD7
metadata:
  node_type: memory
  type: reference
  originSessionId: 77f884e0-20f8-427f-b074-6e8d6a4aabad
  modified: 2026-11-12T19:32:23.963Z
---

- Client: `python tools/vmos.py list` / `python tools/vmos.py <endpoint> '<json>'` (V2 SHA-256 signing, host api.vmoscloud.com, prefix /vcpcloud/api/padApi/).
- Phone (bought 2026-11-12): Google Pixel 10 Pro, padCode APP6958QPXXF8LD7, padType real, Android 16, 1080x2410, has TikTok + Chrome.
- Screenshot: `getLongGenerateUrl {"padCodes":[...]}` → signed URL; download it UNCHANGED (editing width/height breaks the sign).
- Endpoint list for AI: https://cloud.vmoscloud.com/vmoscloud/doc/zh/server/llms.html (simulateTouch, inputText, startApp, uploadFileV3, asyncCmd, openOnlineAdb).
- vmos.py also: `shot [out]`, `sh "input tap x y"`, `run "cmd"` (waits output), `push local /sdcard/...` (base64 chunks, max 4096 chars/cmd, ~1 s per 3 KB: OK for photos, too slow for videos). In Git Bash prefix MSYS_NO_PATHCONV=1 or /sdcard gets mangled.
- ADB tunnel does NOT work on this "real" phone (forward target localhost:1 → device offline); tools/vmos_adb.py left as is.
- TikTok account @mexitve (antes @naldo5944) (pkg com.zhiliaoapp.musically), avatar = MEXI TV logo (2026-11-12). Warm-up: `python tools/tiktok_warmup.py [min] [p_like]` — pure script + Haiku 5.5 screen check every 8 videos (API credits); restarts TikTok at start.
- Purpose: posting to TikTok/FB from cloud phones (related [[artemis]], [[zernio]]).
- Subida PROBADA 2026-11-12 (chofer-patrona p1 publicado en @naldo5944): LucidLink app → Renders finales claude/<Estilo> → ⋮ → Download → GUARDAR (va a /sdcard/Download) → TikTok "+" → miniatura galería abajo-izq → video → Siguiente → Siguiente → tocar descripción → API `inputText {"padCodes":[pad],"text":caption}` (emojis OK; TikTok deja solo 5 hashtags) → atrás (teclado) → Publicar (≈2337 y). Caption sin la marca (MAJESTIC/VISTA...). Permisos de contactos: NO PERMITIR.
- SCRIPT de subida (probado en seco 2026-11-12): `python tools/tiktok_upload.py <Estilo> <archivo.mp4> [--dry]` — baja de LucidLink, mira 3-6 videos, sube con el .txt (sin marca, 5 hashtags), luego mira 4-8 videos; toques con jitter. Botones por texto vía uiautomator filtrado en el teléfono (la API corta salidas a 2000 caracteres). Cero tokens.
- **Teléfono V06 = cuenta de Patrick (2026-11-14):** padCode ATP63362YSJXJF2F (virtual, Android 15, M2012K11AG, SIM T-Mobile US, IP en Industry CA). TikTok @agentedavis (51.8K seguidores, app en español) + LucidLink (alanwork/trabajo) logueados. Zona horaria y GPS puestos en Los Ángeles para que coincidan con la IP. SOLO la cuenta de Patrick en este teléfono. Usar `VMOS_PAD=ATP63362YSJXJF2F python tools/vmos.py ...` (también tiktok_upload.py / tiktok_warmup.py leen VMOS_PAD del entorno; sin él usan el Pixel APP6958). Ver [[gumroad]], [[agente-davis-guiones]].
- V06 herramientas (2026-11-14): `tools/patrick.py ui|tap|type|key|swipe`, `tools/patrick_inbox.py` (vuelca chats, pero NO lee mensajes largos: verificar con captura), `tools/patrick_dm.py`. inputText AÑADE al borrador: vaciar la caja antes (y en el chat se puede "Cancelar envío" con pulsación larga, 1 h). Pantalla 720x1280. Estrategia y estado: agente-davis/tiktok/ESTRATEGIA.md.
