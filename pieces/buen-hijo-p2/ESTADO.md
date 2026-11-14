---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2]
relatedTo: [buen-hijo, recetario-p2]
---
# buen-hijo-p2 (El Buen Hijo · Parte 2): estado
- Sigue en el mismo segundo del cliffhanger de buen-hijo (Parte 1, entregada con MAJESTIC STORIES). Payoff: la fábrica era de Elena, la mamá de Tadeo; la carta escondida por la nana; Román confiesa lo del inventario y el padre cede. Gancho nuevo: doña Petra, la señora de la avenida, es la mamá de Elena, y Abundio le dijo durante años que Tadeo no quería conocerla.
- Marca: **MAJESTIC STORIES** (la de la Parte 1, fuera de la rotación). Música y marca de agua de pieces/_marcas/MAJESTIC (edit.py, BRAND = "MAJESTIC").
- Archivos listos:
  - guion.md.
  - lines.json, fuente única de clips.py.
  - clips.py: 30 clips (c01–c29 + r1 mudo), 232 s de voz en bruto, 54 frases. Lleva gaze() + ONE + ALONE en todos los planos, NOSUB y END tras cada diálogo, sin sombreros, una sola carta (LET/NOLET, sin sobre ni sello), SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips y el gatito de control. Imprime "FIN P2", acepta IDs y mueve la versión vieja a clips/old/. Probado en seco con un gen falso.
  - make_sheets.py: --reupload de 6 hojas de la Parte 1 (ABUNDIO, TADEO, ROMAN, AURELIA, LOC_SALON, LOC_FOGON) con control md5 DUPLICADO y control de nombre único. Sin hojas nuevas. Imprime "FIN HOJAS P2".
  - phr.py.
  - edit.py: EDL vacía, cálida de c19 a c24, BLACK 0.4 entre c28 y c29, salida renders/v1.mp4.
  - caption.txt.
- chars/: copia de la Parte 1 (las 10 hojas), revisadas en hoja de contactos: cada nombre es su persona/lugar y los md5 son distintos. Ojo: LOC_PERSIANA trae grafiti con letras (no se usa en la Parte 2).
- Nada generado en Flow todavía.
- Siguiente (una sesión de Flow a la vez):
  1. `python -I make_sheets.py --reupload > sheets_log.txt` (Monitor sobre "^FIN HOJAS P2"); revisar que no haya DUPLICADO ni FALTA.
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6").
  3. QA por agente (qa_clips.md). Revisar:
     - nadie en los bordes ni en primer plano (tiras de bordes a 4 fps);
     - subtítulos quemados y frases o palabras repetidas;
     - una sola carta, en la mano correcta y sin sobre (c04 Aurelia; Tadeo desde c05; abierta e ilegible en c13);
     - sin sombreros;
     - lados fijos (cocina: Tadeo izq., Aurelia der.; salón: Tadeo/Aurelia izq., Abundio/Román der.);
     - Román sin barba y con reloj, Abundio con bigote;
     - r1 mudo (ganancia 0);
     - c29 CTA con voz desde el inicio y gestos.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, EDL por frases en edit.py y `python -I edit.py` -> renders/v1.mp4.
  5. Verificación completa (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca MAJESTIC arriba a la izq.). Después, Telegram: `python tools/enviar_telegram.py pieces/buen-hijo-p2/renders/v1.mp4` (lee caption.txt).
- Riesgos:
  - c01 (frase larga de 10 s);
  - c04/c05 (paso de la carta);
  - c13 (carta abierta: letras legibles);
  - c18/c26/c27 (caras que cambian de tono);
  - r1 mudo (Whisper alucina).
- Pronunciación: "Elena", "Aurelia", "inventario", "igualito", "orgullosa".
