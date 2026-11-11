# Kimodo on the Windows PC (NVIDIA GPU) -> BVH motions for zawdog

Text-to-motion with NVIDIA Kimodo on the PC, results pushed to git, then retargeted on the Mac in Blender. Option A (kimodo.cpp, public weights, no login) first; Option B is the official Python repo.
Spanish step-by-step for the whole PC setup (folder `para_pc/`, copied by USB): `para_pc/LEEME.md` (not in git; same content summarised here).

Model: **Kimodo-SOMA-SEED-v1.1** (NVIDIA Open Model License, commercial use OK).
**Never use `Kimodo-SMPLX-RP-v1`**: NVIDIA Internal R&D licence, no commercial or production use. The batch script refuses SMPL-X names.
(Kimodo-SOMA-RP-v1.1/v1.2 are also Open Model License and better quality, since they were trained on 700 h vs 288 h. Use `--model Kimodo-SOMA-RP-v1.2` if you want them.)

## Option A (recommended): kimodo.cpp, NO Hugging Face login

The same route that already works on the Mac: kimodo.cpp (Apache-2.0) with the **public** GGUF weights on Hugging Face
(`LocalAI-io/Llama-3-Kimodo-GGML` text encoder + `LocalAI-io/Kimodo-SOMA-SEED-v1.1-GGML` motion model). No account, no
token, no gated Llama request. kimodo.cpp has a CPU and a **Vulkan** backend (no CUDA backend): on an NVIDIA card Vulkan
runs on the GPU through the normal NVIDIA driver; if Vulkan fails, build CPU-only (still ~2 min per 3.5 s clip).
The Windows build is not tested here (the Mac build is): if a step fails, use Option B.

1. Install: Git, Python 3.11 (tick "Add to PATH"), CMake ≥ 3.25, Ninja, **Visual Studio 2022 Build Tools** with
   "Desktop development with C++" (latest MSVC, C++23), the **Vulkan SDK** (LunarG, vulkan.lunarg.com) and Blender 5.2.
2. In the **x64 Native Tools Command Prompt for VS 2022**:
   ```bat
   cd C:\
   git clone --recursive https://github.com/localai-org/kimodo.cpp kimodo-cpp
   cd kimodo-cpp
   py -m venv venv && venv\Scripts\pip install huggingface_hub
   venv\Scripts\python scripts\download_gguf_weights.py --output . --model soma-seed-v1.1 --text-quantization q8_0
   cmake -S . -B build\release -G Ninja -DCMAKE_BUILD_TYPE=Release -DKIMODO_BUILD_TESTS=OFF -DKIMODO_ENABLE_VULKAN=ON
   cmake --build build\release
   ```
   (CPU only: `-DKIMODO_ENABLE_VULKAN=OFF`. Low on RAM/VRAM: `--text-quantization q4_k`, what the Mac uses. Use
   `download_gguf_weights.py`, not the `.sh`.)
3. Batch, from the repo folder:
   ```bat
   cd C:\ruta\claude-proyectos
   py styles\zawdog\tools\kimodo_cpp_batch.py --kimodo C:\kimodo-cpp --blender "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
   ```
   It reads `styles/zawdog/motions/kimodo/prompts.txt` (`name | prompt | seconds`), runs `kmd-generate` per prompt
   (SOMA-SEED only, it refuses RP/SMPL-X) and converts each result with `tools/kimodo_cpp_to_bvh.py` into
   `styles/zawdog/motions/kimodo/<name>.bvh` (30 fps, the 30-joint skeleton `retarget.py` already knows). Then section 5.

## Option B: the official nv-tlabs/kimodo (Python + CUDA, needs Hugging Face gated access)

## 0. What you need

