# ANIMS_HOMBRE.md
**Catálogo consolidado de animaciones, gestos y poses del pretendiente (Danny/Daniel) en los 8 videos de @missmedannypsx**

---

## 0. Cómo leer este documento

### 0.1 Videos fuente (id corto = últimos 6 dígitos, como en `male_anims/`)

| id corto | id completo | Video |
|---|---|---|
| `806870` | 7705812724365806870 | "One Cup of Sugar" (pide azúcar, pancakes) |
| `935190` | 7706199662880935190 | Ep 4 "Something True" (ascensor, radio) |
| `466198` | 7707302378944466198 | "The password was her idea" (Gerald 5G, wifi) |
| `411222` | 7705212283139411222 | Ep 2 "Special Delivery" (paquete, apodo Danny) |
| `648662` | 7705212103157648662 | Ep 1 "Wrong Door" (lámpara, 4D/4B) |
| `129430` | 7708414498654129430 | Ep 7 "Blackout" (velas, "On Air") |
| `040982` | 7706931737108040982 | Ep 5 "Laundry Day" (rosa/salmón) |
| `909462` | 7704420833954909462 | Tráiler T1 "Across the Hall" |

### 0.2 Advertencias sobre las fuentes
- Los tiempos salen de fotogramas a 1 fps, así que tienen **±0,5 s** de error.
- Los ángulos, cm y duraciones son **valores propuestos por nosotros**. Parten de lo descrito en los análisis (por ejemplo "ladeo ~10°", "~1,5 s", "3–4 toques/s") y los completamos con criterio de animador.
- Elegí las imágenes de referencia **por nombre y descripción del archivo, sin verlas**. Conviene revisarlas antes de dar por buena cada correspondencia.
- Dos archivos tienen el nombre "sanitizado": `411222_019.5s_gesto-se-alar.jpg` (es *gesto-señalar*) y `129430_033.5s_ojos-cerrados-verg-enza.jpg` (es *ojos-cerrados-vergüenza*).
- `935190 abanicarse` aparece en el JSON a 39,5 s (el texto dice 38,5 s). Uso el archivo `039.5s`.
- Hay animaciones sin fotograma propio (por ejemplo `466198 explain-looking-up`, `hope-pose`, `happy-okay`, `lights-out`; `935190 sonrisa-radio`; `648662 pausa-umbral`). Para esas enlazo el fotograma más cercano y lo indico como "(aprox.)".

### 0.3 Rig y convenciones
- **Silueta del personaje:** cabeza pequeña en forma de huevo, **cuello larguísimo y fino**, torso y brazos delgados, piernas largas, manos blancas tipo guante. Es más bajo que ella (ella ≈ 1,25×), así que **mira hacia arriba ~10–15° cuando habla con ella**.
- **Escala:** los cm asumen un personaje de ~175 cm. Si el rig es distinto, reescalar proporcionalmente.
- **Huesos usados:** `root`, `pelvis`, `spine_01`, `chest`, `neck_01`, `neck_02`, `head`, `clavicle_L/R`, `upperarm_L/R`, `forearm_L/R`, `hand_L/R`, `thigh`, `shin`, `foot`. El cuello va en dos huesos para poder estirarlo (squash & stretch).
- **Signos de ángulo:** `pitch +` = barbilla abajo (asiente); `yaw +` = gira hacia su izquierda; `roll +` = ladea hacia su izquierda; flexión de hombro `+` = brazo al frente/arriba; abducción = separar del cuerpo.
- **Cadencia:**
  - El cuerpo va con claves interpoladas a 24–30 fps.
  - La **cara cambia por sprites a 8–12 Hz, sin sincronía labial**. La boca alterna 2–3 formas fijas cada ~0,15 s.
- **Curvas:** `EO` = ease-out, `EIO` = ease-in-out, `POP` = ease-out con overshoot del 10–15 %, `HOLD` = pose mantenida.
- **Recomendación para nuestro pretendiente:** la cabeza es pequeña y se lee poco, así que conviene **exagerar un 20 % los ángulos de cabeza** frente a los valores de abajo.

### 0.4 Códigos de sprites faciales

| Código | Significado |
|---|---|
| `OJ-N` | ojos neutros (iris marrón/ámbar, contorno grueso) |
| `OJ-ARCO` | ojos cerrados en arco "^ ^" (felicidad) |
| `OJ-ANCHO` | muy abiertos, iris pequeño (sorpresa) |
| `OJ-ESCLERA` | esclera completa, pupilas diminutas (pánico/shock final) |
| `OJ-ENTORNADO` | párpados a media altura |
| `OJ-LADO` | pupilas desviadas abajo o a un lado |
| `OJ-CORAZON` | iris sustituidos por corazones rosa |
| `OJ-CERRADO` | cerrados (con pestañas) |
| `CE-N / CE-ARRIBA / CE-V / CE-BAJAS` | cejas neutras / altas / inclinadas en V (preocupado) / bajas (ofendido) |
| `BO-LINEA` | boca cerrada, línea corta |
| `BO-SONRISA` | sonrisa cerrada |
| `BO-W` | sonrisa pequeña en "w" |
| `BO-O` | pequeña "o" abierta |
| `BO-OVAL` | óvalo abierto |
| `BO-ABIERTA` | boca abierta con lengua |
| `BO-RISA` | boca muy abierta de risa |
| `BO-ONDA` | línea ondulada "~" (cara plana/nerviosa) |
| `BO-RECT` | rectángulo rojo estrecho (susto) |
| `RU-0 / RU-1 / RU-2` | rubor ninguno / mejillas rosa / intenso con rayitas |

---

## 1. IDLE DE PIE

#### IDL-01 · Idle base de pie
- **Apariciones:** `806870` 0,5 (idle-puerta) · `935190` 12,5 (idle-de-pie) · `411222` 16,5 (idle-pasillo-trasero) y 34,5 (idle-espera) · `648662` 13,5–14,5 (idle-de-espaldas) y 42,5 (de pie ante ella).
- **Ref:** [806870 idle-puerta](male_anims/806870_000.5s_idle-puerta.jpg) · [935190 idle-de-pie](male_anims/935190_012.5s_idle-de-pie.jpg) · [411222 idle-pasillo-trasero](male_anims/411222_016.5s_idle-pasillo-trasero.jpg) · [648662 idle-de-espaldas](male_anims/648662_014.5s_idle-de-espaldas.jpg)
- **Animar:**
  - Loop de 4 s, sin costura.
  - Peso repartido en ambas piernas.
  - `chest` pitch ±1° con la respiración. `pelvis` roll ±2° y sway lateral ±1,5 cm.
  - Brazos colgando con codos flexionados 10–15° y manos semiabiertas.
  - `head` micro-deriva ±1,5° en yaw y roll, con pitch −10° a −12° (mira hacia arriba a ella).
  - Parpadeo cada 3–5 s: 2 sprites de ~0,1 s.
  - Cara: `OJ-N`, `BO-LINEA`, `CE-N`, `RU-1`.
- **Prioridad:** **A**. Es la base sobre la que se montan todas las demás.

#### IDL-02 · Idle de escucha (la cabeza sigue a la interlocutora)
- **Apariciones:** `806870` 35,5 (escuchar-de-pie) · `411222` 46,5 (idle-escuchando-burla) y 34,5 (idle-espera) · `648662` 51,5–54,5 (escuchar, mirando hacia arriba) · `129430` 48,5 (mirada-hacia-ella, perfil).
- **Ref:** [806870 escuchar-de-pie](male_anims/806870_035.5s_escuchar-de-pie.jpg) · [411222 idle-escuchando-burla](male_anims/411222_046.5s_idle-escuchando-burla.jpg) · [411222 idle-espera](male_anims/411222_034.5s_idle-espera.jpg)
- **Animar:**
  - Base de IDL-01 más un `head` que sigue sus gestos: yaw ±10–15° con EIO de 0,3 s.
  - Roll fijo de 5° (cabeza algo ladeada).
  - Asentimiento mínimo (pitch +4°, 0,3 s) cada 2–3 s.
  - Manos abiertas y brazos sueltos.
  - Loop de 3–4 s, tantas veces como dure el diálogo.
  - Cara: `BO-LINEA`, `OJ-N` fijos en ella, `RU-1`.
- **Prioridad:** **A**. La mayor parte del tiempo en pantalla es escuchar.

#### IDL-03 · Espera con cambio de peso
- **Apariciones:** `806870` 26,5 (espera-en-umbral) · `648662` 13,5–14,5 (gira apenas la cabeza hacia el sofá).
- **Ref:** [806870 espera-en-umbral](male_anims/806870_026.5s_espera-en-umbral.jpg) · [648662 idle-de-espaldas](male_anims/648662_014.5s_idle-de-espaldas.jpg)
- **Animar:**
  - Loop de 4 s.
  - La `pelvis` se desplaza ~3 cm lateralmente en 0,8 s (EIO), se mantiene 1,5 s y vuelve. El pie descargado se adelanta 2 cm.
  - `head` yaw ±20° para seguir a ella mientras se mueve.
  - Brazos caídos con un leve contra-balanceo de 3°.
- **Prioridad:** **B**. Sirve mientras la camarera cruza el local.

