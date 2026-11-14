# Storyboard v1 del ep8: 25 fotogramas del motor (review/sb/f_*.png, orden = stills_ids) + fila de props (foto vs lowpoly) + animales.
import glob, os
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); P = H + "/.."
files = sorted(glob.glob(H + "/sb/f_*.png"), key=lambda f: float(os.path.basename(f)[2:-4]))
CAP = ["1 THE ALERT - cocina 6:42, Ava con el telefono", "1 alerta: ZOMBIE OUTBREAK DAY 1", "1 grua sobre la granja + 40 MI TO TOWN", "1 Ava en el porche, guino 'best places'",
 "2 tarjeta RE: 7:05 AM DON'T GO TO TOWN", "2 mapa: carreteras llenas hacia TOWN", "2 YOU DIED en el atasco (ventanilla)", "2 FILE: FARM RULE #1",
 "3 GRID > HOUSE > PUMP > WATER", "3 banera +40 GAL (medidor)", "3 vacas 10-20 GAL/DIA x12: 110 GAL en medio dia", "4 Ava arranca el generador",
 "4 anillos 50/100/200 m = 53/47/41 dB", "4 algo se levanta en el maizal", "4 20 FT, escape lejos, CO sin color ni olor", "5 vacas al corral, gallinas al gallinero",
 "5 perro oye ~4x mas lejos", "6 cadena + candado: CLICK", "6 tornillos de 3 in al montante (ep1)", "7 ITEM: MEDICINE 0 (sin First Aid Spray)",
 "7 guardado: DAY 1 - THE FARM", "8 Ribbon grune al granero (noche)", "8 algo se mueve dentro (ambiguo)", "8 'Oh, fudge': ojos de miedo, boca abierta", "8 PART 2: SOMETHING IN THE BARN + SUBSCRIBE!"]
pw, ph, cols, lab = 480, 270, 5, 30
rows = (len(files) + cols - 1) // cols
props = Image.open(P + "/objects/compare/PROPS_ROW.png").convert("RGB"); ani = Image.open(P + "/assets_dl/animals/CHOSEN_ROW.png").convert("RGB")
Wd = pw * cols; props = props.resize((Wd, int(props.height * Wd / props.width))); ani = ani.resize((Wd, int(ani.height * Wd / ani.width)))
top = 70; Ht = top + rows * (ph + lab) + 50 + props.height + 50 + ani.height + 40
im = Image.new("RGB", (Wd, Ht), (14, 14, 18)); d = ImageDraw.Draw(im)
f1 = ImageFont.truetype("arialbd.ttf", 34); f2 = ImageFont.truetype("arialbd.ttf", 19); f3 = ImageFont.truetype("arial.ttf", 22)
d.text((16, 16), "AVA: The Last Farm - Day 1 (Part 1)  |  storyboard v1 (16:9, motor 640x360 x3)  |  tiempos con timeline provisional", font=f1, fill=(236, 230, 218))
for i, f in enumerate(files):
    x, y = (i % cols) * pw, top + (i // cols) * (ph + lab)
    d.text((x + 8, y + 5), CAP[i] if i < len(CAP) else os.path.basename(f), font=f2, fill=(255, 210, 63))
    im.paste(Image.open(f).convert("RGB").resize((pw - 6, ph - 6), Image.NEAREST), (x + 3, y + lab))
y = top + rows * (ph + lab) + 10
d.text((16, y), "PROPS: foto aislada de Flow (arriba) vs PS1 low poly (abajo). Cadena hecha en codigo; balde y telefono reusados del ep6/ep7.", font=f3, fill=(200, 210, 230)); im.paste(props, (0, y + 36))
y += 36 + props.height + 10
d.text((16, y), "ANIMALES elegidos (comparados en assets_dl/animals/COMPARE.png). Perro: Ribbon, Quaternius German Shepard CC-BY 3.0 (el del ep3).", font=f3, fill=(200, 210, 230)); im.paste(ani, (0, y + 36))
im.save(P + "/storyboard_v1.png"); print(im.size)
