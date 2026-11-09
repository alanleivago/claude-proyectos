---
type: reference
status: active
tags: [roblox, gneef, characters, hair, outfits, expressions]
relatedTo: [styles/roblox/STYLE.md]
---

# Gneef — peinados, atuendos y expresiones

Fuente: 15 shorts de Gneef (Ref roblox/Gneef), detalle en gneef-looks-per-video.md.

# Gneef-Style Roblox Avatar Kit: Replication Spec (three.js)

Sources: 15 per-video catalogs. Hex values are eyeballed from compressed frames, so use them as starting points. Where several videos disagree, I give the most common value.

---

## 0. Base rig and conventions

**Units.** Head = 1 unit. All sizes below are in head-units, with the head centred at the origin, face toward +Z, top at y=+0.5 and chin at y=-0.5.

| Part | Size (w×h×d) | Notes |
|---|---|---|
| Head | 1×1×1, rounded box (bevel ~0.12) | Flat decal plane on the +Z face. No nose or ears. |
| Torso | 2×2×1 | One box. |
| Arms / legs | 1×2×1 each | **R6-style: no elbow or knee joints.** Faking R15 by not bending anything is fine. |
| Boxy sleeves | 1.15×2×1.15 | Oversized-sweater gag. |

**Rendering tiers.** Support both and mix them in one scene, because the mismatch is part of the look.
- **Tier A "classic noob":** yellow skin `#F5CD30`, flat-colour torso and legs, thick-line faces.
- **Tier B "modern":** peach, orange or pink skin, textured clothing with wrinkle or knit normal maps, thin-line faces.

**Skin palette.** These are deliberately non-realistic colour choices.

| Name | Hex |
|---|---|
| Orange-tan (hero family) | `#E8893A` / `#F08A62` |
| Peach-orange | `#F4A878` |
| Pale peach | `#F3D9C2` |
| Salmon / pink | `#F0A0A0` |
| Classic yellow | `#F5CD30` |
| Porcelain white | `#EDEDED` |
| Deep brown | `#7A3E26` |
| Lavender porcelain (doll) | `#B9B4F0` |

**Materials.**
- Hair: flat-shaded `MeshStandardMaterial`, roughness 0.9, no strand detail.
- Skin: flat colour.
- Faces: transparent-PNG `CanvasTexture` at 256×256.
- Lighting (day, night and cold) is done with **scene lights and a colour grade, never by re-colouring textures**. See §4.

**Face-grid constants (256 px canvas).**
- Eye centres: (86,112) and (170,112).
- Brow line: y≈78.
- Mouth centre: (128,172).
- Stroke tiers:
  - S = 3–4 px (calm)
  - M = 6 px (acting)
  - H = 8–10 px (rage, scream, horror)
- Standard "dot" eye = filled circle, r≈8 (about 6% of face width).
- Line caps are round, and there are no gradients.

---

## 1. Hair library (top 15 by recurrence)

Hair is the loudest object on every character: **1.3–1.5× head width** is the default. Build each style as its own mesh group. Shard styles use `flatShading:true`, 3–4 radial-segment cones or wedges, and a darker under-layer copy scaled 0.92 and offset down 0.03.

