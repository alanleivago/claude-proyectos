# Cuánto aceleran sus videos en Atrium Stories (2026-11-14)

## Resultado
- **Aceleran a 1.20x.** Lo normal es 1.20x, con algunos videos a 1.15x y otros a 1.25x. El rango va de 1.15 a 1.25.
- Aceleran **video y voz por igual**, así que los labios siguen en sincronía. **El tono de la voz se conserva** (equivale a `atempo`). No es una aceleración completa con `asetrate`.
- Dentro de cada video la velocidad es **pareja**: todos los planos tienen la misma cadencia. Solo 1 de los 13 videos mezcla dos velocidades.
- Empezaron hace poco. El video a 24 fps (7705027297656507662) y nuestros renders no tienen la marca de aceleración. Los de octubre son de 60 fps y siguen otro patrón que no analicé.
- Lo más probable es que usen la velocidad de CapCut (que por defecto conserva el tono) y exporten a 30 fps.

## Muestra
13 videos de @atriumstories_. Los 4 más nuevos los bajé a `velocidad/videos/`: 7707710905521327391, 7706934219510975774, 7706344565933985054 y 7706316327023119647. Los otros 9 ya estaban en `videos/`. Para comparar usé nuestros clips crudos de Omni: `pieces/baul-sanmiguel/clips` (c01-c38) y `pieces/garrafon-bernal/clips` (30 clips), más `pieces/baul-sanmiguel/renders/share.mp4`.

## Método c) Cadencia de cuadros (el más fiable)
Omni entrega a 24 fps (nuestros clips son 24/1). Atrium publica a **30 fps**. Si un clip de 24 fps se acelera s veces y se exporta a 30 fps por cuadro más cercano, se repite un cuadro cada 1/(1 − 0.8·s) cuadros:
- a 1.00x, un cuadro repetido cada 5;
- a 1.15x, cada 12.5 (alterna 12 y 13);
- a 1.20x, cada **25**;
- a 1.25x, ninguno (24 × 1.25 = 30 exactos).

Medí la diferencia entre cuadros consecutivos, plano por plano, e hice el histograma de la distancia entre cuadros repetidos:

| video | fps | distancia dominante | velocidad |
|---|---|---|---|
| 7707710905521327391 | 30 | 25 | **1.20** |
| 7706934829392203039 | 30 | 25 | **1.20** |
| 7706934219510975774 | 30 | 25 | **1.20** |
| 7706344565933985054 | 30 | 25 | **1.20** |
| 7706316327023119647 | 30 | 25 | **1.20** |
| 7705479449055169822 | 30 | 25 | **1.20** |
| 7706270980758441247 | 30 | 42 | 1.22 |
| 7707034442048507166 | 30 | sin repetidos en 48 de 55 planos | **1.25** |
| 7705076412604091678 | 30 | 12/13 alternado | **1.15** |
| 7706224426399829279 | 30 | 25 en la 1.ª mitad, nada en la 2.ª | mezcla 1.20 y 1.25 |
| 7705027297656507662 | 24 | no aplica; tampoco hay cuadros saltados | **1.00** |
| 7700349674628074783, 7697405703966838046 (oct.) | 60 | otro patrón | no concluyente |

- En los videos a 1.20x el patrón es casi perfecto: `d........................d` en cada plano.
- Le apliqué nuestro filtro propuesto (abajo) a 30 s de nuestro share.mp4. Salió **exactamente la misma huella** (distancia 25 en el 100 % de los casos). Confianza: **alta** (~95 %).

## Método a) Velocidad del habla
Usé faster-whisper medium con timestamps por palabra. Corté frases donde había pausas de más de 0.25 s, tomé solo las de 5 palabras o más y conté sílabas por segundo de voz activa. Los datos están en `velocidad/habla_f0.json`.

| fuente | sílabas/s | razón contra Atrium 1.00x |
|---|---|---|
| nuestros clips baul-sanmiguel | 4.70 | |
| nuestros clips garrafon-bernal | 5.32 | |
| Atrium 7705027 (1.00x, 24 fps) | **6.21** | 1.00 |
| Atrium 7706344 (1.20x) | 7.34 | 1.18 |
| Atrium 7707710 (1.20x) | 7.44 | 1.20 |
| Atrium 7706934829 (1.20x) | 7.52 | 1.21 |
| Atrium 7705076 (1.15x) | 7.46 | 1.20 |
| Atrium 7707034 (1.25x) | 7.82 | 1.26 |

