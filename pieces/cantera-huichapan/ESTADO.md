---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, remake-transformado, patron-injusticia, huichapan, hidalgo, cantera]
relatedTo: [aserrin-huamantla, garrafon-bernal, cantera-huichapan, atrium-vista]
---
# cantera-huichapan (La Cantera de Huichapan · Parte 1): estado

## Video base
- Remake transformado de **"Le cobraba el equipo de seguridad a los obreros… (P1)"** de @atriumstories_ (7697405703966838046, 128K, 102 s, 37 planos). Su P2, "Su jefe les cobraba lo que era gratis" (7698054444662934815), hizo 141K. Análisis nuevos (Whisper + API): `fuentes/atrium-vista/videos/7697405703966838046_analisis.md` y `7698054444662934815_analisis.md`.
- Por qué este: es una de las 2 historias nuevas sin pieza que recomienda `fuentes/atrium-vista/ranking2.md`.
- Pedido del usuario (2026-11-14): más cerca de las historias de Atrium, sin copiar. Se conservan la historia y su ritmo emocional (el honesto devuelve lo que "no ha pagado" → era gratis → el villano miente con el reglamento → a solas se delata y amenaza → la patrona lo oyó todo y lo cita con plazo). Cambian el escenario y la región, el oficio, los objetos clave, los nombres, todos los diálogos, el detalle del giro y el CTA.

## Qué se cambió
- Región y escenario: obra en construcción → cantera de piedra rosa cerca de Huichapan (Hidalgo).
- Oficio y ropa: obrero con casco y chaleco → cantero con camisa rojo ladrillo y paliacate; capataz con casco y chaleco naranja → supervisor calvo con piocha, lentes redondos y chaleco verde liso sin letras. Sin cascos ni chalecos con letras.
- Objetos: casco, botas y guantes con cifra → guantes de carnaza, lentes y cubrebocas, sin cifras; lentes viejos pegados con cinta (injusticia visible en el gancho).
- Giro: las cámaras con audio → el celular de Abdías en llamada con Rosalba.
- Plazo nuevo: "antes de que acabe el turno" (gancho y vuelta contra Sotero).
- CTA: "¿Ustedes qué le harían a Sotero?"
- Nombres nuevos y únicos en pieces/: Rosalba Monroy (52), Abdías Carbajal (31), Sotero Verástegui (56).
(Detalle en guion.md, tabla "Qué cambia respecto al original".)

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC" (kit pieces/_marcas/MAJESTIC: marca arriba a la izquierda y su música).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 319 palabras), clips.py (35 clips: 30 hablados c01-c30, 3 insertos i01-i03 y 2 reacciones r1-r2), make_sheets.py (3 personajes + LOC_CANTERAHUICH + LOC_CASETACANT = 5 hojas), phr.py y edit.py (EDL vacía; música cálida de c11 a c12).
- Copia de aserrin-huamantla con todas sus defensas: gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); todos los @{ASSET} tienen hoja y no sobra ninguna; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes; Sotero y Abdías muy distintos.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; Abdías a la izquierda en la mesa de labrado; el chaleco de Sotero sin letras; los lentes pegados con cinta iguales en i01 e i02; el celular de Rosalba en la mano derecha; i03 sin texto legible en la pantalla; pronunciación de "Abdías", "Sotero", "Rosalba" y "cantera".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink con caption.txt.
