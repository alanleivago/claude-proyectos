# analizar.py: analiza con Claude (créditos de API) las miniaturas de los outliers del nicho "historia del sueño"
# y escribe analisis.md (corto). Uso: python analizar.py
import os, json, base64, anthropic
ROOT = r"F:/Claude Proyectos"
for line in open(os.path.join(ROOT, ".env"), encoding="utf-8"):
    if line.startswith("ANTHROPIC_API_KEY="): key = line.split("=", 1)[1].strip().strip('"')
client = anthropic.Anthropic(api_key=key)
HERE = os.path.dirname(os.path.abspath(__file__))
top = json.load(open(os.path.join(HERE, "top.json"), encoding="utf-8"))
content = []
for r in top:
    vid = r["url"].split("/")[-1]; p = os.path.join(HERE, "thumbs", vid + ".jpg")
    if not os.path.exists(p): continue
    content.append({"type": "text", "text": f"{r['mult']:.0f}x channel median | {r['channel']} | {r['title']}"})
    content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(open(p, "rb").read()).decode()}})
content.append({"type": "text", "text": """These are YouTube thumbnails of outlier videos (views divided by their own channel's median) in the "history of sleep" niche.
For each: subject, text (exact words, count), colours, composition, emotion, what question it opens. Then the 5 patterns shared by the strongest ones.
Then apply it: our video is a 10-minute explainer where Mechayuki, a blonde android girl in red armour (Mega Man Legends 2 PS1 low-poly look), digs up a buried modern bedroom thousands of years from now and traces 8 artifacts back in time (grass beds on ash 200,000 years ago, stone pillows, strangers sharing beds at inns, first and second sleep, a chamber-pot nightstand). The title will be a searchable question like "How Did Humans Sleep Before Beds?".
Propose 3 thumbnail concepts we can render from our 3D engine (she must be the main subject, face visible with a strong expression, plus the strongest hook object), each with 2-4 words of text that do NOT repeat the title. Rank them. Answer in Spanish, concise (max 450 words)."""})
out = []
with client.messages.stream(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": content}]) as st:
    msg = st.get_final_message()
txt = "".join(b.text for b in msg.content if b.type == "text")
open(os.path.join(HERE, "analisis.md"), "w", encoding="utf-8").write("# Miniaturas: outliers del nicho historia del sueño (análisis por API)\n\n" + txt)
print("tokens", msg.usage.input_tokens, msg.usage.output_tokens, "-> analisis.md")