#### IDL-04 · Idle rígido (miedo o formalidad)
- **Apariciones:** `935190` 21,5 (idle-rigido, manos juntas) · `129430` 41,5 (de-pie-detras, hombros subidos).
- **Ref:** [935190 idle-rigido](male_anims/935190_021.5s_idle-rigido.jpg) · [129430 de-pie-detras](male_anims/129430_041.5s_de-pie-detras.jpg)
- **Animar:**
  - Loop de 3 s.
  - Hombros elevados +3 cm. Columna recta, sin sway y con respiración casi nula (±0,5°).
  - Variante A: manos juntas delante, codos 45°. Variante B: brazos pegados al cuerpo con dedos rígidos.
  - Opcional: temblor de manos ±1° a 6 Hz.
  - Mirada fija (en ella o en la puerta).
- **Prioridad:** **B**. Es el contraste cómico con el idle suelto.

#### IDL-05 · Apoyado en el marco de la puerta
- **Apariciones:** `129430` 8,5 (apoyo-puerta).
- **Ref:** [129430 apoyo-puerta](male_anims/129430_008.5s_apoyo-puerta.jpg)
- **Animar:**
  - One-shot de entrada (0,4 s, EO) y luego hold de 1 s con respiración.
  - `spine`/`chest` yaw 30° hacia ella.
  - Mano izquierda plana sobre el marco a altura de hombro, con el codo a ~100°. Brazo derecho colgando.
  - Cara: `BO-O` (sorpresa), `OJ-N`, `CE-ARRIBA`.
- **Prioridad:** **B**. Sirve para apoyarse en la barra o el mostrador.

#### IDL-06 · Idle tímido de rostro (plano cercano, sonrisa cerrada)
- **Apariciones:** `411222` 4,5 (idle-nervioso-frontal) · `129430` 10,5 (sonrisa-timida) · `806870` 12,5 (sonrisa-cerrada) · `466198` 5,5 (smile-hold) · `935190` 20,5 (timido-frontal).
- **Ref:** [411222 idle-nervioso-frontal](male_anims/411222_004.5s_idle-nervioso-frontal.jpg) · [129430 sonrisa-timida](male_anims/129430_010.5s_sonrisa-timida.jpg) · [935190 timido-frontal](male_anims/935190_020.5s_timido-frontal.jpg) · [466198 smile-hold](male_anims/466198_005.5s_smile-hold.jpg)
- **Animar:**
  - Loop de 3 s (o hold de 0,5–1 s entre frases).
  - `head` pitch +4–5° y sway ±2°.
  - Hombros respiran ±1 cm. Cejas inclinadas.
  - Cara: `BO-SONRISA`, `OJ-ENTORNADO`, `RU-1` (o `RU-2` si aumenta la tensión).
- **Prioridad:** **A**. Es la expresión "marca" del personaje.

---

## 2. CAMINAR Y DESPLAZARSE

#### WLK-01 · Caminar lento de espaldas (pasillo)
- **Apariciones:** `411222` 2,5 (caminar-de-espaldas) y 72,5 (caminar-alejandose) · `648662` 37,5 (salida-puerta-espaldas) y 67,5 (alejarse-con-lampara).
- **Ref:** [411222 caminar-de-espaldas](male_anims/411222_002.5s_caminar-de-espaldas.jpg) · [411222 caminar-alejandose](male_anims/411222_072.5s_caminar-alejandose.jpg) · [648662 salida-puerta-espaldas](male_anims/648662_037.5s_salida-puerta-espaldas.jpg) · [648662 alejarse-con-lampara](male_anims/648662_067.5s_alejarse-con-lampara.jpg)
- **Animar:**
  - Loop de 1,1 s por ciclo (2 pasos), paso lento y algo rígido.
  - Zancada ~45 cm. Bob vertical de `pelvis` ±1 cm. Giro de hombros ±5°.
  - Brazos con swing ±15°, sin exagerar. Cabeza estable.
  - Con objeto bajo el brazo, bloquear ese brazo con IK y mantener el otro en swing.
  - Para salir de cuadro, one-shot de 3–4 pasos.
- **Prioridad:** **A**.

#### WLK-02 · Caminar con carga a dos manos (caja, bandeja)
- **Apariciones:** `648662` 2,5 (caminar-con-caja) · `909462` 0,5 (caminar-con-caja).
- **Ref:** [648662 caminar-con-caja](male_anims/648662_002.5s_caminar-con-caja.jpg) · [909462 caminar-con-caja](male_anims/909462_000.5s_caminar-con-caja.jpg)
- **Animar:**
  - Loop de 1,2 s (1 paso cada 0,6 s).
  - Ambos antebrazos con IK al objeto, que va pegado al vientre/pecho (codos ~90°). Los brazos no oscilan.
  - Bob vertical ±1,5 cm. Hombros ±3°. Cabeza con sway ±3°.
- **Prioridad:** **B**. Reutiliza el IK para ramo, taza o bandeja.

#### WLK-03 · Caminar aturdido de perfil con objeto colgando
- **Apariciones:** `648662` 76,5 (caminar-pasillo-lampara).
- **Ref:** [648662 caminar-pasillo-lampara](male_anims/648662_076.5s_caminar-pasillo-lampara.jpg)
- **Animar:**
  - Loop de 1,6 s, paso lento.
  - Hombros caídos −2 cm. `head` pitch +8°.
  - Objeto colgando de la mano a la altura de la cadera, con péndulo ±5°.
- **Prioridad:** **C**.

#### WLK-04 · Salida feliz (paso ligero)
- **Apariciones:** `806870` 64,5 (salida-feliz).
- **Ref:** [806870 salida-feliz](male_anims/806870_064.5s_salida-feliz.jpg)
- **Animar:**
  - One-shot de 1,5 s. De espaldas, termina saliendo de cuadro.
  - Ciclo de 0,7 s con rebote de 2 cm por paso.
  - Brazos con swing ±25° (el que lleva objeto, solo ±8°).
  - `head` roll 5° y leve vaivén de felicidad.
- **Prioridad:** **A**. Es el remate de los finales dulces.

#### WLK-05 · Entrar / pasar el umbral con un paso
- **Apariciones:** `909462` 2,5 (entrada-feliz) · `648662` 5,5 (entrada-feliz-ojos-cerrados) · `935190` 2,5 (entrada-aturdido) · `129430` 26,5 (salir-pasillo).
- **Ref:** [909462 entrada-feliz](male_anims/909462_002.5s_entrada-feliz.jpg) · [648662 entrada-feliz-ojos-cerrados](male_anims/648662_005.5s_entrada-feliz-ojos-cerrados.jpg) · [935190 entrada-aturdido](male_anims/935190_002.5s_entrada-aturdido.jpg) · [129430 salir-pasillo](male_anims/129430_026.5s_salir-pasillo.jpg)
- **Animar:**
  - One-shot de 1–1,5 s. Un paso de ~40 cm hacia adelante y luego idle.
  - Variante feliz: `head` pitch −10° (hacia atrás), `OJ-ARCO`, `BO-RISA`, hombros relajados, rebote de rodillas 2 cm.
  - Variante aturdida: `head` pitch +10°, mirada fija, `CE-ARRIBA`, sonrisa leve. Entra con pixelado.
  - Variante "salir al pasillo": pasos cortos arrastrando los pies y giro de hombros 15°. Ella ocupa el primer plano.
- **Prioridad:** **A**. Es la entrada al local de la camarera.

---

## 3. HABLAR Y GESTICULAR

#### TLK-01 · Hablar frontal base (lipflap)
- **Apariciones:** `129430` 11,5 (hablar) · `466198` 4,5 (explain-looking-up) y 6,5 (open-mouth-explain) · `411222` 5,5 (hablar-ceja-arriba) · `806870` 2,5 (hablar-pidiendo) y 13,5 (boca-o) · `040982` 32,5 (habla-inclinado).
- **Ref:** [129430 hablar](male_anims/129430_011.5s_hablar.jpg) · [806870 hablar-pidiendo](male_anims/806870_002.5s_hablar-pidiendo.jpg) · [411222 hablar-ceja-arriba](male_anims/411222_005.5s_hablar-ceja-arriba.jpg) · [466198 open-mouth-explain](male_anims/466198_006.5s_open-mouth-explain.jpg) · [040982 habla-inclinado](male_anims/040982_032.5s_habla-inclinado.jpg) · [806870 boca-o](male_anims/806870_013.5s_boca-o.jpg)
- **Animar:**
  - Loop de lipflap mientras hay audio.
  - Boca alterna `BO-OVAL` ↔ `BO-ABIERTA` cada ~0,15 s (6–7 Hz). La lengua se ve en las vocales abiertas.
  - `head` pitch ±3° por sílaba, roll 5–10° (barbilla hacia cámara en frases alegres).
  - `torso` se inclina +5° hacia el interlocutor.
  - Manos con palmas semiabiertas, separadas 10–15 cm.
  - `CE-ARRIBA` en preguntas.
  - Duración típica por frase: 1–2,5 s.
- **Prioridad:** **A**.

