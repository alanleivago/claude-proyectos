# Kimodo on the Windows PC (NVIDIA GPU) -> BVH motions for zawdog

Text-to-motion with NVIDIA Kimodo on the PC. The results are pushed to git and then retargeted on the Mac in Blender.
The Spanish step-by-step guide for the whole PC setup is `para_pc/LEEME.md`, in the folder copied by USB. It is not in git and follows the same order as this file.

- **Model: `Kimodo-SOMA-SEED-v1.1` only.** It is under the NVIDIA Open Model License, which allows commercial use.
- **The RP models (`Kimodo-SOMA-RP-*`, `Kimodo-SMPLX-RP-v1`) are not used.** They are treated as research/R&D-only for this channel. The batch scripts refuse them.

---------------------------------------------------------------------------------------------------------------------
## Option A (main): the official full Kimodo (nv-tlabs/kimodo, CUDA, full LLM2Vec / Llama-3-8B-Instruct encoder)

This is the best quality: the full bf16 text encoder runs on the GPU. It needs Hugging Face gated access, but only once.

### A0. What you need
- **VRAM:** an NVIDIA GPU with a recent driver (`nvidia-smi` must work). The full GPU run needs **about 17 GB of VRAM**, most of it for the 8B text encoder.
- **Smaller card:** set `TEXT_ENCODER_DEVICE=cpu`. The GPU then needs **under 3 GB**, but the encoder runs in system RAM: plan for **32 GB of RAM** (16 GB is the bare minimum, and slow).
- **Build tools:** Git for Windows, Miniconda (Python 3.10), CMake and **Visual Studio 2022 Build Tools** ("Desktop development with C++"). `pip install` compiles a C++ extension.
- **Disk:** about 25 GB free for the Hugging Face cache.

### A1. Hugging Face account, gated Llama access, token
1. Create an account at https://huggingface.co (or log in).
2. Open https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct, fill in the form and accept the Meta Llama 3 licence ("request access"). **Wait for the approval e-mail** or the "You have been granted access" line on that page. It takes minutes to days, and nothing below works until then.
3. Open https://huggingface.co/nvidia/Kimodo-SOMA-SEED-v1.1 and accept the terms if a box appears.
4. Create a **Read** token at https://huggingface.co/settings/tokens/new?tokenType=read. Copy it.
5. On the PC, inside the env (step A2), run `huggingface-cli login` (or the newer `hf auth login`) and paste the token.
   **Never share the token, put it in the repo or send it in a chat.** It only lives in the PC's HF cache.

### A2. Install (Anaconda Prompt)
```bat
conda create -n kimodo python=3.10 -y
conda activate kimodo
pip install torch --index-url https://download.pytorch.org/whl/cu128
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
pip install --upgrade huggingface_hub
huggingface-cli login
pip install git+https://github.com/nv-tlabs/kimodo.git
```
- The `python -c` line must print `True`. If it doesn't, pick the CUDA wheel for your driver at https://pytorch.org/get-started/locally/.
- If the native build fails on Windows, the official fallback is Docker (`docker compose` in the kimodo repo).
- Low VRAM: run `set TEXT_ENCODER_DEVICE=cpu` in the same terminal before generating.

### A3. Smoke test (the first run downloads the weights into `%USERPROFILE%\.cache\huggingface`)
```bat
kimodo_gen "A man is startled and jumps back in fright." --model Kimodo-SOMA-SEED-v1.1 --duration 3.5 --output test --bvh
```
This writes `test.bvh`, on the 77-joint SOMA skeleton. Its main joints (Hips, Spine1, Spine2, Chest, Neck1/2, Head,
Left/RightShoulder, Arm, ForeArm, Hand, Left/RightLeg, Shin, Foot) have the same names `retarget.py` already maps, and
its rest pose is handled by the rest-independent retarget.

