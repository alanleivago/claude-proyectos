# ANIMS_MUJER.md: catálogo de animaciones de la protagonista femenina (8 videos de @missmedannypsx)

> **Nota de método.** Las descripciones salen de los análisis por video (frames a 1 fps, transcripción y JSON de animaciones). No he abierto los `.jpg`, así que antes de animar conviene mirar el fotograma enlazado.
> - **t** es el del nombre del archivo, que coincide con el JSON. En algunos videos el texto del análisis difiere en ±1 s.
> - Lo marcado como **PROPUESTA** no aparece en los 8 videos. Se deriva de los precedentes más cercanos y no lleva enlace inventado.

---

## 0. Leyenda

### IDs cortos (últimos 6 dígitos del ID de TikTok, igual que en los archivos)

| id | video | tema | dur. |
|---|---|---|---|
| 806870 | 7705812724365806870 | "One cup of sugar" (sin Ep.) | 66 s |
| 935190 | 7706199662880935190 | Ep 4 "Something True" (ascensor) | 83 s |
| 466198 | 7707302378944466198 | Gerald / contraseña wifi | 71 s |
| 411222 | 7705212283139411222 | Ep 2 "Special Delivery" | 73 s |
| 648662 | 7705212103157648662 | Ep 1 "Wrong Door" | 82 s |
| 129430 | 7708414498654129430 | Ep 7 "Blackout" | 68 s |
| 040982 | 7706931737108040982 | Ep 5 "Laundry Day" | 72 s |
| 909462 | 7704420833954909462 | Tráiler T1 "Across the Hall" | 65 s |

### Prioridad para NUESTRA camarera

- **A:** imprescindible. Es el motor del flirteo o de la marca, o aparece en ≥3 videos.
- **B:** útil para dar variedad.
- **C:** situacional, requiere un prop o decorado concreto, o es arriesgada técnicamente.

### Formato de enlace

`[id·t](female_anims/<archivo>.jpg)`

### Adaptación del rig a la camarera

- **Corsé negro:** el torso es casi rígido. Spine y Chest aportan como máximo ±20° de flexión y ±5° de contrarrotación. Todo lo demás sale de Hips, Neck y Head.
- **Mangas abullonadas:** son un hueso secundario o físico `Sleeve_L/R` con retardo de 2–3 frames y overshoot de 6–10°. Hacen que cualquier gesto de brazo se lea más grande.
- **Shorts:** las piernas se ven, así que el contrapposto y el flex de rodilla son visibles. Hay que limpiar los pies y las rodillas.
- **Prop de oficio:** la bandeja sustituye a la caja, el tarro y la lámpara de las referencias. La libreta y la jarra son opcionales. El brazo que lleva bandeja la mantiene horizontal (±2°) en todas las poses.
- **Nuca:** en las referencias, de espaldas se ve la "cabeza hueca" (cara trasera sin textura). Nuestra camarera necesita nuca y pelo trasero texturizados.
- **Ritmo:**
  - Cuerpo con claves a 24–30 fps.
  - Cara por sprite-swap a 8–12 Hz, sin sincronía labial: 2–3 bocas alternando.
  - Cámara a 30 fps.

---

## 1. Catálogo común (por categoría)

### 1.1 Gancho a cámara (catchphrase)

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **frase-firma-frontal** | PP frontal a cámara, cabeza ladeada ~15°, boca "o" que pasa a abierta con lengua. Mechones oscilan y hay push-in leve. One-shot de 1,5 s. Para la camarera: su frase firma. | [648662·0.5](female_anims/648662_000.5s_hablar-a-camara.jpg) · [040982·0.5](female_anims/040982_000.5s_gancho-miss-me.jpg) · [935190·0.5](female_anims/935190_000.5s_hola-provocadora.jpg) · [411222·0.5](female_anims/411222_000.5s_sting-miss-me.jpg) · [129430·0.5](female_anims/129430_000.5s_hablar-frontal.jpg) | **A** |
| **remate-palabra-final** | La última palabra con boca más grande y ojos más abiertos. La cabeza sube y se mece. | [040982·1.5](female_anims/040982_001.5s_danny-boca-grande.jpg) · [935190·1.5](female_anims/935190_001.5s_danny-pregunta.jpg) | **A** |
| **frase-firma-exterior** | Variante con sonrisa grande, mirada hacia arriba y mejillas rojas, en azotea nocturna. | [909462·9.5](female_anims/909462_009.5s_miss-me-azotea.jpg) | C |

### 1.2 Idles y esperas

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **idle-escucha** | De pie, brazos sueltos, peso en una cadera, cabeza ladeada hacia él. Loop de 3–4 s con respiración mínima. | [466198·0.5](female_anims/466198_000.5s_listen-idle-door.jpg) · [806870·0.5](female_anims/806870_000.5s_idle-umbral.jpg) · [935190·21.5](female_anims/935190_021.5s_idle-alto.jpg) · [909462·24.5](female_anims/909462_024.5s_de-pie-en-umbral.jpg) · [040982·21.5](female_anims/040982_021.5s_perfil-en-puerta.jpg) | **A** |
| **idle-de-espaldas** | Vista trasera, brazos relajados, cabeza ladeada. Sirve para espera antes de girarse. | [909462·1.5](female_anims/909462_001.5s_espera-de-espaldas.jpg) | B |
| **idle-apoyo-baranda** | Una mano en la barandilla, cuerpo ladeado, escuchando. En la camarera, mano o codo sobre la barra. | [935190·50.5](female_anims/935190_050.5s_apoyada-baranda.jpg) | B |

