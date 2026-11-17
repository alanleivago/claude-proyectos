---
type: handoff
status: active
tags: [atrium, novelas, flow, monetizadotiktok18, cola]
---
# Handoff novelas (monetizadotiktok18), 2026-11-17

## Estado de la cola
- Runner: `nohup bash <scratchpad>/nov_q/queue.sh >/dev/null 2>&1 &` (scratchpad = C:/Users/ALANLE~1/AppData/Local/Temp/claude/c026b2981c42eeb2/50c3c1ee-af27-4bdd-ab17-c508335a8f8f/scratchpad). Cola viva: pieces/_cola_monetizado.txt; pendiente guardada: pieces/_cola_monetizado_pendiente.txt. Log: pieces/_cola_monetizado.log.
- Ledger: pieces/_creditos_monetizadotiktok18.json (gastado 8600 al entregar junta).

## Entregadas a main en esta sesión (renders listos, NO entregados a LucidLink/Telegram)
| pieza | marca | # | cierre |
|---|---|---|---|
| domino-jerez | MEXI | 31 | 3 |
| pipian-tlaxcala | MAJESTIC | 25 | 7 |
| sobre-alamos | MEXITV | 7 | 2 |
| junta-guadalajara | VISTA | 26 | 1 |

## Escritas y en cola (GEN), en este orden
| pieza | marca | # | familia | cierre |
|---|---|---|---|---|
| brindis-orizaba | MAJESTIC | 19 | Bodas | 5 |
| manteles-apan | MEXI | 48 | Patronas | 2 |
| lucero-parral | MEXITV | 22 | Traición familiar | 7 |
| cacao-comalcalco | VISTA | 53 | Patronas | 3 |
| copita-matatlan | MAJESTIC | 1 | Identidad oculta | 1 |
| carta-durango | MEXI | 49 | Patronas | 4 |
Todas tienen sheets_spec.json, make_sheets.py, clips.src.py → clips.py, lines.json, edit.py (mkedit, SPEED 1.15, subtítulos), phr.py, mk_edl.py, caption.txt y ESTADO.md inicial.

## Siguiente pieza nueva
- Marca: MEXITV. Debe ser NO-patronas (la anterior, carta-durango, es patronas), cierre ≠ 4, familia ≠ Patronas. Usados hoy: #1,7,14,19,22,25,26,31,48,49,53. Saltar #44.
- Nombres ya usados hoy (no repetir): Nicanor, Valeria, Mercedes, Arriaga, Clemencia, Renata, Bernardo, Tomasa, Rufino, Ismael, Ximena, Anselmo, Rosario, Arturo, Leonor, Eusebio, Julián, Candelaria, Teófilo, Iker, Daniela, Brígida, Fausto, Inés, Joaquín, Pilar.

## Cómo escribir una pieza nueva (5 min)
1. mkdir pieces/<p>; copiar phr.py y mk_edl.py de silla-izamal.
2. sheets_spec.json → `python -I <sc>/nov_q/mksheets.py "F:/Claude Proyectos/pieces/<p>"` (ruta absoluta, no ".").
3. lines.json + clips.src.py (copiar el de carta-durango o manteles-apan) → `python -I <sc>/nov_q/build.py <p>/clips.src.py <p>/clips.py` + py_compile.
4. `python -I <sc>/nov_q/mkedit.py "F:/.../pieces/<p>" <BRAND> "<Título>" <t1cid> <t2cid>`.
5. caption.txt, ESTADO.md, `echo "GEN <p>" >> pieces/_cola_monetizado.txt`.

## Cerrar una pieza
1. `python -I <sc>/nov_q/qa_clips.py "F:/.../pieces/<p>"` → REVISAR en clips mudos (r*, i*) suelen ser alucinaciones del ASR ("¡Suscríbete!"). Hoja: `python <sc>/stack.py <dir> c01,c02,... out.jpg 560` (ver subtítulos quemados, sobre todo en el CTA).
2. Regens: insertar `REGEN <p> <ids>` al principio de la cola (`sed -i '1i ...'`).
3. `python <sc>/nov_q/post.py <p>`; `bash <sc>/strip.sh <p>` → qa/strip.jpg; revisar_render.py (el "watermark" de MEXITV es falso positivo). Tiempos→clip: `python <sc>/tmap.py "F:/.../pieces/<p>"`.
4. ESTADO.md + SendMessage a main con la línea estándar (leer gastado del ledger antes).