- Contra el video de Atrium sin acelerar, la razón da **1.18 a 1.26**, igual que la cadencia de cuadros. Eso indica que la voz se acelera con el mismo factor que la imagen.
- Contra nuestros clips la razón da ~1.5x, pero eso exagera. Incluso sin acelerar, Atrium habla ~1.2x más rápido que nosotros (6.2 contra 5.0 sílabas/s): sus líneas son más densas y no tienen las pausas con "…".
- Confianza: **media**. La referencia sin acelerar es un solo video.

## Método b) Tono de la voz (F0)
Calculé la mediana del F0 por frase con Praat (parselmouth). Separé hombres (menos de 165 Hz) de mujeres.

| fuente | hombres | mujeres |
|---|---|---|
| nuestros (2 piezas) | 123-129 Hz | 194-209 Hz |
| Atrium 1.00x | 139 Hz | 189 Hz |
| Atrium acelerados (5 videos) | **110-118 Hz** | **187-211 Hz** |

- Con `setpts` + `asetrate` a 1.2x, un hombre de 125 Hz pasaría a ~150 Hz (+3.2 semitonos). En Atrium las voces aceleradas no suben: las de hombre incluso quedan más graves porque usan muchos patrones mayores.
- Conclusión: **el tono se conserva**, es decir, usan un estiramiento de tiempo tipo atempo o la velocidad de CapCut. Confianza: **alta**.

## Método d) Duración de los planos continuos
- En los videos a 1.20x, el plano más largo mide 6.53 s, menos que 8 s / 1.2 = 6.67 s.
- En el video a 1.00x llega a 7.04 s.
- Es coherente con lo anterior, pero débil, porque casi todos los planos están recortados (mediana de 1.3 a 2.9 s). Confianza: **baja**.

## Gestos y parpadeos
No los medí por separado. La cadencia de cuadros ya demuestra que la imagen corre al mismo factor que la voz.

## Cambio propuesto para edit.py (referencia: `pieces/baul-sanmiguel-p2/edit.py`; no lo modifiqué)
Hay que acelerar **una sola vez, sobre `raw.mov`** (voz + video ya concatenados), **antes** de la mezcla de música y del loudnorm.
- La sincronía voz-labios se mantiene porque `setpts` y `atempo` aplican el mismo factor a todo el archivo. En la prueba con 30 s, el desfase final fue de 11 ms.
- La música no se acelera.
- Las marcas t1/t2 se dividen por la velocidad.
- loudnorm sigue igual: mide la mezcla ya acelerada y deja −14 LUFS.

1. Arriba, junto a `MUSIC_VOL`: `SPEED = 1.2`
2. Justo después del bloque que genera `raw.mov` (línea 157) y antes de `dur = ...` (línea 161):
```python
    fast = R / "raw_fast.mov"
    if not (REMIX and fast.exists()):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-filter_complex",
                        f"[0:v]setpts=PTS/{SPEED},fps=30[v];[0:a]atempo={SPEED}[a]", "-map", "[v]", "-map", "[a]",
                        "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(fast)], check=True)
    raw = fast
```
   Con esto, `dur` (línea 161), la mezcla y el render final usan la versión acelerada sin otros cambios.
3. Línea 164: `at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]]) / SPEED` (si no, las camas musicales entran tarde).
4. Línea 187, opcional: dividir el s/plano impreso por `SPEED`.

Notas:
- `fps=30` copia la cadencia de Atrium: un cuadro repetido cada 25, imperceptible.
- Si se prefiere 1.25x, `fps=30` queda sin ningún cuadro repetido.
- Si se quisiera quedar en 24 fps, `fps=24` descarta 1 de cada 6 cuadros, y eso se nota más.
- `atempo` acepta de 0.5 a 2.0 en una sola pasada, así que 1.2 no necesita encadenarse.
- Aun a 1.2x quedaríamos en ~6 sílabas/s, frente a ~7.5 de Atrium. El resto de la diferencia está en el guion: líneas más densas y menos "…".
