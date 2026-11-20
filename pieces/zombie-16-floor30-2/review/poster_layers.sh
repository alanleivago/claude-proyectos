#!/bin/zsh
# renders the poster layers: ./poster_layers.sh "extra query"
cd "$(dirname "$0")/../engine"
for l in bg ava hud; do rm -rf ../review/poster/_$l; node stills.mjs ../review/poster/_$l 0.5 --q "poster=1&layer=$l&$1" >/dev/null 2>&1; mv ../review/poster/_$l/f_0.50.png ../review/poster/l_$l.png; rmdir ../review/poster/_$l; done
