---
type: handoff
status: active
tags: [atrium, novelas, majestic, parte1, capos, veracruz, orizaba, catalogo]
relatedTo: [atrium-vista, novelas-variedad]
---
# brindis-orizaba (Parte 1): estado

## Hecho (2026-11-17)
- **CATALOGO.md #19 "El brindis" [CAPO]. Familia: Bodas, compromisos y pretendientes. Cierre tipo 5: se vuelve la acusación contra quien acusa ("Pregúntele a su esposa, don Clemente").**
- MAJESTIC. Cuenta monetizadotiktok18, proyecto Flow propio. 18 clips + 1 regen (c01: el ASR no oía "Brindo por la novia"; tras regenerar se comprobó con audio acolchado que sí lo dice y se forzó el tramo c01 desde 0.0 s en la EDL y en renders/phr.json).
- Render renders/share.mp4: 49.8 s, SPEED 1.15, subtítulos tamaño 38 revisados en qa/strip.jpg y renders/subs/*.json. LUFS -14.1, pico -2.1 dBTP.
- QA: qa/report.txt, qa/render_report.txt (c03 "mija"→ASR "mi hija"). revisar_render.py NO corrió: la API se quedó sin créditos (400 credit balance too low); revisión visual hecha en sesión con qa/strip.jpg.

## Pendiente
- No entregado (main entrega). caption.txt listo. Si se re-renderiza con post.py SIN --noedl, se pierde el arreglo de c01.
