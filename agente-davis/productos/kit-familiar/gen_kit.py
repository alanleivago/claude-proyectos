"""Genera el Kit Plan de Emergencia Familiar (HTML imprimible) con la API de Claude."""
import sys
from pathlib import Path
import anthropic

HERE = Path(__file__).parent
ROOT = HERE.parents[2]

def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        if line.startswith("ANTHROPIC_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    sys.exit("sin key")

BRIEF = (HERE / "brief.md").read_text(encoding="utf-8")
client = anthropic.Anthropic(api_key=key(), timeout=1200)
out = []
with client.messages.stream(model="claude-sonnet-5-5", max_tokens=64000,
                            messages=[{"role": "user", "content": BRIEF}]) as s:
    msg = s.get_final_message()
html = "".join(b.text for b in msg.content if b.type == "text")
if "<html" in html:
    html = html[html.index("<!"):] if "<!" in html else html
    html = html[: html.rindex("</html>") + 7]
(HERE / "kit.html").write_text(html, encoding="utf-8")
print("ok", len(html), msg.usage)
