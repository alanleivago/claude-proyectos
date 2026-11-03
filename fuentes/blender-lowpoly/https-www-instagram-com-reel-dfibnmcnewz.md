# https://www.instagram.com/reel/DfIBNmCNewZ/

- Link: https://www.instagram.com/reel/DfIBNmCNewZ/
- Fecha: 2026-11-01
- Tema: blender-lowpoly

## De qué trata
El video muestra un flujo de trabajo para crear modelos 3D con estética PS1 (low poly de principios de los 2000) a partir de una sola foto, usando Claude para generar un script de Python y Blender para ejecutarlo. Está pensado para quien quiere ese look pero cree que el modelado 3D está fuera de su alcance. El resultado es un objeto low poly texturizado, con vértices que "tiemblan" como en la PS1, más un turntable y un loop idle renderizados. El ejemplo principal es una botella de Pepsi Blue.

## Pasos / método
1. **[00:12]** Conseguir una foto clara del objeto real. Es el único insumo: de ella salen la forma y la textura.
2. **[00:14]** Dársela a Claude y pedirle un modelo low poly estilo PS1 en Blender.
3. **[00:16]** Claude escribe un script de Python para Blender. En pantalla se ve una función que arma el modelo por "loft" a partir de metadatos de la imagen.
4. **[00:20]** Se ejecuta el script en Blender. Lee la silueta/forma de la foto y construye una malla simple.
5. **[00:24]** El script envuelve la foto sobre la malla como textura.
6. **[00:26]** Se reduce mucho la resolución de la textura, para el efecto pixelado.
7. **[00:28]** Se recortan los colores (paleta limitada), como tenían que hacer las consolas viejas.
8. **[00:30]** Se hace que los vértices tiemblen (jitter), típico de los modelos PS1.
9. **[00:33]** Se renderiza un turntable (giro del objeto) y un loop idle.
10. **[00:35]** Si algo sale mal (ej. una caja demasiado cuadrada), se lo explicás a Claude y corrige el script.
11. **[00:39]** Se repite con otros objetos: la botella de Heinz, la botella amarilla y personajes con disfraces de Halloween.

## Lo que se ve en pantalla
- **[00:00–00:12]** Resultado final: la botella de Pepsi Blue pixelada girando; la habitación de Halloween con carteles, luces naranjas y un esqueleto en estilo low poly (**[00:04–00:06]**).
- **[00:12]** La foto original de la botella, recortada sobre fondo negro.
- **[00:16–00:18]** Editor de texto de Blender (pestañas Texture Paint, Shading, Animation, Rendering, Compositing) con el código: `def loft_from_meta(meta, name=None):` que lee `rows`, `sides`, `cross`, `proj` y calcula `zmin`, `zmax` y el ancho/alto en píxeles (`w_px`, `h_px`) con las coordenadas `x0, x1, y0, y1`.
- **[00:20]** Viewport de Blender en Object Mode con la botella y un editor de imágenes abajo con el archivo "pepsi_blue_2004_…".
- **[00:22]** Malla en wireframe naranja (anillos y cortes verticales) sobre la botella: es un loft con pocas secciones.
- **[00:24]** La malla sin textura (gris), con la tapa azul.
- **[00:26–00:28]** Close-up de la botella de Heinz con texturas muy pixeladas y paleta reducida.
- **[00:30–00:34]** Botella amarilla en turntable.
- **[00:36–00:38]** Caja de Hershey's Swoops; se ve un lateral deformado/estrecho, ejemplo del error de proporciones.
- **[00:42]** Pantalla de selección de personaje "Select your player – Halloween Night 2001", con estadísticas Style/Flow/Vibe y tres jugadores disfrazados.
- **[00:44–00:48]** Llamado a comentar "BLENDER" para recibir la guía.

## Consejos y advertencias
- **[00:12]** Usar una foto clara del objeto real; la calidad de la foto condiciona el resultado.
- **[00:35]** Si la forma sale mal, no editar a mano: describirle el problema a Claude para que corrija el script.
- **[00:26–00:30]** El look PS1 depende de tres cosas: textura de baja resolución, paleta de colores reducida y jitter de vértices.
- **[00:36–00:38]** Las cajas pueden salir con proporciones incorrectas (el audio menciona "demasiado cuadrada").

## Lo que no queda claro
- No se muestra el prompt exacto que se le da a Claude ni el script completo; solo un fragmento de código.
- No se indican valores concretos (resolución de textura, cantidad de colores, intensidad del jitter, cantidad de polígonos).
- No se explica cómo se obtiene la silueta de la foto (si Claude la analiza o hace falta recortar el fondo antes); en pantalla las fotos ya están recortadas.
- No se detallan los ajustes del render, ni de la animación idle, ni el uso de versiones de Blender o de Claude.
- La guía completa solo se entrega comentando "Blender"; no está en el video.
- La transcripción dice "Doritos 3D" y "Sobi", pero en pantalla aparece una caja de Hershey's Swoops y una botella con texto parecido a "Sobe"; conviene verificarlo.