### 1.3 Hablar (diálogo, cabeza y boca)

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **hablar-pregunta** | Boca abierta con lengua, cabeza inclinada y ojos entornados. Duración ~1 s, tono de pregunta ladina. | [806870·5.5](female_anims/806870_005.5s_whats-it-for.jpg) · [806870·15.5](female_anims/806870_015.5s_pregunta-abierta.jpg) · [466198·2.5](female_anims/466198_002.5s_ask-talk.jpg) · [935190·32.5](female_anims/935190_032.5s_stairs-hablar.jpg) | **A** |
| **hablar-burla** | Boca en zigzag o abierta y párpados bajos. La cabeza se estira hacia delante y vuelve atrás al rematar. | [935190·27.5](female_anims/935190_027.5s_boring-zigzag.jpg) · [935190·28.5](female_anims/935190_028.5s_boring-remate.jpg) · [129430·29.5](female_anims/129430_029.5s_bromear.jpg) · [909462·16.5](female_anims/909462_016.5s_you-look-lost-boca-gato.jpg) | **A** |
| **hablar-orden** | Boca muy abierta, cejas arriba, cabeza adelantada y brazo abierto que indica. Tono de orden en broma. | [466198·41.5](female_anims/466198_041.5s_capital-lecture.jpg) · [466198·50.5](female_anims/466198_050.5s_louder-command.jpg) · [806870·55.5](female_anims/806870_055.5s_and-knock.jpg) · [040982·50.5](female_anims/040982_050.5s_tomorrow-boca-abierta.jpg) · [466198·36.5](female_anims/466198_036.5s_dictate-smug.jpg) | **A** |
| **hablar-saludo-invitación** | Boca abierta sencilla, asentimiento corto y sonrisa. Sirve para "pase", "hola", "ey". | [806870·23.5](female_anims/806870_023.5s_come-in.jpg) · [129430·6.5](female_anims/129430_006.5s_hi-sonrisa.jpg) · [909462·14.5](female_anims/909462_014.5s_hey-media-sonrisa.jpg) · [648662·17.5](female_anims/648662_017.5s_and-me-alegre.jpg) | **A** |
| **hablar-cálido-bajo** | Voz baja: ojos grandes con pestañas y boca abierta pequeña. Para confesiones. | [806870·59.5](female_anims/806870_059.5s_its-you.jpg) · [935190·25.5](female_anims/935190_025.5s_algo-verdadero.jpg) | B |
| **hablar-risueño** | Misma risa con boca en zigzag al hablar. El pelo sigue a la cabeza. | [935190·69.5](female_anims/935190_069.5s_favorite-one.jpg) | B |

### 1.4 Sonrisas y microexpresiones (cabeza casi quieta)

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **sonrisa-cerrada-lado** | Sonrisa de lado, párpados medios, hold de 1–2 s. Es la cara base de "ya lo sabía". | [466198·9.5](female_anims/466198_009.5s_smirk-close.jpg) · [806870·41.5](female_anims/806870_041.5s_tooth-sonrisa.jpg) · [806870·51.5](female_anims/806870_051.5s_butter-sonrisa.jpg) · [806870·56.5](female_anims/806870_056.5s_twice-sonrisa.jpg) · [935190·9.5](female_anims/935190_009.5s_danny-sonrisa.jpg) · [935190·7.5](female_anims/935190_007.5s_sonrisa-contrapicado.jpg) · [935190·55.5](female_anims/935190_055.5s_escuchar-radio.jpg) · [935190·60.5](female_anims/935190_060.5s_sonrisa-sabia.jpg) · [129430·38.5](female_anims/129430_038.5s_calma-sonrisa.jpg) · [129430·63.5](female_anims/129430_063.5s_lamp-sonrisa.jpg) · [411222·11.5](female_anims/411222_011.5s_sonrisa-puerta.jpg) · [411222·22.5](female_anims/411222_022.5s_too-long-smirk.jpg) · [411222·59.5](female_anims/411222_059.5s_mostly-ladina.jpg) · [648662·74.5](female_anims/648662_074.5s_usually-sonrisa-lado.jpg) | **A** |
| **sonrisa-ancha-w** | Sonrisa más ancha tipo "w", ojos medio cerrados. Remate tras una pregunta o una caricia verbal. | [806870·33.5](female_anims/806870_033.5s_sonrisa-ancha.jpg) · [806870·32.5](female_anims/806870_032.5s_how-much.jpg) · [806870·60.5](female_anims/806870_060.5s_you-suave.jpg) · [648662·31.5](female_anims/648662_031.5s_happy-ternura.jpg) · [648662·50.5](female_anims/648662_050.5s_here-sonrisa-p-cara.jpg) | B |
| **ternura-sonrojada** | Rubor de rayitas o puntos, ojos suaves, mirada desviada. Es el momento en que ella también se ablanda. | [648662·24.5](female_anims/648662_024.5s_mirada-timida-sonrojo.jpg) · [040982·54.5](female_anims/040982_054.5s_confiesa-sonrojada.jpg) · [129430·46.5](female_anims/129430_046.5s_my-hero.jpg) | B |
| **mirada-fija-a-cámara** | Sonrisa cerrada, pupilas grandes, mirada clavada en cámara y balanceo mínimo. Push-in lento. Loop de ~4 s. Efecto parasocial. Detalle en C-14. | [466198·63.5](female_anims/466198_063.5s_gaze-lock.jpg) | **A** |
| **celos-bufanda** | Ojos medio cerrados y sonrisa cerrada. Boca "o" pequeña en "territorial" y balanceo de cabeza. | [909462·44.5](female_anims/909462_044.5s_celos-con-bufanda.jpg) | C |

### 1.5 Risas

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **risa-ojos-cerrados** | Ojos en arco "^ ^", boca abierta (con lengua), cabeza ladeada y oscilante, hombros que tiemblan. Loop de 1,5–2 s. | [040982·44.5](female_anims/040982_044.5s_risa-ojos-cerrados.jpg) · [411222·40.5](female_anims/411222_040.5s_risa-ojos-cerrados.jpg) · [935190·67.5](female_anims/935190_067.5s_reir-ojos-cerrados.jpg) · [466198·30.5](female_anims/466198_030.5s_laugh-eyes-closed.jpg) · [129430·44.5](female_anims/129430_044.5s_risa.jpg) · [909462·19.5](female_anims/909462_019.5s_risa-danny.jpg) | **A** |
| **risa-final / carcajada** | La misma risa con la cabeza bajando y subiendo. Cierra el video. | [935190·82.5](female_anims/935190_082.5s_risa-final.jpg) · [909462·59.5](female_anims/909462_059.5s_carcajada-final.jpg) | B |
| **risa-con-prop** | Risa con cabeza hacia atrás mientras sostiene el objeto en primer plano. | [411222·54.5](female_anims/411222_054.5s_leer-etiqueta-risa.jpg) · [411222·43.5](female_anims/411222_043.5s_cold-freezing.jpg) | B |
| **risa-tímida** | Ojos "^ ^", sonrisa grande, rubor intenso y cabeza que se inclina. | [909462·49.5](female_anims/909462_049.5s_risa-timida-rubor.jpg) | B |