| # | Style (frequency) | Build recipe | Colours |
|---|---|---|---|
| **H1** | **Shard mop**, the hero hair (≈15 of 17 videos) | **Cap:** half-ellipsoid r0.56, scaled (1.05, 0.9, 1.05), centred at y=0.1.<br>**Fringe:** 4 flattened cones (r0.14, h0.45, z-scale 0.4) hung from the front hairline (z=+0.52, y=0.3), tilted 10–25° sideways. They cover the top 30–40% of the face and end in 2–3 points over the eyes.<br>**Sides:** 2 cones per side (r0.1, h0.3) at x=±0.52, y=0.05, flicking outward 30°.<br>**Crown:** 3 cones (r0.12, h0.35) tilted back 15°, plus 1 taller ahoge (h0.45) left of centre. Two of them can read as "cat ears".<br>**Back:** 3 wedges ending in a single nape point at y=-0.4.<br>**Total:** 12–14 wedges, overall width 1.3×. | `#F07A1A`; under-layer `#C2410C` (under night tint it reads `#B8421A`) |
| **H2** | **Spike fan** (rival, noobs, red family) | Same cap, plus 6–8 cones (r0.16, h0.6–0.9) radiating back and up at 20–70° from vertical, and 2 ear-flare cones per side. Total height ≈1.4–1.5× head. Add a swoopy fringe lock curling over one eye. | red `#E0101A`, crimson `#C1121F`, orange `#FF8A1E` with tip `#FFB347`, silver `#B9B9C0` |
| **H3** | **Space buns with bobbles** (moms) | **Cap:** smooth, glossy sphere r0.54.<br>**Buns:** 2 spheres r0.3 at (±0.4, 0.55, -0.05).<br>**Bobbles:** 2 spheres r0.07 at the bun base.<br>**Bangs:** box 1.0×0.18×0.1 at y=0.38.<br>**Side curtains:** boxes 0.12×0.5 down to the ears.<br>**Ringlet:** an optional S-curl tube on one cheek. | orange `#E8620F` or red `#E0141E`; bobbles `#D81E1E` |
| **H4** | **Emo side-sweep** (villains, best friends) | Flat cap, plus a big fringe plane (0.7×0.5) angled 20° from the right crown down over the **left** eye. Add 3–4 thin spike cards (h0.25) on top and ragged nape tufts. | `#111` with maroon shadow `#4A0E14` |
| **H5** | **Mad-professor mane and beard** (old men, ≥4 videos) | **Mane:** lumpy cap of 5–7 spheres (r0.25–0.35) around the head, swept up and out, 1.5–1.6× width, flaring over the ears.<br>**Beard:** box 0.9×0.9×0.5 plus sphere clusters hanging to y≈-1.0 (mid-chest). Separate mesh.<br>**Moustache:** 2 upturned capsules. | `#D8D3E8`, `#CFC8DC`, `#E5E1DA` with grey shadow bands |
| **H6** | **Afro (± beanie)** | **Afro:** squashed sphere r0.8 (1.5–1.6× width, up to 2× on extras) at (0, 0.15, -0.1).<br>**Beanie:** half-sphere r0.58 plus a short-brim cylinder, perched on top with the afro bulging out below. | afro `#1A1210`; beanie denim `#3B5A8C` / blue `#2D4FA0` |
| **H7** | **Pompadour / quiff** | **Pompadour:** rounded box 1.0×0.5×1.1 on top, plus a half-torus rolling forward, 0.6× head height of volume. Add a forehead curl and long wispy side planes to below the ears.<br>**LEGO variant (hero "Captain Shine"):** one smooth chunky extruded piece with a temple curl and no spikes. | white `#F4F4F4` / grey `#C9C9CF`; brown `#3A2418` glossy; LEGO `#F5D400` |
| **H8** | **Pigtails with bobbles and choppy bangs** | **Pigtails:** 2 capsules (r0.22, h0.5) at (±0.6, 0.35) tilted outward 25°.<br>**Bobbles:** magenta spheres r0.08.<br>**Bangs:** 7–8 flat jagged strips, each 0.14 wide, tapering like cut paper. | `#F5C842`; bobbles `#E040A8` |
| **H9** | **Bob with band or bow** | Rounded box 1.15×1.0×1.15 down to the chin, with a flip at the ends and a side-swept fringe plane. Add a headband (thin torus or box) and a side bow (2 triangles). | `#111` or golden `#E8892B`; band `#E4208F` or black |
| **H10** | **Grandma swirl / cloud bun** | **Swirl:** 3 stacked tori shrinking in radius (spiral), ≈0.8 head-size, on a smooth cap.<br>**Cloud variant:** 8 spheres (r0.3) wrapping the head to 1.4× width. | `#E8E4DA`; lavender under night |
| **H11** | **Costume hood** (frog, dino, nightcap) | **Hood:** sphere r0.6 with a cheek-wide skirt.<br>**Eye bumps:** 2 white spheres r0.18 at (±0.25, 0.62, 0.2) with black pupils.<br>**Dino:** 7 white zigzag teeth along the rim, plus a snout.<br>**Nightcap:** cone h0.9 with diamond studs.<br>Short curly bangs peek out the front. | frog `#4CD13A`; dino `#2F9A4A`; nightcap `#2E8B3A` with white studs |
| **H12** | **Beanie with pom-pom, hair poking out** | **Beanie:** knit-textured half-sphere r0.58 with a rolled cuff (cylinder h0.18, r0.6).<br>**Pom:** sphere r0.2.<br>**Hair:** 3 small orange cones poking from the sides. | `#4A2A1E`, `#A8BFD6`; pom `#8A6A58` |
| **H13** | **Long wavy / ponytail with fox tufts** | Cap plus a back curtain (bent plane 1.2 wide, down to the shoulders y≈-0.9) with 2 wave kinks.<br>**Ahoge:** thin curved cone h0.3.<br>**Fox tufts:** 2 cones (r0.12, h0.3) at (±0.2, 0.55).<br>**Ponytail:** capsule. | blonde `#F5D547`; red `#B3121A`; magenta `#C01C8C` |
| **H14** | **Top-knot bun** | Cap plus a sphere r0.3 at y≈0.85, so it reads like a second head. Add side-swept bangs. | hot pink `#E040A8` |
| **H15** | **Bald with side tufts / helmet heads** | **Receding:** smooth head, 2 wing-shaped half-spheres (r0.18) at x=±0.5, y=0.1, plus a thick moustache plane at z=0.52 (0.7×0.15, handlebar droop).<br>**Guard helmet:** ellipsoid r0.62 ×1.1 in white, a black visor box 1.0×0.18, and one emissive red dot r0.05.<br>**Porcelain doll:** egg dome with ear nubs. | ginger `#C8561E`; helmet `#E8E6E3`, dot `#FF1A1A` |