#### TLK-02 · Hablar de perfil / de reojo
- **Apariciones:** `935190` 52,5 (hablar-radio) y 47,5 (admitir-dormir) · `909462` 7,5 (giro-perfil-pregunta) y 51,5 (confesion-lateral) · `466198` 45,5–46,5 (type-profile, mientras recita).
- **Ref:** [935190 hablar-radio](male_anims/935190_052.5s_hablar-radio.jpg) · [935190 admitir-dormir](male_anims/935190_047.5s_admitir-dormir.jpg) · [909462 giro-perfil-pregunta](male_anims/909462_007.5s_giro-perfil-pregunta.jpg) · [909462 confesion-lateral](male_anims/909462_051.5s_confesion-lateral.jpg)
- **Animar:**
  - Hold con lipflap suave durante 1–2 s.
  - `head` yaw 60–90° a perfil, con pitch −5° (mira algo arriba) o +10° (mira al suelo).
  - `OJ-LADO` (reojo a ella o a cámara). Boca pequeña con micro-movimientos de mandíbula.
  - Brazo extendido bajo y relajado.
- **Prioridad:** **B**.

#### TLK-03 · Pregunta con ladeo y espera
- **Apariciones:** `806870` 3,5 (pregunta-ladeo) · `935190` 34,5 (pregunta-curiosa) · `129430` 23,5 (ofrecer) · `411222` 36,5 (adivinar-books) · `648662` 19,5 ("This isn't 4D?", sin fotograma propio).
- **Ref:** [806870 pregunta-ladeo](male_anims/806870_003.5s_pregunta-ladeo.jpg) · [935190 pregunta-curiosa](male_anims/935190_034.5s_pregunta-curiosa.jpg) · [129430 ofrecer](male_anims/129430_023.5s_ofrecer.jpg) · [411222 adivinar-books](male_anims/411222_036.5s_adivinar-books.jpg)
- **Animar:**
  - One-shot de 1 s.
  - Al terminar la frase, `head` roll 10° y `CE-ARRIBA`. Se queda esperando 0,5 s (HOLD).
  - `BO-O` o boca abierta pequeña, `OJ-ANCHO`.
  - Adivinar: cabeza adelantada 3 cm. Pregunta-curiosa: `head` yaw 15° hacia la izquierda.
  - Ofrecer: sonrisa amable con la cabeza ladeada.
- **Prioridad:** **A**. Es la mecánica de "pedir" (la carta, el pedido).

#### TLK-04 · Explicar con mano abierta / brazo extendido
- **Apariciones:** `935190` 41,5 (explicar-solapas) · `040982` 42,5 (explica-brazo-extendido) y 47,5 (explica-sonriente).
- **Ref:** [935190 explicar-solapas](male_anims/935190_041.5s_explicar-solapas.jpg) · [040982 explica-brazo-extendido](male_anims/040982_042.5s_explica-brazo-extendido.jpg) · [040982 explica-sonriente](male_anims/040982_047.5s_explica-sonriente.jpg)
- **Animar:**
  - One-shot de 1,5 s, o loop expresivo de 3 s en "explica-sonriente".
  - `upperarm` abducción 30–45°, `forearm` supinado (palma arriba). La mano se abre en 0,3 s (EO) y se mantiene 0,5–1 s.
  - Opcional: la otra mano plana sobre el pecho.
  - `head` alterna roll ±5° cada ~1 s.
  - Cara: sonrisa cerrada, pupilas grandes, `CE-ARRIBA`.
- **Prioridad:** **B**.

#### TLK-05 · Señalar con el dedo o la mano
- **Apariciones:** `040982` 58,5 (senala-con-dedo) y 69,5 (senala-secadora) · `411222` 19,5 (gesto-señalar) · `648662` 46,5 (apparently-mano-atras, pulgar hacia atrás).
- **Ref:** [040982 senala-con-dedo](male_anims/040982_058.5s_senala-con-dedo.jpg) · [040982 senala-secadora](male_anims/040982_069.5s_senala-secadora.jpg) · [411222 gesto-señalar](male_anims/411222_019.5s_gesto-se-alar.jpg) · [648662 apparently-mano-atras](male_anims/648662_046.5s_apparently-mano-atras.jpg)
- **Animar:**
  - Subida de 0,4 s (EO) y HOLD de 2–3,5 s con respiración.
  - Brazo con flexión de hombro 70–90° (o abducción 80°) y codo casi extendido (10°). Índice extendido y el resto de dedos cerrados.
  - `torso` yaw 30° hacia el objetivo. `head` mira al objetivo o reprocha a la interlocutora.
  - Variante "señalar atrás": codo 90°, mano a la altura del hombro, dedos abiertos, agitada ±15° dos veces en 0,5 s.
- **Prioridad:** **B**.

#### TLK-06 · Mano de "alto / espera"
- **Apariciones:** `935190` 10,5 (mano-alto) · `648662` 10,5 (mano-alto-perfil) y 27,5 (mano-agitada-you-just).
- **Ref:** [935190 mano-alto](male_anims/935190_010.5s_mano-alto.jpg) · [648662 mano-alto-perfil](male_anims/648662_010.5s_mano-alto-perfil.jpg) · [648662 mano-agitada-you-just](male_anims/648662_027.5s_mano-agitada-you-just.jpg)
- **Animar:**
  - One-shot de 1 s. El antebrazo sube en 0,3 s hasta la altura de hombro/pecho, palma al frente y dedos separados (codo 90–100°).
  - Opcional: agitar ±10° (2 ciclos en 0,6 s).
  - `torso` yaw 20–30° hacia ella.
  - Cara: boca abierta, ceño de sorpresa (`CE-ARRIBA` o `CE-V`).
- **Prioridad:** **B**.

#### TLK-07 · Negar con la palma
- **Apariciones:** `935190` 45,5 (negar-nada) · `648662` 55,5 (negacion-palma-panico) y 56,5 ("First time!") · `411222` 48,5 (protesta-orgullo).
- **Ref:** [935190 negar-nada](male_anims/935190_045.5s_negar-nada.jpg) · [648662 negacion-palma-panico](male_anims/648662_055.5s_negacion-palma-panico.jpg) · [411222 protesta-orgullo](male_anims/411222_048.5s_protesta-orgullo.jpg)
- **Animar:**
  - One-shot de 0,7–1 s.
  - Antebrazo a la altura del hombro o el pecho, palma abierta. Oscila ±20° (roll de antebrazo/muñeca) 2–3 veces a ~4 Hz.
  - `torso` se inclina adelante 8° con la cabeza adelantada. Alternativa defensiva: palma delante del pecho y cuerpo ladeado.
  - Cara de pánico educado: `OJ-ANCHO`, `BO-O` grande, `CE-ARRIBA`, `RU-1/2`.
  - Con energía: un paso atrás de 15 cm.
- **Prioridad:** **A**.

#### TLK-08 · Manos abiertas "bueno…" / encogerse de hombros
- **Apariciones:** `806870` 37,5 (encogerse-incomodo) · `648662` 28,5 (manos-abiertas-wide).
- **Ref:** [806870 encogerse-incomodo](male_anims/806870_037.5s_encogerse-incomodo.jpg) · [648662 manos-abiertas-wide](male_anims/648662_028.5s_manos-abiertas-wide.jpg)
- **Animar:**
  - One-shot de 1 s.
  - Hombros suben 2–3 cm. Antebrazos rotan con las palmas hacia fuera/arriba y abducción de 20–25°.
  - Opcional: un paso adelante de 10 cm.
  - Cara: `BO-LINEA` o `BO-ABIERTA` pequeña, `CE-V`.
- **Prioridad:** **B**.

#### TLK-09 · Hablar en susurro / ensayo / "disimular"
- **Apariciones:** `411222` 7,5 (ensayo-susurro-puerta), 14,5 (excusa-quietly) y 6,5 (sonrisa-forzada-normal).
- **Ref:** [411222 ensayo-susurro-puerta](male_anims/411222_007.5s_ensayo-susurro-puerta.jpg) · [411222 excusa-quietly](male_anims/411222_014.5s_excusa-quietly.jpg) · [411222 sonrisa-forzada-normal](male_anims/411222_006.5s_sonrisa-forzada-normal.jpg)
- **Animar:**
  - Susurro: de perfil mirando la puerta. `head` pitch +8°, boca pequeña con movimiento rápido y micro-balanceo del torso ±1,5°. Manos a los lados.
  - "Quietly": mano derecha cerrada a medias junto al pecho, con 2 golpecitos de 3 cm en 0,5 s. Sonrisa pequeña y mirada de lado.
  - Sonrisa forzada: `BO` tensa y ancha, `OJ-ENTORNADO`, asentimiento de 4° durante 1 s.
- **Prioridad:** **B**.

#### TLK-10 · Hablar soñador (cabeza que se balancea)
- **Apariciones:** `935190` 56,5 (sonador-frontal) y 57,5 (sonrisa-radio, sin fotograma propio).
- **Ref:** [935190 sonador-frontal](male_anims/935190_056.5s_sonador-frontal.jpg)
- **Animar:**
  - Loop de 2 s.
  - `head` roll ±5° lento (ciclo ~1,5 s).
  - Párpados a media asta, sonrisa abierta con lengua y `RU-1`.
  - Termina en sonrisa cerrada de ternura (HOLD 1 s).
- **Prioridad:** **B**.

