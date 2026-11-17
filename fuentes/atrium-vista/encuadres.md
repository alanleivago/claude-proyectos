# Encuadres: Atrium frente a nosotros (2026-11-14)

Método: `encuadres/encuadres.py`. Cortes con `select='gt(scene,0.3)'`, un fotograma en el medio de cada plano (se saltan los negros) y mosaicos de 5x3 numerados. Cada video va en una sola llamada a la API (claude-sonnet-5-5, stream, 16000 tokens, solo bloques de texto), que clasifica personas, tamaño, tipo y momento de cada plano. Los datos crudos están en `encuadres/datos.json`. El costo fue de unos 200k tokens de entrada en total.

- **Atrium:** 8 videos recientes (4 de `velocidad/videos`, 4 de `videos`), con 661 planos y una media de 2.15 s por plano.
- **Nosotros:** el `renders/share.mp4` de jipi-becal, sarape-saltillo, baul-sanmiguel-p2, garrafon-bernal, cantera-huichapan y aserrin-huamantla, con 266 planos y una media de 2.88 s. Los saltos dentro del mismo clip no se detectan como corte, así que en realidad tenemos más planos, pero con el mismo encuadre. Por eso también va el porcentaje por tiempo.

## Porcentajes

| | Atrium (% planos / % tiempo) | Nosotros (% planos / % tiempo) |
|---|---|---|
| **1 persona en cuadro** | **15 % / 18 %** | **94 % / 98 %** |
| **2 personas** | **77 % / 77 %** | **0 %** |
| **3 o más** | **8 % / 5 %** | **0 %** |
| Sin personas (inserto) | 0 % | 6 % / 2 % |
| Primer plano (CU) | 39 % / 44 % | 30 % / 28 % |
| Plano medio (PM) | 41 % / 41 % | 49 % / 54 % |
| Medio abierto / americano (PMA) | 12 % / 11 % | 15 % / 15 % |
| General (PG) | 8 % / 4 % | 6 % / 3 % |
| Single (uno solo, a cámara o lateral) | 14 % / 18 % | 92 % / 97 % |
| **Sobre el hombro (OTS)** | **62 % / 63 %** | 0 % |
| Two-shot (los dos de frente o de perfil) | 16 % / 15 % | 0 % |
| Grupo | 6 % / 2 % | 0 % |
| Inserto | 2 % / 1 % | 8 % / 3 % |

Por video:

| video | dur | planos | 1 pers. | ≥2 pers. | OTS | two-shot | grupo | CU |
|---|---|---|---|---|---|---|---|---|
| atr 7707710905521327391 | 177 s | 82 | 10 % | 90 % | 63 % | 16 % | 5 % | 34 % |
| atr 7706934219510975774 | 164 s | 53 | 28 % | 72 % | 30 % | 42 % | 0 % | 42 % |
| atr 7706344565933985054 | 195 s | 97 | 13 % | 87 % | 72 % | 6 % | 8 % | 86 % |
| atr 7706316327023119647 | 186 s | 99 | 13 % | 87 % | 73 % | 4 % | 10 % | 33 % |
| atr 7707034442048507166 | 140 s | 78 | 23 % | 76 % | 37 % | 36 % | 0 % | 28 % |
| atr 7706934829392203039 | 178 s | 69 | 17 % | 83 % | 43 % | 39 % | 0 % | 29 % |
| atr 7706270980758441247 | 191 s | 95 | 13 % | 87 % | 75 % | 2 % | 11 % | 4 % |
| atr 7706224426399829279 | 191 s | 88 | 8 % | 92 % | 81 % | 2 % | 9 % | 49 % |
| jipi-becal | 124 s | 58 | 95 % | 0 % | 0 % | 0 % | 0 % | 26 % |
| sarape-saltillo | 112 s | 46 | 98 % | 0 % | 0 % | 0 % | 0 % | 43 % |
| baul-sanmiguel-p2 | 150 s | 47 | 94 % | 0 % | 0 % | 0 % | 0 % | 19 % |
| garrafon-bernal | 123 s | 41 | 90 % | 0 % | 0 % | 0 % | 0 % | 27 % |
| cantera-huichapan | 129 s | 38 | 97 % | 0 % | 0 % | 0 % | 0 % | 21 % |
| aserrin-huamantla | 130 s | 36 | 92 % | 0 % | 0 % | 0 % | 0 % | 47 % |

**El usuario tiene razón, y la diferencia es todavía mayor de lo que dijo.** En Atrium, un plano de una sola persona es la excepción (15 %). Nosotros lo usamos siempre (94 %). La cámara está igual de cerca en los dos casos, entre CU y PM. Lo que cambia es que en Atrium casi siempre aparece el otro personaje en cuadro, de espaldas, en el borde.

## Cómo son los planos de 2 o más en Atrium

Los ejemplos están en `encuadres/ejemplo_atrium_ots.jpg`, `encuadres/ejemplo_atrium_grupo.jpg` y `encuadres/ejemplo_nuestro_single.jpg`.