### 1.6 Reacciones (sorpresa, eco, deadpan)

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **eco-burlón** | Repite su frase con cabeza ladeada, cejas alzadas y sonrisa de lado. Pose de "no pasa nada" con sonrisa en el nombre. | [806870·45.5](female_anims/806870_045.5s_what-eco.jpg) · [806870·46.5](female_anims/806870_046.5s_nothing-danny.jpg) · [935190·62.5](female_anims/935190_062.5s_is-that-so.jpg) · [935190·36.5](female_anims/935190_036.5s_guess.jpg) | **A** |
| **sorpresa-ojos-grandes** | Ojos abiertos, cejas altas y boca redonda. Reacción corta (~0,5 s). | [806870·9.5](female_anims/806870_009.5s_ojos-abiertos-sonrisa.jpg) · [806870·10.5](female_anims/806870_010.5s_pm-asombro.jpg) · [935190·71.5](female_anims/935190_071.5s_oh-diurno.jpg) · [129430·5.5](female_anims/129430_005.5s_oh-ojos-entrecerrados.jpg) | B |
| **deadpan-ojos-grandes** | Cara recta con iris grande y boca abierta. Gag seco antes de la sonrisa pícara. | [466198·23.5](female_anims/466198_023.5s_gerald-deadpan.jpg) · [648662·16.5](female_anims/648662_016.5s_gerald-deadpan.jpg) | B |
| **giro-a-la-voz** | Gira cabeza y torso hacia una voz, sonrisa de medio lado. | [129430·4.5](female_anims/129430_004.5s_giro-hacia-voz.jpg) | B |
| **exuberante-brazos-abiertos** | Cabeza echada hacia arriba y brazos abiertos con manos extendidas. | [935190·78.5](female_anims/935190_078.5s_pasillo-cabeza-atras.jpg) | C |
| **mirada-hueca** | Ojos sin iris y vela baja. Efecto inquietante tipo horror suave, usar con cuidado. | [129430·61.5](female_anims/129430_061.5s_mirada-vacia.jpg) | C |

### 1.7 Props en mano (para la camarera: bandeja, taza, jarra, libreta)

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **mostrar-objeto-brazo-extendido** | Brazo extendido a un lado o al frente con el objeto, boca abierta y ojos entornados. En la camarera: "sirve la bandeja". | [806870·28.5](female_anims/806870_028.5s_mostrar-tarro.jpg) · [411222·16.5](female_anims/411222_016.5s_ofrecer-caja.jpg) · [411222·17.5](female_anims/411222_017.5s_caja-extendida.jpg) · [040982·9.5](female_anims/040982_009.5s_puerta-calcetin-sonrisa.jpg) · [040982·15.5](female_anims/040982_015.5s_exhibit-mano-calcetin.jpg) · [129430·9.5](female_anims/129430_009.5s_pose-bandeja.jpg) | **A** |
| **sostener-objeto-idle** | Objeto al pecho, a la cintura o a la altura de la cabeza, cabeza inclinada. Base de hablar con prop. | [411222·46.5](female_anims/411222_046.5s_caja-al-pecho.jpg) · [411222·34.5](female_anims/411222_034.5s_caja-en-alto.jpg) · [129430·14.5](female_anims/129430_014.5s_mano-bandeja.jpg) · [648662·36.5](female_anims/648662_036.5s_sostener-lampara.jpg) · [909462·28.5](female_anims/909462_028.5s_sostener-sudadera-rosa.jpg) · [040982·40.5](female_anims/040982_040.5s_muestra-camisa.jpg) | **A** |
| **objeto-en-alto-burla** | Brazo estirado sobre la cabeza con el objeto, cadera ladeada, sonrisa de victoria. Variante de palma hacia arriba con incredulidad fingida. | [411222·38.5](female_anims/411222_038.5s_nope-brazo-arriba.jpg) · [806870·36.5](female_anims/806870_036.5s_gesto-whole-cup.jpg) | B |
| **entrega-de-objeto** | Mano sobre el objeto mientras él lo toma por abajo. Contacto de manos. | [648662·64.5](female_anims/648662_064.5s_entrega-lampara-mano.jpg) | **A** |
| **manipular-objeto** | Doblar, alisar, acariciar. Gestos lentos con las manos sobre la mesa. En la camarera: limpiar mesa, doblar servilleta. | [040982·29.5](female_anims/040982_029.5s_dobla-camisa.jpg) · [040982·37.5](female_anims/040982_037.5s_alisa-sobre-mesa.jpg) · [648662·32.5](female_anims/648662_032.5s_acariciar-lampara.jpg) | B |
| **llevarse-objeto** | De espaldas, brazos abiertos sosteniendo el objeto, se desliza hacia la puerta. | [040982·58.5](female_anims/040982_058.5s_se-lleva-camisa.jpg) | C |
| **tocar-puerta** | De perfil, un brazo golpea y el otro lleva el prop. En la camarera: golpea con bandeja en mano. | [129430·2.5](female_anims/129430_002.5s_tocar-puerta.jpg) | B |

### 1.8 Gestos de reto, trato y cuidado

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **reto-mirada-fija** | Mirada seria con ojos de lado, cabeza inclinada y boca cerrada. Es el "then say it". | [411222·50.5](female_anims/411222_050.5s_reto-then-say-it.jpg) | B |
| **gestos-de-trato** | Manos con el índice señalando y moviéndose ante él (negociación en broma). | [411222·31.5](female_anims/411222_031.5s_gestos-trato.jpg) | B |
| **oferta-manos-juntas** | En el umbral, manos juntas a la altura del muslo y sonrisa sutil, luego se inclina sobre el hombro. | [411222·65.5](female_anims/411222_065.5s_oferta-teach.jpg) | **A** |
| **travesura-or-don't** | Ojos muy abiertos, boca abierta y asentimiento rápido. Cierre de invitación pícara. | [909462·56.5](female_anims/909462_056.5s_or-dont-travesura.jpg) | B |
| **escudo-protector** | Brazo extendido a un lado como barrera, bandeja en la otra mano. | [129430·41.5](female_anims/129430_041.5s_escudo.jpg) | C |
| **mano-atrás-protección** | Extiende la mano hacia atrás sin mirar para proteger a la otra persona. | [129430·28.5](female_anims/129430_028.5s_mano-atras-proteccion.jpg) | B |
| **tranquilizar-respira** | Cabeza ladeada ~20°, sonrisa suave, inspira para marcar "breathe". Base de C-08B. | [129430·49.5](female_anims/129430_049.5s_tranquilizar.jpg) | B |

### 1.9 Giros, ofrecimiento corporal y despedidas