- NVIDIA GPU. The full GPU run needs about 17 GB of VRAM, mostly for the Llama-3-8B text encoder. On a smaller card, set `TEXT_ENCODER_DEVICE=cpu` so the encoder runs on the CPU and the GPU needs under 3 GB. It's slower, and it needs about 16 GB+ of system RAM.
- Recent NVIDIA driver (`nvidia-smi` works in a terminal).
- Git for Windows, Miniconda (or Python 3.10 + venv), **CMake** and **Visual Studio 2022 Build Tools ("Desktop development with C++")**. `pip install` compiles the bundled `MotionCorrection` C++ extension (pybind11, via CMake), so it fails without these.
- About 25 GB free disk space for the Hugging Face cache (Llama 3 8B + Kimodo checkpoint).

## 1. Hugging Face account, gated Llama access, token

1. Create or log in to an account at https://huggingface.co.
2. Open https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct and request access (accept the Meta Llama 3 licence). Approval is manual and can take minutes to days. **Wait for the approval e-mail** or "You have been granted access" on the page. Nothing below works until then.
3. Open https://huggingface.co/nvidia/Kimodo-SOMA-SEED-v1.1. If it shows a licence or terms box, accept it.
4. Create a **Read** token: https://huggingface.co/settings/tokens/new?tokenType=read
5. Log in from the terminal (this happens in step 2 below, inside the env): `hf auth login` and paste the token. Never commit the token or put it in the repo.

## 2. Install (Anaconda Prompt or PowerShell)

These steps follow the official docs (`docs/source/getting_started/installation*.md`), which say Python 3.10 and PyTorch >= 2.0.

```bat
conda create -n kimodo python=3.10 -y
conda activate kimodo

:: PyTorch with CUDA. Pick the CUDA line for your driver at https://pytorch.org/get-started/locally/
pip install torch --index-url https://download.pytorch.org/whl/cu128

python -c "import torch; print(torch.__version__, torch.cuda.is_available())"   :: must print True

pip install --upgrade huggingface_hub
hf auth login

:: Kimodo (package install, CLI only; add [all] only if you want the web demo)
pip install git+https://github.com/nv-tlabs/kimodo.git
```

Source-install alternative: `git clone https://github.com/nv-tlabs/kimodo.git && cd kimodo && pip install -e .`
If the native build fails on Windows, the official fallback is Docker (`docker compose` in the kimodo repo, see `installation_docker.md`).

Low VRAM (under ~17 GB): run this in the same terminal before generating:
```bat
set TEXT_ENCODER_DEVICE=cpu
```

## 3. Smoke test (downloads the weights on first run)

The checkpoint and the text encoder download automatically into the HF cache (`%USERPROFILE%\.cache\huggingface`) the first time you run it.

```bat
kimodo_gen "A man is startled and jumps back in fright." --model Kimodo-SOMA-SEED-v1.1 --duration 3.5 --output test --bvh
```

This should write `test.npz` and `test.bvh`. `--bvh` is the official SOMA BVH export (77-joint SOMA skeleton, BONES-SEED rest pose). Add `--bvh_standard_tpose` for a standard T-pose rest pose.

## 4. Batch: prompts.txt -> one BVH per prompt

- Prompts: `styles/zawdog/motions/kimodo/prompts.txt`, one `name | prompt | seconds` per line, `#` = comment.
- Script: `styles/zawdog/tools/kimodo_batch.py`

From the repo root, with the env active:

```bat
cd C:\path\to\claude-proyectos
git pull
python styles\zawdog\tools\kimodo_batch.py
:: options: --only wave_hello facepalm   --seed 7   --steps 100   --standard_tpose   --model Kimodo-SOMA-RP-v1.2
```

The script loads the model once and calls the same functions as the official `kimodo/scripts/generate.py`: `kimodo.load_model`, `model(...)`, `kimodo.skeleton.global_rots_to_local_rots` and `kimodo.exports.bvh.save_motion_bvh`. It writes `styles/zawdog/motions/kimodo/<name>.bvh` (+ `<name>.npz`, which is git-ignored). I checked these names against the repo source but haven't run the script on a GPU yet. If the API route errors, use the CLI route. It calls `kimodo_gen ... --bvh` once per prompt and reloads the model each time:

```bat
python styles\zawdog\tools\kimodo_batch.py --cli
```

