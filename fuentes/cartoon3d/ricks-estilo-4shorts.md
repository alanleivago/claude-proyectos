# Estilo Ricks Clips: estudio visual de 4 shorts (2026-11-08)

Fuentes:
- gsPV3pf-nnk: "How to make a Ricks Clips animation in 60 seconds".
- WutivYmFoAw: corte en la palabra.
- lCaTVGx2Cxc: las 4 pasadas del look.
- w2AM1ltiers: las 5 reglas de animación.

Los cuatro son promos de Creatorize. Mezclan clips reales de Ricks Clips (etiqueta "Ricks Clips") con clones de Creatorize (etiqueta "Creatorize"). Ver en cada caso cuál es cuál: los clones tienen la tinta más fina y el sombreado más 3D. Las notas generales (transcripción, pasos) están en los 4 `.md` de ver-youtube de esta carpeta. Este archivo es solo el estudio VISUAL.

Material de trabajo, todo local en `refs-ext/ricks-4shorts/` (git-ignorado):
- `frames/<id>/f_NNNN.jpg`: un fotograma cada 0,25 s.
- `sheets/`: contactos de 1 fps.
- `crops/`: recortes a resolución completa de caras, brazos, cuerpos y sets.

Las hojas lado a lado (Ricks contra la nuestra) están en `pieces/toon-test/renders/cmp_*_v5.jpg`.

Leyenda: **v4 mal** = lo que toon.js hacía distinto en v4. **v5** = el estado después de esta ronda.

## 1. Cabeza y posición de la cara
- La cabeza es un círculo casi perfecto, con muy poca irregularidad.
  - Ricks real: tipo de la corbata en "who" y tipo del moño en "He just".
  - Sombreado de esfera: lado iluminado casi blanco, caída gris-azulada o cálida hacia el borde lejano y una "pale streak" (franja pálida de luz) en la mejilla del lado de la luz.
- La cara va en el centro horizontal de la cabeza, con los ojos a ~50-55 % de la altura y la boca a ~65-70 %.
  - En 3/4 los rasgos se corren apenas hacia el lado al que mira (Ricks real "who").
  - En perfil fuerte ("THE WHEELS", inclinado) los rasgos van al borde. No hay nariz en ninguna vista.
- **v4 mal:** la cara se deslizaba 0,035 W en 3/4 (más 0,012 W la boca, más una deformación del contorno de 0,03·f). Con facing de 1,1 a 2 se iba al borde de la cabeza. Además, nariz en perfil.
- **v5:** desliz 0 para |facing| ≤ 1,3, como pidió el usuario (cara centrada). El contorno ya no se deforma con el giro y se quitó la nariz. La raya del pelo y la barba de candado también quedan centradas.

## 2. Ojos, párpados, cejas, bocas y dientes por emoción
- **Neutro / habla:** dos óvalos negros verticales y chicos, ~7 % W de ancho y ~10 % W de alto, separados ~0,26 W entre centros. En los 4 shorts no se ve brillo.
- **Párpado (smug, aburrido, serio):** línea gruesa horizontal arriba y medio disco negro debajo. Ricks real: moño y corbata.
- **Susto / preocupado:** anillos blancos grandes (diámetro ~18-20 % W), casi tocándose, con pupila negra sólida y borde grueso.
- **Esfuerzo ("CENTURIES BY", "ONE SACK"):** ojos en chevrón `> <` apuntando a la nariz, cejas bajas en V y boca-caja de dientes.
- **Cejas:** cortas, gruesas y en arco. Miden ~16-19 % W de largo, con punta redondeada y poco afinamiento. Son ellas las que llevan la emoción: V en enojo o esfuerzo, ^ en tristeza.
- **Bocas:**
  - una línea corta (neutro);
  - sonrisa pequeña en U, ladeada en smirk;
  - "O" chica;
  - caja de dientes: rectángulo redondeado con 3-4 dientes y una línea media.
- **Bigote / barba:** masas oscuras sólidas sobre la cara (buzo "BACK", barbudo f257). Barba de candado: puntos.
- **Cambio de cara:** instantáneo, de un cuadro al siguiente, sin cuadros intermedios (w2AM regla 4, f257→f258).
- **v4 mal:**
  - ojos grandes (8×11,6 % W) con doble brillo;
  - anillos chicos (15 % W);
  - cejas finas (afinan de 4,2 a 1,8);
  - boca algo baja;
  - no existía la cara de esfuerzo.