| Animación | Qué hace | Apariciones | Prio |
|---|---|---|---|
| **giro-torso-curioso** | Gira el torso a ¾ mirándolo de lado, cabeza ladeada y manos sueltas. Pasa de la espera a la curiosidad. | [806870·14.5](female_anims/806870_014.5s_giro-curioso.jpg) | B |
| **girarse-de-espaldas** | Pivota para quedar de espaldas a él mirando una puerta. Ojo: la nuca hueca de las referencias. | [935190·44.5](female_anims/935190_044.5s_girarse-puerta.jpg) | B |
| **deslizarse-sin-pasos** | Entra flotando sin pasos, brazos algo separados. Gag PS1, no usar como base de caminar. | [040982·22.5](female_anims/040982_022.5s_flota-entrando.jpg) | C |
| **despedida-sonrisa-quieta** | Queda de perfil, quieta, brazos caídos y sonrisa pequeña mientras él se va. Cierra con un detalle (corazón sobre la puerta). | [806870·64.5](female_anims/806870_064.5s_ve-partir.jpg) | **A** |
| **despedida-puerta-palmas** | De pie en la puerta con las manos abiertas a los lados, palmas visibles, inclinada hacia él. | [411222·67.5](female_anims/411222_067.5s_despedida-puerta.jpg) | **A** |
| **buenas-noches** | Cabeza ladeada, boca abierta y rubor. Después camina hacia dentro con la bandeja a un lado. | [129430·58.5](female_anims/129430_058.5s_buenas-noches.jpg) | **A** |
| **reto-de-salida** | Boca abierta y luego sonrisa "ᴗ", mirada de reojo y giro lento de cabeza. Remate "come and find out". | [040982·64.5](female_anims/040982_064.5s_come-and-find-out.jpg) | **A** |

### 1.10 Sin fotograma (no enlazadas)

Están en el JSON del video 466198 pero no en `female_anims/`:
- `repeat-echo` (8.5 s): eco burlón con torso adelantado.
- `sure-lazy` (29.5 s): ojos caídos, boca a medias.
- `door-close` (66.5 s): no es animación de ella, es la puerta.

---

## 2. POSES Y ANIMACIONES COQUETAS

> **Convenciones de este bloque**
> - **Huesos:** `Root, Hips, Spine, Chest, Neck, Head, Clavicle_L/R, UpperArm_L/R, Forearm_L/R, Hand_L/R, UpperLeg_L/R, LowerLeg_L/R, Foot_L/R, Hair_Bangs, Hair_Side_L/R, Hair_Back, Sleeve_L/R`.
> - **Unidades:** grados y cm, con la camarera a escala 1,70 m. Ella es ~1,25× más alta que el chico, como en las referencias, así que muchas miradas son hacia abajo.
> - **Ángulos:** "+" es hacia delante, hacia él o hacia el lado indicado.
> - **Corsé:** limita Spine y Chest, como se indica en §0.
> - **Contenido:** tono rom-com PG-13. El contacto es siempre sobre la ropa, en zonas neutras (esternón, hombro, mano) y sin cámara en picado intencionada.
> - **Reacciones de él:** se citan por el nombre de sus clips en los análisis (`rascarse-nuca`, `ojos-de-corazon`, etc.).

---

### C-01 · Lean-in: inclinarse hacia él (prioridad A)
- **Apariciones**
  - [806870·48.5 bring-me-one](female_anims/806870_048.5s_bring-me-one.jpg)
  - [806870·42.5 noticed](female_anims/806870_042.5s_noticed.jpg)
  - [935190·14.5 inclinarse-breathe](female_anims/935190_014.5s_inclinarse-breathe.jpg)
  - [935190·15.5 recostar-sonrisa](female_anims/935190_015.5s_recostar-sonrisa.jpg) (retorno)
  - [909462·33.5 inclinacion-con-celular](female_anims/909462_033.5s_inclinacion-con-celular.jpg) (con prop)
- **Huesos y partes**
  - Hips traslada +4 cm hacia él y baja 1 cm.
  - Spine +10° y Chest +8° (total ≤18° por el corsé).
  - Neck +8° y Head −6° (barbilla baja, mira hacia abajo).
  - Clavicle_R +4° adelante.
  - UpperArm_R 15° flexión, Hand_R floja. En `bring-me-one` la mano derecha queda suelta.
  - Hand_L en cadera o colgando.
  - Hair_Side_L/R oscilan hacia delante 12° con 3 frames de retraso.
  - Sleeve overshoot 6°.
- **Dirección:** hacia su rostro o pecho, sin invadir. Distancia final de cabezas ~35 cm.
- **Duración**
  - Entrada 0,45 s.
  - Hold 1,2 s.
  - Salida 0,5 s (en `recostar-sonrisa`, 0,6 s).
  - Variante corta `noticed`: 0,35 s dentro y 0,6 s de hold.
- **Tipo:** one-shot con hold. El hold puede hacer loop de respiración (Chest ±0,5 cm a 0,3 Hz).
- **Curva:** entrada ease-out cúbica con overshoot de 3°. Hold senoidal. Salida smoothstep.
- **Peso del cuerpo:** de 60/40 sobre la pierna trasera a 35/65 sobre la delantera. El talón trasero se levanta 2 cm y la rodilla delantera flexiona 8°.
- **Cara que la acompaña**
  - Ojos medio cerrados.
  - Sonrisa de lado.
  - Boca abierta con lengua visible en la sílaba tónica.
  - Sin rubor (ella no se sonroja aquí).
- **Qué provoca en él:** echa la cabeza 4–6 cm hacia atrás (`sorpresa-cup`, `what-confundido`). Después se sonroja y hace `rascarse-nuca`. Si el hold dura más de 1,5 s pasa a `ojos-de-corazon`.
- **Camarera:** al apoyar la bandeja en el mostrador o la mesa, hace lean-in con la bandeja a 90 cm del suelo.

### C-02 · Contrapposto: cadera ladeada en idle (prioridad A)
- **Apariciones**
  - [466198·1.5 smug-idle-you](female_anims/466198_001.5s_smug-idle-you.jpg)
  - [909462·3.5 idle-columna](female_anims/909462_003.5s_idle-columna.jpg)
  - [648662·8.5 idle-columna-sonrisa](female_anims/648662_008.5s_idle-columna-sonrisa.jpg)
  - Base sin coquetería en §1.2.
- **Huesos y partes**
  - Hips roll 6–8° (lado de la pierna libre arriba) y desplazamiento lateral de 3 cm hacia la pierna de carga.
  - Spine contra-roll −4°, Chest −3°. La línea de hombros se inclina 4–5° en sentido contrario.
  - Head roll 8–10° hacia el lado cargado.
  - UpperLeg libre con abducción 6°, rodilla flex 12° y punta del pie hacia fuera 25° apoyada en metatarso.
  - Hand_L en cadera o colgando abierta. Hand_R con prop si lo hay.
  - Chest respira ±0,8 cm.
