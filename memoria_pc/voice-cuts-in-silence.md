---
name: voice-cuts-in-silence
description: Voice-over cuts must fall in silence between words, never inside a word or mid-phrase (all bitpix videos and later)
metadata:
  type: feedback
---

Never cut or separate a voice take in the middle of a word or while something is being said; cut only in the gaps/silences after a word ends. Applies to the birthday video and every video from now on (said 2026-10-14).

**Why:** the first split cut at whisper's estimated word starts minus 0.05s, which can land inside a word; the user heard it.
**How to apply:** use `styles/bitpix/tools/split_voice.py` (now cuts at the middle of the longest pause below −45 dBFS between lines, spells digits out before aligning, 8 ms fades, warns when no silence). After splitting, re-transcribe every line file and confirm each contains exactly its sentence before building. Related: [[bitpix-series]]

Also never split a phrase between lines ("sonic | boom", 2026-10-21): the cut window starts at the end of the previous line's last heard word — a plosive's closure (the silent start of a 'b'/'p') is not a pause.
