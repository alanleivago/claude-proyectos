#!/bin/zsh
# build.sh: the whole soundtrack, deterministic: design -> synth -> mix.py (stems, no master) -> combine (master + QA)
set -e
A=${0:A:h:h}; P=~/tools/earshot/.venv/bin/python
cd $A
$P -I tools/design.py
$P -I tools/synth.py work/synth.wav > /dev/null
$P -I tools/tube.py
$P -I ~/.claude/skills/real-sound/scripts/mix.py --root . --design sounddesign.json --no-master --out work/mix/premix.wav \
   --stems work/mix/stems --report work/mix/mix_report.json --cues-out work/mix/cues_sounded.json --trace work/mix/adds.json --cache work/cache | tail -4
$P -I tools/combine.py