**Hair rules.**
- A character's hair is one dominant hue.
- Two characters in the same story usually share the hue but get **opposite silhouettes** (shard spikes vs. smooth buns, spiky orange vs. smooth yellow).
- Hair swap must be a first-class feature: the "aged white hair on the same outfit" gag needs it.

---

## 2. Outfits and archetypes

### Texture assets to build once
- **Cable-knit (64×64 tile):** vertical rope columns plus 3–4 horizontal tonal bands. Normal or bump map. Reuse it on sweaters, beanies, beards and bedding.
- **Rib trim:** a separate coloured band for cuffs, hem and neckline.
- **Wrinkle tee:** a crumple normal map (grey tee, jeans, hospital gown).
- **Patterns:** gingham (12 px squares), Fair Isle zigzag, argyle, ditsy floral, pinstripe, rainbow-bunny pyjama tile.

### A. HERO, the "ginger kid" (≈every video)
Orange mop (H1) on orange-tan skin, so the head reads as one orange mass.

| Part | Spec |
|---|---|
| **Sweater (default)** | Cream `#EFE4D0`, ~4 beige bands, cable texture, round rib collar, **boxy oversized sleeves**, **orange rib cuffs and hem** `#F59A4E`. Hands are orange. |
| **Pants** | Plain brown `#6B4126` / `#5A3322`. |
| **Shoes** | White sneakers with orange or red sole stripe. |
| **Night tint** | The sweater reads lavender or blue; the cuffs go red or pink. |
| **Alt fit "Roblox default fit"** | Heather-grey crumpled tee `#A9A5AE` with a white neck ring, **teal track pants** `#0F7C73` with a white outer-leg stripe and satin sheen, chunky white soles. |
| **Prop swaps** | Hot dog, clipboard, party hat, wrist timer, chest plate or badge. |
| **Disguise** | Charcoal knit tactical vest with a raised collar covering the mouth. |

### B. Parents
- **Mom A, "Gingham mom":** red/white gingham top, white bib apron with crossed straps and a waist bow, red skirt, buns or red hair (H3 or H13). Skin salmon `#E89A84`. Face is the most detailed in the cast, with white-sclera eyes.
- **Mom B, "Cottagecore":** blue-purple mottled bolero `#4B3DA0` with a lace hem over a white blouse, and a navy ditsy-floral skirt.
- **Dad A, "Worker":** brown ribbed beanie, orange pom (H12), orange knit beard (separate mesh), hi-vis orange vest `#FF6A00` with a silver waist stripe over a brown Fair Isle sweater.
- **Dad B, "Moustache":** wide black moustache plane, white open-V shirt with black suspenders, or a ribbed tank top `#FF5A36`.
- **Grandma/neighbour:** H10, a dark-plum floral dress with a white ruffled collar, and a cardigan.