- **v5:**
  - punto de 7×10,4 % W con UN brillo pequeño (regla 2 del usuario, "un poco de brillo"; los shorts no muestran brillo, ver huecos);
  - anillo de 18,4 % W con borde de 2,7, sin doble brillo;
  - párpado sin brillo;
  - cejas de 5,4-6,2 a 3,0-3,6, más largas;
  - boca más arriba (cy+18u);
  - nuevo `strain` (`> <` + dientes).
  - Las caras siguen cambiando por pasos (ya era así).

## 3. Catálogo de peinados (silueta contra el borde de la cabeza)
- **Gorro/casco liso pegado al cráneo:** Ricks real, castaño oscuro, de borde a borde, apenas por encima del contorno.
- **Despeinado oscuro con picos:** "SIX MEN" / submarino. Silueta dentada que sobresale ~5-8 % por arriba, picos sueltos y sin brillo de color.
- **Barba y pelo como una sola masa marrón** que rodea la cara (barbudo de "THE FIRST").
- **Rizado pelirrojo** (Ricks real "who", chico de atrás).
- **Lo más importante:** a los personajes los distinguen sobre todo los **SOMBREROS** (gsPV "them apart": Beret / Ranger hat / Top hat). Se ven boina verde, gorra plana de rayas (tren), bombín, chistera, sombrero ranger, sombrerito con cinta (moño) y vincha de rayas (cocinero).
- **v4 mal:** no hay sombreros. El "messy" tiene una banda de brillo lila que Ricks no usa en el pelo oscuro.
- **v5:** sin cambios en el pelo (ya iba con la cabeza y simétrico). Los sombreros quedan pendientes.

## 4. Torso, ropa, enganche y curva de los brazos
- **Torso:** frijol o cápsula vertical.
  - Ricks real: angosto y alto, ~0,55-0,65 W de ancho y ~1,2-1,4 alturas de cabeza.
  - Clones: 0,65-0,85 W.
- **Ropa** con detalle real:
  - camisa a cuadros con botones blancos y cinturón de hebilla dorada;
  - chaleco con corbata;
  - tirantes rojos;
  - bufanda roja;
  - delantal verde.
- **Sin** credenciales, lanyards, cámaras ni plumas.
- **Brazos:** una línea de tinta uniforme (~4 % W) que sale del BORDE del torso, justo bajo la cabeza (~15-20 % de la altura del torso).
  - Siempre es un arco blando, sin codo marcado: `( )` cuando cuelgan hasta la cadera, U o "cactus" cuando suben (manos a la altura de los ojos, por fuera de la cabeza) y curva continua cuando agarran algo.
- **v4 mal:**
  - brazos con codo IK que en "hip" o "talk" formaban una V rígida y salían desde dentro del torso;
  - "up" ponía las manos sobre la cabeza;
  - correa con cámara (línea y cuadro negro) en el verde, credencial "ROSSI", lanyard, pluma del chaleco.
- **v5:**
  - arco cúbico que siempre se curva al menos el 22 % del tramo (máx(0,22·d, 0,07 HH, holgura·0,45)) y entra a la mano desde afuera;
  - hombro en el borde a 0,2 Th;
  - "up" en U hacia afuera;
  - ancho 4,2→4,0 % W;
  - se borró el código de correa, lanyard, credencial y pluma, y se quitó la credencial del elenco.

## 5. Manos
- Un punto negro redondo (~2,5-3× el grosor del brazo), sin dedos.
- Al agarrar (tenedor, cronómetro, martillo) el punto queda encima del mango y el brazo llega curvo.
- **v4/v5:** ya era punto. En v5 la curva del brazo llega a la mano sin quiebre.

## 6. Piernas y pies
- Dos líneas finas largas y casi rectas (~1,2-1,4 alturas de cabeza), con una curva leve en las rodillas al sentarse ("He just": rodillas arriba, piernas colgando). Pies: zapatos oscuros chicos.
- **v4/v5:** iguales (fideo con IK y zapatos). Está bien.

## 7. Grosor de tinta, sombreado y color
- **Tinta:** marrón muy oscuro, casi uniforme.
  - Ricks real: ~3-3,5 % W en la cabeza.
  - Clones: ~2-2,5 %.
- **Sombreado:** esfera suave con luz clave del set, franja pálida, sombra proyectada propia (pasada de sombra: "lo que ve el sol") y sombra de contacto.
- **Grade:** en general más oscuro y con niebla que nuestro banco.
- **v4 mal:** tinta de 4,6 % W con variación 3:1 (hasta ~7 % del lado pesado).
- **v5:** 3,6 % W con variación 0,3 (cabeza, torso y pelo).

