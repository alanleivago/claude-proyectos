---
name: yt-agente-style
description: "Estilo APROBADO del canal YouTube \"agente Patrick Davis\" (refs en Ref youtube agente, video 1) y cómo se produce con yt-editor/edit.py"
metadata:
  node_type: memory
  type: project
  originSessionId: 4acbbdf7-be55-457b-a4ba-363c0a2f0599
  modified: 2026-10-28T03:56:45.805Z
---

Estilo aprobado el 2026-10-21 tras video 1 (`yt-editor/raw/video1_edit.mp4`, cues en `raw/cues.json` = plantilla).

**Flujo** (`F:\Claude Proyectos\yt-editor\edit.py`):
1. Unir `Ref youtube agente\videos raw\N-1.mp4` + `N-2.mp4` (concat -c copy, lista sin BOM). Sin cortes.
2. `python edit.py transcribe raw.mp4` (srt) y `python edit.py words raw.mp4` (tiempos por palabra). Whisper medium CPU int8 (CUDA falla por cublas; PyAV 19 roto → audio vía ffmpeg).
3. Elegir imágenes ancladas a la PALABRA exacta (buscar la frase en words.json), verificar lo que se dice durante cada una.
4. Imágenes: desde 2026-10-21 el usuario quiere FOTOS REALES DE INTERNET (sincronizadas a lo que se dice). Buscar primero en fuentes libres/dominio público: Wikimedia Commons API (`commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1920`, da licencia), fotos del gobierno de EE. UU. (DHS, CBP, USDA, DOL: dominio público), bancos gratuitos. Le avisé que fotos de prensa/agencias pueden dar reclamos o strikes; guardar lista de créditos (CC BY / BY-SA exigen atribución → para la descripción). Cuando se habla del gobierno/políticos (Trump, Casa Blanca, Congreso, DHS/ICE, Washington…) usar FOTOS REALES de esas personas/lugares, exactamente en la palabra que los nombra (retratos y fotos oficiales de la Casa Blanca/DHS/Congreso son dominio público; Wikimedia los tiene). Personas reales NUNCA con IA, solo fotos reales y de la persona correcta. Fallback si no hay foto adecuada: MCP srz-google-flow-mcp (Nano Banana 2.1, 16:9, prompt + ", realistic documentary photograph, natural light, no text, no logos, no readable signs"). NO flow-auto. Ver [[flow-mcp]].
5. STORYBOARD antes del render (plan de imágenes con tiempo+frase dicha + fotogramas de un preview con `max_t`) y esperar OK. Luego render completo (~3 min, NVENC).

**Reglas visuales:**
- **Primeros 40 s (pedido 2026-10-25):** ritmo fijo de imagen 5 s → 6 s de cámara → imagen 5 s… (inicios en 0:04, 0:15, 0:26, 0:37), cada una elegida por lo que se dice en esa ventana. Después, el ritmo normal:
- Imágenes a pantalla completa, ~6,5 s cada una, ≥9 s de cámara entre imágenes, y **media de una imagen cada ≤33 s** (pedido 2026-10-24: 46 s le pareció demasiado; v02 quedó en 28 s con 23 imágenes en 10:49). Si la regla de separación choca, acortar la imagen anterior (mín. 5 s) en vez de descartar. Primera imagen en el segundo 4. Zoom-in lento en cada imagen.
- Film burns (de `Ref youtube agente\film burn.mp4`, usados 3s–86s, girados a horizontal, 8 clips en assets/burns, semitransparentes, pico en el corte) SOLO en cortes de los primeros 50 s; luego cortes directos.
- Cámara: un push-in lento y continuo por tramo (sin saltos abierto/cerrado), con `perspective` subpíxel (zoompan tiembla). ZOOM_RATE 0.0055/s.
- Intro (tarjeta Patrick Davis) cuando dice "soy el agente…", ~7,5 s, voz debajo. Botón de suscripción cada 2 min + en "suscríbanse" (asset recortado desde 17,7 s, sin destello). Outro "¡Suscríbete!" al final.
- Títulos de los primeros ~15 s: 2 líneas grandes, palabras clave en amarillo #FFD400, glow brillante. Desde v03 (2026-10-27) ANIMADOS con Remotion (`yt-editor/yt-remotion`, composición Titles: palabras que entran escalonadas con spring + blur, destello de glow en las amarillas, salida con blur): `npx remotion render Titles ../vNN/titles.mov --props=../vNN/titles_props.json --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png` y cue `"titles_video"`. Tarjetas laterales con sombra suave.
- Subtítulos: UNA línea, FreeSansBold 78, blanco con borde negro.
- Audio: voz -14 LUFS; BGM -29 LUFS (en video 1 fue -27 y aún algo alta).
- **Bloque tarjeta roja (pedido 2026-10-27, hecho en v03):** igual que la ref (1.mp4 4:40-5:23). En "la tarjeta roja" entra `Ref youtube agente\tarjeta roja 2.webp` a la DERECHA (x1342 y147 468x542); en la siguiente frase `tarjeta roja 1.mp4` en bucle a la IZQUIERDA (x24 y192 703x405), esquinas redondeadas 22, fade-in 0,3. Tras "no se imaginan cuántas paradas… esta tarjeta" se INSERTA en el raw (corte en silencio) el clip `No importa tu situación migratoria…mp4` 3,9-11,4 s a pantalla completa (810 px de ancho centrado, fondo desenfocado) CON su audio; luego vuelven las tarjetas hasta terminar de hablar de ellas ("…aquí abajo") y salen con fade 0,5. edit.py: cues "pips"; plantilla `yt-editor/v03/cues.json`.
**Why:** iterado con el usuario en 3 rondas hasta que dijo "mucho mejor… todo bien".
**How to apply:** reutilizar edit.py tal cual; solo cambiar raw, imágenes, títulos de apertura y tiempos de botones.


**Corrección 2026-11-05:** ya NO mostrar storyboard antes del render (son simples): renderizar y entregar directo. Nunca repetir la misma imagen en un video.