### C. Kids and friends
- **Best friend:** emo hair (H4), flat saturated blue tee `#1E6FE0`, navy pants, pink skin.
- **Noob (Tier A):** yellow skin; torso, legs and hair each one saturated primary (blue torso with lime legs, or red/red/yellow). The head wears a tiny hat or none.
- **Pyjama kids:** top in a pastel colour plus **identical** rainbow-bunny pants.
- **Fluorescent kids:** blue tee and plain pants.
- **School girl:** yellow shirt with a black headband.
- **Pigtail girl:** cream knit with a small floral print, blue overalls `#3E6FA8` (or shorts with a scalloped hem), pink bobbles.

### D. Heroes and powered characters
- **Captain Shine:** white torso, yellow chest circle at 40% torso width, yellow belt stripe, bare yellow arms, royal-blue pants `#1F4FD8`, short orange cape plane, gold sparkle particles.
- **Hammer-wielder:** black top, gold crenellated crown or collar with a fire gradient, red mane, giant yellow hammer at 1.5× avatar height.
- **Rival "HERO" kid:** flat orange tee, gold coin badge reading "★ HERO", spikier H2, yellow skin, ember particles on the hand.

### E. Villains and authority
- **Corporate villain:** black pinstripe suit, white flat shirt block, **red tie and red triangular pocket square** (every company character gets this accent), H7 white pompadour, egg head.
- **Professor/puppetmaster:** maroon jacket with a darker vest and 2 gold buttons, black pants, H5, wooden cuffs.
- **Griefer:** black high-collar hoodie with boxy cape shoulders, a purple ray-gun with a glowing pink orb and star sparkles, H4 hair with maroon tint.
- **Guards:** white helmet with a visor and red dot (H15), grey wool-knit torso with a dark plate vest, a dark-red arm band, 1.2× bulk, **faceless**.
- **Robot keepers:** box head of white cap + emissive band + grey block; band **cyan = friendly, red = hostile**; scale 1.3× head.
- **Conductor / cop / lifeguard:** peaked or captain's cap with a gold badge, black suit with red tie, gold star badge with chevrons, red top with a "SURFACE PATROL" patch and whistle.
- **Doll rig:** egg-shaped bald porcelain head, thin neck, long thin arms with skeletal fingers, ruffled collar and long pleated dress with a rust hem stain, a wind-up key in the back.
- **Monster / giant:** black flat-shaded silhouette (2× height) with two glowing pale-blue eyes, or a cluster of 40–60 slate-blue spheres with emissive slit eyes.

### F. Extras (crowd kit)
- **Mix-and-match** from 6 saturated tee colours × 3 pants colours × 10 hair styles × 4 hats (ranger, fedora, ushanka, cap).
- **Always include** one moustache guy, one afro, one bun, one noob, one old grey-haired man and one dark silhouette.
- **Crowd rule:** copy-paste dozens, but keep per-extra hair different (uniform outfits make it read as toys).

---

## 3. Face decal library (256×256, transparent PNG)

Coordinates use the face grid from §0. "Dot" = filled circle r8.

