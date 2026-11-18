---
type: handoff
status: active
tags: [atrium, novelas, flow, monetizadotiktok18, cola]
---
# Handoff novelas (monetizadotiktok18), 2026-11-17

## Estado de la cola
- Runner: `nohup bash <scratchpad>/nov_q/queue.sh >/dev/null 2>&1 &` (scratchpad = C:/Users/ALANLE~1/AppData/Local/Temp/claude/c026b2981c42eeb2/50c3c1ee-af27-4bdd-ab17-c508335a8f8f/scratchpad). Cola viva: pieces/_cola_monetizado.txt; pendiente guardada: pieces/_cola_monetizado_pendiente.txt. Log: pieces/_cola_monetizado.log.
- Ledger: pieces/_creditos_monetizadotiktok18.json (gastado 8600 al entregar junta).

## AL RETOMAR (runner DETENIDO 15:30 por PAUSA del usuario; esperar el OK de main)
1. `cp pieces/_cola_monetizado_pendiente.txt pieces/_cola_monetizado.txt` y arrancar el runner. Cola: `REGEN vendimia-ensenada` (GEN cortado: hechos c01-c06, faltan c07 r1 c08 i01 c09 r2 r3 c10; su proyecto Flow es el activo), `REGEN relevo-ures c02` (c02 traía subtítulos quemados), `GEN viajante-sombrerete`.
2. Después de cada una: qa_clips → hoja → post.py → strip → ESTADO → SendMessage. relevo-ures ya tiene QA hecho (solo falta c02).
3. **Créditos de la API de Anthropic agotados**: revisión en sesión con qa/strip.jpg + qa/render_report.txt (+ hoja de clips con stack.py). Ojo: Omni a veces quema subtítulos propios (jima c02, relevo c02) → regenerar; y a veces corta la última frase de un clip de 6 s (carta c10) → acortar la línea en lines.json y regenerar.
4. gastado Flow al detener: 10460.
5. Procesos: matar queue.sh/gen.sh (kill por PID en `ps -ef`), y en Windows python clips.py / make_sheets.py / node cli.js (Get-CimInstance Win32_Process por CommandLine). No tocar los bash de vera-01 (otra sesión).

## Entregadas a main en esta sesión (renders listos, NO entregados a LucidLink/Telegram)
| pieza | marca | # | cierre |
|---|---|---|---|
| domino-jerez | MEXI | 31 | 3 |
| pipian-tlaxcala | MAJESTIC | 25 | 7 |
| sobre-alamos | MEXITV | 7 | 2 |
| junta-guadalajara | VISTA | 26 | 1 |
| brindis-orizaba | MAJESTIC | 19 | 5 | (EDL c01 arreglada a mano: re-render solo con post.py --noedl)
| manteles-apan | MEXI | 48 | 2 |
| lucero-parral | MEXITV | 22 | 7 | (PUNCH de c06 quitado a mano: re-render solo con --noedl)
| cacao-comalcalco | VISTA | 53 | 3 |
| copita-matatlan | MAJESTIC | 1 | 1 |
| flores-tapalpa | MEXITV | 16 | 1 |
| carta-durango | MEXI | 49 | 4 | (c10 regenerada con línea acortada)
| jima-arandas | VISTA | 46 | 3 |
| traje-zamora | MAJESTIC | 5 | 1 |
| cafetal-coatepec | MEXI | 45 | 7 |
Pendientes de cerrar: relevo-ures MEXITV #24 (5), vendimia-ensenada VISTA #55 (6), viajante-sombrerete MAJESTIC #12 (1).

## Escritas después (en cola, orden de rotación): flores-tapalpa MEXITV #16 cierre 1 (Bodas) · jima-arandas VISTA #46 cierre 3 (Patronas) · traje-zamora MAJESTIC #5 cierre 1 (Identidad) · cafetal-coatepec MEXI #45 cierre 7 (Patronas). Después: relevo-ures MEXITV #24 cierre 5 (Traición). Después: vendimia-ensenada VISTA #55 cierre 6 (Patronas). Después: viajante-sombrerete MAJESTIC #12 cierre 1 (Doble vida). Siguiente nueva: MEXI, Patronas, cierre ≠1. Usados además: #5,12,16,24,45,46,55. Nombres: Aurelio, Remigio, Baltasar; Nombres: Gustavo, Lisardo, Natividad, Silvestre, Fernanda, Luca. Nombres nuevos usados: Hortensia, Valentina, Gael, Patricio, Graciela, Santiago, Marisol, Eugenia, Rodrigo, Fulgencio, Abundio, Amparo, Griselda, Celestino, Felipa. OJO: lucero-parral ya es caballo+fierro (no repetir esa premisa).

## Escritas (manteles con clips listos; el resto en la cola pendiente), en este orden
| pieza | marca | # | familia | cierre |
|---|---|---|---|---|
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