#### TLK-11 · Confesión tímida (hablar bajo, encogido)
- **Apariciones:** `806870` 18,5 (confesion-alone) · `935190` 17,5 (cabeza-baja) y 19,5 (confesar-lifts).
- **Ref:** [806870 confesion-alone](male_anims/806870_018.5s_confesion-alone.jpg) · [935190 cabeza-baja](male_anims/935190_017.5s_cabeza-baja.jpg) · [935190 confesar-lifts](male_anims/935190_019.5s_confesar-lifts.jpg)
- **Animar:**
  - One-shot de 1–1,5 s.
  - `head` pitch +10–15°. Los ojos miran de lado, o hacia arriba bajo el flequillo.
  - Hombros hacia dentro (se encoge ~1 cm).
  - Boca pequeña entreabierta (con lengua visible). `RU-1/2`, `CE-V` o contraídas.
- **Prioridad:** **A**. Es el motor emocional de las conversaciones con ella.

#### TLK-12 · Exclamación enfática / grito de pánico o indignación
- **Apariciones:** `935190` 11,5 (grito-floors) y 24,5 (more-exclamacion) · `648662` 12,5 (apartment-grito) · `909462` 8,5 (grito-indignado) y 21,5 (protesta-danny) · `040982` 62,5 (alarma-demands) y 63,5 (alarma-o).
- **Ref:** [935190 grito-floors](male_anims/935190_011.5s_grito-floors.jpg) · [935190 more-exclamacion](male_anims/935190_024.5s_more-exclamacion.jpg) · [648662 apartment-grito](male_anims/648662_012.5s_apartment-grito.jpg) · [909462 grito-indignado](male_anims/909462_008.5s_grito-indignado.jpg) · [909462 protesta-danny](male_anims/909462_021.5s_protesta-danny.jpg) · [040982 alarma-demands](male_anims/040982_062.5s_alarma-demands.jpg) · [040982 alarma-o](male_anims/040982_063.5s_alarma-o.jpg)
- **Animar:**
  - One-shot de 0,5–1 s con POP.
  - `head` empujada adelante 5–8 cm con squash & stretch (cuello +10 % de estiramiento) en 0,3 s.
  - `torso` hacia atrás 10° (o adelante 8° en protesta).
  - Cara: `BO-ABIERTA` con lengua, `OJ-ANCHO`, `CE-ARRIBA`.
  - Opcional: una mano oscila una vez (palma arriba).
  - Para alarma-o: cabeza hacia atrás con `BO-O`.
- **Prioridad:** **A**.

---

## 4. REACCIONES

#### REA-01 · Sobresalto (flinch) + hold de miedo
- **Apariciones:** `935190` 3,5 (susto-we) · `411222` 12,5 (sobresalto-giro) · `129430` 36,5 (sobresalto) y 37,5 (hold-miedo) · `909462` 6,5 (susto-manos-arriba).
- **Ref:** [935190 susto-we](male_anims/935190_003.5s_susto-we.jpg) · [411222 sobresalto-giro](male_anims/411222_012.5s_sobresalto-giro.jpg) · [129430 sobresalto](male_anims/129430_036.5s_sobresalto.jpg) · [129430 hold-miedo](male_anims/129430_037.5s_hold-miedo.jpg) · [909462 susto-manos-arriba](male_anims/909462_006.5s_susto-manos-arriba.jpg)
- **Animar:**
  - One-shot de 0,3 s más hold de 0,7–1 s.
  - `head` yaw 60–90° (snap hacia la fuente, 2 frames de anticipación contraria).
  - `pelvis` retrocede 5 cm y `torso` 8–10°.
  - Hombros +3 cm. Manos suben al pecho con palmas hacia fuera y dedos curvados (codo 90°). Overshoot de 10 %.
  - Durante el hold: temblor de manos ±2° a 8 Hz.
  - Cara: `OJ-ESCLERA` o `OJ-ANCHO`, `BO-RECT` o `BO-O` con lengua, `CE-ARRIBA`, `RU-1`.
- **Prioridad:** **A**.

#### REA-02 · Double-take / giro rápido de cabeza
- **Apariciones:** `648662` 38,5 (wait-giro-cabeza) · `806870` 57,5 (twice-pop).
- **Ref:** [648662 wait-giro-cabeza](male_anims/648662_038.5s_wait-giro-cabeza.jpg) · [806870 twice-pop](male_anims/806870_057.5s_twice-pop.jpg)
- **Animar:**
  - One-shot de 0,3–0,8 s.
  - Wait: `head` yaw 120° sobre el hombro en 0,3 s (EO). Se ve un ojo muy abierto. El cuerpo se detiene en seco con los pies clavados.
  - Twice-pop: `head` sube de golpe (pitch −15°). Objeto bajado a la altura de la cadera.
  - Cara: `OJ-ANCHO`, `BO-O` pequeña.
- **Prioridad:** **B**.

#### REA-03 · Shock congelado (cara de sorpresa/duda)
- **Apariciones:** `648662` 11,5 (shock-primer-plano) y 26,5 · `040982` 25,5 (shock-fold) y 53,5 (shock-for-you) · `411222` 25,5 (shock-danny) · `935190` 23,5 (ojos-enormes) · `806870` 11,5 (sorpresa-excusa), 34,5 (sorpresa-cup) y 44,5 (what-confundido) · `466198` 20,5 (wait-realization) y 22,5 (disbelief-question) · `129430` 18,5 (choque-confusion).
- **Ref:** [648662 shock-primer-plano](male_anims/648662_011.5s_shock-primer-plano.jpg) · [040982 shock-fold](male_anims/040982_025.5s_shock-fold.jpg) · [040982 shock-for-you](male_anims/040982_053.5s_shock-for-you.jpg) · [411222 shock-danny](male_anims/411222_025.5s_shock-danny.jpg) · [935190 ojos-enormes](male_anims/935190_023.5s_ojos-enormes.jpg) · [806870 sorpresa-excusa](male_anims/806870_011.5s_sorpresa-excusa.jpg) · [806870 sorpresa-cup](male_anims/806870_034.5s_sorpresa-cup.jpg) · [806870 what-confundido](male_anims/806870_044.5s_what-confundido.jpg) · [466198 wait-realization](male_anims/466198_020.5s_wait-realization.jpg) · [129430 choque-confusion](male_anims/129430_018.5s_choque-confusion.jpg)
- **Animar:**
  - Snap de 0,2–0,3 s y HOLD de 0,5–1,5 s. Salida con EIO de 0,3 s a idle.
  - `head` hacia atrás 5–8° (o adelante 3–5 cm en "cup!").
  - Cuello +5 % de estiramiento. El resto del cuerpo queda **congelado**, con micro-temblor de 1° a 6 Hz.
  - Cara: `OJ-ANCHO` (iris pequeño), `CE-ARRIBA`, `BO-O` pequeña roja, `RU-1`.
  - Variante "what confundido": `head` yaw 20° hacia ella en perfil.
  - Variante "incredulidad": `head` roll leve y boca más redonda.
- **Prioridad:** **A**.

#### REA-04 · Pánico final / "ojos en blanco" (remate de comedia)
- **Apariciones:** `935190` 76,5 (shock-final) · `466198` 67,5 (panic-realize).
- **Ref:** [935190 shock-final](male_anims/935190_076.5s_shock-final.jpg) · [466198 panic-realize](male_anims/466198_067.5s_panic-realize.jpg)
- **Animar:**
  - One-shot de 0,4 s y HOLD de 2 s.
  - `OJ-ESCLERA`, boca "o" profunda con lengua roja.
  - Brazos colgando laxos con manos flojas y temblor ±2° a 8 Hz.
  - `head` hacia atrás 8° y ladeada 10°, con shake corto (2 ciclos de ±4° en 0,4 s).
  - Si lleva objeto, cae de golpe (30 cm en 0,2 s).
- **Prioridad:** **A**.

#### REA-05 · Cara plana / mirada vacía (deadpan)
- **Apariciones:** `806870` 31,5 (mirada-vacia) · `129430` 34,5 (cara-plana) y 67,5 (cara-plana-final) · `466198` 39,5 (deadpan-doubt) · `648662` 20,5 (escepticismo-mirada-lateral).
- **Ref:** [806870 mirada-vacia](male_anims/806870_031.5s_mirada-vacia.jpg) · [129430 cara-plana](male_anims/129430_034.5s_cara-plana.jpg) · [129430 cara-plana-final](male_anims/129430_067.5s_cara-plana-final.jpg) · [466198 deadpan-doubt](male_anims/466198_039.5s_deadpan-doubt.jpg) · [648662 escepticismo-mirada-lateral](male_anims/648662_020.5s_escepticismo-mirada-lateral.jpg)
- **Animar:**
  - Pose casi estática de 1,5–2 s, sin parpadeo (como mucho uno a mitad).
  - Brazos abajo. `head` roll 5–8°. Sin sway.
  - `BO-ONDA` o línea diminuta, `OJ-N` fijos o `OJ-ENTORNADO`, `CE-ARRIBA` leve, `RU-1`.
  - Variante escéptica: pupilas desviadas ~20° a un lado, giro suave de cabeza hacia ese lado.
- **Prioridad:** **A**. Es el remate cómico por excelencia.