- **Dirección:** el frente del cuerpo queda ligeramente girado (10°) hacia él.
- **Duración:** entrada 0,6 s. Loop de 3,2 s. Cambia de lado cada 8–10 s con un swap de 0,7 s.
- **Tipo:** loop.
- **Curva:** senoidal con micro-sway Hips ±1,5° a 0,25 Hz. El swap usa smoothstep.
- **Peso del cuerpo:** 70/30. Es el eje de todas las demás poses.
- **Cara que la acompaña:** sonrisa cerrada ":3", párpados al 60 %, parpadeo cada 3–4 s (2 frames de sprite).
- **Qué provoca en él:** desvía el peso de un pie a otro (`espera-en-umbral`). Su mirada baja y vuelve (`mirada-evasiva`). Se pone a hablar rápido.

### C-03 · Apoyarse en marco, columna o barra, y asomarse (prioridad A)
- **Apariciones**
  - [411222·10.5 aparece-en-marco](female_anims/411222_010.5s_aparece-en-marco.jpg)
  - [648662·8.5 idle-columna-sonrisa](female_anims/648662_008.5s_idle-columna-sonrisa.jpg)
  - [909462·3.5 idle-columna](female_anims/909462_003.5s_idle-columna.jpg)
  - [909462·18.5 asomarse-por-marco](female_anims/909462_018.5s_asomarse-por-marco.jpg)
  - [909462·40.5 guardiana-de-puerta](female_anims/909462_040.5s_guardiana-de-puerta.jpg)
  - [648662·69.5 asomarse-puerta](female_anims/648662_069.5s_asomarse-puerta.jpg)
- **Huesos y partes**
  - Hips +6 cm hacia el marco y yaw 15° hacia él.
  - Spine roll 6° hacia el marco. Clavicle cercana contacta con el borde.
  - UpperArm cercano con abducción 75° y Forearm 100°. Hand agarra el borde con los dedos curvados 40° (en `asomarse-puerta` se ve la mano de dedos largos sobre el borde).
  - UpperArm lejano suelto o en cadera.
  - Head roll 12–15° hacia el marco, yaw 10° hacia él.
  - Piernas cruzadas: pie lejano cruza 12 cm por delante, rodilla 10° flex.
  - **Variante asomarse:** Hips yaw 40° de espaldas al hueco, solo Head, Hand y media cara visibles. Head roll 15°, pupilas de lado.
  - **Guardiana de puerta:** un brazo extendido sostiene la puerta y el otro cuelga.
- **Dirección:** el cuerpo "cierra" el paso. Él queda entre ella y la salida.
- **Duración:** entrada 0,7 s (apoyo del hombro en 0,25 s). Hold de 3–4 s con sway ±2° a 0,3 Hz. Salida 0,4 s.
- **Tipo:** entrada one-shot, hold en loop.
- **Curva:** ease-out al llegar. Un frame de squash de 1 cm en el hombro al contactar. Sway senoidal.
- **Peso del cuerpo:** 55/45, con ~30 % apoyado en el marco.
- **Cara que la acompaña:** sonrisa de gato, mirada que se desliza hacia él cada 1,5 s, párpados al 60 %.
- **Qué provoca en él:** se siente atrapado: no entra ni sale. Hace `risita-nerviosa` y `mirada-evasiva`, y se sonroja.
- **Camarera:** marco de cocina, pase de platos o barra, con el codo sobre el mostrador.

### C-04 · Mirar por encima del hombro (prioridad A)
- **Apariciones**
  - [806870·27.5 giro-sobre-hombro](female_anims/806870_027.5s_giro-sobre-hombro.jpg)
  - [935190·74.5 danny-final](female_anims/935190_074.5s_danny-final.jpg)
  - [129430·42.5 mirada-atras](female_anims/129430_042.5s_mirada-atras.jpg)
  - [129430·57.5 giro-pasillo](female_anims/129430_057.5s_giro-pasillo.jpg)
  - [040982·60.5 gira-en-puerta](female_anims/040982_060.5s_gira-en-puerta.jpg)
- **Huesos y partes**
  - Hips yaw 25° alejándose de él.
  - Spine +15° y Chest +10° de contra-yaw (el corsé limita).
  - Neck yaw +25° y Head +15°.
  - Cuerpo total ~50° y cuello ~40°, para que los ojos lleguen a él.
  - Hombro lejano baja 3°. Hand_L en cadera, Hand_R con prop (como en `giro-sobre-hombro`).
  - Hair_Back con overshoot de 10° y 4 frames de retraso, que se asienta en 0,5 s.
- **Dirección:** de espaldas a él, rostro de ¾ hacia él.
- **Duración:** giro 0,5 s. Hold 1,0–1,5 s. Después retorno o salida caminando.
- **Tipo:** one-shot.
- **Curva:** ease-out con overshoot de 5° a los 0,4 s. Asentamiento suave.
- **Peso del cuerpo:** 65/35 sobre la pierna delantera. El pie pivota 20°.
- **Cara que la acompaña:** ojos half-lid, sonrisa asimétrica, una ceja más alta y un parpadeo lento (0,3 s) al final.
- **Qué provoca en él:** se queda quieto (`mirada-vacia` y luego `sonrisa-feliz`). Gira la cabeza ~10° para seguirla.
- **Aviso técnico:** en la referencia de 935190·74.5 aparece un glitch de malla en el pelo. Evitarlo con pesos limpios en Hair_Back.

### C-05 · Jugar con el pelo (PROPUESTA, prioridad B)
- **Apariciones:** no observada. El precedente más cercano es el pelo sobre la cara en [040982·28.5 agacha-cabeza-quiero](female_anims/040982_028.5s_agacha-cabeza-quiero.jpg) y la oscilación de mechones largos.
- **Huesos y partes**
  - UpperArm_R elevación 55° y Forearm_R 110°.
  - Hand_R en pinza sobre Hair_Side_L (hook bone).
  - **Enroscar:** twist de muñeca ±30° durante 2 ciclos de 0,35 s.
  - **Soltar:** estira 6 cm hacia fuera y suelta en 0,15 s.
  - **Tuck:** la mano sube 8 cm hacia la oreja en 0,3 s y el mechón se fija (swap de pesos en 1 frame).
  - Head roll 10° contra la mano. Chest yaw 5°.
  - Hand_L sostiene bandeja o libreta, o está en cadera.
  - La manga abullonada cae 3 cm hacia el codo al levantar el brazo.
