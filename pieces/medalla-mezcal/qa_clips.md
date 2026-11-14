# QA clips medalla-mezcal (2026-11-04 02:00)

Method: ffmpeg contact sheets (fps=2) + faster-whisper small (cpu int8, es, word timestamps); doubtful clips rechecked with medium.
Skipped (modified <10 min ago or not present yet): c31, c32, c33, c34, c36, c38, c39, r3, r4.

General note: FAUSTO in every clip (green plaid shirt, red bandana, wide sombrero, thick grey moustache) does NOT match chars/FAUSTO.jpg (cream shirt, cowboy palm hat, short goatee). He is consistent across all clips and does not look like SEVERO, so it is not on the regenerate list. Fix chars/FAUSTO.jpg reference if the sheet look is wanted. SEVERO, TOBIAS, CAPORAL and HEROINA match their sheets.

| id | OK/BAD | problem | line timings (s) |
|---|---|---|---|
| c01 | OK | - | L1 0.7-4.2 · L2 5.2-7.0 |
| c02 | OK | - | 0.8-2.1 · 3.5-5.1 · 6.8-8.4 |
| c03 | OK | "juro" ok | 0.7-2.3 · 2.9-4.8 · 5.6-9.2 |
| c04 | OK | slight sombrero size drift (minor) | 0.9-~2.0 · ~2.2-~5.0 · ~5.2-8.2 |
| c05 | OK | - | 1.1-2.2 · 3.5-7.0 |
| c06 | OK | - | 0.0-~1.6 · ~1.8-3.5 · 4.9-6.2 |
| c07 | OK | - | 0.0-~3.0 · ~3.0-6.7 · 7.5-9.5 |
| c08 | OK | - | 0.9-~3.5 · ~4.0-6.6 |
| c09 | OK | "hija" ok | 0.0-4.3 · 5.0-8.1 |
| c10 | OK | - | 0.0-~2.8 · ~3.0-~5.5 · ~5.8-7.1 |
| c11 | OK | - | 0.7-3.4 · 4.2-6.0 · 7.2-8.5 |
| c12 | OK | - | 0.0-3.4 · 5.4-6.2 |
| c13 | OK | - | 0.0-2.9 · 3.6-6.8 · 7.9-8.7 |
| c14 | OK | "Judas" ok | 0.0-~1.2 · ~2.0-~4.5 · ~5.5-7.1 |
| c15 | OK | long pause after "No sé." (0.9-1.7, next 4.0) | 0.9-5.8 · 7.0-8.5 |
| c16 | OK | "hija" ok | 0.0-~3.0 · ~3.0-~6.5 · ~6.5-8.5 |
| c17 | OK | - | 1.3-~2.0 · ~2.5-4.8 · 6.4-8.9 |
| c18 | OK | - | 0.9-2.8 · 4.2-5.7 |
| c20 | BAD | invented repetition: "Dime la verdad, dime la verdad" | 0.0-3.3 (dup) · 5.3-5.8 · 8.5-9.0 |
| c21 | OK | - | 0.0-~3.0 · ~3.0-~5.5 · ~5.5-8.8 |
| c22 | OK | - | Severo 1.1-3.6 · Tobías 4.1-5.3 |
| c23 | OK | - | 0.0-~3.5 · ~3.5-~5.5 · ~5.5-7.1 |
| c24 | OK | - | Tobías 0.9-2.3 · Severo 3.9-5.4 · 6.5-7.7 |
| c25 | OK | no dialogue (whisper hallucination only) | - |
| c26 | OK | hard cut Tobías→Severo (as prompted) | Tobías 0.7-2.8 · Severo 6.3-8.8 |
| c27 | OK | hard cut Tobías→Severo (as prompted) | Tobías 0.0-2.3 · Severo 4.1-~6.3 · ~6.5-8.5 |
| c28 | BAD | invented repetition: "avisan del pueblo, avisan del pueblo" | 1.1-6.2 (dup) · 7.4-8.6 |
| c29 | OK | last frame jumps to another shot (trim last ~0.3 s) | 1.9-~2.5 · ~3.5-6.8 |
| c30 | OK | - | 0.0-~2.0 · ~2.5-7.2 |
| c35 | OK | blurred foreground hat leaves frame during push-in (minor) | 0.0-~0.8 · ~1.0-4.6 · 6.2-8.7 |
| c37 | OK | burned-in subtitle "Entrégamela." (~4.5-6 s) | 0.0-~2.5 · ~3.5-5.3 |
| i1 | OK | no dialogue | - |
| i2 | OK | no dialogue | - |
| i3 | OK | no dialogue | - |
| r1 | OK | no dialogue | - |
| r2 | OK | no dialogue | - |

