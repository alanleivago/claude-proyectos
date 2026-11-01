---
type: rules
status: active
tags: [youtube, miniaturas, thumbnails, packaging, zombie-channel]
relatedTo: [zombie-channel, youtube-skills]
---

# Reglas de miniaturas (para cada video)

Fuentes: tutorial de Aprilynne Alter (`give-me-9-minutes-ill-make-your-thumbnails-81-better.md`), skill `yt-package`, y la competencia en `competencia/` (30 oct 2026).

## Antes de diseñar
1. **Empezá por la pregunta y la emoción, no por "qué muestro".** Escribí en una línea qué se va a preguntar el espectador y qué va a sentir. Cada elemento tiene que servir a eso.
2. **Juntá 10–15 referencias** de outliers: videos que superaron la mediana de su propio canal (vistas ÷ mediana de los últimos 30). Sumá canales con el mismo formato en otra temática. Para cada una, anotá el mecanismo: qué pregunta abre y cómo lo logra.
3. **Título y miniatura son una sola unidad.** El texto de la miniatura nunca repite palabras del título. Pasalo por `python ~/.claude/skills/yt-package/title.py --title "..." --thumb "..."`.

## Composición
4. **Un solo sujeto obvio**, lo primero que se ve, grande y separado del fondo por color o luz. Si podés, que sea una cara con emoción o un monstruo enorme.
5. **Test del 50 %:** tapá la mitad de abajo. Lo de arriba (cara, texto) tiene que bastar para entender y querer bajar, porque la TV y algunos feeds cortan la parte inferior.
6. **Sin desorden:** todo lo que no trabaja para la miniatura, trabaja en contra. Recortá columnas, muebles y bordes aunque "estén en la escena".
7. **Máximo 3 palabras** (4 como techo), en mayúscula gruesa (Impact) con borde negro y sombra. Una palabra en rojo. Mejor un número, un nombre o una hora que un adjetivo.
8. **Contraste:** oscuro alrededor (viñeta) y el sujeto claro. Una sola tinta caliente (rojo) sobre una paleta fría.
9. **Comprobá a 320x180 y a 168x94.** Si el texto o la cara se vuelven una mancha, agrandá o quitá cosas.

## Lo que funciona en el nicho (datos)
- **NobodyGetsIn** (mediana 194 mil): los dos outliers (Supermercado 14x, Escuela 8x) son una **pantalla partida DAY 1 | DAY 30**: el mismo lugar cotidiano, calmo a la izquierda y de noche con **zombis pegados al cristal** a la derecha. Texto blanco y número en rojo arriba. Las versiones con el personaje enorme y el lugar poco visible, o con sello "PART N", rinden mucho menos (0.5–2x).
- **Beanie Survives / Day-by-Day:** primer plano del personaje con cara de miedo en el tercio derecho, contador enorme (DAY 365, 30 DAYS) a la izquierda y la horda detrás. Etiqueta roja pequeña.
- **Retro/PS1 horror** (refs del usuario: HawkesByte 10x su mediana, AlexPalex ~540x): **un solo monstruo low poly enorme**, sin cara humana, **marco de cámara REC/visor**, paleta oscura y monocroma con un color caliente, poco o nada de texto. Lo pixelado se muestra a propósito.
- **"Ghibli survival"** (Ghibli Arni 60x, Lily Tales 48x): interior acogedor con zombis en las ventanas y nada de texto. Funciona el contraste entre seguridad y amenaza.
- Nadie usa flechas ni círculos.

## Para Ava (estilo PS1 RE)
- **Ava de cuerpo entero en pose de heroína es SIEMPRE el sujeto principal** (pedido del usuario: su look es lo que atrae al canal). La pose sale de las portadas de RE (Jill/Claire): cuerpo entero o 3/4, algo de perfil, con la pistola negra apuntando, en guardia baja o alzada junto a la cara. Se ven las piernas, en una pose segura y nada explícita; siempre con su ropa de siempre. Ava ocupa el 50–60 % del alto de un lado del cuadro, con cámara baja y luz de contorno azul del cristal. La amenaza (Vickers, la horda, Ribbon) va detrás. Revisá cara y manos: que nada atraviese el cuerpo y que la pistola esté bien empuñada. Poses: `engine/thumb_post.js` (clip `pistol_ready` + brazos apuntados).
- Renderizá desde el motor del video, sin subtítulo ni HUD: `node engine/thumb.mjs <out> spec.json` (ver `pieces/zombie-03-station/largo/engine/thumb.mjs`, admite cámara propia). Después componé con `thumb_compose.py`.
- Hacé 3 conceptos para el Test & Compare de YouTube: (1) cara de Ava con la amenaza detrás, (2) el monstruo del episodio enorme en un marco CCTV/REC, (3) pantalla partida con hora o día.

## Ref NobodyGetsIn "30 Days Locked Inside a School" (2XYr2AEHDGI · 1,73 M vistas · canal de 52,5 mil · 8x su mediana)
Archivo: `competencia/ref_2XYr2AEHDGI/` (miniatura PNG 1280x720 + meta.tsv).
- **Pantalla partida 50/50** con un separador blanco grueso, apenas inclinado y de borde oscuro. Es el mismo lugar visto de la misma forma: antes y después.
- **Izquierda calma:** día, paleta pastel (verde agua y madera clara), poco contraste. El personaje está quieto y con cara neutra.
- **Derecha amenaza:** el mismo cuarto en gris azulado con bruma y viñeta. Hay zombis apretados contra la ventana de la puerta, una barricada de pupitres, el personaje asustado y un arma improvisada (el extintor).
- **Texto solo arriba** y centrado en cada mitad: "DAY 1" en crema y "DAY 30" en rojo anaranjado. Usa sans muy gruesa y redondeada, con contorno gris oscuro y sombra suave. No hay más texto grande.
- **El número es el gancho:** dos marcas de tiempo que muestran el cambio. El título repite la fórmula y la miniatura no la repite.
- El personaje queda en el **tercio inferior de cada mitad**, siempre con la misma ropa (gorra roja) y del mismo tamaño en las dos.
- No usa marco, brillo, flechas ni círculos. Es dibujo plano con línea fina, y lo único saturado es la gorra y el texto rojo.
- Para Ava: "9 PM | 3:14 AM", con el vestíbulo vacío y claro y Ava sonriendo a la izquierda, y de noche con la horda, Vickers, Ribbon y la pistola alzada a la derecha (`largo/miniatura_K1-K3.png`).