- **Dirección:** la mano sube por el lado contrario a él.
- **Duración:** subir 0,4 s + enroscar 1,0 s + tuck 0,3 s + bajar 0,4 s ≈ 2,1 s.
- **Tipo:** one-shot. El enroscar puede hacer loop de 1 s.
- **Curva:** subir ease-out. Enroscar senoidal. Soltar ease-in rápido.
- **Peso del cuerpo:** 50/50 con cadera ladeada (C-02).
- **Cara que la acompaña:** ojos desviados ~20° hacia arriba y al lado, sonrisa cerrada y párpados al 70 %. En el tuck vuelve a mirarle.
- **Qué provoca en él:** pierde el hilo (`mirada-vacia`, boca "~") y tartamudea. Se rasca la nuca.
- **Uso:** ideal mientras él habla, para interrumpirle sin palabras.

### C-06 · Acercarse e invadir su espacio (prioridad A)
- **Apariciones**
  - [648662·40.5 interrogar-paso-adelante](female_anims/648662_040.5s_interrogar-paso-adelante.jpg)
  - [129430·27.5 paso-al-frente](female_anims/129430_027.5s_paso-al-frente.jpg)
- **Huesos y partes**
  - Dos pasos de 35 cm, de 0,55 s cada uno, de 1,2 m a 0,35 m de distancia.
  - Hips sway ±3 cm lateral y ±5° yaw.
  - Chest casi quieto y Head estabilizada ±1°.
  - Brazo libre con swing de 8°. El otro lleva el prop (en 648662 lleva la lámpara y la mano libre abierta).
  - **Parada:** pies de frente a 20 cm de sus zapatos. Hips con squash de 1,5 cm. Head −10° y Spine +5°.
- **Dirección:** frontal. Ella lo hace retroceder hacia pared, marco o puerta.
- **Duración:** 1,1 s de aproximación + hold de 1–1,5 s. En C-04 puede encadenarse un giro.
- **Tipo:** one-shot.
- **Curva:** primer paso ease-in. Velocidad constante en medio. Frenado ease-out en 0,2 s.
- **Peso del cuerpo:** 60/40 en la pierna delantera al detenerse.
- **Cara que la acompaña:** boca abierta alegre (como en 648662) o sonrisa cerrada, con ojos fijos en los suyos.
- **Qué provoca en él:** retrocede un paso (`sobresalto-giro`, `giro-ofendido`), se pega a la pared y se sonroja al máximo. Si ella no retrocede, hace `ojos-de-corazon`.
- **Cámara sugerida:** PP sobre el hombro, con ella en contrapicado leve.

### C-07 · Caminar con intención (prioridad A)
- **Apariciones**
  - [806870·26.5 caminar-sala](female_anims/806870_026.5s_caminar-sala.jpg)
  - [935190·73.5 salir-ascensor](female_anims/935190_073.5s_salir-ascensor.jpg)
  - [466198·65.5 exit-door](female_anims/466198_065.5s_exit-door.jpg)
  - [909462·26.5 caminar-con-abrigo](female_anims/909462_026.5s_caminar-con-abrigo.jpg)
  - Contraejemplo, solo como gag: [040982·22.5 flota-entrando](female_anims/040982_022.5s_flota-entrando.jpg).
- **Huesos y partes**
  - Ciclo de 1,0 s (más lento que el natural de 0,8 s) con zancada de 42 cm.
  - Hips yaw ±8°, roll ±4° y lateral ±2,5 cm, sincronizados con cada paso.
  - Pies casi en una línea, cruzando 3 cm.
  - Chest contra-rota ±3° (corsé).
  - Head estabilizada ±1°.
  - Brazos con swing de 12° (la mano con bandeja se queda en 0°, horizontal).
  - Hair_Back con 3 frames de retraso. Sleeve con overshoot.
- **Dirección:** hacia un objetivo claro, con la mirada al frente o hacia él.
- **Duración**
  - Arranque de 1 paso en 0,5 s.
  - Loop de ciclo.
  - Parada en 0,3 s con settle de 1,5 cm en Hips.
- **Tipo:** loop con arranque y parada one-shot.
- **Curva:** senoidal en Hips. Contactos de pie en los frames 0 y 15 (a 30 fps).
- **Peso del cuerpo:** transferencia completa en cada paso, con pico sobre el pie de apoyo.
- **Cara que la acompaña:** boca cerrada, sonrisa mínima y mirada al frente o de reojo a él.
- **Qué provoca en él:** la sigue con la cabeza (`espera-en-umbral`). Se queda con `mirada-evasiva`. Si ella se aleja, `sonrisa-feliz`.
- **Camarera:** botas o zapatillas bajas. El tacón queda descartado salvo decisión de diseño.

### C-08 · Tocarle el pecho (PROPUESTA, prioridad B)
- **Apariciones:** no observada. Precedentes de contacto o cuidado:
  - [129430·28.5 mano-atras-proteccion](female_anims/129430_028.5s_mano-atras-proteccion.jpg)
  - [129430·49.5 tranquilizar](female_anims/129430_049.5s_tranquilizar.jpg)
  - [648662·64.5 entrega-lampara-mano](female_anims/648662_064.5s_entrega-lampara-mano.jpg)
  - [909462·50.5 cabeza-en-hombro](female_anims/909462_050.5s_cabeza-en-hombro.jpg)
- **Variante A (dedo en el esternón, reto/provocación)**
  - **Huesos y partes**
    - UpperArm_R +40° y Forearm_R 75°.
    - Wrist −10°. Índice extendido, otros dedos con curl de 70°.
    - Punto de contacto: esternón de él, ~10 cm por debajo de su barbilla. El brazo va casi horizontal, con 10° hacia abajo por la altura.
    - Hips +5 cm hacia él, Spine +8° y Head tilt 15°.
  - **Secuencia**
    - Alcanza en 0,35 s.
    - Presiona en 0,12 s (el dedo hunde 1 cm, él retrocede 3 cm y su torso cabecea −4°).
    - Hold de 0,6 s.
    - Opcional: 2 golpecitos de 0,2 s con 1 cm.
    - Retira en 0,3 s.
    - Total ~1,6 s.
  - **Curva:** alcance ease-out. Presión con impulso brusco y rebote. Retirada ease-in.
  - **Peso del cuerpo:** 55/45 hacia delante.
  - **Cara que la acompaña:** ojos medio cerrados, sonrisa de lado, mirada a sus ojos (no al dedo).
- **Variante B (palma plana, calma tipo "respira")**
  - **Huesos y partes:** Hand plana, contacto de 0,2 s sobre el pecho de él y subida de 2 cm con su inspiración. Hold de 1,0 s.
  - **Cara que la acompaña:** sonrisa suave y rubor de puntos.
