---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, remake-transformado, madrastra-justicia, huamantla, tlaxcala, alfombras-de-aserrin]
relatedTo: [plata-taxco, aserrin-huamantla, baul-sanmiguel, betun-zacatecas, atrium-vista]
---
# aserrin-huamantla (La Alfombra de Huamantla · Parte 1): estado

## Video base
- Remake transformado de **"Llegó a casa y vio lo que su esposa le hacía a su hija | PARTE 1"** de @atriumstories_ (7705076412604091678, **632K vistas**, 150 s, 54 planos). Análisis: `fuentes/atrium-vista/videos/7705076412604091678_analisis.md`.
- Por qué este: es el video de Atrium con más vistas que no tenía pieza (el 4.º de la cuenta). Ver `fuentes/atrium-vista/ranking2.md`.
- Pedido del usuario (2026-11-14): más cerca de las historias de Atrium, pero sin copiar. Se conservan la historia y su ritmo emocional. Cambian el escenario y la región, el oficio, el objeto clave, los nombres, todos los diálogos, el detalle del giro y el CTA.

## Qué se cambió
- Región y escenario: una sala sin región pasa a ser el patio de una casa de Huamantla (Tlaxcala) el día de las alfombras de aserrín, con La Malinche al fondo.
- Oficio y objetos: el padre sin oficio definido pasa a ser Delfino, maestro alfombrista. El trapeador se cambia por la escobeta, el aserrín teñido y la plantilla del colibrí; se suma la carpeta azul con las escrituras.
- Mentira: "yo hice la comida" pasa a "yo teñí el aserrín de tu alfombra".
- Plazo nuevo en el gancho: la procesión de esta noche, que vuelve invertida al final.
- Giro: la casa es de Abigail, porque su madre se la dejó escriturada. Cleotilde manda a su hija Kenia por la carpeta azul.
- CTA: "¿Ustedes creen que Cleotilde se sale con la suya?"
- Nombres nuevos y únicos en pieces/: Delfino Cuapio, Abigail Cuapio (21) y Cleotilde Tenopala. Kenia y Dayana solo se nombran.
(Detalle en guion.md, tabla "Qué cambia respecto al original".)

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA" (kit pieces/_marcas/VISTA, con su música; la pieza no tiene carpeta music/ propia).

## Archivos
guion.md, caption.txt, lines.json (fuente única, unas 340 palabras), clips.py (39 clips: 31 hablados c01-c31, 4 insertos i01-i04 y 4 reacciones r1-r4), make_sheets.py (3 personajes + LOC_PATIOHUAM = 4 hojas), phr.py y edit.py (EDL vacía; música cálida de c13 a c15).
- Es copia de la plantilla plata-taxco y conserva todas sus defensas:
  - en los prompts: gaze + ONE + ALONE, PRES (un plano de presentación por personaje), NOSUB + CLEAN + END, NODOUBLE;
  - en los reintentos: SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6;
  - contra fallos de Flow: gatito como IMAGEN, control de duplicados por md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen().
- make_sheets.py pide "ordinary non-famous face", controla duplicados por md5 (DUPLICADO) y acepta --reupload.
- Comprobaciones:
  - `python -m py_compile` OK en clips.py, make_sheets.py, edit.py y phr.py.
  - Los IDs de CLIPS coinciden con las claves de lines.json, en el mismo orden (leído con ast, sin importar el módulo).
  - Todos los @{ASSET} tienen hoja y no sobra ninguna hoja.
  - Las frases en español de SOFT coinciden con lines.json.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow. Faltan las hojas, los clips, el QA, phr.py, la EDL y el montaje.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, correr `md5sum chars/*.jpg` y mirar la hoja de contactos: caras comunes y distintas entre sí.
2. `python -I clips.py > clips_log.txt` y QA de cada clip. Revisar:
   - morphs y bordes del cuadro;
   - Cleotilde siempre a la derecha en la hamaca (acostada hasta c14, sentada desde c15), con tubos rosas y bata fucsia;
   - Abigail a la izquierda, con trenza, mandil de lunares y manos teñidas, y que se vea adulta;
   - la plantilla del colibrí igual en i02 y r2, y el celular dorado en la mano derecha;
   - la pronunciación de "Cleotilde", "Abigail", "Delfino" y "aserrín".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink con caption.txt.