#### REA-06 · Risa
- **Apariciones:** `806870` 7,5 (risa-pancakes) y 19,5 (risita-nerviosa) · `466198` 27,5 (sheepish-laugh-scratch) y 33,5 (ready-grin).
- **Ref:** [806870 risa-pancakes](male_anims/806870_007.5s_risa-pancakes.jpg) · [806870 risita-nerviosa](male_anims/806870_019.5s_risita-nerviosa.jpg) · [466198 sheepish-laugh-scratch](male_anims/466198_027.5s_sheepish-laugh-scratch.jpg) · [466198 ready-grin](male_anims/466198_033.5s_ready-grin.jpg)
- **Animar:**
  - One-shot de 1–1,5 s.
  - Hombros suben y bajan ±1,5 cm a 4–5 Hz. `head` rebota 1–2 veces (pitch ±6°) y con roll 5–10°.
  - `torso` se dobla hacia atrás 5–8°.
  - Cara: `OJ-ARCO`, `BO-RISA`, `RU-2`.
  - Variante nerviosa: más corta y con la cabeza ladeada (se combina con NRV-01).
  - Variante "ready": cabeza con bob hacia adelante y brazo con objeto que se eleva.
- **Prioridad:** **A**.

#### REA-07 · Indignación / protesta ofendida
- **Apariciones:** `411222` 57,5 (indignacion) y 27,5 (giro-ofendido) · `466198` 53,5 (router-protest).
- **Ref:** [411222 indignacion](male_anims/411222_057.5s_indignacion.jpg) · [411222 giro-ofendido](male_anims/411222_027.5s_giro-ofendido.jpg) · [466198 router-protest](male_anims/466198_053.5s_router-protest.jpg)
- **Animar:**
  - One-shot de ~1 s.
  - `torso` yaw 20–30° hacia ella, `head` adelante 4 cm.
  - Palma hacia arriba al frente (antebrazo supinado, codo 90°, a ~20 cm del cuerpo).
  - Cara: `CE-BAJAS` (ofendido) o "?!" con `OJ-ANCHO`, `BO-ABIERTA` con lengua, `RU-2`.
  - Variante giro-ofendido: cabeza a perfil, mirada lateral y boca pequeña con puntitos.
- **Prioridad:** **A**.

#### REA-08 · Derrota cómica / resignación
- **Apariciones:** `466198` 54,5 (pout-resign) · `909462` 52,5 (derrota-comica) · `648662` 78,5 (autoironia-impression) y 80,5 (ante-puerta-4d-derrota).
- **Ref:** [466198 pout-resign](male_anims/466198_054.5s_pout-resign.jpg) · [909462 derrota-comica](male_anims/909462_052.5s_derrota-comica.jpg) · [648662 autoironia-impression](male_anims/648662_078.5s_autoironia-impression.jpg) · [648662 ante-puerta-4d-derrota](male_anims/648662_080.5s_ante-puerta-4d-derrota.jpg)
- **Animar:**
  - One-shot de 0,5 s (caída) y HOLD de 1 s.
  - `head` pitch +10–12°, hombros −2–3 cm, `torso` encorvado 5°. Rebote final de 1 cm.
  - Cara: `BO-ONDA` o `BO-ABIERTA` ancha (entre risa y queja), `OJ-LADO`, `RU-1/2`.
  - Variante frente a la puerta: una mano a la frente o al pomo, con rebote de 2 cm.
- **Prioridad:** **B**.

#### REA-09 · Disculpa
- **Apariciones:** `648662` 35,5 (disculpa-perfil) · `935190` 64,5 (disculpa-perfil).
- **Ref:** [648662 disculpa-perfil](male_anims/648662_035.5s_disculpa-perfil.jpg) · [935190 disculpa-perfil](male_anims/935190_064.5s_disculpa-perfil.jpg)
- **Animar:**
  - One-shot de 1,5 s.
  - Perfil. `head` pitch +12° y boca abierta de lado. `CE-V` (ceja preocupada).
  - `torso` gira 20–30° hacia la salida. Mano cerca de la cadera.
- **Prioridad:** **B**.

#### REA-10 · Euforia con brazos abiertos
- **Apariciones:** `129430` 54,5 (euforia-brazos) y 55,5 (mantener-euforia).
- **Ref:** [129430 euforia-brazos](male_anims/129430_054.5s_euforia-brazos.jpg) · [129430 mantener-euforia](male_anims/129430_055.5s_mantener-euforia.jpg)
- **Animar:**
  - Entrada de 0,4 s (POP) y HOLD de 1,5 s.
  - Brazos con abducción 60–70° y antebrazos hacia fuera, palmas arriba. `torso` erguido +3°.
  - Dos rebotes verticales de 2–3 cm en 0,5 s. Luego `head` con vaivén ±4°.
  - Cara: `OJ-ANCHO`, `BO-ABIERTA` grande con lengua.
- **Prioridad:** **B**.

#### REA-11 · Sorpresa feliz con ojos cerrados
- **Apariciones:** `648662` 72,5 (reaccion-ojos-cerrados).
- **Ref:** [648662 reaccion-ojos-cerrados](male_anims/648662_072.5s_reaccion-ojos-cerrados.jpg)
- **Animar:** cutaway de 1 s. `head` pitch −8° (elevada), `OJ-ARCO`, boca abierta. `RU-1`.
- **Prioridad:** **C**.

#### REA-12 · Asentir / aprobar / aceptar
- **Apariciones:** `040982` 36,5 (aprueba-boca-abierta) · `806870` 53,5 (thats-fair), 58,5 (comprension-serena) y 40,5 (sweet-tooth, con leve asentimiento) · `129430` 44,5 (strategically).
- **Ref:** [040982 aprueba-boca-abierta](male_anims/040982_036.5s_aprueba-boca-abierta.jpg) · [806870 thats-fair](male_anims/806870_053.5s_thats-fair.jpg) · [806870 comprension-serena](male_anims/806870_058.5s_comprension-serena.jpg) · [806870 sweet-tooth](male_anims/806870_040.5s_sweet-tooth.jpg) · [129430 strategically](male_anims/129430_044.5s_strategically.jpg)
- **Animar:**
  - Lento (serena): `head` pitch +8–10° en 0,5 s (EIO) y vuelta en 0,5 s, con `OJ-CERRADO`.
  - Enfático (aprueba): asentimiento corto, 2 × 4° en 0,4 s, con boca abierta.
  - "That's fair": labios en "o", encogimiento de hombros ±1,5 cm y asentimiento.
  - "Strategically": boca abierta orgullosa y `CE-ARRIBA`, luego sonrisa de satisfacción con `OJ-ENTORNADO` y pecho +3 cm.
- **Prioridad:** **A**.

#### REA-13 · "Oh" de revelación y giro final
- **Apariciones:** `129430` 60,5 (pregunta-on-air), 64,5 (oh-lengua) y 65,5 (giro-final).
- **Ref:** [129430 pregunta-on-air](male_anims/129430_060.5s_pregunta-on-air.jpg) · [129430 oh-lengua](male_anims/129430_064.5s_oh-lengua.jpg) · [129430 giro-final](male_anims/129430_065.5s_giro-final.jpg)
- **Animar:**
  - Pregunta: `head` yaw 30–40° hacia el interior, `OJ-ANCHO`, boca "ah", brazos separados 15–20°.
  - "Oh": boca pequeña con lengua y ojos amplios.
  - Giro final: `head` yaw 20° hacia su izquierda con sonrisa incómoda.
  - Cada una es un one-shot de ~1 s.
- **Prioridad:** **C**.

---

## 5. COQUETEO Y ROMANCE

#### ROM-01 · Ojos de corazón y emoción
- **Apariciones:** `806870` 61,5 (ojos-de-corazon), 62,5 (emocion-pancakes) y 63,5 (sonrisa-feliz).
- **Ref:** [806870 ojos-de-corazon](male_anims/806870_061.5s_ojos-de-corazon.jpg) · [806870 emocion-pancakes](male_anims/806870_062.5s_emocion-pancakes.jpg) · [806870 sonrisa-feliz](male_anims/806870_063.5s_sonrisa-feliz.jpg)
- **Animar:**
  - Tres tiempos, ~3,5 s en total.
  - 1) Corazones: el sprite `OJ-CORAZON` entra con pop de escala 0→1,2→1 en 0,2 s. `RU-2`, boca cerrada pequeña, HOLD de 1 s.
  - 2) Emoción: `torso` se inclina adelante 10–15°. Boca abierta grande, `head` rebota ±5° 3 veces (0,3 s cada una).
  - 3) Cierre: sonrisa cerrada con corazones, HOLD de 1 s antes de girarse para salir (→ WLK-04).
- **Prioridad:** **A**. Es el "clímax" romántico de la serie.