- **OTS, el plano base (62 %).** El que habla está de frente en 3/4, en CU o PM (CU 45 %, PM 54 %). En un borde, el 20-30 % del cuadro lo ocupa el que escucha, desenfocado: hombro, nuca o pelo, sin cara ni boca. Se alterna plano y contraplano en cada frase. Así se ve toda la discusión.
- **Two-shot (16 %).** Casi siempre en PMA o PM (PMA 54 %, PM 27 %, PG 14 %), los dos de perfil o en 3/4, separados. Aparece en la discusión o confrontación, en la "tensión" antes de una réplica, en el consuelo o el abrazo y en la llegada de la figura de poder. Sirve de respiro geográfico entre ráfagas de OTS.
- **Grupo (6 %).** Casi siempre en PG (75 %), a veces en PMA. Aparece en el establecimiento de la escena, la llegada de la figura de poder, de la familia o del abogado, la reacción del grupo, la negociación o revisión de documentos y el desenlace con la familia reunida. Suele durar menos de 1.5 s, como corte de ubicación.
- **Dónde aparecen a lo largo del video:**

  | tramo | OTS | single | two-shot | grupo |
  |---|---|---|---|---|
  | 0-10 % (gancho) | 52 % | 23 % | 14 % | 9 % |
  | 10-40 % | 64 % | 13 % | 14 % | 8 % |
  | 40-90 % | 67 % | 8 % | 18-19 % | 5 % |
  | 90-100 % (CTA) | 20 % | **71 %** | 6 % | 0 % |

  Varios videos abren con un two-shot o un grupo hablando desde 0.0 s. Nunca con objetos.
- **Dónde usa Atrium el single (14 %).** En el CTA a cámara (los 8 videos cierran con 2 o 3 singles mirando a cámara), en llamadas por teléfono, en el llanto y en reacciones fuertes con push-in, como la reacción a la revelación.

## Cómo describe hoy los planos nuestro clips.py (pieces/costal-cuyutlan/clips.py)

- `ONE`: "a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, no shoulder…". `ALONE`: "the only person in the whole shot…". `SOLO` y `gaze(side)` hacen que la persona mire "toward someone far outside the frame". `PRES` es el single de presentación desde las rodillas. `SAL` agrega "nobody else in the background".
- Todos los `c` y `r` pasan por `one(...)`. Solo `i01` (PG de salineros, sin protagonistas) y el inserto `i02` salen de ese molde. Resultado: 0 % OTS por diseño.
- **Por qué existe ONE (regla camionero v1, `pieces/camionero/qa_clips.md`).** El prompt decía "looking at X off-screen" y Omni metía en el borde a un doble de X o a un desconocido, con otra ropa. La solución fue prohibir la segunda figura. La regla de continuidad de bordes de `atrium-reglas.md` ya marca la otra salida: nombrar a la persona del borde con su `@{ASSET}` y su ropa. El problema no eran los OTS, era un OTS sin especificar.

## Cambio propuesto (sin aplicar)

### 1. Constantes nuevas en clips.py (la plantilla)

Cada personaje tiene una descripción corta "de espaldas", con lo que se ve desde atrás:

```python
ATA_B = "@{ATANASIO_VARELA} seen from behind (short white curly hair, faded sky-blue work shirt, white cloth knotted at his neck)"
LEO_B = "@{LEONIDAS_PAZOS} seen from behind (cream straw fedora with a black band, black polo shirt, heavy build)"
XOC_B = "@{XOCHITL_VARELA} seen from behind (short black hair cut at the jaw, mustard-yellow t-shirt, denim overall straps)"
EVE_B = "@{EVELIO_VARELA} seen from behind (bald crown with grey hair on the sides, burgundy short-sleeve shirt)"

PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening")

def ots(desc, fg_back, fg_side):
    """Plano sobre el hombro como el de Atrium: quien escucha, de espaldas y desenfocado en el borde."""
    return (f"Over-the-shoulder shot from behind {fg_back}: his/her blurred shoulder and the back of the head fill the {fg_side} "
            f"edge of the frame in the foreground, out of focus, face never visible. {desc}, facing the camera three-quarters "
            f"and looking at the person in the foreground; {PAIR}.")

def two(desc):
    """Two-shot de perfil, de las rodillas o la cintura para arriba."""
    return f"Medium two-shot, both characters fully in frame, {desc}; {PAIR}."
```

Hay que respetar el lado de la geografía fija. Ejemplo de costal: Leónidas va a la DERECHA y Atanasio a la IZQUIERDA. En el OTS de Leónidas, la espalda de Atanasio queda en el borde **LEFT**. En el contraplano, la espalda de Leónidas queda en el borde **RIGHT**.

### 2. Redacción exacta de los prompts de Omni

