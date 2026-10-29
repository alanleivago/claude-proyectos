---
name: ver-youtube
description: Mira uno o más videos de YouTube con Claude por API (créditos mensuales del plan Max, no tokens del plan) bajándolos con yt-dlp, transcribiendo con Whisper local y analizando fotogramas, y guarda notas de aprendizaje en español en fuentes/[tema]/[titulo-del-video].md, con pasos y minutos, lo que se ve en pantalla, consejos y dudas. Usala siempre que el usuario pase links de YouTube y quiera aprender, estudiar, resumir, sacar notas, "ver" o investigar un tema a partir de esos videos, aunque no diga "ver-youtube".
---

# ver-youtube

Convierte videos de YouTube en notas de aprendizaje. El script baja el video, lo transcribe en local y le manda a Claude (API, con los créditos de $200/mes del plan Max) los fotogramas con timestamp + la transcripción. Así no se gastan tokens del plan de Claude Code: yo solo leo el `.md` final.

## Entrada
- Uno o más links de YouTube (públicos o no listados; yt-dlp no baja privados).
- Un tema. Si el usuario no lo dice, deducilo de su pedido o preguntá en una línea; define la carpeta `fuentes/<tema>/` y orienta las notas.

## Antes de correr
1. Requisitos: `yt-dlp`, `ffmpeg`, `node` en PATH; Python con `anthropic`, `faster-whisper` y `numpy`. Si falta algo, explicale al usuario qué se instala y para qué antes de instalarlo.
2. La clave sale de `ANTHROPIC_API_KEY` en el `.env` del proyecto (el script la busca desde la carpeta actual hacia arriba). Nunca la muestres ni la copies a otros archivos, y nunca la pongas como variable de entorno de Windows. Si da error de autenticación, la clave venció (dura 30 días): pedile al usuario una nueva de platform.claude.com → Claves y acceso.

## Ejecutar
Desde la raíz del proyecto (las notas quedan en `./fuentes/`):

```
python .claude/skills/ver-youtube/scripts/ver_youtube.py --tema "<tema>" <url1> <url2> ...
```

Opciones: `--force` rehace notas ya existentes (por defecto las saltea), `--model` cambia el modelo (default `claude-sonnet-5-5`; `claude-haiku-5-5` es más barato para videos largos).

Por cada video: lee título y canal (oEmbed), baja el video ≤720p, transcribe con Whisper `small` en CPU, saca hasta 60 fotogramas repartidos en el video y pide las notas a Claude. Imprime los tokens usados (un short de ~2 min ≈ 29k de entrada, unos $0.13 con Sonnet). Un video que falla no frena a los demás.

## Formato de las notas
Secciones: **De qué trata**, **Pasos / método** (con [MM:SS] cada uno), **Lo que se ve en pantalla** (herramientas, configuraciones, ejemplos), **Consejos y advertencias**, **Lo que no queda claro**. Son notas para aprender, no transcripción.

## Después
Revisá cada `.md` sin leerlo entero (por ejemplo `grep "^## "` para ver que estén las cinco secciones y los timestamps). Si una nota sale floja, rehacela con `--force`. Al usuario respondele con la lista de archivos creados (rutas) y una línea por video; no pegues las notas enteras.