#### ROM-02 · Sonrojo y mirada evasiva
- **Apariciones:** `806870` 17,5 (mirada-evasiva) · `648662` 18,5 (sonrojo-nervioso), 39,5 (sonrojo-primer-plano) y 62,5 (was-i-esperanzado) · `935190` 16,5 (mirar-de-lado) · `411222` 26,5 (verguenza-halagada) y 52,5 (frontal-avergonzado) · `909462` 20,5 (mirada-timida-arriba) · `040982` 18,5 (mira-de-lado-sonrojado) y 26,5 (sonrisa-timida).
- **Ref:** [806870 mirada-evasiva](male_anims/806870_017.5s_mirada-evasiva.jpg) · [648662 sonrojo-nervioso](male_anims/648662_018.5s_sonrojo-nervioso.jpg) · [648662 sonrojo-primer-plano](male_anims/648662_039.5s_sonrojo-primer-plano.jpg) · [648662 was-i-esperanzado](male_anims/648662_062.5s_was-i-esperanzado.jpg) · [935190 mirar-de-lado](male_anims/935190_016.5s_mirar-de-lado.jpg) · [411222 verguenza-halagada](male_anims/411222_026.5s_verguenza-halagada.jpg) · [411222 frontal-avergonzado](male_anims/411222_052.5s_frontal-avergonzado.jpg) · [909462 mirada-timida-arriba](male_anims/909462_020.5s_mirada-timida-arriba.jpg) · [040982 mira-de-lado-sonrojado](male_anims/040982_018.5s_mira-de-lado-sonrojado.jpg) · [040982 sonrisa-timida](male_anims/040982_026.5s_sonrisa-timida.jpg)
- **Animar:**
  - HOLD de 1–2 s.
  - `RU-2` con fade-in de 0,2 s. Pupilas a 20–30° (abajo o de lado).
  - `head` pitch +8–10° y roll 10°. Hombros cerrados hacia dentro.
  - Boca `BO-W` o línea corta.
  - Micro-rebote de 1 cm. Tras ~1 s los ojos suben bajo el flequillo y vuelven a ella.
  - Variante "esperanzado" (was-i): ojos al frente, boca abierta, rebote de cabeza ±2°.
- **Prioridad:** **A**.

#### ROM-03 · Mirada pícara / burlona
- **Apariciones:** `806870` 39,5 (mirada-picara) y 40,5 (sweet-tooth) · `040982` 30,5 (mirada-baja-burlona) y 20,5 (sonrisa-satisfecha).
- **Ref:** [806870 mirada-picara](male_anims/806870_039.5s_mirada-picara.jpg) · [806870 sweet-tooth](male_anims/806870_040.5s_sweet-tooth.jpg) · [040982 mirada-baja-burlona](male_anims/040982_030.5s_mirada-baja-burlona.jpg) · [040982 sonrisa-satisfecha](male_anims/040982_020.5s_sonrisa-satisfecha.jpg)
- **Animar:**
  - HOLD de 1 s.
  - `head` roll 8–10° con yaw 10° hacia la derecha, `OJ-ENTORNADO`, cejas inclinadas hacia abajo, `RU-1`.
  - Sonrisa en "w", o boca abierta alegre con asentimiento de 4° ("sweet tooth").
  - Burlona: `head` pitch +8° mirando hacia abajo a ella.
- **Prioridad:** **A**. Es la coquetería activa del pretendiente.

#### ROM-04 · Asomarse con cara de cachorro + puchero
- **Apariciones:** `411222` 31,5 (puppy-asomado) y 32,5 (puchero-please).
- **Ref:** [411222 puppy-asomado](male_anims/411222_031.5s_puppy-asomado.jpg) · [411222 puchero-please](male_anims/411222_032.5s_puchero-please.jpg)
- **Animar:**
  - One-shot de entrada (0,4 s, EO) y HOLD de 1–1,5 s.
  - `head` asoma 15–20 cm lateral desde el borde del marco, con roll 10–15°.
  - Cuerpo oculto. Manos colgando.
  - Cara: sonrisa suave con rubor y luego puchero (labios fruncidos hacia abajo, ojos grandes mirándola, roll 10°, ~1 s).
- **Prioridad:** **A**. Funciona para "pedir algo" con encanto.

#### ROM-05 · Sonrisa tranquila / cierre feliz
- **Apariciones:** `909462` 35,5 (sonrisa-tranquila-puerta) · `806870` 22,5 (bajar-mano) · `648662` 66,5 (umbral-con-lampara) · `411222` 69,5 (day-one-sonrisa) · `129430` 13,5 (cierre-sonriente) · `935190` 29,5 (tu-primero).
- **Ref:** [909462 sonrisa-tranquila-puerta](male_anims/909462_035.5s_sonrisa-tranquila-puerta.jpg) · [806870 bajar-mano](male_anims/806870_022.5s_bajar-mano.jpg) · [648662 umbral-con-lampara](male_anims/648662_066.5s_umbral-con-lampara.jpg) · [411222 day-one-sonrisa](male_anims/411222_069.5s_day-one-sonrisa.jpg) · [129430 cierre-sonriente](male_anims/129430_013.5s_cierre-sonriente.jpg) · [935190 tu-primero](male_anims/935190_029.5s_tu-primero.jpg)
- **Animar:**
  - Loop de 2 s (o hold).
  - Sonrisa cerrada, `OJ-ENTORNADO` ("ojos dulces"), `RU-1`, `head` roll 5–10°.
  - Contrapposto: peso en una pierna, cadera ±3°, respiración suave.
  - Opcional: mirada a cámara en 3/4. En "tu primero", hold de 2 s.
- **Prioridad:** **A**.

#### ROM-06 · Mirada fija hacia ella (gaze lock)
- **Apariciones:** `129430` 48,5 (mirada-hacia-ella) · `935190` 71,5 (mirar-a-ella-dia).
- **Ref:** [129430 mirada-hacia-ella](male_anims/129430_048.5s_mirada-hacia-ella.jpg) · [935190 mirar-a-ella-dia](male_anims/935190_071.5s_mirar-a-ella-dia.jpg)
- **Animar:**
  - `head` yaw 25° hacia ella (EIO de 0,4 s), pitch −10° (ella es más alta).
  - Boca cerrada, cuerpo relajado con brazos caídos. HOLD de 2 s casi quieto.
- **Prioridad:** **A**.

---

## 6. NERVIOS Y TICS

#### NRV-01 · Rascarse la nuca / tocarse la cara
- **Apariciones:** `806870` 20,5 (rascarse-nuca) y 22,5 (bajar-mano) · `466198` 27,5 (sheepish-laugh-scratch) · `648662` 44,5 (rascar-cabeza-timido), 36,5 (gesto-nervioso-mano-cara) y 80,5 (mano a la cabeza).
- **Ref:** [806870 rascarse-nuca](male_anims/806870_020.5s_rascarse-nuca.jpg) · [806870 bajar-mano](male_anims/806870_022.5s_bajar-mano.jpg) · [648662 rascar-cabeza-timido](male_anims/648662_044.5s_rascar-cabeza-timido.jpg) · [648662 gesto-nervioso-mano-cara](male_anims/648662_036.5s_gesto-nervioso-mano-cara.jpg) · [466198 sheepish-laugh-scratch](male_anims/466198_027.5s_sheepish-laugh-scratch.jpg)
- **Animar:**
  - Subida de la mano a la nuca en 0,4 s (EO). `upperarm` abducción 80–90°, `forearm` flexión 120–140°.
  - HOLD de 1,5–2 s con frote ±2 cm a ~3 Hz.
  - La otra mano cuelga abierta. `torso` se mece lateralmente (roll ±3°, ciclo 1,5 s) y mira a ella.
  - Bajada en 0,5 s hasta el hombro y luego relaja el cuerpo con media sonrisa.
  - Variante "mano a la cara/cuello" (648662): mano a la mejilla o al cuello, hombros encogidos 2 cm.
  - Cara: sonrisa nerviosa, `RU-1/2`.
- **Prioridad:** **A**. Es el tic más reconocible del personaje.

#### NRV-02 · Saludo/"no, no" nervioso con nuca
- **Apariciones:** `806870` 29,5 (verguenza-saludo).
- **Ref:** [806870 verguenza-saludo](male_anims/806870_029.5s_verguenza-saludo.jpg)
- **Animar:**
  - One-shot de 1,5 s.
  - Mano derecha a la nuca (como NRV-01). La izquierda sube junto a la cabeza (codo 90°) y oscila ±20° (roll de antebrazo), 2 ciclos en 0,8 s.
  - `CE-V`, boca abierta, `RU-2`.
- **Prioridad:** **B**.

#### NRV-03 · Abanicarse el cuello
- **Apariciones:** `935190` 39,5 (abanicarse).
- **Ref:** [935190 abanicarse](male_anims/935190_039.5s_abanicarse.jpg)
- **Animar:**
  - Loop de 2 s.
  - Ambas manos pellizcan las solapas/cuello. Tiran 4–5 cm hacia fuera y sueltan 3–4 veces (ciclo ~0,3 s).
  - Cara: boca abierta con lengua, `RU-2`. Sudor opcional.
  - Adaptación: tirar del cuello de la camisa.
- **Prioridad:** **B**.

#### NRV-04 · Balbuceo, excusa nerviosa y sonrisa forzada
- **Apariciones:** `129430` 31,5 (balbuceo-nervioso), 33,5 (ojos-cerrados-vergüenza) y 51,5 (sonrisa-tensa) · `466198` 68,5 (nervous-excuse) y 69,5 (forced-smile) · `040982` 27,5 (boca-ondulada-nervioso) · `411222` 61,5 (excusa-friend).
- **Ref:** [129430 balbuceo-nervioso](male_anims/129430_031.5s_balbuceo-nervioso.jpg) · [129430 ojos-cerrados-vergüenza](male_anims/129430_033.5s_ojos-cerrados-verg-enza.jpg) · [129430 sonrisa-tensa](male_anims/129430_051.5s_sonrisa-tensa.jpg) · [466198 forced-smile](male_anims/466198_069.5s_forced-smile.jpg) · [040982 boca-ondulada-nervioso](male_anims/040982_027.5s_boca-ondulada-nervioso.jpg) · [411222 excusa-friend](male_anims/411222_061.5s_excusa-friend.jpg)
- **Animar:**
  - One-shot de 1–1,5 s.
  - Lipflap rápido (8–10 Hz). Las pupilas alternan entre ella y el lado opuesto cada ~0,5 s.
  - `head` roll 5–10° y balanceo ±5°. Cejas elevadas. Hombros se encogen 2 cm.
  - Variante vergüenza: `OJ-CERRADO` con la cara arrugada y la cabeza ladeada.
  - Variante forzada: sonrisa tensa, `BO-W` ancha, `RU-1`, ojos alternando entre cámara y objeto.
  - Variante "boca ondulada": `BO-ONDA`, ojos esquivos.