## Sesión 17:30 (retomada)
- Entregadas: vendimia-ensenada (VISTA #55, 6), relevo-ures (MEXITV #24, 5). viajante-sombrerete: falta REGEN c02 (cortó la 1ª frase) → post → entregar.
- Escritas y en cola, en orden: dama-lagos MEXI #52 cierre 3 (Patronas) · prueba-penjamo MEXITV #43 cierre 5 (Chantajes) · panuelo-jalpan VISTA #56 cierre 6 (Patronas, época) · foto-cosala MAJESTIC #41 cierre 4 (Chantajes) · aretes-jojutla MEXI #47 cierre 7 (Patronas).
- compromiso-lagunillas MEXITV #34 cierre 3 (Capos) también en cola. ojo-cienegas VISTA #51 cierre 2 (Patronas) en cola. danzon-cordoba MAJESTIC #39 cierre 6 en cola. moro-sabinas MEXI #54 cierre 4 en cola. tienda-mineral MEXITV #30 cierre 1 en cola (24 clips). Siguiente nueva: VISTA, Patronas (solo queda #50; si no, premisa nueva tipo patrona), cierre ≠1. DESDE AHORA 22-26 clips, 65-85 s.
- Nombres nuevos: Benigna/Paulina Altamirano, Macrina Leal, Ventura; Evodio/Saúl/Gerónimo Salcedo; Anastasio/Mariana Echeverría, Matías Robledo, Rafael Garduño; Benito Quiroga, Fabián Rosas, Cipriano, Horacio Lugo; Leonarda/Isadora Montoya, Abel/Lucía Cortés.
- barrica-mascota VISTA #50 cierre 7 (Patronas, 24 clips) en cola. Patronas del catálogo AGOTADAS (#45-#56 usados): inventar premisas nuevas tipo patrona/hacienda. Siguiente: MAJESTIC, no patronas, cierre ≠7.
- hotel-mazamitla MAJESTIC #28 cierre 3 (25 clips) en cola. Siguiente: MEXI, patrona NUEVA (inventada), cierre ≠3.
- puro-tuxtla MEXI (patrona nueva) cierre 5 (24 clips) en cola. Siguiente: MEXITV, no patronas, cierre ≠5.

## AL RETOMAR (runner DETENIDO 21:40 por contexto del agente; gastado 12330)
1. `cp pieces/_cola_monetizado_pendiente.txt pieces/_cola_monetizado.txt` + arrancar runner. Cola: REGEN tienda-mineral (hechos c01-c05; el proyecto Flow activo 4cf25b82 está vacío y es para ella) · GEN barrica-mascota · GEN hotel-mazamitla · GEN puro-tuxtla.
2. Entregadas en esta tanda (main): vendimia-ensenada, relevo-ures, viajante-sombrerete, dama-lagos, prueba-penjamo, panuelo-jalpan, foto-cosala, aretes-jojutla, compromiso-lagunillas, ojo-cienegas, danzon-cordoba, moro-sabinas.
3. Rotación: después de puro-tuxtla (MEXI, cierre 5) va MEXITV, no patronas, cierre ≠5, 22-26 clips. Catálogo [CAPO] libre: #3 (viñedo, evitar), #9 (medios hermanos, evitar tras barrica), #33, #35; o premisas nuevas.
4. Kill de procesos: en ps -ef el usuario tiene espacio ("Alan Lei"), así que el PID es la columna 3 de awk, no la 2. Matar primero queue.sh y gen.sh, DESPUÉS los python/node (si no, el runner sigue con la pieza siguiente).
5. Revisión ahorrando tokens: qa_clips.py → grep "r=0.[0-8]" del report; hoja stack.py a 360 px; post.py; tira de 6 fotogramas 3x2 a 120 px.

## Sesión 21:36 (retomada por subagente)
- Runner arrancado 21:36 con la cola pendiente. Escritas y en cola: luto-tacambaro MEXITV #33 cierre 2 (Capos) · trapiche-cuautla VISTA #58 cierre 3 (Patronas nueva, época) · llavero-saltillo MAJESTIC #8 cierre 1 (Herencia). puro-tuxtla agregada al catálogo como #57.
- Siguiente nueva: MEXI, patrona NUEVA (#59), cierre ≠1.
- Nombres nuevos: Altagracia/Prisciliano/Aniceto Sotelo, Moisés Rangel, Areli Campos; Fidelina Villaseñor, Adalberto Larrea, Elías Cervera, Dominga; Itzayana Cordero, Zulema/Reinaldo/Gregorio Montemayor, Olegario Zertuche.

## AL RETOMAR (runner DETENIDO 21:47 por PAUSA del usuario; esperar el OK de main; gastado 12400)
1. `cp pieces/_cola_monetizado_pendiente.txt pieces/_cola_monetizado.txt` + arrancar runner. Cola: REGEN tienda-mineral (hechos 12/24: c01-c10 r1 r2; proyecto Flow activo 4cf25b82 es el suyo) · GEN barrica-mascota · hotel-mazamitla · puro-tuxtla · luto-tacambaro · trapiche-cuautla · llavero-saltillo.
2. Ninguna pieza entregada aún en esta tanda. Siguiente nueva: MEXI, patrona NUEVA (#59), cierre ≠1.