- **Tipo:** one-shot.
- **Qué provoca en él:** se congela (hold de 1 s tras `sobresalto`). Rubor máximo y 0,5 s después `ojos-de-corazon`. Sin respuesta verbal.
- **Límites de tono:** contacto sobre ropa, zona esternón o solapa, sin cámara cerrada en el cuerpo.
- **Tarea técnica:** necesita colisión simple en el pecho de él (un empujón de 3 cm) y un clip de reacción dedicado.

### C-09 · Mano en la cadera con objeto (prioridad B)
- **Apariciones**
  - [648662·52.5 provocar-lampara-cadera](female_anims/648662_052.5s_provocar-lampara-cadera.jpg)
  - [806870·28.5 mostrar-tarro](female_anims/806870_028.5s_mostrar-tarro.jpg) (mano izquierda en cadera)
  - [129430·9.5 pose-bandeja](female_anims/129430_009.5s_pose-bandeja.jpg)
- **Huesos y partes**
  - UpperArm_L abducción 30°, Forearm 95°, codo a 12 cm del torso.
  - Hand_L apoyada en la cresta ilíaca, dedos con curl de 20°.
  - Brazo del objeto: UpperArm_R 15° flexión y Forearm 100°, con la bandeja a 90 cm del suelo y horizontal ±2°.
  - Hips shift 3 cm y roll 6° (C-02). Head roll 10°.
  - Balanceo del cuerpo ±3° a 0,5 Hz.
- **Dirección:** el torso gira 10° hacia él, con el prop cerca de la cámara.
- **Duración:** entrada 0,5 s y loop de 3 s.
- **Tipo:** loop.
- **Curva:** senoidal. Entrada ease-out.
- **Peso del cuerpo:** 70/30.
- **Cara que la acompaña:** sonrisa de lado y ojos entornados.
- **Qué provoca en él:** mira bandeja, cadera y cara, en ese orden (`mirada-picara`).

### C-10 · Cabeza ladeada y sonrisa de gato (prioridad A)
- **Apariciones**
  - [806870·4.5 that-depends](female_anims/806870_004.5s_that-depends.jpg)
  - [411222·21.5 saborear-daniel](female_anims/411222_021.5s_saborear-daniel.jpg)
  - [411222·28.5 i-do-now](female_anims/411222_028.5s_i-do-now.jpg)
  - [909462·4.5 very-sweet-ladeada](female_anims/909462_004.5s_very-sweet-ladeada.jpg)
  - [909462·22.5 i-do-inclinacion-lenta](female_anims/909462_022.5s_i-do-inclinacion-lenta.jpg)
  - [129430·21.5 inclinar-cabeza](female_anims/129430_021.5s_inclinar-cabeza.jpg)
  - [129430·15.5 burlona](female_anims/129430_015.5s_burlona.jpg)
  - [648662·59.5 shame-cabeza-ladeada](female_anims/648662_059.5s_shame-cabeza-ladeada.jpg)
  - [040982·28.5 agacha-cabeza-quiero](female_anims/040982_028.5s_agacha-cabeza-quiero.jpg)
  - [040982·34.5 soy-meticulosa](female_anims/040982_034.5s_soy-meticulosa.jpg)
- **Huesos y partes**
  - Head roll 12–20° (hacia el hombro) y Head pitch +6°.
  - Neck roll 6°. Chest yaw 5° hacia él.
  - Clavicle del mismo lado sube 2°.
  - Hair_Side cuelga hacia ese lado 15°.
  - **Variante agachada** (`agacha-cabeza-quiero`): Head pitch 25° con pelo cubriendo la cara y ojos hacia abajo.
  - **Variante cámara holandesa** (`soy-meticulosa`): cámara ladeada, mirada de lado, boca cerrada con orgullo.
- **Dirección:** hacia el hombro, con la mirada siempre a él.
- **Duración:** entrada 0,4 s (la lenta de "I do" tarda 0,9 s). Hold de 1,5 s con oscilación ±1,5° a 0,7 Hz. Salida 0,4 s.
- **Tipo:** one-shot con hold.
- **Curva:** entrada ease-out con 2° de overshoot. Hold senoidal.
- **Peso del cuerpo:** neutro, 55/45.
- **Cara que la acompaña:** párpados al 50–60 %, sonrisa cerrada ":3" o "w", cejas asimétricas (una 3 px más alta).
- **Qué provoca en él:** duda (`mirada-picara`, `what-confundido`). Se rasca la nuca. Le da la sensación de que ella ya lo ha leído.

### C-11 · Apoyar la cabeza en su hombro (prioridad B, requiere asiento)
- **Apariciones**
  - [909462·50.5 cabeza-en-hombro](female_anims/909462_050.5s_cabeza-en-hombro.jpg)
- **Huesos y partes**
  - Hips +8 cm hacia él (sentada). Spine roll 8°.
  - Neck roll 18° y Head roll 20° hasta contactar con su hombro (0 cm de penetración).
  - Hand_far reposa en el regazo.
  - Chest respira lento a 0,2 Hz con 0,8 cm de amplitud.
- **Dirección:** lateral, hacia su hombro.
- **Duración:** aproximación 0,9 s. Hold en loop de 4 s. Retirada 0,6 s.
- **Tipo:** aproximación one-shot, hold en loop.
- **Curva:** smoothstep en las transiciones. Hold senoidal.
- **Peso del cuerpo:** 50/50, apoyada en el respaldo.
- **Cara que la acompaña:** ojos cerrados en arco suave, sonrisa contenta y rubor de puntos.
- **Qué provoca en él:** `sentado-rigido-sofa`: tieso, ojos al frente, rubor alto y respiración casi contenida. Luego confesión lateral.
- **Camarera:** descanso en un banco o una mesa de la trastienda.

### C-12 · Guiño (prioridad A, barata y potente)
- **Apariciones**
  - [648662·71.5 guiño](female_anims/648662_071.5s_gui-o.jpg)
- **Huesos y partes**
  - Head roll 10° y yaw 5° hacia cámara.
  - Hombro cercano sube 2 cm.
  - Mano opcional (PROPUESTA): dedo a la barbilla o a los labios.
- **Dirección:** a cámara o a él.
- **Duración:** 0,5 s en total. Ojo cierra en 0,08 s, hold 0,25 s, abre en 0,1 s.
- **Tipo:** one-shot.
- **Curva:** pasos de sprite (3 frames a 12 Hz). La sonrisa se desplaza 3 px hacia un lado.
- **Peso del cuerpo:** neutro.
- **Cara que la acompaña:** sonrisa pícara y cabeza ladeada.
- **Qué provoca en él:** `reaccion-ojos-cerrados`, sorpresa feliz de ~1 s.

