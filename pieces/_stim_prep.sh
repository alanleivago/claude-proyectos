#!/bin/bash
# prep pipeline for stimulus 5-11: transcribe -> refine -> pauses -> make_edit
cd "/f/Claude Proyectos/pieces"
for N in "$@"; do P=$(printf "stimulus-%02d-hf" $N); cd "$P"
  echo "=== $P"; python prep/transcribe.py "../../Ref videos Dariel/Stimulus/raw footage/$N.mp4" > prep/transcribe_out.txt 2>&1 || { echo FAIL transcribe; cd ..; continue; }
  cp prep/words.json prep/words_whisper.json; python prep/refine_words.py > prep/refine_out.txt 2>&1; python prep/pauses.py; python prep/make_edit.py; tail -1 prep/transcribe_out.txt | cut -c1-300; cd ..
done