- **Prioridad:** **A**.

---

## 7. SENTARSE

#### SIT-01 · Sentado rígido (cuando ella se le acerca)
- **Apariciones:** `909462` 50,5 (sentado-rigido-sofa).
- **Ref:** [909462 sentado-rigido-sofa](male_anims/909462_050.5s_sentado-rigido-sofa.jpg)
- **Animar:**
  - Loop de 4 s.
  - Torso recto. Manos planas sobre los muslos (`upperarm` 10°, codo 90°).
  - Cabeza al frente, `OJ-N` abiertos, `RU-2`.
  - Solo respira (`chest` ±1°). Si ella apoya la cabeza en su hombro, ese hombro queda elevado +1 cm y quieto.
- **Prioridad:** **A**. Equivale a sentarse en la barra o en una mesa de la cafetería.

#### SIT-02 · Sentarse / levantarse (POR CREAR, sin referencia en los 8 videos)
- **Apariciones:** ninguna. En los 8 videos el personaje solo está de pie o ya sentado (SIT-01).
- **Ref:** [909462 sentado-rigido-sofa](male_anims/909462_050.5s_sentado-rigido-sofa.jpg) (pose de llegada, aprox.)
- **Animar (propuesta):**
  - Sentarse (1 s, EIO): la `pelvis` baja ~45 cm con `spine` pitch +10° al descender. Manos van a los muslos y la cabeza mira a ella.
  - Levantarse: la inversa, con una anticipación de 3° hacia atrás.
  - Añadir un rebote mínimo (1 cm) al asentarse.
- **Prioridad:** **A**. Para un formato de cafetería es una transición esencial.

#### SIT-03 · Sentado hablando (derivar de TLK-01/ROM-02)
- **Apariciones:** ninguna directa. Es una derivación.
- **Ref:** [909462 sentado-rigido-sofa](male_anims/909462_050.5s_sentado-rigido-sofa.jpg) (pose base, aprox.)
- **Animar (propuesta):**
  - Cabeza y cara se reutilizan de TLK-01/ROM-02.
  - `torso` se inclina 8° hacia ella sobre la mesa o barra. Antebrazos apoyados.
  - Respiración del idle sentado.
- **Prioridad:** **B**.

---

## 8. INTERACCIÓN CON OBJETOS

#### OBJ-01 · Idle con caja contra el torso (umbral / pausa)
- **Apariciones:** `909462` 1,5 (idle-umbral-sonrisa) · `648662` 4,5 (pausa en el umbral, sin fotograma propio).
- **Ref:** [909462 idle-umbral-sonrisa](male_anims/909462_001.5s_idle-umbral-sonrisa.jpg) · [648662 entrada-feliz-ojos-cerrados](male_anims/648662_005.5s_entrada-feliz-ojos-cerrados.jpg) (aprox.)
- **Animar:**
  - Loop de 3 s, con one-shot de entrada de ~1 s (rebote de rodillas 2 cm).
  - Caja contra el torso con ambos antebrazos (IK).
  - Cabeza ladeada 5–10°, sonrisa de ojos cerrados, sway respiratorio ±1°.
- **Prioridad:** **B**.

#### OBJ-02 · Recibir / sostener / llevar caja en una mano
- **Apariciones:** `411222` 63,5 (sostener-caja), 65,5 (recibir-caja), 68,5 (volverse-a-su-puerta) y 69,5 (day-one-sonrisa).
- **Ref:** [411222 sostener-caja](male_anims/411222_063.5s_sostener-caja.jpg) · [411222 recibir-caja](male_anims/411222_065.5s_recibir-caja.jpg) · [411222 volverse-a-su-puerta](male_anims/411222_068.5s_volverse-a-su-puerta.jpg) · [411222 day-one-sonrisa](male_anims/411222_069.5s_day-one-sonrisa.jpg)
- **Animar:**
  - Recibir: brazo derecho extendido horizontal a la altura de la cintura. La mano agarra el lateral del objeto (cierre de dedos 0,2 s). Queda quieto mientras ella habla.
  - Llevar: objeto contra el pecho con ambas manos y mano libre al pomo.
  - Pose final: 3/4 con el objeto a la altura del pecho, mirada a cámara, sonrisa suave y contrapposto (HOLD ~2 s).
- **Prioridad:** **B**.

#### OBJ-03 · Dejar la caja sobre una pila
- **Apariciones:** `648662` 6,5 (caja-sobre-pila-glitch).
- **Ref:** [648662 caja-sobre-pila-glitch](male_anims/648662_006.5s_caja-sobre-pila-glitch.jpg)
- **Animar:**
  - One-shot de 1 s.
  - Los brazos bajan la carga y la apoyan. Luego quedan abiertos sobre ella (abducción 40°).
  - Cara: sonrisa satisfecha con `OJ-ARCO`.
- **Prioridad:** **C**.

#### OBJ-04 · Sostener tarro / taza con ambas manos
- **Apariciones:** `806870` 48,5 (sostener-tarro), 53,5 (thats-fair, tarro en la mano derecha), 57,5 (twice-pop, tarro a la cadera) y 64,5 (salida con tarro).
- **Ref:** [806870 sostener-tarro](male_anims/806870_048.5s_sostener-tarro.jpg) · [806870 thats-fair](male_anims/806870_053.5s_thats-fair.jpg) · [806870 twice-pop](male_anims/806870_057.5s_twice-pop.jpg)
- **Animar:**
  - Loop de 3 s.
  - Ambas manos a la altura del pecho, codos 90–100° y antebrazos separados ~20 cm.
  - Casi quieto, con asentimientos de 3° cada ~1,5 s mientras escucha.
  - Variante "una mano": objeto en la derecha a la altura de la cadera, brazo izquierdo suelto.
- **Prioridad:** **A**. Es la animación base para recibir una taza o un pedido de la camarera.

#### OBJ-05 · Teléfono en alto (buscar señal)
- **Apariciones:** `466198` 0,5 (search-arm-up), 4,5, 6,5 y 11,5 (el brazo sigue en alto).
- **Ref:** [466198 search-arm-up](male_anims/466198_000.5s_search-arm-up.jpg) · [466198 open-mouth-explain](male_anims/466198_006.5s_open-mouth-explain.jpg)
- **Animar:**
  - Hold largo (hasta ~14 s, fragmentable).
  - Brazo derecho recto con flexión de hombro 160–170° y mano abierta con el objeto.
  - Micro-temblor ±1 cm a ~2 Hz. `torso` inclinado hacia atrás 5–8°. `head` pitch −20° (mira arriba).
  - Brazo izquierdo colgando. Se puede hablar encima (TLK-01).
- **Prioridad:** **C**. El pose de "brazo en alto" es reutilizable para llamar al camarero.

#### OBJ-06 · Bajar el teléfono y mirarlo / idle final con teléfono
- **Apariciones:** `466198` 14,5 (lower-phone-check) y 70,5 (end-idle-hallway).
- **Ref:** [466198 lower-phone-check](male_anims/466198_014.5s_lower-phone-check.jpg) · [466198 end-idle-hallway](male_anims/466198_070.5s_end-idle-hallway.jpg)
- **Animar:**
  - Bajada de 0,6 s (EIO): el brazo pasa de ~165° a ~60° de flexión y la mano queda frente al pecho con la pantalla hacia la cara. `head` pitch +15°.
  - Idle final: de perfil, objeto en alto del pecho, mirándolo. HOLD hasta el fundido (sin caminar).
- **Prioridad:** **C**.

#### OBJ-07 · Teclear / recitar mientras habla
- **Apariciones:** `466198` 45,5 (type-profile), 46,5 (speak-while-typing), 48,5 (recite-emphasis), 54,5 y 57,5 (type-exclamation).
- **Ref:** [466198 speak-while-typing](male_anims/466198_046.5s_speak-while-typing.jpg) · [466198 type-exclamation](male_anims/466198_057.5s_type-exclamation.jpg)
- **Animar:**
  - Loop con sincronía sílaba–toque.
  - De perfil, antebrazo derecho doblado 90° con el objeto a la altura del pecho. El dedo de la mano libre toca 2–3 cm a ~3 Hz.
  - `head` cabecea 2° con cada toque. Ojos abajo, de reojo a ella cuando habla.
  - Toque final con una sola pulsación y sonrisa de `OJ-ARCO`.
- **Prioridad:** **C**.

