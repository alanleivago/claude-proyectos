---
name: tesseract
description: Tesseract by Mirage (tsrct CLI 0.5.0 + 5 skills tesseract-*) instalado para editar talking heads / motion graphics
metadata:
  node_type: memory
  type: reference
  originSessionId: 180a3cfb-8b3b-49b6-b8ac-a71a3a85ca01
  modified: 2026-11-05T13:12:47.547Z
---

Instalado 2026-11-05 en este PC (Windows):
- CLI: `%LOCALAPPDATA%\Tesseract\bin\tsrct.cmd` (no está en PATH; desde bash: `cmd //c "$(cygpath -w "$LOCALAPPDATA/Tesseract/bin/tsrct.cmd")" ...`). Zip v0.5.0 windows-x86_64, SHA256 b4cbb7b0...6b77523 verificado.
- Skills globales: tesseract-video (editar footage, talking heads), tesseract-motion, tesseract-design, tesseract-3d, tesseract-editor (`npx skills add mirage-hq/Tesseract -g -a claude-code -s '*' -y --copy`).
- Telemetría del CLI viene activada (`tsrct telemetry disable` para apagarla).
- Licencia propietaria: gratis salvo empresas con ingresos ≥ US$1M/año.
- Proyecto `.tsrct` es autocontenido (empaqueta media y fuentes); entregar carpeta con .tsrct + mp4 + Previews/ + fuentes originales.
- Prueba OK: import-video + capa Video + rect → preview y export H.264/AAC 1080x1920 en 4 s.

## Trucos del motor (aprendidos en stimulus-01, 2026-11-05)
- Llamar `tsrct.exe` directo (`%LOCALAPPDATA%\Tesseract\public-cli\0.5.0-x86_64\bin\tsrct.exe`): el `.cmd` se rompe con rutas con espacios.
- Cursiva real: `skew: -17, skewAxis: -90, rotation: +17` (axis 0 no hace nada; sin la rotación el renglón se inclina).
- Export exige fuentes que resuelvan exacto: si una fuente falla "resolved only approximately", hacer copia con fontTools (nameID 2/4/6 con "Regular" y usWidthClass=5) y pasar `fontAssetId`.
- `--fps` solo entero (24 para material 23.976).
- Persona detrás de títulos: `applyFxVideoPersonCutout` (nativo, funciona); zoom en un Group que envuelve el video, no en el video.
- Voz: derivar `voice.wav` con ffmpeg (highpass+compresor+loudnorm+alimiter) y ponerla en capas Audio por plano; volumen del video None. Mezcla -15 LUFS / -2 dBTP.
- El helper de waveform del skill crashea en Windows (fontconfig): medir silencios con numpy.
