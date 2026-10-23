---
name: ver-youtube
description: Mira uno o más videos de YouTube con Gemini (función oficial de video de la API, SDK google-genai) y guarda notas de aprendizaje en español en fuentes/[tema]/[titulo-del-video].md, con pasos y minutos, lo que se ve en pantalla, consejos y dudas. Usala siempre que el usuario pase links de YouTube y quiera aprender, estudiar, resumir, sacar notas, "ver" o investigar un tema a partir de esos videos, aunque no diga "ver-youtube".
---

# ver-youtube

Convierte videos de YouTube en notas de aprendizaje. Gemini mira el video (imagen + audio) directo desde el link; Claude no descarga nada.

## Entrada
- Uno o más links de YouTube (públicos: Gemini no puede ver privados ni no listados).
- Un tema. Si el usuario no lo dice, deducilo de su pedido o preguntá en una línea; define la carpeta `fuentes/<tema>/` y orienta las notas.

## Antes de correr
1. `python --version` y `python -c "import google.genai"`. Si falta Python o el SDK, **explicale al usuario cada paso antes de hacerlo** (qué se instala, de dónde y para qué) y después instalá: Python con `winget install Python.Python.3.12` (Windows), el SDK con `python -m pip install google-genai`.
2. La clave sale de `GEMINI_API_KEY` en el `.env` del proyecto (el script la busca desde la carpeta actual hacia arriba). Si no está, pedile al usuario que la agregue; nunca la muestres ni la copies a otros archivos.

## Ejecutar
Desde la raíz del proyecto (las notas quedan en `./fuentes/`):

```
python .claude/skills/ver-youtube/scripts/ver_youtube.py --tema "<tema>" <url1> <url2> ...
```

Opciones: `--force` rehace notas ya existentes (por defecto las saltea), `--model` cambia el modelo (default `gemini-3.8-flash`).

El script, por cada video: lee título y canal (oEmbed de YouTube), le pide a Gemini las notas con el formato de abajo usando `client.interactions.create` con `{"type": "video", "uri": url}` en modo `background=True` (sin eso la conexión se corta mientras Gemini procesa el video), y guarda `fuentes/<tema-slug>/<titulo-slug>.md` con encabezado (título, link, canal, fecha, tema). Un video que falla no frena a los demás.

Videos muy largos: el plan gratis permite ~8 h de YouTube por día; si da error de cuota o tamaño, avisale al usuario.

## Formato de las notas
Secciones: **De qué trata**, **Pasos / método** (con [MM:SS] cada uno), **Lo que se ve en pantalla** (herramientas, configuraciones, ejemplos), **Consejos y advertencias**, **Lo que no queda claro**. Son notas para aprender, no transcripción.

## Después
Leé cada `.md` generado y revisalo rápido: que tenga las cinco secciones, timestamps y que no sea una copia textual. Si una nota sale floja, rehacela con `--force`. Al usuario respondele con la lista de archivos creados (rutas) y una línea por video; no pegues las notas enteras.