No j→y or "trabayo" issues heard in checked words (juro, hija, dijo, Judas, junta, déjeme).

REGENERAR: c20, c28

## Ronda 2

Revisados los 45 clips regenerados (00:27-02:45 del 2026-11-04). ARREOLA comparado con `chars/ARREOLA.jpg` (camisa crema, sombrero de paja claro, piocha corta).

| id | estado | problema |
|---|---|---|
| c01 | OK | - |
| c02 | OK | ARREOLA correcto |
| c03 | OK | - |
| c04 | OK | ARREOLA correcto; whisper "mandó a ser" = "mandó hacer" (homófono) |
| c05 | OK | - |
| i1 | OK | sin diálogo |
| c06 | OK | ARREOLA correcto |
| c07 | OK | - |
| c08 | OK | ARREOLA correcto (se levanta de la mesa) |
| c09 | OK | "hija" bien |
| c10 | OK | ARREOLA correcto |
| c11 | OK | HEROINA con playera blanca más limpia (menor) |
| c12 | OK | ARREOLA correcto |
| c13 | OK | el "No." inicial no se oye claro en whisper (menor, revisar al montar) |
| c14 | OK | ARREOLA correcto; "San Judas" bien |
| c15 | OK | pausa larga tras "No sé." (1.5-4.0) |
| i2 | OK | sin diálogo |
| c16 | OK | "hija" bien |
| c17 | OK | - |
| c18 | OK | whisper no capta "se" en "Pues se equivocó" (menor) |
| i3 | OK | sin diálogo |
| c20 | OK | ya sin repetición; ARREOLA correcto |
| r1 | OK | ARREOLA correcto |
| c21 | OK | - |
| c22 | OK | - |
| c23 | OK | - |
| c24 | OK | al final se suben a la camioneta (acorde a "¡Súbanse!") |
| c25 | OK | sin diálogo |
| c26 | OK | corte duro Tobías→Severo (como se pidió) |
| c27 | OK | corte duro Tobías→Severo (como se pidió) |
| r2 | OK | ARREOLA correcto |
| c28 | OK | ya sin repetición |
| c29 | OK | trabajadores del fondo desaparecen durante el push-in (menor) |
| c30 | OK | "Déjeme" bien |
| c31 | OK | ARREOLA correcto; "hija" bien |
| c32 | BAD | HEROINA sin chamarra de mezclilla (camisa beige, otra cara al final) y ARREOLA con camisa de trabajo beige y pantalón oscuro, no la camisa crema del ref; líneas bien |
| c33 | OK | ARREOLA correcto; ella corre a la casa |
| c34 | OK | 2 cortes internos (gran plano → Severo → Arreola+Caporal); ARREOLA correcto |
| c35 | BAD | el hombro en primer plano es el look viejo: paliacate rojo + chaleco café + camisa a rayas (no ARREOLA.jpg) |
| c36 | OK | ARREOLA correcto |
| c37 | OK | subtítulo quemado "Entrégamela." (~4.5-5.5 s) |
| c38 | OK | ARREOLA correcto |
| r3 | OK | sin diálogo |
| r4 | OK | no se ve la ventana (menor) |
| c39 | OK | - |

Sin errores j→y (juro, hija, dijo, Judas, junta, Déjeme bien). Sin líneas inventadas ni repetidas.

REGENERAR2: c32, c35
