---
type: note
status: active
tags: [lowpolyshorts, expresiones, referencias]
relatedTo: [fuentes/lowpolyshorts-style/especificacion-tecnica-del-estilo.md]
---
# Expresiones en Low Poly Shorts (4 refs, análisis por API)

# Expresiones faciales en Low Poly Shorts (4 vídeos)

**Advertencia previa:** en este canal la expresión humana casi no se anima. Las caras son fotos con aspecto realista y un gesto fijo por plano. Lo "expresivo" viene sobre todo de los props y overlays (venas, tinte de color, ojos pixelados), no de la cara.

## 1. Catálogo de expresiones

| # | Expresión | Frames | Ojos / cejas / boca / extras | Exageración | Momento narrativo |
|---|---|---|---|---|---|
| 1 | **Ojos borrados / vacío** (viejo calvo) | S3HE_001–006 | Ojos casi eliminados: borrones claros sin iris ni pupila. Cejas planas y caídas. Boca fina, recta, ligeramente hacia abajo. Arrugas marcadas y puntitos blancos de brillo en mejillas y frente. | Media. Es una textura sin ojos, casi inquietante, pero sin gesto. | "Tomaron cientos de miles de células cerebrales…" Es el sujeto pasivo con el cerebro abierto. |
| 2 | **Severo / deadpan culpable** (mismo viejo, chaqueta roja) | WIbd_016–019 | Ojos abiertos, iris gris-azul pequeño, mirada directa a cámara. Cejas bajas y rectas. Boca plana con labios apretados y comisuras apenas caídas. | Ninguna. Es realista. | "Y acabas de comprarte un billete gratis a la cárcel". Con el mono naranja y tras los barrotes (018–019) la cara **no cambia**: el humor está en la contradicción. |
| 3 | **Concentrado / profesional** (veterinario, gafas, mono amarillo) | v-wf_001, 003–004, 014–016, 025–027 | Ojos abiertos y atentos, mirando a la tarea o a cámara. Cejas neutras. Boca cerrada (026: apenas entreabierta). Gafas. | Ninguna. | Cortar el costado de la vaca, abrir la tapa, sacar la bacteria, alimentar a la vaca. |
| 4 | **Neutro de testigo** | WIbd_020 (policía, brazos cruzados, mira de lado al láser); WIbd_022–025 (pilotos de perfil, labios cerrados) | Mirada fija hacia el objeto. Boca cerrada. | Ninguna. | Fondo de la escena: "los pilotos dentro". |
| 5 | **Cansado / caído** (chaleco verde, WIbd_028–031) | WIbd_028–031 | Cabeza gacha y ojos pequeños hundidos bajo la ceja. Cara demacrada y boca cerrada algo triste. El cuerpo encorvado hace parte del gesto. | Baja-media, vía postura. | "Alguien con chaleco reflectante", el personaje que no brilla. |
| 6 | **Deslumbrado / ojo entrecerrado** (piloto, primer plano extremo) | WIbd_050–051 | Solo un ojo enorme, muy pixelado y teñido de verde láser. Párpados naranja-rojizos casi cerrados, pupila diminuta. | Alta. Primer plano, tinte saturado y píxeles gigantes. | "Esto ciega al piloto". |
| 7 | **Peces: ojo vivo → ojo muerto** (no humano) | RPp_007–014 (ojo grande blanco con pupila negra, cejas inexistentes, boca pegada a la hembra), RPp_022 (ojo negro-blanco), RPp_023 (ojo azul pálido, pupila pequeña, boca de dientes abierta con lengua roja), RPp_024–026 (ojo nublado azul-gris), RPp_032–034 (pez gris pálido, ojo vacío, sonrisa de dientes) | Pasa de ojo brillante a ojo lechoso y sin pupila. La boca queda abierta con una "sonrisa" de dientes. | **Es la única animación expresiva real**: alta, macabra pero cómica. | "Sus ojos se desvanecen… ya no necesita comer ni ver". |
| 8 | **Monitor "AI" feliz → derrotado** | S3HE_046 (texto "AI" verde, manos saludando); S3HE_052–054 (ojos "X X" y boca "︵" verde sobre pantalla) | Cara de píxeles verdes sobre CRT. | Cartoon total, pero es una pantalla, no una cara humana. | El humano (cerebro) le gana a la IA. |