To make the CLI route faster, start `kimodo_textencoder` in a second terminal first so the text encoder stays loaded between calls.

Tips: write short, literal prompts in the style "A person ...". Read the official best-practices page (https://research.nvidia.com/labs/sil/projects/kimodo/docs/key_concepts/limitations.html). Try 2-3 seeds and keep the best.

## 5. Send the results back to the Mac

On the PC:
```bat
git add styles/zawdog/motions/kimodo/*.bvh
git commit -m "zawdog: kimodo motions"
git push
```

On the Mac:
```sh
cd ~/claude-proyectos && git pull
/Applications/Blender.app/Contents/MacOS/Blender -b -P styles/zawdog/tools/retarget.py -- styles/zawdog/motions/kimodo/<name>.bvh <action_name>
# standing gestures (shrug, point, facepalm): add  still=1 stance=0.12   (both feet stay planted, normal stance width)
/Applications/Blender.app/Contents/MacOS/Blender -b -P styles/zawdog/tools/motion_check.py -- <action_name> pieces/<piece>/review/motion
```
`retarget.py` writes `styles/zawdog/motions/baked/<action_name>.blend` (one Action for any kit v3 human) and a `.json`
with contacts and foot QA; `motion_check.py` renders a strip and measures the real shoe vertices (floating, sinking,
sliding). It auto-detects the skeleton by joint names: CMU, 100STYLE and the 30-joint SOMA skeleton from kimodo.cpp
(Hips, Spine1, Spine2, Chest, Neck1, Neck2, Head, Left/RightArm, ForeArm, Hand, Left/RightLeg, Shin, Foot). The official
Python Kimodo exports the 77-joint SOMA skeleton: if its BVH uses other joint names, add them to `MAPS["soma"]` in
`retarget.py` (one line per joint) the first time.

## 6. Media that does NOT travel through git

All of it is physically copied into `para_pc/` at the repo root on the Mac (git-ignored, ~215 MB): copy that folder to the PC by USB / cloud and follow `para_pc/LEEME.md` (it puts every file back at its repo path).

The repo's `.gitignore` excludes all audio/video and some assets. The relevant patterns are:

- `*.wav`, `*.mp3`, `*.flac`, `*.aif`, `*.aiff`, `*.ogg`, `*.mp4`, `*.mov`, `*.webm`
- `assets/` (any folder named assets, which includes the Bert Cole music folders)
- `*.blend`, `*.blend1`, `*.glb`
- `pieces/*/sound/out/`, `pieces/*/renders/`, `pieces/*/frames/`
- new: `*.gguf`, `*.safetensors`, `/kimodo-cpp/`, `/kimodo/`, `/checkpoints/`, `styles/zawdog/motions/kimodo/*.npz`

So if the PC is also going to edit or mix videos, copy these by **USB or cloud drive** (not git):

- **Bert Cole BGM** (16-Bit Starter Pack, `.ogg`, ~133 MB, the same copy sits in 4 places):
  `pieces/lps-onoda/audio/assets/music/bertcole/16-Bit Starter Pack/` (this is the one zawdog uses: `pieces/zaw-dog-05/sound/mix_zaw.py` reads `.../Various Themes/A Little R & R.ogg`; "Waiting.ogg" is in the same folder). Copies also live in `pieces/lps-own-face/`, `pieces/lps-blind/` and `pieces/lps-erfurt/` under `audio/assets/music/bertcole/`.
- **VoiceStudio voice takes**: `pieces/zaw-dog-0N/voice/*.wav` and `pieces/zaw-dog-0N/voice/takes/`
- **Chosen SFX** (Freesound mp3): `pieces/zaw-dog-0N/sound/chosen*/`, `pieces/zaw-dog-0N/sound/fs/`
- **Mix stems**: `pieces/zaw-dog-0N/sound/out/`
- **Blender scenes / GLBs**: every `*.blend` / `*.glb` in `pieces/zaw-dog-*` and `styles/zawdog/motions/kimodo/*.glb`

The Kimodo BVH generation on the PC needs none of these. Only the `.bvh` files go back through git.
