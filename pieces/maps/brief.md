---
type: brief
status: active
tags: [scroll3d, google-maps, traffic, scroll-engineer, remake]
relatedTo: [styles/scroll3d/STYLE.md, pieces/airtag]
---
# Cómo sabe Google Maps del tráfico — brief

**Style:** scroll3d, in the reference's light daytime world. **Format:** 9:16, 1080×1920, 30 fps, 162.46 s.
**Source:** Spanish remake of @scroll.engineer #3 (Google Maps traffic, 2026-10-08, 158.3 s; `Ref Scroll animations/3-maps.mp4`): 34 shots and their camera moves, re-timed through 88 line anchors (`ANCH`).
**Voice:** VoiceStudio "scroll 2 buena español", 16 paragraph takes with the "Veamos." trick, 49 lines 1:1 with the reference.

## Changes from the reference
- A Latin-American urban expressway: sand ground, white and terracotta blocks, palms (reference: round trees), yellow taxis among the cars.
- km/h everywhere (100 normal, 25 in the jam, 40 at midnight / rush hour); cyan phone dots (reference: blue); the street graph has its own layout with diagonal streets; ALTERBASE end tag.
- Labels: white text in a dark box (the user's white labels, readable on a light world).

## How the traffic works (code)
Cars are evenly spaced in travel time through a speed field (`vAt`), so where the field is slow they bunch up — the reference's "spacing = speed" for free. Verges are coloured per segment (`setVerges`). Routes come from Dijkstra on the graph (street 28 km/h, highway 75 km/h, ×3.2 when jammed).

## Sound
Documentary track (`Ref volt y amps/`), −4.5 dB, silent 1.15 s before "25 km/h", +3 dB on it; code SFX ×3.5; 23 recordings (`sound/layer.py`).

## Claims and sources
- Maps uses aggregate live location data and historical traffic patterns, blended by machine learning — [Google Maps 101 (Google blog)](https://blog.google/products/maps/google-maps-101-how-ai-helps-predict-traffic-and-determine-routes/), [MediaPost](https://www.mediapost.com/publications/article/355412/how-google-uses-artificial-intelligence-to-predict.html).
- The reference's "without cameras, road sensors or anyone reporting" softened to "sin necesitar…": Google also uses other sources (e.g. user reports), so it is not exclusive.
- Speeds, phone counts, the graph's km and minutes: illustrative (ILUSTRATIVO on screen).