## 8. Tiempos del idle y de los gestos
Medido por Creatorize (w2AM) y comprobado en los fotogramas f219-f232:
- Cada movimiento es una pose nueva: 60-70 % del movimiento en los primeros 4 cuadros y asentado al 100 % en el cuadro 10.
- No hay rebote ni motion blur, y no hay tween entre dibujos.
- Al detenerse, el personaje queda MUERTO QUIETO: nada de respiración ni balanceo, retenciones de hasta 2 s.
- Las caras cambian de golpe, sin intermedios.
- **v4 mal:**
  - respiración sinusoidal continua;
  - gestos al hablar con senos;
  - tilt de cabeza con seno;
  - transiciones de brazo con rebote (EZ.back) que terminaban EN la clave;
  - holds de 0,24 s con overshoot;
  - giros con EZ.io.
- **v5:**
  - `t3Snap` (67 % en 4 de 10 cuadros, 100 % a 0,33 s), medido con el código;
  - holds del torso de 1-2 s y de la cabeza de 0,7-1,6 s (0,4-0,9 s hablando);
  - las claves de brazo EMPIEZAN en la clave (sobre la palabra);
  - gestos al hablar por poses;
  - el cabeceo de cada beat salta, se mantiene 0,6 s y vuelve;
  - giros en 0,2 s;
  - respiración apagada (`T3.breathe = 0`).
  - Cabeza y cuerpo siguen con horarios independientes (pedido del usuario).

## 9. Caminar, sentarse y vistas de giro
- **Caminar:** de 3/4 y de lado, con piernas fideo que se cruzan y rebote mínimo.
- **Sentarse:** piernas colgando o rodillas arriba ("He just").
- **3/4:** el torso y la ropa giran (la corbata se corre).
- **Perfil:** la cabeza sigue redonda.
- **v5:** el sistema de vistas ya existía; el perfil queda sin nariz.

## 10. Sets, utilería, luz y grade
- **Sets:** 3D con texturas reales, muy densos. Ejemplos:
  - vías con balasto y cañón rojo;
  - submarino de acero remachado con válvulas y tuberías;
  - muelle al atardecer con bolardos;
  - jardín con glorieta y follaje;
  - porche con cajas "FRAGILE KITCHEN";
  - bar oscuro con lámparas;
  - prisión con puerta rosa, azulejos celestes y tubo fluorescente.
- **Utilería** en mano o en primer plano: cajas, sacos, barriles, martillo, tenedor, cometa, cronómetro.
- **Luz:** una clave fuerte con sombras proyectadas y relleno de color.
- **Post (9 efectos por cuadro, gsPV/lCaT):** luz del mundo, aire/niebla, haze, DOF, bloom, "screen", personajes encima, partículas (polvo flotando) y grade.
- **Primeros planos:** fondo muy desenfocado.
- **v4 mal:** fondo nítido en los primeros planos; banco brillante y saturado, sin niebla.
- **v5:** DOF por plano en toon-test:
  - primer plano: bgBlur 12;
  - plano medio: 8-9;
  - plano general: 3.
  - Niebla, haze y grade más oscuro siguen pendientes.

## 11. Cámara, DOF y ritmo de corte
- La cámara casi nunca está quieta: solo el ~4,5 % de los cuadros es fijo.
  - Movimientos: push-in, órbita y "whip" (barrido) que frena en seco. Recorrido del whip por cuadro: 49, 46, 39, ~25, ~8 px y luego 0.
- **Cortes:**
  - 45 planos en 63 s, uno nuevo cada ~1,4 s;
  - 37 de 40 cortes caen a ±50 ms del inicio de una palabra (mediana 28-39 ms, ~1 cuadro);
  - el insulto se corta antes;
  - el plano largo (2,7× el promedio) se guarda para el final.
- **Encuadre:** de lejos (cara = 20 % del ancho) a primer plano (77 %).
- **v5:** sin cambios de cámara en toon-test (pushes lentos). Pendiente.

## 12. Otros rasgos propios
- Subtítulos de 1-2 palabras: blancos, mayúscula gruesa, contorno negro, en el centro y abajo.
- Polvo o partículas flotando en el aire.
- Personajes del mismo kit de cara: los separan el pelo, el sombrero y la ropa.

## Pendientes (no resueltos en v5)
- Sombreros (boina, gorra de rayas, bombín, chistera, ranger).
- Torso de Ricks real más angosto (0,55-0,65 W) que nuestro "avg" (0,78 W).
- Set más oscuro con niebla, haze y partículas.
- Cámara con push, órbita y whip.
- El brillo de los ojos contradice los shorts: queda por la regla del usuario y se puede quitar.