#### OBJ-08 · Tomar y entregar un objeto (lámpara)
- **Apariciones:** `648662` 43,5 (tomar-lampara), 64,5 (entrega-lampara-manos) y 66,5 (umbral-con-lampara).
- **Ref:** [648662 tomar-lampara](male_anims/648662_043.5s_tomar-lampara.jpg) · [648662 entrega-lampara-manos](male_anims/648662_064.5s_entrega-lampara-manos.jpg) · [648662 umbral-con-lampara](male_anims/648662_066.5s_umbral-con-lampara.jpg)
- **Animar:**
  - Tomar: brazo derecho extendido hacia el objeto en 0,5 s (EO), cierre de dedos en 0,2 s.
  - Entrega: su mano sujeta por arriba y la de él por abajo. Se mantiene 1 s con intercambio de miradas (`RU-1`).
  - Después lo lleva a la altura del muslo con el brazo izquierdo colgando y balanceo suave.
- **Prioridad:** **B**. Adaptable a recibir la taza, la cuenta o una flor.

#### OBJ-09 · Sostener, desplegar y doblar una prenda
- **Apariciones:** `040982` 3,5 (sostiene-prenda-no), 5,5 (brazo-cruza-camara), 12,5 (sostiene-prenda-colgante) y 37,5 (pliega-gran-plano) · `909462` 25,5 (doblar-tela-lavanderia).
- **Ref:** [040982 sostiene-prenda-no](male_anims/040982_003.5s_sostiene-prenda-no.jpg) · [040982 brazo-cruza-camara](male_anims/040982_005.5s_brazo-cruza-camara.jpg) · [040982 sostiene-prenda-colgante](male_anims/040982_012.5s_sostiene-prenda-colgante.jpg) · [040982 pliega-gran-plano](male_anims/040982_037.5s_pliega-gran-plano.jpg) · [909462 doblar-tela-lavanderia](male_anims/909462_025.5s_doblar-tela-lavanderia.jpg)
- **Animar:**
  - Sostener: ambas manos a la altura del pecho, brazos extendidos, codos ~100°, cabeza hacia abajo-izquierda 15°.
  - Mostrar: el antebrazo cruza cámara de derecha a izquierda en 0,4 s mientras gira la prenda.
  - Colgante: una mano en alto con la prenda colgando y la cabeza girada hacia ella (idle de ~3 s).
  - Doblar: ciclo de 2 s alisando sobre la mesa, con `torso` inclinado 10°.
- **Prioridad:** **C**. Adaptable a doblar una servilleta o un delantal.

#### OBJ-10 · Golpear botonera / pulsar
- **Apariciones:** `935190` 5,5 (aporrear-botones).
- **Ref:** [935190 aporrear-botones](male_anims/935190_005.5s_aporrear-botones.jpg)
- **Animar:**
  - Loop de 2 s.
  - Brazo derecho en primer plano. Índice y medio tocan 3–4 veces por segundo, con micro-temblor del hombro ±1 cm.
  - La cara queda fuera de cuadro.
  - Adaptación: golpear la campanilla del mostrador.
- **Prioridad:** **C**.

#### OBJ-11 · Mano sobre el delantal (barista fastidiado)
- **Apariciones:** `909462` 27,5 (barista-fastidiado).
- **Ref:** [909462 barista-fastidiado](male_anims/909462_027.5s_barista-fastidiado.jpg)
- **Animar:**
  - Idle de ~2 s.
  - Mano derecha sobre el abdomen rozando la tela.
  - `OJ-ENTORNADO`, `RU-2`, mirada de lado y boca en línea corta.
- **Prioridad:** **C**.

---

## 9. CON LA MUJER (animaciones de relación/espacio)

#### FEM-01 · Reclamar con la mano extendida
- **Apariciones:** `411222` 18,5 (mano-reclama).
- **Ref:** [411222 mano-reclama](male_anims/411222_018.5s_mano-reclama.jpg)
- **Animar:**
  - One-shot de 0,5 s (EO), con HOLD breve.
  - Brazo con flexión de hombro 70–80°, mano abierta con dedos separados, hacia el objeto que ella sostiene.
  - Boca abierta ("That's mine"). `head` girada hacia ella.
- **Prioridad:** **B**.

#### FEM-02 · Saltar / estirarse por un objeto que ella levanta
- **Apariciones:** `411222` 39,5 (salto-alcanzar-caja) y 41,5 (alcance-fallido).
- **Ref:** [411222 salto-alcanzar-caja](male_anims/411222_039.5s_salto-alcanzar-caja.jpg) · [411222 alcance-fallido](male_anims/411222_041.5s_alcance-fallido.jpg)
- **Animar:**
  - Salto: brazo derecho estirado hacia arriba (~170°), de puntillas (talón +8 cm, `pelvis` +6 cm). Cuerpo en 3/4 a cámara. Repetir 2–3 veces (0,5 s cada uno). Sonrisa de esfuerzo.
  - Fallido: mantiene el brazo arriba con la mueca y luego ladea la cabeza.
- **Prioridad:** **B**.

#### FEM-03 · Esconderse / pegarse tras ella
- **Apariciones:** `129430` 40,5 (asomarse-tras-ella) y 41,5 (de-pie-detras).
- **Ref:** [129430 asomarse-tras-ella](male_anims/129430_040.5s_asomarse-tras-ella.jpg) · [129430 de-pie-detras](male_anims/129430_041.5s_de-pie-detras.jpg)
- **Animar:**
  - One-shot de 0,6 s y luego idle rígido (IDL-04).
  - Se pega a su espalda a 10–15 cm. `torso` inclinado 8–10° y hombros +3 cm.
  - Sostiene el objeto (vela) con una mano. Boca entreabierta, mirada sobre su hombro.
- **Prioridad:** **B**.

---

## 10. OTROS

#### OTR-01 · Giro de cuerpo de 180° (volverse y alejarse)
- **Apariciones:** `411222` 68,5 (volverse-a-su-puerta) · `648662` 67,5 (alejarse-con-lampara).
- **Ref:** [411222 volverse-a-su-puerta](male_anims/411222_068.5s_volverse-a-su-puerta.jpg) · [648662 alejarse-con-lampara](male_anims/648662_067.5s_alejarse-con-lampara.jpg)
- **Animar:**
  - One-shot de 0,6–0,8 s (EIO).
  - La cabeza se adelanta 0,15 s. Giro con 3 pasos pivote pequeños.
  - Objeto contra el pecho. La otra mano va al pomo o queda libre.
- **Prioridad:** **A**.

#### OTR-02 · Pose final congelada ante la puerta (cierre)
- **Apariciones:** `466198` 70,5 (end-idle-hallway) y 71,5 (lights-out) · `648662` 80,5 (ante-puerta-4d-derrota) · `411222` 69,5 (day-one-sonrisa).
- **Ref:** [466198 end-idle-hallway](male_anims/466198_070.5s_end-idle-hallway.jpg) · [648662 ante-puerta-4d-derrota](male_anims/648662_080.5s_ante-puerta-4d-derrota.jpg) · [411222 day-one-sonrisa](male_anims/411222_069.5s_day-one-sonrisa.jpg)
- **Animar:**
  - HOLD de 1–2 s con respiración mínima (±0,5°) antes del fundido a negro.
  - No camina. Mira al objeto o a cámara.
  - Cara según el remate: sonrisa suave, `BO-ONDA` o derrota (REA-08).
- **Prioridad:** **B**.

---

## 11. KIT MÍNIMO (orden de producción)

**Fase 1: base para el primer episodio con la camarera (11 animaciones)**
1. **IDL-01** Idle base de pie.
2. **IDL-06** Idle tímido de rostro.
3. **IDL-02** Idle de escucha.
4. **WLK-05** Entrar / pasar el umbral.
5. **TLK-01** Hablar frontal base (lipflap).
6. **TLK-03** Pregunta con ladeo (pedir).
7. **REA-03** Shock congelado.
8. **REA-06** Risa.
9. **ROM-02** Sonrojo y mirada evasiva.
10. **NRV-01** Rascarse la nuca.
11. **WLK-04** Salida feliz.

**Fase 2: personalidad y remates (10 animaciones)**
12. **ROM-01** Ojos de corazón y emoción.
13. **ROM-05** Sonrisa tranquila / cierre feliz.
14. **ROM-03** Mirada pícara / burlona.
15. **OBJ-04** Sostener taza/tarro con dos manos.
16. **SIT-01** Sentado rígido.
17. **SIT-02** Sentarse / levantarse (por crear).
18. **REA-01** Sobresalto + hold de miedo.
19. **REA-05** Cara plana (deadpan).
20. **TLK-12** Exclamación enfática.
21. **NRV-04** Balbuceo y sonrisa forzada.

**Fase 3: variedad (resto de A y los B más útiles)**
22. **WLK-01** Caminar lento de espaldas.
23. **TLK-07** Negar con la palma.
24. **TLK-11** Confesión tímida.
25. **REA-04** Pánico final con ojos en blanco.
26. **REA-07** Indignación.
27. **REA-12** Asentir / aprobar.
28. **ROM-04** Asomarse con cara de cachorro + puchero.
29. **ROM-06** Mirada fija hacia ella.
30. **OTR-01** Giro de 180°.

El resto (**B** y **C**) se hace bajo demanda. Casi todos se construyen recombinando las piezas de arriba: cabeza y cara de TLK-01 más brazos de TLK-04/05, o la pose de objeto de OBJ-04 más una reacción de REA.
