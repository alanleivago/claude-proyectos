---
name: stimulus-style
description: Estilo Stimulus (talking heads de Dariel) — spec en styles/stimulus/ESTILO.md, outro real y logo en styles/stimulus/assets
metadata:
  type: project
---

Primer estilo talking head pedido (2026-11-05): replicar los 7 videos de `Ref videos Dariel/Stimulus/` (marca Stimulus Athletic, uniformes deportivos, presentadora en inglés, 9:16, 14-24 s).
- Fuente principal: DIN Next LT Arabic Bold (dicho por el usuario).
- Outro con logo obligatorio: usar `styles/stimulus/assets/outro.mp4` (2.44 s, idéntico en todos los refs).
- Spec medida: `styles/stimulus/ESTILO.md` (subtítulos blancos 60-64 px + resalte cursiva lima #E6F25A, gancho gigante con RGB split, saltos de zoom secos 100↔108-120 %, flashes cálidos, catálogos con subtítulo negro).
- Herramienta: [[tesseract]]. Análisis por API: `tools/analizar_estilo_edicion.py`.
- Primer video: `pieces/stimulus-01/` (build.py = fuente de verdad; regenerar el .tsrct con `python build.py`). Entregado 2026-11-05, críticos API 7 y 7.5 tras 3 rondas, pendiente feedback del usuario.

## Corrección del usuario (2026-11-05): v1 en Tesseract "no se parece en nada"
**Why:** usé el resumen de la API en vez de mirar los refs cuadro a cuadro, y abusé del serif.
**How to apply:**
- Hacerlo en HyperFrames (`pieces/stimulus-01-hf/`, `prep/gen.py` genera index.html; `prep/make_edit.py` corta el edit; `remove-background` da el recorte para texto detrás de la cabeza).
- Títulos grandes = DIN Next bold (NO serif): degradado blanco→crema, glow, RGB split rojo/cian, detrás de la cabeza; kicker blanco arriba + línea blanca a la derecha; línea luminosa lima bajo la cifra.
- Serif (Gloucester) SOLO en "1 Free PDF" y casos así, casi nunca.
- Subtítulos: 1-2 líneas en el pecho; línea 1 blanca con sombra suave + glow blanco; línea 2 cursiva crema con glow; palabra negativa roja, positiva verde; entrada blur→nítido 0.3 s por línea.
- Iconos de contorno blanco con glow en fila bajo el subtítulo (no emojis 3D). Checklist: círculo verde + MAYÚS cursiva + línea luminosa. Flashes light-leak naranja/rosa.
- Estudiar SIEMPRE los refs a resolución completa (recortes) antes de construir.

## Correcciones v2 → v3 (2026-11-05)
- Palabras grandes detrás de la cabeza = lo PRIMERO que dice (ej. "CLUB" un poco grande + "DIRECTORS" enorme, la gorra tapa parte). Cifras ($5,000) van ABAJO en la zona de subtítulos, grandes pero no enormes, y aparecen JUSTO en la palabra, con conteo rápido (~0.4 s).
- Palabras que flanquean la cabeza: una a la izquierda y otra a la derecha, detrás de él, sin taparle nunca la cara.
- Aberración cromática difuminada (feather, blur ~5px, opacidad .6), no copias duras.
- Recorte limpio: endurecer el alfa del cutout (niveles + erosión) para que nada traspase la cabeza.
- Sin SFX en el zoom de entrada. Zooms: además de cortes secos y drift lento, push-ins rápidos con ease in/out en palabras clave.
- Transiciones = film burns reales (Pexels, screen, opacidad ~0.5) en algunos cortes; NO light leaks de colores hechos en CSS.
- Subtítulos con glow blanco ligero. Iconos siempre pegados al texto (nada suelto). Marca limpia y ordenada.
- Outro: sin su música propia; sigue la música del video, más alta.

## Correcciones v3 → v4 (2026-11-05)
- Música: tipo `Ref videos Dariel/Stimulus/Referencia bgm.mp4` (groove funk/house ~120 BPM, sub bass, plucks, vocal chops, "confident & cool"); SIEMPRE debajo de la voz y sonando desde el frame 0 (sin intro floja).
- Alinear palabras apiladas: la C de CLUB exactamente sobre la D de DIRECTORS (mismo borde de tinta, medido con PIL), con margen a los bordes (DIRECTORS ~190 px, CLUB ~134). Palabras que flanquean la cabeza: MISMO tamaño y misma línea, sin tocar bordes.
- NADA de whoosh en transiciones/burns/outro.
- Zooms como los refs (medidos con ORB): ~0.5 s, arranque corto (ease-in) + frenada larga (ease-out), ±12-18 %, alternando in/out; entre zooms la cámara QUIETA (sin drift lento). Cortes = salto de escala seco.
- Cursivas con background-clip: dar padding al span (.cream) o se corta la última letra ("right?").
- Subtítulos ~70 px (cursiva 66), máx 2-3 palabras por línea, slide-up marcado (~38 px, 0.34 s). Palabras clave en grande dorado + línea amarilla como el $5,000 (LESS, CASH, FREEDOM...). Iconos solo en bloques cortos para no tapar el balón/manos.
- Checklist (seg 32) APROBADO tal cual.
- Outro: `assets/outro.mp4` tenía 2 frames con un pedazo de otro video al inicio → recortado (2.336 s).

## Correcciones v4 → v5 (2026-11-05)
- Música = CINEMATOGRÁFICA/ORQUESTAL (cuerdas, metales, percusión, épica-inspiradora), NO funk. Usada: Freesound 608811 "Uplifting Dramatic Soundtrack" (CC0).
- Palabras que flanquean la cabeza: una pegada a la izquierda y otra a la derecha con el MISMO margen (~75 px), misma línea y tamaño; "through" en blanco.
- Líneas luminosas bajo palabras/montos: separadas ~15-20 px del texto.
- Film burns: usar SIEMPRE `Ref videos Dariel/Stimulus/Overlay film burn transition.mp4` (1920x1080, rotar 90° a vertical), opacidad baja (~0.38), con el frame más brillante justo ANTES del corte (empieza antes, tapa el corte).
- Outro: la tarjeta entra deslizando ENCIMA de todo; el video y los captions se quedan debajo (no mover la cámara).
- Captions un poco más grandes (76 px / cursiva 72). Checklist también con glow y RGB ligera.
- Estilo extra de los refs: línea chica blanca + línea luminosa separadora + línea en MAYÚSCULAS grande con degradado y RGB split visible ("you want to be / 100% SURE", "Coach, / THIS IS FOR YOU!"). Usarlo en algunos bloques.

## Correcciones v5 → v6 (2026-11-06) — v6 = versión final de stimulus-01, plantilla para los siguientes
- FLUJO: antes de renderizar, mandar STORYBOARD (contact sheets en `<pieza>/storyboard/`) + previews de música (25 s con voz) y esperar OK. Storyboards NO van a Telegram.
- Música aprobada: Freesound 621294 "Orchestral Score 1" (sección de cuerdas 32.6-70.7 s en loop) + sub-bajo añadido (asubboost + bass shelf). Cellos, un poco rápida; risers (Freesound 500656/822419) antes de los momentos grandes ($5,000, giro, CASH, CTA).
- Film burns llevan su propio sonido (audio del mismo overlay).
- through / fundraising: grandes (96/80 px), misma línea base, mismo margen; plano en 1.16 con paneo dentro del rango que cubre el cuadro.
- Zoom NUNCA < 1.16 (con y=-150 aparecen barras negras). Zooms: MUCHOS zoom-ins (~17 en 52 s), 0.6-0.9 s, power2.inOut (ease-in que se sienta), paso 0.09, máx 1.42; nunca cruzan un corte.
- Líneas bajo palabras/montos: justo a la mitad entre esa línea y la de abajo (calcular con métricas DIN: asc 1.2, desc .27, cap .68).
- Rojos: más grandes (+6 px) con contorno oscuro para que se lean sobre el balón. Captions 86 px (cursiva 82, caps 94), autoajuste a 960 px.
- v6→v8: SOLO los risers estaban altos (los demás SFX bien: burn 0.4, impact 0.3-0.5, pop 0.25, click 0.35, tick 0.14). Riser RÁPIDO (~0.9 s de subida, Freesound 754771) a 0.08; nada de risers largos. Música bed 0.10, outro 0.32. Si piden bajar X, bajar SOLO X.

## NIVEL APROBADO (2026-11-06): stimulus-01 v8 = formato y nivel mínimo para todos los siguientes
Plantilla: `pieces/stimulus-01-hf/` (prep/make_edit.py, prep/gen.py, assets/). El usuario da libertad creativa para subir el nivel.

## Video 2 (2026-11-06) — pieces/stimulus-02-hf (flujo: prep/transcribe.py <raw> -> prep/make_edit.py -> remove-background + firmar alfa -> prep/gen.py -> storyboard -> OK -> render)
- MÚSICA DISTINTA en cada reel (parecida, no la misma) al menos en 6 de los 11; luego se pueden repetir. Usadas: v1 = Freesound 621294 (Orchestral Score 1); v2 = 583274 "Obsession (Strings)". Elegir la siguiente con earshot compare contra la B (cuerdas/cellos), siempre con el sub-bajo añadido.
- Limpiar el ruido de fondo de la voz: afftdn=nr=18:nf=-42 + agate suave antes del compresor (piso -41 → -69 dB); igualar la voz a -15 LUFS integrados.
- Iconos 130 px, separados del texto con el mismo aire que hay entre líneas (ICON_GAP 30 desde la caja de la última línea).

## Correcciones video 2 (2026-11-06) — REGLAS FIJAS
- NINGUNA palabra con pop-in/scale: TODO entra con slide-up + fade (+blur). Palabras grandes NUNCA en rojo: siempre el dorado/crema (gfill) del video 1.
- Títulos detrás de la cabeza salen PALABRA POR PALABRA al ritmo en que las dice; ninguna palabra cortada/tapada por la gorra (kicker por encima de la cabeza).
- NO poner SFX a palabras ni iconos (nada de pop/impact/click). Solo risers rápidos, sonido de los film burns.
- Unir bloques cortos para que palabras e iconos duren más (ej. "one sheet, ONE BOX" + "ships to you." en un bloque con ambos iconos debajo).
- Bloques sin icono con palabras rojas/listas: aprovechar para poner iconos debajo.
- Revisar pausas largas en el edit (cortarlas aunque el detector no las marque).
- Música: tipo DOCUMENTAL / inspiradora como la B; NADA de terror/suspenso. Dar 5 candidatas para elegir.
- ANTES de entregar: revisión del render (tools/revisar_render.py + fotogramas).

## Música por reel (desde 2026-11-06)
Pistas del usuario en `Ref videos Dariel/Stimulus/musicas bgm/`, procesadas en `styles/stimulus/assets/bgm/*.wav`:
premiere (Artlist Adrián Berenguer, desde seg 5), presto (Slowed&Reverbed acelerada asetrate ×1.2), highest_order (Soundstripe, atempo 0.92), zaphenath, rain, music_B.
Asignación: v1 B · v2 premiere · v3 presto · v4 highest_order · v5 zaphenath · v6 rain · v7+ se repiten.
Pistas Artlist/Soundstripe: sin bajo añadido, solo loudnorm -14; cama 0.10 bajo la voz (voz siempre encima).
- Kicker del hook (COACHES & CLUB) va DETRÁS de la cabeza (z bajo el matte), pegado encima de DIRECTORS, con glow blanco.
- Glow de iconos en el wrapper .icon (el tween sobre img pisa su filter); glow MEDIO (3px .8 + 12px .45); el fuerte de 4 sombras fue "muy alto".
- Inicio de palabras: refinar con energía de la voz (prep/refine_words.py) — Whisper adelanta los inicios.
- Palabra clave del hook (PICK WRONG) visible ≥0.9 s nítida; el bloque siguiente espera a que salga.

## Video 2 APROBADO (2026-11-06) — plantilla para 3..11: pieces/stimulus-02-hf
Flujo: transcribe.py (voz limpia) → refine_words.py (inicios reales) → make_edit.py (pausas globales) → words_edit.json con inicios refinados → plan (BLOCKS/CHECKS/CTA/HARD/ZMOVES) en gen.py → check → snapshots → render → revisar_render.py → Telegram.
Reglas fijas añadidas: palabras aparecen cuando él las dice; "or" blanco entre palabras grandes; RGB difuminado (blur 7-10px, op .4-.5); sin riser en los primeros 3 s; burn SFX junto a su imagen; zoom termina ≥0.7 s antes de un corte y saltos de escala ≥1.6 s separados (sin zoom→corte inmediato); música del outro con fundido ~0.9 s (sin subida brusca).
- (video 3) Cortar SIEMPRE las pausas largas "pensando": además del silencio global, cortar todo hueco entre palabras ≥0.3 s (con respiración no lo detecta -50 dB); fusionar pausas solapadas.
- Título del gancho más grande (kicker 120 px, palabra grande 225 px) y alineados por el borde izquierdo de la tinta.
- Si el recorte se lleva el neón del fondo: borrar SOLO ese blob del matte (caja justo encima del ala de la gorra, sin tocar cabeza) y revisar que no quede un "cuadro" raro sobre las letras.
- Voz +1.5 dB sobre el v2 (mezcla ≈ -13.7 LUFS).
- Sujeto con balón/objeto abajo: los bloques altos suben (nunca texto sobre el balón ni sobre la boca); cada línea ≥0.8 s en pantalla.
- ANTES DE ENTREGAR: recortar y MIRAR de cerca las letras del gancho en 4-5 fotogramas (0.5-4 s) del render final; ninguna letra cortada por el matte. El neón del fondo se borra con geq siguiendo el borde de la gorra (no con caja).
- Cortes reales a <1.6 s entre sí: misma escala (sin salto de zoom) y sin zoom en segmentos cortos.
- Video 3 APROBADO (2026-11-06): pieces/stimulus-03-hf es la plantilla más reciente (gen.py con HOOK_HANDOFF/AFTER_HOOK, cámara sin saltos en cortes cercanos).
- (video 4) prep/pauses.py = pausas globales + huecos ≥0.3 s; make_edit usa la duración real del raw (no 63.95 fijo). Ropa blanca: halo oscuro en .cap/.list. fit() a 930 px (rojas incluidas). Palabras "big" anchas (>~900 px) → usar caps. Título del gancho: colocar según dónde quede la gorra/neón de cada raw (revisar recortes).
- (video 4 v2) Captions NUNCA en la cara: top ≥990 y CAP_BOTTOM por video (1560 sin balón, 1330 con balón). Lista: .dot flex:none (números alineados). Kicker del gancho CENTRADO y algo más chico (96 px) sobre la palabra grande. Zooms: solo zoom-in (el corte resetea) + push-in lento sine.inOut en tramos quietos ≥2.4 s. CTA "free design and sample jersey": 2 líneas blancas + icono de camiseta 3D a color (assets/icons/jersey3d.svg) grande a la derecha.
- Refs nuevas (2026-11-06): "Ref videos Dariel/Stimulus/ref videos nuevos/ESTILO.md" (+ *_estilo.md). Adoptar desde v5: CTA en 4 bloques (Contact us today [icono teléfono con ondas] / to see if your team qualifies / for a free design / and sample jersey [camiseta 3D a color a la derecha]); tras cada corte push-in lento continuo (≈+3-6 %/s, hasta 108-118 %); barrido de brillo (shine 0.5 s) sobre la línea luminosa y títulos; palabra clave en cursiva que cambia de color al decirse (problema amarillo/rojo, solución verde); máx. 2 acentos por video. Mantener las reglas del usuario (slide-up, sin SFX en palabras) por encima de la ref.

## v4 v3 (2026-11-06) — correcciones
- MÁS íconos: casi todo bloque lleva 1-2 íconos (filas que se acumulan, p.ej. 3 camisetas). Ícono nunca aparece antes de la última línea de su bloque (si su palabra es antes, entra con la última línea, escalonado 0.15 s). Bloques con íconos suben 60 px (no tocar manos); bloques con "big" van sin íconos.
- MÁS zooms: ZMOVES casi cada 2-3 palabras, ZSTEP 0.07, ZMAX 1.50, separación 0.1 s, y push-in lento en cualquier tramo quieto ≥1.4 s.
- Nombres/palabras clave EXACTAMENTE al decirlas: verificar el onset en la forma de onda (Whisper puede atrasar 0.2 s) y corregir words[i]["s"].
- Rotoscopia del gancho: rehacer con rembg BiRefNet-portrait (prep/roto_hook.py, solo los primeros ~4.7 s, cutout_hook.webm) — el matte de hyperframes deja manchas oscuras junto a la gorra/oreja. Revisar recortes sobre amarillo.

## Roto del gancho = Premiere (2026-11-07, APROBADO como método)
- El usuario hace la máscara de objeto en Premiere (secuencias "ROTO stimulus-0N", bin "Roto Claude", seguimiento hasta 10 s). Yo exporto con ExtendScript `seq.exportAsMediaDirect(out, "...Apple ProRes 4444 with alpha.epr", 1)` tras setIn 0/setOut 10.5 (Media Encoder se cae: NO usar export_sequence/AME). Luego `python tools/prores_to_cutout.py roto_pr.mov cutout_pr.webm` (deja solo el blob mayor = sin neón) y v-cut dura 10.4 s.
- MCP: llamadas a Premiere SIEMPRE de una en una (en paralelo el bridge falla).
- Referencias buenas del usuario: secuencia "Stimulus reels buenos" en el proyecto Dariel Stimulus (muchos reels; inspeccionar textos/brillos/zooms y ser creativo por reel).
- OJO (corrección 2026-11-07): el export de Premiere puede venir ESCALADO/MOVIDO si el clip tiene Movimiento (v1 109%, v3 103%) → se ve doble. SIEMPRE medir alineación roto vs edit.mp4 (diff media en alfa ≈1 = bien; si >5, sacar el affine con cv2.findTransformECC y pasarlo como 3er arg a tools/prores_to_cutout.py). Mirar el render completo (no solo recortes de la gorra) antes de entregar.

## Reglas 2026-11-07 (de "Stimulus reels buenos" en Premiere + correcciones) — APLICAR SIEMPRE
- Íconos EN SU PALABRA (nunca esperar a la última línea). "three kids" = 3 camisetas a la vez (escalonadas 0.12 s). Entrada como el usuario: suben ~480 px en 0.5 s (power3.out, blur leve), fila separada ~235 px, glow medio + sombra 0 10px 14px.
- Zooms (sus "Acercar lento"): rápido-largo 100→122-125 % en 1.2 s con ease, luego vuelta (zoom out 0.8 s) — alternar in/out cada ~3 s, el primero empieza a 0.6 s (zoomeando ya antes de los 2 s). También zoom lento 100→127 % en 5 s. NUNCA saltos de escala en inicios de frase (solo en cortes reales).
- Kicker del gancho (HIGH SCHOOL): 82 px, baseline 478 (separado del título grande).
- Inspeccionar la secuencia por ExtendScript con `return` explícito (sin return devuelve "undefined"); valores de keys con getValueAtTime.

## Estándar "Premiere del usuario" (2026-11-07) — los 4 reels re-renderizados con styles/stimulus/hfkit.py (importado por cada prep/gen.py)
- Subtítulos: DIN 83.5 px, tracking −0.031em, 90 px entre líneas base, blancos; línea 2/remate en cursiva BLANCA (no crema); resaltes verde #78FF00 / rojo #F92F2F en cursiva; MAYÚS solo en líneas de énfasis (cursiva, degradado #CDC9A9→blanco, sin text-shadow encima del background-clip). Entrada: +60 px en 0.5 s cubic-bezier(.33,0,0,1) (CustomEase "pr") + opacidad lineal 0.04–0.43 s. Palabras grandes: misma subida, 0.5 s.
- Íconos = PNG del usuario (EMOJIS PNG) invertidos a blanco: `python styles/stimulus/make_icons.py` → styles/stimulus/icons_png (nombres en MAP; solo íconos negros de línea, los de color se descartan). 175 px (150/130 si hay balón), centro 125 px bajo la última línea base, ranuras 3 = 310/540/770, 4 = 190/420/660/890; suben 45 px en 0.51 s; bloques con íconos +60 px arriba; nunca en bloques "big" ni donde él gesticula.
- Cámara: hfkit.camera() muestrea por fotograma (tl.set por frame; los keyframes GSAP en grupo NO se aplicaban). Tipos A 172→100 lineal 0.77 s · B push 1.24 en 1.2 s+deriva+vuelta · C escalera 1.15→1.26 · D lineal 1.27/5 s · E golpes ×1.13/×1.11 · cortes: O reset abrupto a 100 / I zoom-in abrupto 120 (el plano anterior vuelve a 100 antes). Cortes <1.6 s no cambian escala. Mientras el título está detrás de la cabeza solo D corto 1.095/2.7 s (la gorra no tapa más letras). Secuencias: v1 DBECBDEC/OIOO, v2 EDBCEBDC/OOI, v3 CBEDBECD/IOO, v4 BEDCBECD/OIO.
- CTA "for a free design / and sample jersey" = hfkit.cta_free: Europa Grotesk SH Med (está en %LOCALAPPDATA%\Microsoft\Windows\Fonts\EuropaGroteskSH-Med.otf) 95.6 px +0.006em; línea 2 cursiva 91 px ×1.03, +93 px, degradado #BDBE83→#F8F8F6, +0.78 s, parpadeo de blur en el wrapper (no en el span: borra las sombras); camiseta tintada #1B6F4A (icons_png/jersey_green.png) 165 px, rot 8°, centro = fin de "design" −8 px, línea base −62 px, DETRÁS del texto, +0.117 s. Medido: la línea 1 del ref va de x 234 a 848 (ANALISIS decía 796, error).

## 2026-11-07 — v1-v4 APROBADOS (estilo Premiere "Stimulus reels buenos", hfkit.py) + 2 correcciones para v5+
- v1-v4 renders aprobados: "quedaron muchisimo mejor". Base para 5-11 = styles/stimulus/hfkit.py + premiere_ref/ANALISIS.md.
- PALABRAS GRANDES (títulos/key words tipo CLUB DIRECTORS): usar el gradient VIEJO, más amarillo: `.gfill` linear-gradient(180deg,#ffffff 0%,#fbf8dc 45%,#ece88f 100%) (y `.cream` #fffef2→#f6f3c4 55%→#e7e98f) + RGB split feathered. El gradient nuevo de hfkit (más blanco/beige) NO gusta. Es lo único a conservar de las versiones viejas.
- ÍCONOS: si la palabra del ícono cae tarde en el bloque (cerca del final de lo que dice), el ícono entra con la PRIMERA línea del bloque (ej. tienda en "Their uniforms came from", no en "brand"). Nunca íconos al final cuando el bloque ya se va.

## v5-v11 (2026-11-07) — cómo se construyen (fase 1)
- Código común: `styles/stimulus/gen5_body.py` (= gen.py aprobado del v4 con gancho genérico) + `hfkit.GOLD_CSS` (gradient viejo amarillo, SOLO v5+) + `icon_row(late_to_first=True)` (ícono cuya palabra cae en la 2ª mitad del bloque o con <1.3 s restantes entra con la 1ª línea; la fila se llena de izquierda a derecha). v1-v4 no usan nada de esto (no regenerarlos).
- Cada pieza: `prep/plan.py` (HOOK kicker/big/end/k_base/big_base, BLOCKS, CHECKS, CTA, CAP_TOP/CAP_BOTTOM, CAM_ORIGIN/CAM_Y, JERSEY_TINT, BURN_CUTS) → `bash pieces/_mkgen.sh NN pista offset` arma prep/gen.py + assets/music.mp3. Montos "$16,000" en línea big = conteo 0.42 s automático.
- Encuadre distinto por raw: el título va con su base ~147 px bajo el borde superior de la gorra en pantalla. Tomas de pie (cabeza alta): CAM_ORIGIN "585px 600px", CAM_Y +90. Con balón en el pecho: origen del zoom en el borde superior del balón (v8: "585px 1250px", y −100) y captions en el pecho ENCIMA del balón (760-1085) — debajo del balón no cabe, los zooms lo empujan.
- Gancho temporal sin roto de Premiere: `prep/roto_hook.py <seg>` (BiRefNet CPU, ~8 s/fotograma) → cutout_hook.webm; gen usa cutout_pr.webm automáticamente cuando exista (re-correr gen.py + render).
- Jersey del CTA teñido por reel: icons_png/jersey_{green,purple,navy,teal,red}.png (glow del mismo color).
- Música 5-11: v5 zaphenath@12 · v6 rain@4 · v7 premiere@40 · v8 presto@60 · v9 highest_order@100 · v10 rain@60 · v11 zaphenath@78 (offset dentro de styles/stimulus/assets/bgm/*.wav, loudnorm -14).
- Rotos 5-11 (Premiere, máscara de opacidad del usuario) exportados con exportAsMediaDirect + preset `C:\Program Files\Adobe\Adobe Premiere Pro 2026\MediaIO\systempresets\3F3F3F3F_4D6F6F56\Apple ProRes 4444 with alpha.epr`; chequeo `python pieces/_roto_align.py <pieza>` (diff ≈1 = ok; imprime AFF si no) y `python pieces/_cut_check.py NN out.jpg` (fondo amarillo + blobs). v6 venía con Escala 110 → AFF 1.1/-54/-96.
- Premiere BLOQUEA los edit.mp4 importados: no reescribirlos. Voz al nivel aprobado (render ≈ -13.5 LUFS como v3/v4) va en `assets/edit_v.mp4` (gen5_body lo usa si existe). Medir: el volume=+G de ffmpeg sobre el edit dio ~1 dB más de lo calculado → medir después siempre.
- Título del gancho: el revisor API marca "letra tapada por la gorra" siempre; subir el título hasta que la gorra solo tape la parte baja de 1 letra (base ≈ borde superior de la gorra + 105 px) sin que el kicker pise el neón STIMULUS (achicar kicker a 60-70 px si hace falta).

## Correcciones v5-v11 (2026-11-07, "están geniales") — REGLAS
- Zoom-out de arranque 172→100 RÁPIDO: 0.4 s (hfkit.camera a_dur; gen5_body pasa 0.4 por defecto). v1-v4 conservan 0.77.
- Títulos apilados: la línea chica va PEGADA a la palabra grande (tinta de la grande 14 px bajo la base del kicker, como "SOCCER/COACHES", "100/Jersey Options" de los refs). gen5_body lo calcula solo (HOOK["gap"]); kicker más grande cuando sobra espacio (v6 86 px, v11 104).
- Palabras del gancho y kicker: inicio medido por RMS SIEMPRE (Whisper atrasa 0.2-0.4 s: v7 "coaches" 1.50→1.27, v9 "uniform" 1.10→0.72 raw).
- NUNCA cortar dentro de una palabra: revisar el primer corte del gancho con la envolvente RMS (v9 cortaba el inicio de "uniform"). Si el edit cambia después del roto de Premiere: rearmar el cutout (alfa viejo desplazado + BiRefNet solo en los fotogramas nuevos, prep/resync_cutout.py de v9) y medir el diff.
- CTA "Start a design request / Link in bio" = gráfico cta_free del usuario (Europa blanca + línea 2 cursiva con degradado + camiseta), línea 2 entra en su palabra (dt2).
- Palabra grande sola del gancho (sin kicker) más grande: 270 px, ancho hasta ~1010 (v8 COACHES).
- v5: BGM 0.13 (pedido solo para v5).

## 2026-11-07 — v1-v11 APROBADOS ("ahora sí quedaron excelentes") — plantilla para futuros Stimulus
- Base de código: styles/stimulus/gen5_body.py + prep/plan.py por pieza (pieces/_mkgen.sh), hfkit.py, ANALISIS.md. Partir de stimulus-05..11-hf.
- Zoom inicial 172→100 RÁPIDO: 0.4 s (no 0.77).
- Títulos apilados: palabra grande pegada a la línea chica (~14 px de aire); línea chica grande y legible (≥86 px), palabras grandes ~270 px (COACHES, SIZING). Gradient amarillo viejo en palabras grandes.
- Títulos/palabras clave salen EXACTO cuando las dice: medir el onset por RMS (Whisper llega tarde 0.2 s).
- Nunca cortar dentro de una palabra (el hook también); cortes solo en silencio.
- CTA final siempre con estilo (línea 1 blanca + ícono jersey, línea 2 itálica con gradient), nunca texto plano.
- Verificar captions contra el audio cuando Whisper duda.
- Flujo roto: crear secuencias "ROTO stimulus-NN" en bin "Roto Claude" → el usuario enmascara 10 s → exportAsMediaDirect ProRes 4444 → chequeo de alineación (corregir escala del clip, ej. 110%) → prores_to_cutout.py.

**B-roll (2026-11-11):**
- Equilibrado: unos 3 clips por video, con el film burn de Premiere al entrar y al salir.
- Objetivo: que se vean las camisetas de Stimulus; mejor chicos jugando de verdad.
- El b-roll entra ANTES de un corte del host, para taparlo.
- Descargar solo los clips que se usan.
- Zoom-out inicial en rampa, muy rápido (más que el V8 v3).
- Voz alta y sin sonar comprimida.

**Cortes (2026-11-11, queja del cliente):** el cambio de zoom (punch-in/out) cae EXACTAMENTE en el frame del corte, para taparlo. Nunca un zoom seguido de un corte a pocos frames (se siente como dos saltos). Nunca dejar clips sueltos de menos de ~8 frames. El b-roll se extiende o se mueve para tapar los cortes cercanos.
- APROBADO V2 v4 (2026-11-11): cortes reales detectados del edit y zoom/b-roll pegados al frame del corte (helpers en hfkit; plantilla stimulus-02-hf/prep/gen.py).
- Descargas: bajar SOLO los clips de b-roll que se usan. El usuario borró 60 GB que no se usaron.
