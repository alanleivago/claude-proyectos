---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, historia-original]
relatedTo: [gardenia, canasta, nochebuena]
---
# pedida-mano (La Pedida de Mano · Parte 1, video 24): estado
- Historia ORIGINAL, no navideña. Fórmula "humilló a alguien sencillo sin saber quién era", la de las más virales del ranking (chicles 3.4M, la dueña humilde 2.5M). Es la primera pieza con una pedida de mano; no hay dueño, empresa, dinero ni papeles.
- Fórmula:
  - Humillación en la 1.ª línea: Isabela al señor de la llanta ponchada: "¿esta carcacha es suya? … no quiero que mis suegros vean esta basura".
  - Giro de poder: el señor es don Lorenzo, el papá del novio, que venía a pedir su mano.
  - Payoff: Lorenzo le devuelve "me dijeron que mi lugar era en la cocina"; la pedida "se pospone… hasta que su hija aprenda a saludar"; Esteban se pone del lado de su papá.
  - Gancho: Beatriz y Lorenzo se conocían: "¿Ya le contaste a tu hija por qué me fui del pueblo?"
- Marca: **MAJESTIC STORIES** (rotación: gardenia=VISTA → esta=MAJESTIC → siguiente=MEXI). La música y la marca de agua salen de pieces/_marcas/MAJESTIC (edit.py, BRAND = "MAJESTIC"); no hay carpeta music/ propia.
- Archivos listos:
  - guion.md y caption.txt (formato Parte 1).
  - lines.json: fuente única de clips.py (492 palabras, unos 235–245 s).
  - clips.py, con 39 clips: c01–c35 y r1–r4. Suman 294 s de generación.
    - Todos los planos con diálogo son de una persona: gaze(side) + ONE + ALONE.
    - NOSUB + CLEAN + END en cada diálogo.
    - NODOUBLE en los de riesgo: c01, c02, c05, c08, c14, c15, c19, c21, c23, c28, c30 y c33.
    - SAFE/SOFT, incluidas las frases fuertes del diálogo.
    - variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control y 17 s entre clips.
    - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
  - make_sheets.py: 6 hojas con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS". phr.py.
  - edit.py:
    - EDL en borrador por índices de línea, con ganancia 0 en los mudos y BLACK 0.4 s antes de c35.
    - Música: cama cálida de c19 a c33. Loudnorm en dos pasadas. Salida en renders/v1.mp4.
- Hojas nuevas (aún no generadas; nombres verificados como únicos en pieces/*): ISABELA_VALDIVIA, BEATRIZ_VALDIVIA, LORENZO_CARRASCO, ESTEBAN_CARRASCO, LOC_PORTONPEDIDA, LOC_COMEDORPEDIDA.
  - Las locaciones son simples: nada religioso, sin adornos, flores, cuadros ni letreros (lección de intercambio).
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO y correr `md5sum chars/*.jpg`. Armar una hoja de contactos y comprobar:
     - Isabela de vestido rojo, pelo suelto; Beatriz rubia cenizo de verde (que no se parezcan).
     - Lorenzo de guayabera blanca, pelo gris y bigote; Esteban de azul marino, barba negra (que no se parezcan).
     - La camioneta verde con la llanta ponchada y sin placa con letras; el portón sin letreros.
     - El comedor sin flores, cuadros ni adornos.
  2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
  3. QA con hoja de fotogramas, tiras de la franja inferior y bordes.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
  5. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y `python -I edit.py`.
  6. Verificar: sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, marca MAJESTIC arriba a la izquierda. Luego Telegram con caption.txt.
- Revisar en el QA:
  - Geografía:
    - Estacionamiento de día: Lorenzo IZQ. junto a la camioneta; Isabela y Beatriz DER. en el portón.
    - Comedor: Isabela y Beatriz IZQ., sentadas; Esteban y Lorenzo DER., de pie.
    - Anochecer: Lorenzo IZQ.; Beatriz DER.
  - Ningún doble: otro vestido rojo, otro vestido verde, otra guayabera blanca, otro saco azul.
  - Nadie en los bordes; nadie que entre caminando; sin meseros ni gente al fondo del comedor.
  - Utilería:
    - Una sola camioneta, la verde, con la llanta ponchada; sin placas con letras.
    - El celular en la mano DERECHA con la pantalla de espaldas (c11, c12).
    - Ninguna herramienta, sobre, papel ni carpeta inventados.
  - Sin sombreros ni lentes que aparezcan. Ropa igual en todos los planos (guayabera limpia, vestido rojo, bob rubio).
  - Subtítulos quemados, frases repetidas, 2.ª frase perdida, morphs.
- Riesgos:
  - c02/c04: Lorenzo agachado junto a la llanta (que no aparezca una llave de cruz que parezca arma ni otra persona).
  - c19–c32: Lorenzo en la puerta de arco (que no entre caminando y que no salgan meseros ni comensales).
  - c33–c35: anochecer con un farol (que no aparezca gente en el portón).
  - Pronunciación: "carcacha", "ponchó", "ponchada", "Quítela", "estacionamiento", "pospone", "Esteban".