### A4. Batch: prompts.txt -> one BVH per prompt
- `styles/zawdog/motions/kimodo/prompts.txt` holds one `name | prompt | seconds` per line (`#` = comment).
- Script: `styles/zawdog/tools/kimodo_batch.py`. It loads the model once and uses the official API (`load_model`,
  `save_motion_bvh`). `--cli` is the fallback that calls `kimodo_gen --bvh` per prompt. It has not been run on a GPU
  here yet; if the API route errors, use `--cli`.
```bat
cd C:\claude-proyectos
git pull
conda activate kimodo
python styles\zawdog\tools\kimodo_batch.py
python styles\zawdog\tools\kimodo_batch.py --only startle_jump_back --seed 7
python styles\zawdog\tools\kimodo_batch.py --cli
```
The second line regenerates one clip with another seed; the third is the CLI fallback.
Output: `styles/zawdog/motions/kimodo/<name>.bvh` (the `.npz` files are git-ignored).
Tips: write short, literal prompts ("A person ..."), and try 2-3 seeds per clip.

---------------------------------------------------------------------------------------------------------------------
## Option B (fallback, no login): kimodo.cpp with the public GGUF weights

This is the route that already works on the Mac: kimodo.cpp (Apache-2.0) with the public `LocalAI-io/Llama-3-Kimodo-GGML`
encoder and `LocalAI-io/Kimodo-SOMA-SEED-v1.1-GGML`. You need no account, no token and no Llama request.
- **Backend:** kimodo.cpp has CPU and **Vulkan** backends but no CUDA. On an NVIDIA card it runs on the GPU through Vulkan; otherwise build it CPU-only (about 2 min per 3.5 s clip).
- **Quality:** the encoder is quantised (q8_0 / q4_k), so the result is slightly below option A.
- **Windows:** the Windows build is untested (the Mac build works).

1. Install Git, Python 3.11, CMake ≥ 3.25, Ninja, VS 2022 Build Tools (C++), the Vulkan SDK (vulkan.lunarg.com) and Blender 5.2.
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
   - CPU only: `-DKIMODO_ENABLE_VULKAN=OFF`.
   - Low memory: `--text-quantization q4_k` (what the Mac uses).
3. Batch, from the repo folder:
   ```bat
   py styles\zawdog\tools\kimodo_cpp_batch.py --kimodo C:\kimodo-cpp --blender "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
   ```
   This writes `styles/zawdog/motions/kimodo/<name>.bvh` (30 fps, 30-joint SOMA). It was tested on the Mac and produced `shrug_palms_up.bvh`.

---------------------------------------------------------------------------------------------------------------------
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
/Applications/Blender.app/Contents/MacOS/Blender -b -P styles/zawdog/tools/motion_check.py -- <action_name> pieces/<piece>/review/motion
```
- For standing gestures (shrug, point, facepalm), add `still=1 stance=0.12` to the first command.
- `retarget.py` writes `styles/zawdog/motions/baked/<action_name>.blend`.
- `motion_check.py` measures the real shoe vertices: floating, sinking and sliding.
- If a BVH uses joint names that are not mapped yet, add them to `MAPS["soma"]` in `retarget.py`.

## 6. Media that does NOT travel through git
All of it is physically copied into `para_pc/` at the repo root on the Mac (git-ignored, ~215 MB). Copy that folder to
the PC by USB or cloud and follow `para_pc/LEEME.md`: `robocopy` puts every file back at its repo path.

What it holds:
- the Bert Cole *16-Bit Starter Pack* (`.ogg`, "A Little R & R" and "Waiting");
- the zaw-dog voice WAVs and chosen SFX;
- the kit v3 SFX and mix;
- the `.blend` files (owner, baked actions, dog v2);
- the Kimodo GLB;
- the VoiceStudio reference audio (`voces_voicestudio/`).

The ignored patterns are `*.wav *.mp3 *.ogg *.mp4 *.blend *.glb`, `assets/`, `pieces/*/sound/out/`, `pieces/*/renders/`,
`*.gguf`, `*.safetensors` and `/para_pc/`. Generating BVH on the PC needs none of this; only the `.bvh` files go back through git.