| # | Name | Drawing spec | Story moment |
|---|---|---|---|
| **F1** | **Deadpan dot** | 2 dots wide apart (x 78/178), no brows, mouth: 40 px short curve or dash (S). | Default narration, idle, "dazed" hero. |
| **F2** | **Sleepy calm** | Half-closed arc eyes (28 px wide, flat lower line) with a tiny white sparkle dot in each black iris. No brows. Thin U-smile 60 px with small corner ticks (S). | Calm intro, content sleep (arcs only). |
| **F3** | **Smug half-lid** | Black ovals 20×28 with a flat upper-lid line cutting the top third. L brow: thick short line slanted 20° down toward the nose. R brow: higher. Mouth: shallow "u", 50 px, lifted on one side (M). | Scheming, arms crossed, "I know something", meeting the crowd. |
| **F4** | **Teeth smirk (evil grin)** | V-brows (H, steep down-in). Small oval eyes. Mouth: oversized crescent, 55% face width, black outline, white teeth strip (4 columns), lower-lip curve. Cheek-tick marks. | Villain reveal, creepy mom at the party, boss "25". |
| **F5** | **Happy squint** | "^ ^" closed arcs (30 px, M). Mouth: wide open D, black or dark red fill, small red tongue, 70 px wide. Optional pink blush stripes. | Birthday, laughing, win, cheer. |
| **F6** | **Laugh with tongue** | Solid tall black ovals (18×30) with no highlight, one short tilted brow. D mouth 80 px with red interior, black outline. | Gags, excited, tricking someone. |
| **F7** | **Shock "o"** | Dots or ovals wide apart with white shine dot. Brows absent or lifted high. Tiny black "o" 18 px, offset slightly. | Reaction beat, discovery. |
| **F8** | **Oh-no red dot** | Large dots wide apart, no brows. Mouth: tiny circle (r10), **red fill, black outline**. | Realization, the hero seeing the trap. |
| **F9** | **Pleading / sad** | Big ovals with a large white glint and a white lower-sclera sliver (watery). Brows thin, slanted up in the middle, almost touching the eyes. Mouth: small "n" arc (M, 40 px). Tear creases under the eyes. Blush smudge. | Humiliation, lonely kid, begging. |
| **F10** | **Worried peek** | Dots, brows angled up in the middle (S), hidden or tiny mouth, optional sweat drop. | Hiding, whispering, "something's wrong". |
| **F11** | **Rage** | Narrow eyes under thick V-brows (H, 8–10 px) slanting hard to the nose, optional furrow line between them. Mouth: inverted-U or trapezoid, corners pulled down, thick dark lips, optional white teeth bar. Cheek furrows. | Bully, villain, mom's panic-fury. |
| **F12** | **Mega scream** | Eyes squeezed into ">  <" wedges (H). Mouth: tall rounded rectangle taking **45–55% of face height**, black outline, upper white teeth bar, pink tongue blob. Optional white sparkles. | Peak horror, flung into the air. |
| **F13** | **Googly terror** | 2 white circles r34 with thick black outline (M–H), tiny pupils off-centre, thick arched brows. Mouth: wobbly downturned trapezoid, teeth row, dark interior. Optional eye-bags (black crescents under the eyes) and heavy blush. | Mom's horror, doorway scare, "nervous grin" dad. |
| **F14** | **Strain / clenched** | ">" "<" squeezed eyes (H), short strain lines, wide trapezoid mouth with clenched white teeth and vertical dividers. Variant: eyes as "ᵔ", mouth as wavy "∽", puffed cheeks. | Headstand, holding breath, ageing "poof". |
| **F15** | **Shiver** | Half-lid eyes (flat lower line, heavy upper lid, short brow). Mouth: tiny "ω". Two big bracket arcs "( )" on the cheeks. Snowflakes overlaid. | Cold scenes only (one-off meme face). |
| **F16** | **Doll creepy** | Hollow black oval sockets with chipped rims (brown flecks), faint thin brown brows, big soft pink cheek circles `#E8508F` at 70% opacity with feathered edges, small nose bump with a dark chip, tiny glossy red lips `#D62B2B` with 2–3 white dots and thin black wing lines. Crown-to-eye black crack. | Horror close-ups. It **never animates**. |

