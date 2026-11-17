# UV Unwrapping + Texturing Characters! ✨ Blender 3D Character Modeling Tutorial - Part 7 [2024]

- Link: https://www.youtube.com/watch?v=pKOlyzXFf4U
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un episodio de la serie de modelado de personajes low poly en Blender (de Crashsune) centrado en el UV unwrapping. Explica qué es un UV, cómo se relaciona con las texturas y por qué conviene usar resoluciones potencia de 2. Después muestra cómo aplicar la textura de Love-chan a la cabeza y desenvolver las UV de la cara y la mandíbula con "Project from View". Está pensado para principiantes que ya tienen el modelo 3D terminado y quieren texturizarlo.

## Pasos / método
1. **[00:53]** Ubicar el UV en el flujo de trabajo: concepto (dibujo) → turnaround dibujado y coloreado como referencia → modelo 3D → UVs → texturas. Las UV se hacen con el modelo ya terminado o casi terminado.
2. **[02:26]** Entender la definición: UV unwrapping es aplanar la superficie del modelo 3D sobre una imagen 2D para poder aplicarle texturas correctamente.
3. **[03:35]** Superponer el mapa UV sobre la textura para ver cómo encajan las piezas (brazos, manos, cintura, nariz, mandíbula). Las UV superpuestas están bien en este estilo.
4. **[04:48]** Elegir un tamaño de textura potencia de 2 (1, 2, 4… 1024, 2048, 4096, 8192). Aquí se usa 1024x512; también sirven formatos cuadrados como 512x512 o 256x256. Motivo: cálculos más simples y mejor generación de mipmaps y filtrado en motores como Unreal y Unity.
5. **[06:43]** Texturizar de forma iterativa: primero colores planos de base, luego se añaden detalles (cintura, zapatos, brazos, luces y sombras del pelo, cara, sombreado de la chaqueta). Se va y viene entre el mapa UV y el programa de pintura.
6. **[09:54]** Descargar las texturas gratis desde el Patreon (enlace en la descripción): LoveChan-FaceTexture.png y LoveChan-BodyTexture.png.
7. **[10:28]** Seleccionar el modelo de cabeza y pelo, ir a Material Properties y pulsar New. Nombrar el material "LoveChanBody".
8. **[11:02]** Cambiar el shader de Principled BSDF a Emission (en el menú de Surface, atajo E).
9. **[11:19]** Cambiar el Timeline por el Shader Editor, agrandarlo y hacer zoom.
10. **[11:53]** Arrastrar y soltar la textura desde el explorador de archivos al Shader Editor y conectar su salida Color a la entrada Color del Emission.
11. **[12:44]** Pasar al workspace UV Editing, y con numpad 1 ir a la vista frontal ortográfica en el visor 3D de la derecha.
12. **[13:10]** Pulsar Z para pasar a modo Rendered. Se ve un desastre porque aún no hay UVs.
13. **[13:25]** Con el modelo seleccionado, entrar en Edit Mode (Tab) y seleccionar todas las caras de la cara.
14. **[13:55]** Pulsar U y elegir Project from View.
15. **[14:37]** En el UV Editor: A (seleccionar todo), G (mover) y S (escalar) hasta alinear la parte inferior de la nariz 3D con la nariz de la textura. Se ajusta la escala cuando queda demasiado grande.
16. **[15:19]** Volver a Object Mode para comprobar que la cara ya se ve bien.
17. **[15:24]** Seleccionar las caras bajo la mandíbula, U → Project from View, y en el UV Editor A, G y S para meterlas en la zona sombreada del pelo en la textura.
18. **[16:07]** Corregir un olvido: seleccionar también las caras de arriba y repetir Project from View y el movimiento a la zona sombreada. Al ser sombreado plano, se verá como se espera.

## Lo que se ve en pantalla
- **[04:48]** Textura de Love-chan de 1024x512 con una lista de potencias de 2 al costado, y una textura de caras de 1024x209.
- **[06:30]** Aviso en pantalla: la textura de la cara debería haber sido 1024x256 (era un error).
- **[05:39]** Ejemplos de otras texturas: 256x256 y 512x512.
- **[10:11]** Página de Patreon "Low-Poly Love-chan Textures (Free Download!)" con los dos archivos .png.
- **[10:45]** Panel de Material Properties con el botón New. En **[11:02]** el menú de shaders con Emission.
- **[11:53]** Carpeta de Windows (Gumroad_Bonuses > LowPoly_Love-chan > Textures) con LoveChan-BodyTexture.png de 1024 x 512 y otras texturas.
- **[12:10]** Nodo Image Texture conectado a Emission y Material Output. Con Shift + A aparece el menú Add (Search, Input, Texture, etc.).
- **[13:52]** Menú UV Mapping (U) con Unwrap, Smart UV Project, Lightmap Pack, Follow Active Quads, Cube/Cylinder/Sphere Projection, Project from View, Project from View (Bounds), Mark Seam, Clear Seam y Reset.
- **[14:42]** Alineación final de la cara en el UV Editor: ojos con corazones y sonrisa coinciden con el modelo en 3D.
- **[16:24]** Resultado: cara con textura correcta; pelo/mandíbula en zona sombreada.

## Consejos y advertencias
- **[00:29]** El UV no es tan difícil como parece; con una técnica simple se hace rápido.
- **[04:15]** Las UV superpuestas no son problema para este estilo.
- **[05:12]** No hay un tamaño único ideal, pero conviene mantenerse en potencias de 2, mezclando anchos y altos si hace falta (ej. 1024x512).
- **[07:41]** No se logra todo en el primer intento: empezar con colores planos, ver cómo queda en 3D y añadir detalle poco a poco.
- **[07:56]** Si una parte necesita más resolución, escalar sus UVs, repintar en el programa de dibujo, reexportar y revisar en Blender.
- **[04:48]** Photoshop no es obligatorio, sirve cualquier programa de pintura gratuito.
- **[11:42]** Arrastrar y soltar la imagen al Shader Editor es más rápido que usar Shift+A y Open.
- **[16:07]** Verificar que están seleccionadas todas las caras antes de hacer Project from View (el autor olvidó unas).

## Lo que no queda claro
- No se explica cómo deshacer o rehacer UVs en caso de error, ni cómo guardar o reexportar la textura desde el programa de dibujo.
- Nunca se muestra el ajuste de modo de viewport mencionado en **[13:46]** ("otro modo de sombreado" para ver las caras seleccionadas), solo se alterna visualmente.
- Se menciona de pasada que los cálculos de coordenadas UV son más simples con potencias de 2 sin detallar cómo.
- El resto del cuerpo (UVs) se deja para el siguiente video.
