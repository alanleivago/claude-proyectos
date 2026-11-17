---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, remake-transformado, madrastra-justicia, suegra-nuera, becal, campeche, sombrero-jipi]
relatedTo: [aserrin-huamantla, garrafon-bernal, sarape-saltillo, atrium-vista]
---
# jipi-becal (La Cueva de Bécal · Parte 1): estado

## Video base
- Segunda versión, muy transformada, de **"Llegó a casa y vio lo que su esposa le hacía a su hija (P1)"** de @atriumstories_ (7705076412604091678, **632K**; P2 336K). La primera versión es `pieces/aserrin-huamantla`.
- Por qué: la madrastra es el tipo con mejor mediana de Atrium (336K) según `fuentes/atrium-vista/ranking2.md`, y casi todas las historias top ya tienen pieza.

## Qué se cambió
- Vínculo invertido: abuela (la autoridad) / suegra (villana) / nuera (víctima). La abusadora tiene su propia suegra.
- Región y oficio: tejedoras de sombrero jipi en las cuevas de Bécal, Campeche.
- Objeto: la escalera tirada arriba de la cueva; el celular confiscado.
- Giro: Zoraida le dijo a su hijo que la nuera lo dejó por otro; ella también salió de esa cueva; plazo invertido (para el sábado los doce sombreros los teje ella).
- Gancho de P2: Zoraida le marca a escondidas a su hijo ("tu abuela ya anda muy confundida").
- CTA: "¿Ustedes creen que Lisandro le va a creer a su madre?"
- Nombres nuevos y únicos en pieces/: Apolonia Chablé (81), Zoraida Canul (56), Nicté Ucán (27). Lisandro (el nieto) solo se nombra.
(Detalle en guion.md, tabla "Qué cambia respecto al original y a aserrin-huamantla".)

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI" (kit pieces/_marcas/MEXI, con su música).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 387 palabras), clips.py (42 clips: 32 hablados c01-c32, 4 insertos i01-i04 y 6 reacciones r1-r6), make_sheets.py (3 personajes + LOC_CUEVABECAL + LOC_PATIOBECAL = 5 hojas), phr.py y edit.py (EDL vacía; música cálida de c30 a i04).
- Copia de garrafon-bernal con todas sus defensas: gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas jipi-becal*. Nuevo: vert() para las miradas arriba/abajo entre la boca de la cueva y el fondo.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID; todos los @{ASSET} tienen hoja y no sobra ninguna; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; la escalera tirada en el suelo hasta c06 y metida en la boca de la cueva desde c07; Nicté con vestido azul cielo, mandil beige y dedos vendados, adulta; Zoraida con blusa de leopardo, pelo vino y abanico negro; Apolonia con huipil blanco bordado, rebozo negro y bastón en la mano derecha; celular rosa (Nicté) y dorado (Zoraida) sin texto en pantalla; pronunciación de "Nicté", "Zoraida", "Lisandro" y "plataforma".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta MexiTV) con caption.txt.