Las vacas (v-wf_028–031, 036–037) tienen párpados semicaídos y el hocico claro. Cuando la vaca enferma se cura, la cara no cambia; solo cambian los órganos en los cortes interiores.

## 2. Frecuencia y estilo
- **Cambia por plano, casi nunca dentro de un plano.** Cada personaje tiene una textura facial fija. Las excepciones son el pez (021→023 hace un crossfade de ojo), el monitor (051→052) y los tintes (WIbd_044–049, verde sobre toda la cabina).
- Cada plano dura unos 1,3–1,5 s, un par de frames por subtítulo.
- **Estilo realista y deadpan**: fotos de caras sin deformar. El efecto cómico sale del contraste entre cara impasible y situación absurda, no de la mueca.
- Las exageraciones (venas rojas, ojos pixelados, lengua, tinte verde) son capas gráficas externas.

## 3. Patrones recurrentes
- **Ninguna expresión de sorpresa, asco, burla o confusión.** Casi todas las emociones se resuelven con la cara neutra y el color, la cámara o el prop.
- **Culpa / consecuencias:** cara severa fija (2).
- **Víctima pasiva o experimento:** ojos vacíos (1) o ojo que se apaga (7).
- **Dolor o daño sensorial:** primer plano de ojo con tinte y píxeles (6).
- **Trabajo / explicación técnica:** cara concentrada de perfil (3, 4).
- **Cansancio / marginal:** postura caída (5).
- **Humor visual de "derrota":** emoji con "X X" (8).

## 4. Texturas nuevas para el personaje anime PS1 (pelo negro, ojos grandes)
Textura sugerida de 64×64 px de cara, paleta limitada, sin antialias. Todas mantienen el principio del canal: **cara casi impasible y un detalle inquietante**.

1. **Deadpan base.** Ojos grandes ovalados con iris oscuro, pupila ancha de 2 px y un brillo blanco en cada ojo. Cejas rectas horizontales de 1 px a media altura. Boca línea recta de 6 px, sin comisuras. Sin extras.
2. **Ojos borrados.** Sustituye los ojos por óvalos gris-crema sin iris, con un degradado más oscuro arriba. Un par de píxeles blancos de brillo en las mejillas. Cejas planas y bajas. Boca recta finísima con las comisuras 1 px hacia abajo.
3. **Severo / "te pillaron".** Ojos medio abiertos (párpado superior plano que tapa el tercio superior del iris). Pupilas pequeñas centradas. Cejas muy bajas y oblicuas hacia el centro, 1 px más gruesas. Boca recta con labios apretados y comisuras hacia abajo. Una raya de arruga bajo cada ojo.
4. **Concentrado.** Ojos abiertos normales con pupila mirando a un lado (3/4). Cejas ligeramente fruncidas, una 1 px más baja. Boca cerrada con una leve línea corta de 1 px a un lado, y un pequeño reflejo de gafas opcional (rectángulos claros).
5. **Agotado / sombra.** Párpados caídos a media altura, iris pequeño apuntando abajo. Dos bolsas de 2–3 px bajo cada ojo en tono marrón-violeta. Cejas inclinadas hacia afuera-abajo. Boca recta algo hundida.
6. **Deslumbrado.** Ojo estrecho como una raya de 2 px con pupila de 1 px verdosa y párpados rojo-naranja alrededor. Pestañas oscuras apretadas. Se tiñe toda la cara con una capa verde. Cejas bajas y muy juntas. Boca ligeramente abierta (3 px), con una gota de sudor en la sien.
7. **Apagándose.** Ojos de color azul-gris pálido con pupila de 1 px y una esclerótica "lechosa" que cubre el iris con píxeles dispersos. Cejas relajadas, caídas. Boca entreabierta con 3–4 dientes blancos y una línea roja de lengua. Es la versión anime del pez RPp_023.
8. **Extra (extrapolada, no vista en el canal): "deadpan roto".** Tras el plano deadpan, ojos totalmente blancos y redondos con pupilas diminutas de 1 px, cejas altas rectas y boca en O pequeña de 3×4 px, con una gota fría. Funciona como golpe de efecto, al estilo del cambio del monitor "AI" a "X X".