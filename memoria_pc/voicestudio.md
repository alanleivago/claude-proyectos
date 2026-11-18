---
name: voicestudio
description: "VoiceStudio (voz local clonada) instalado con MCP; voz mathomaly, siempre calidad máxima"
metadata:
  node_type: memory
  type: reference
  originSessionId: 53953e94-9f27-4760-b78b-71efa2260653
  modified: 2026-10-26T22:07:34.938Z
---

VoiceStudio 0.5.6 (Electron) instalado en `%LOCALAPPDATA%\Programs\VoiceStudio`; backend `http://127.0.0.1:3900` (CUDA, RTX 3060 Ti), MCP en `/mcp/` configurado en `F:\Claude Proyectos\.mcp.json`.

- Voz del usuario aprobada: **mathomaly**, profile_id `a5ce5a5c` (clon; al usuario le gustó el resultado).
- **Calidad: nunca bajarla.** Generar siempre con `steps=32` y formato `wav` (nunca opus/ogg).
- Env de usuario: `OMNIVOICE_MCP_OUTPUT_MODE=files`, `OMNIVOICE_MCP_BASE_PATH=F:\Claude Proyectos\voces` → los WAV del MCP caen ahí; clone_voice/transcribe solo leen archivos dentro de esa carpeta.
- El MCP solo conecta si la app está abierta ANTES de arrancar Claude Code; si falla, usar el REST (`/v1/audio/speech`) igual.
- La referencia de mathomaly dura 29.6 s (>20 s) → necesita `openai/whisper-large-v3-turbo` en `%LOCALAPPDATA%\OmniVoice\hf_cache` (instalado a mano, no está en el catálogo). No borrarlo.
- cartoon3d voice: **"3D cartoon 2"** `d9b69bea` (user re-cloned; the first "3D cartoons" d9ac3ed9 left loose voice fragments). User wants it SUPER animated the whole way: `instruct` only accepts accent/age/pitch/whisper (no emotion) → NEVER add "!" to scripts (user: sounds horrible); drive energy with `guidance_scale` 3.0 and picking the liveliest seed (REST /v1/audio/speech, seed varies the take). Generate several seeds, diff each against the script with whisper (they repeat or drop words), pick, then fix pacing in post (insert ~0.16 s beats where lines run together).
- Digger android voice (ORIGINAL, voice design, not a clone of anyone): profile **`5120fcba`** "Digger android (original)" (design: female, young adult, very high pitch, american accent, seed 7). REST /generate with num_step=32, seed=1, effect_preset=raw, then retro_voice.py --preset digger. Details in pieces/digger-01-fridge/voz-studio/README.md. Watch out: instruct+seed sometimes renders broken (a ~560 Hz tone); always check with whisper.
- Datos/logs: `%APPDATA%\OmniVoice` (`omnivoice.log`).
