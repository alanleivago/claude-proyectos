---
name: kimodo-pc
description: Kimodo oficial (opción A) instalado en el PC Windows; cómo correr kimodo_batch.py para los movimientos de zawdog
metadata:
  node_type: memory
  type: reference
  originSessionId: fee78aff-f43d-47c1-a432-a0f21fe3abed
  modified: 2026-11-11T19:15:59.615Z
---

Kimodo oficial instalado el 2026-11-11 en el PC (RTX 3060 Ti 8 GB, 64 GB RAM).
- Entorno: `C:\Users\Alan Leiva\miniconda3\envs\kimodo\python.exe` (conda no está en el PATH).
- Correr: `TEXT_ENCODER_DEVICE=cpu HF_HUB_DISABLE_XET=1 <python> styles/zawdog/tools/kimodo_batch.py [--only nombre] [--seed N]`. Unos 15 s por clip. Salida: `styles/zawdog/motions/kimodo/*.bvh`; los `.npz` están en el gitignore.
- Login de HF guardado en `~/.cache/huggingface/token`. Modelos en la caché de HF: Kimodo-SOMA-SEED-v1.1, Llama-3-8B-Instruct y LLM2Vec mntp/supervised.
- Para reinstalar: CMake de winget no queda en el PATH (está en `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Kitware.CMake_*\...\bin`), y el pip de kimodo lo necesita.
- Avisos que no importan: el reporte de carga dice "MISSING lora", pero se verificó que el adaptador LLM2Vec sí se aplica. Si `xet` corta la descarga con "error decoding response body", usar `HF_HUB_DISABLE_XET=1`.
- La traslación del cuerpo en los BVH va en Hips, no en Root.

Relacionado: [[bitpix-series]] no; estilo zawdog → `styles/zawdog/STYLE.md`.