**Rules.**
- Hero faces stay at S/M weight. Villains and side characters use M/H.
- Contrast the line weights (the hero is minimal, the side character overacts).
- Mom and grandma get white-sclera lashed eyes (2× the hero's eye size).
- Keep a shared eye and mouth grid so decals can swap without re-rigging.
- Overlay sprites (sweat, bubbles, tears, snow, sparkles) are separate from the base decal.

---

## 4. The "wild" rules: what makes it extreme and how to push it

1. **Hair is the loudest object.**
   - Default 1.3×, push to 1.5× for protagonists and 1.6× for old men and afros.
   - Spikes reach 1.4–1.5× head height.
   - Add one oversized secondary shape (bun, hood or topknot) so each character has a unique outline.
2. **One dominant hue per character.**
   - Mono-orange hero, mono-red family, mono-green frog, black and purple villain.
   - Same-hue skin, hair and cuffs make a flat colour mass, and the black decal does all the work.
   - Push by using non-realistic skin (pink, coral, yellow, white, orange).
3. **Complementary clash.** Orange against teal or cyan, yellow against royal blue, pink hair on a red car, and orange with lavender. Use primaries against pastel backgrounds.
4. **Texture contrast.**
   - Rich knit, wrinkle, lace and Fair Isle clothing sits next to flat shadeless faces and flat plastic hair.
   - Within a scene, keep **some characters flat and some textured**.
5. **Layering.** Rib cuffs, collars, aprons, vests over sweaters, chest badges and plates, pins on hats. Add 1–2 thin boxes or planes on top of the base torso.
6. **Face acting at extremes.**
   - Swing between dot-deadpan and mega-scream, and between tiny red-dot "o" and giant teeth.
   - Never use middle states.
   - Add a hero-vs-villain stroke contrast.
7. **Scale gags.**
   - Giant hammer (1.5×), 2× monster, sphere-cluster giants with tiny avatars beside them.
   - Oversized crown, mane and beach ball.
   - Heads fill the frame in close-ups.
   - Copy-paste crowds and marionettes (20+).
8. **Meme props.**
   - Hot dog, frog hat, noob, "STOP FOR CHILDREN" van, ban-hammer, lemonade stand, propeller beanie, newspaper headline.
   - Chest badges ("ORDINARY", "BANNED", "HERO") and chest plates (glowing counters, mint = safe, red = danger).
   - Neon wristbands (red vs. cyan as team code).
   - Wooden puppet cuffs.
   - A "+1" counter with translucent puff spheres (60% opacity, r0.4–0.7 head).
9. **Emissive spot colour.** Cyan or red visor bands, crystals, glowing eyes, golden strings. Use additive sprites plus bloom. One glow colour per scene.
10. **Lighting tells the story.**
    - Daylight base → blue-violet night multiply (~`#8A8CFF` plus a blue rim light), warm interior vs. cold snow, red kaiju grade, grayscale ending.
    - Recolour only per-part tints for special states (frozen hands `#B5B0E6`, icicles).
11. **Mix tiers.** Noob next to textured peach avatars, plus one odd rig per story (doll, mermaid tail, hood, puppet).
12. **Cute-creepy pairings.** Deadpan face with blush, hollow eyes with pink cheeks, a cosy sweater in a horror setting.

---

## 5. Checklist for every new video

1. **Identify the hero.** Orange H1, knit sweater, orange cuffs, brown pants, orange-tan skin. Note any outfit swap (grey tee and teal pants, disguise vest).
2. **Assign one dominant hue** to each of the 3–5 named characters. Check that no two share a hue and silhouette.
3. **Pick hair from H1–H15** for each. Is there a smooth vs. spiky pair? Does at least one hair exceed 1.5× width?
4. **Pick the rendering tier** (A noob or B textured) per character, and make sure at least one pair of each appears in a group shot.
5. **Textures:** list every pattern (knit, gingham, Fair Isle, floral, pinstripe), assign it to a flat or textured material, and add rib trim and layered extras.
6. **Face set:** choose 5–8 of F1–F16 for the hero. Give each villain or side character one overacting face with heavier stroke. Add overlay sprites (sweat, tears, blush, bubbles).
7. **One odd rig or prop gag** (tail, hood, doll, monster, giant hammer, counter plate, wristband).
8. **Crowd:** decide the extras (≥1 afro, bun, moustache, noob, elder) and the duplication count.
9. **Emissive colour** for the scene: one colour, with friendly vs. hostile variants.
10. **Lighting grade** per scene (day, night, cold, interior, villain red). Apply with lights, not textures.
11. **Scale pass:** give at least one thing 1.5× or larger (hair, prop, monster, head in close-up).
12. **Text props:** signs, banners, badges and newspapers in bold black or white caps with a thick outline.
13. **Open questions:** mark anything the frames didn't resolve (e.g. "?") so it can be corrected from clearer frames.
