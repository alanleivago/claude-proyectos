"""Cambia el prompt de c34 (CTA) en clips.py a la variante N. Uso: python -I cta_variants.py N"""
import re, sys
from pathlib import Path
V = [
 ('f"Close-up of {FOR} {RIO}, alone, face and shoulders filling the frame, looking straight into the camera and talking to the viewer, '
  'his lips moving clearly on every word; he has a mischievous half smile, raises one eyebrow, makes a short pause and then asks the question. Nobody else around."',
  '"speaking clearly and warmly, a little mischievous, every word out loud"'),
 ('f"Close-up of {FOR} {RIO}, alone, looking into the camera; he SPEAKS out loud the whole time, mouth clearly moving. '
  'A sly half smile, one eyebrow goes up, a short pause, then he asks. Nobody else around."',
  '"loud and clear, friendly, playful"'),
 ('f"Close-up of {FOR} {RIO}, talking to the camera with a sly half smile and one raised eyebrow. Nobody else around."',
  '"clear, warm, playful voice"'),
]
k = int(sys.argv[1]); p = Path(__file__).with_name("clips.py"); s = p.read_text(encoding="utf-8")
i = s.index('("c34", 10, talk("c34", "Fortino", '); j = s.index("\n]", i)
desc, tone = V[k]
s = s[:i] + f'("c34", 10, talk("c34", "Fortino", {desc},\n     {tone})),' + s[j:]
p.write_text(s, encoding="utf-8"); print("variante", k)