- **OTS con diálogo (el caso más común):**
  `ots(f"Close-up of {LEO} {SAL0}, {LR}, he pats the hood of his white truck, smug", ATA_B, "LEFT")` + `MOUTH("Leónidas", "Atanasio")` + `talk(...)`.
  Texto resultante: *"Over-the-shoulder shot from behind @{ATANASIO_VARELA} seen from behind (short white curly hair, faded sky-blue work shirt, white cloth…): his blurred shoulder and the back of the head fill the LEFT edge of the frame in the foreground, out of focus, face never visible. Close-up of @{LEONIDAS_PAZOS} (…) facing the camera three-quarters and looking at the person in the foreground; only these two people in the frame, no third person, no extras. Only Leónidas speaks: Leónidas's lips move clearly with every word; Atanasio stays silent the whole shot, mouth closed and not visible, only listening."*
  En un OTS no hay ambigüedad de boca: el que está de espaldas no muestra la boca. Esa es la forma más segura de tener dos personas con lip sync.
- **Two-shot con diálogo (pocos, solo con una línea):**
  `two(f"{LEO} on the RIGHT in profile facing left and {ATA} on the LEFT in profile facing right, two meters apart on the dike road {SAL0}, framed from the knees up")` + `MOUTH("Leónidas", "Atanasio")`.
  Conviene que el que habla esté más cerca de cámara o mejor iluminado: "Leónidas slightly closer to the camera and in sharper focus".
- **Two-shot o grupo mudo (reacción o llegada):**
  *"Medium wide shot from the knees up, {ATA} in the foreground LEFT seen in three-quarter back view, {EVE} stepping out of the white truck on the RIGHT, {XOC} behind Atanasio in the back of the blue truck; only these three people. Nobody speaks, all mouths closed. No dialogue."*
- **Plano general de grupo (corte de ubicación de 1-1.5 s):**
  *"Wide shot of the dike road {SAL0}: {LEO} on the RIGHT by his white truck and {ATA} on the LEFT by the blue truck, facing each other, {XOC} standing in the back of the blue truck; only these three people, full bodies visible. No dialogue."*
- **Fallback en `variant()`:** si a partir de k≥3 el OTS sale con un doble o con un tercero, se pasa al `one(...)` actual. Hay que guardar en cada clip la versión single como alternativa, por ejemplo con una tupla `(prompt_ots, prompt_single)`.
- **Hojas de referencia:** cada OTS o two-shot lleva las 2 (o 3) `@{ASSET}`, así que Omni recibe las dos hojas. Si una sale con la cara del otro, se refuerza "the person in the foreground is @{X}, NOT @{Y}". A partir de k≥4, NOREF ya las reemplaza por texto.

### 3. Proporción y en qué clips (pieza tipo costal, unos 30 clips)

Objetivo realista, sin copiar el 62 % de entrada (riesgo de dobles): **OTS ~50 %, single ~25 %, two-shot ~15 %, grupo/PG ~10 %**.

| clip(s) de costal | ahora | propuesto |
|---|---|---|
| c01 gancho | single PM | **OTS** desde detrás de Atanasio (borde LEFT), Leónidas habla desde 0.0 |
| r1 presentación Atanasio | single PRES | **two-shot PMA** mudo: Atanasio y Leónidas separados por el costal en el lodo (la presentación de cuerpo entero sigue) |
| c02-c13 (intercambio) | single CU | **OTS alternado** en ~9 de 12 (plano y contraplano). Quedan 2-3 single en CU para las frases clave (c05 exige la mitad, c07 "que se la coma la lluvia") |
| r2 / c04 / c08 Xóchitl | single | OTS desde detrás de Atanasio hacia Xóchitl en la camioneta, o two-shot Atanasio y Xóchitl |
| r3 chiflido | single CU | single (momento fuerte) |
| r4 sonrisa que se apaga | single CU | single con push-in (reacción) |
| i01 salineros | PG sin protagonistas | **grupo PG**: Leónidas de espaldas en primer plano a la RIGHT viendo llegar a los salineros |
| c14-c21 (vuelta del plazo) | single CU | OTS en ~6 de 8, más un **two-shot PMA** mudo en c17-c18 (Atanasio da un paso hacia Leónidas) |
| r5 / r6 reacciones | single push-in | single (se mantienen) |
| r7 llega Evelio (traidor) | single PM | **grupo PMA** mudo: Atanasio de 3/4 de espaldas a la LEFT, Evelio baja de la camioneta a la RIGHT, Leónidas al lado |
| c22-c26 (traición) | single CU | OTS Atanasio-Evelio alternado. c24 Xóchitl en OTS desde detrás de Evelio |
| i02 inserto | inserto | inserto |
| c27 CTA | single a cámara | **single** a cámara (como los 8 de Atrium) |

### 4. QA nuevo

- En cada OTS, la figura del borde tiene que ser el personaje nombrado y con su ropa (tiras de bordes al 25 %, como en camionero).
- Solo se mueve la boca del que habla (comparar la transcripción con la cara visible).
- No aparece un tercero.
- Se mantiene la geografía izquierda/derecha.
- En edit.py no cambia nada: el OTS se corta por frases igual que el single.