### C-13 · Servir inclinada con pie levantado (PROPUESTA, prioridad B)
- **Apariciones:** no observada. Es una pose propia del oficio.
- **Huesos y partes**
  - Hips hinge 25° con Spine neutro (corsé recto).
  - Rodillas casi rectas (3° de flex).
  - Una pierna levanta el pie hacia atrás 10°, el clásico "foot pop".
  - La mano con la bandeja se extiende hacia la mesa y la otra queda en la cintura.
  - Head girada hacia arriba, hacia él.
- **Dirección:** la cámara en altura de ojos o de pecho, nunca picada.
- **Duración:** 0,8 s para dejar la bandeja, hold de 1,0 s y 0,5 s para incorporarse.
- **Tipo:** one-shot.
- **Curva:** hinge ease-in-out. El foot pop usa un rebote de 2 frames.
- **Peso del cuerpo:** 80/20 sobre la pierna de apoyo.
- **Cara que la acompaña:** sonrisa y mirada hacia arriba de reojo.
- **Qué provoca en él:** `mirada-evasiva`, se rasca la nuca y mira el techo.
- **Nota:** pose de cuadro. No encadenarla con acercamiento de cámara para no empujar el tono.

### C-14 · Mirada fija a cámara (prioridad A)
- **Apariciones**
  - [466198·63.5 gaze-lock](female_anims/466198_063.5s_gaze-lock.jpg)
- **Huesos y partes**
  - Head pitch −3° (barbilla baja) y ojos al 100 % directos a cámara.
  - Chest respira, Hair con micro-movimiento.
  - Cámara con push-in de ~12 % en 4 s.
- **Duración:** loop de 4 s.
- **Tipo:** loop.
- **Curva:** senoidal en respiración y empuje lineal en cámara.
- **Peso del cuerpo:** 60/40.
- **Cara que la acompaña:** sonrisa cerrada, pupilas grandes y rojas, sin parpadeo durante ~2 s.
- **Qué provoca:** efecto parasocial. El espectador ocupa el lugar de él. Útil como cierre de escena.

### Caras que acompañan (sprite sets coquetos)

| Set | Uso |
|---|---|
| **half-lid** (párpados 50–70 %) | Mirada de "ya lo sabía". Base de C-01, C-02, C-04, C-10. |
| **gato-:3** (sonrisa cerrada con pico) | Idle y burla. |
| **w-ancha** | Remate tras provocación. |
| **lengua-visible** | Pregunta o sílaba tónica ("noticed", "what's it for"). |
| **ojos-^^** | Risa y ternura (C-11). |
| **rubor-puntos/rayitas** | Ternura. Evitarlo en poses de dominio. |
| **reojo** (pupilas desplazadas) | C-03 y C-05. |
| **guiño** (ojo cerrado + sonrisa lateral) | C-12. |
| **ojos-huecos** | Solo gag de horror suave (§1.6). |

---

## 3. Kit mínimo (para arrancar la serie con la camarera)

**Objetivo:** 18 clips de cuerpo + 9 sets de cara, suficientes para producir 1 episodio completo de 60–70 s con campo/contracampo, 1 prop (bandeja) y 1 despedida.

| # | Clip | Tipo | Duración | Origen |
|---|---|---|---|---|
| 1 | **idle-escucha** (§1.2) | loop | 3,5 s | A |
| 2 | **C-02 contrapposto** | loop | 3,2 s | A |
| 3 | **C-07 caminar con intención** + arranque + parada | loop + one-shots | 1,0 s ciclo | A |
| 4 | **frase-firma-frontal** (§1.1) | one-shot | 1,5 s | A |
| 5 | **hablar-pregunta** (§1.3) | one-shot | 1 s | A |
| 6 | **hablar-burla** (§1.3) | one-shot | 1,2 s | A |
| 7 | **hablar-orden** (§1.3) | one-shot | 1,2 s | A |
| 8 | **hablar-saludo-invitación** (§1.3) | one-shot | 1 s | A |
| 9 | **sonrisa-cerrada-lado** (§1.4) | hold | 1,5 s | A |
| 10 | **risa-ojos-cerrados** (§1.5) | loop | 1,5 s | A |
| 11 | **eco-burlón** (§1.6) | one-shot | 1 s | A |
| 12 | **sostener-objeto-idle** (bandeja) + **mostrar/entrega** (§1.7) | loop + one-shot | 3 s + 1 s | A |
| 13 | **C-01 lean-in** (entrada, hold, salida) | one-shot | ~2,1 s | A |
| 14 | **C-03 apoyo en marco/barra** (entrada, hold, salida) | one-shot + loop | 0,7 + 3 + 0,4 s | A |
| 15 | **C-04 mirar por encima del hombro** | one-shot | 0,5 + 1,5 s | A |
| 16 | **C-06 acercarse** | one-shot | ~2,2 s | A |
| 17 | **C-10 cabeza ladeada + sonrisa gato** | one-shot | ~2,3 s | A |
| 18 | **C-12 guiño** + **C-14 mirada a cámara** | one-shot + loop | 0,5 s + 4 s | A |
| + | **Despedidas** (`despedida-puerta-palmas`, `reto-de-salida`, `buenas-noches`) | one-shot | 1,5–2 s | A |

**Reacciones de él que hay que producir a la vez** (sin ellas el flirteo no se lee):
- `sobresalto`
- `rascarse-nuca`
- `mirada-evasiva`
- `ojos-de-corazon`
- `espera-en-umbral`
- `sentado-rigido-sofa` (solo si se usa C-11)

**Sets de cara mínimos:** half-lid, gato-:3, w-ancha, lengua-visible, ojos-^^, rubor, reojo, guiño y 2–3 formas de boca para el habla (cerrada, "o", abierta con lengua).

**Orden de producción sugerido**
1. Rig y proporciones, con corsé limitado, mangas con físicas, nuca y pelo trasero texturizados.
2. Idles y caminar (clips 1–3).
3. Cara y habla (4–11) con los sprite sets.
4. Prop de bandeja (12).
5. Coquetas A (13–18).
6. Despedidas.

**Después del kit (B):** C-05 pelo, C-08 tocar el pecho, C-09 cadera con objeto, C-11 cabeza en el hombro, C-13 servir inclinada y las variantes de risa y sonrisa de §1.
