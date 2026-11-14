"""Genera los clips de agua-hacienda con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Uso: python -I clips.py [ID ...]"""
import re
import subprocess, sys, os, tempfile, time
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "clips"
STYLE = ("Cinematic vertical shot from a Mexican telenovela, photorealistic, natural skin texture, 85mm lens, shallow depth of field, "
         "static camera with a very slow push-in. Keep every character exactly as in their reference sheet (same face, hair, clothes, accessories). "
         "No music, no subtitles, no text on screen.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync"
HAC = "in the dusty courtyard of the old hacienda @{LOC_HACIENDA}, harsh golden afternoon sun"
CAM = "on the dirt road among agave plants @{LOC_CAMINO}, golden hour"
COC = "inside the rustic adobe kitchen @{LOC_COCINA}, warm amber window light"
DES = "in the modern law office @{LOC_DESPACHO}, cool daylight"
POR = "on the porch of the humble ranch @{LOC_PORCHE}, late afternoon light"

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho y humillación (hacienda)
 ("c01", 6, f"Wide shot {HAC}: @{{RAFAEL}} holding the hand of his daughter @{{LUPITA_NINA}} stand in front of the stone water trough while the foreman @{{CAPATAZ}} fills a metal bucket. Then the foreman turns the bucket over and the water spills onto the dry ground, splashing in the dust. No dialogue."),
 ("c02", 10, talk("Rafael", f"Over-the-shoulder close-up of @{{RAFAEL}} {HAC}, the blurred shoulder and black hat of the foreman in the foreground, Rafael sweaty and thirsty.",
     ["Patrón, ¿me regala tantita agua para mi niña?", "Le chambeo en lo que sea. Nomás un jarro.", "No le pido limosna, patrón. Le pido chamba."], "humble, tired and pleading")),
 ("c03", 10, talk("Ezequiel", f"Low-angle close-up of the foreman @{{CAPATAZ}} {HAC}, arrogant and cruel, holding an empty metal bucket.",
     ["Esta agua es de la hacienda.", "¿Quieres agua? Ahí está. Lámela.", "Aquí no mantenemos muertos de hambre."], "hard, mocking, contemptuous")),
 ("c04", 8, talk("Ezequiel", f"Close-up of @{{CAPATAZ}} with arms crossed under the arched portico {HAC}.",
     ["¿Trabajo? Mírate. No sirves ni pa' cargar agua.", "Primero aprende a leer, escuincla."], "mocking, then laughing cruelly")),
 ("c05", 8, talk("Lupita", f"Medium two-shot {HAC}: @{{RAFAEL}} stands with his hand on the shoulder of his daughter @{{LUPITA_NINA}}; she speaks with a serious brave expression.",
     ["Papá, vámonos de aquí.", "Algún día usted nos va a pedir agua a nosotros."], "a sweet young voice, calm and firm, proud")),
 ("c06", 6, talk("Rafael", f"Medium shot {HAC}: @{{RAFAEL}} kneels and hugs his daughter @{{LUPITA_NINA}}, eyes wet with tears.",
     ["Vámonos, mija. Aquí no nos quieren."], "broken, gentle")),
 # 2. Protector (camino + cocina)
 ("c07", 6, f"Wide shot {CAM}: @{{RAFAEL}} and his daughter @{{LUPITA_NINA}} walk tiredly along the road; an old muleteer @{{CHUYJOVEN}} approaches leading two loaded donkeys and stops beside them. No dialogue."),
 ("c08", 10, talk("Don Chuy", f"Over-the-shoulder close-up of @{{CHUYJOVEN}} {CAM}, Rafael's blurred straw hat in the foreground, kind smile.",
     ["¿A dónde van con este solazo, amigo?", "¿Y la niña ya tomó agua?", "En mi casa el agua no se cobra, amigo. Se comparte."], "warm, calm, unhurried rural voice")),
 ("c09", 8, talk("Rafael", f"Close-up of @{{RAFAEL}} {CAM}, eyes filling with tears.",
     ["Buscando trabajo, señor.", "No tengo con qué pagarle."], "humble, ashamed")),
 ("c10", 8, f"Wide shot {COC}: the kind woman @{{ROSAJOVEN}} pours water from a clay pitcher into clay jarros on the wooden table for @{{RAFAEL}}, @{{CHUYJOVEN}} and the daughter @{{LUPITA_NINA}}, everyone smiling warmly. The daughter says in native Mexican Spanish, sweet voice, clear lip sync: \"Gracias, señora. Está bien fría.\""),
 ("c11", 8, talk("Doña Rosa", f"Close-up of @{{ROSAJOVEN}} {COC}, moved, eyes shining.",
     ["Toma toda la que quieras, mi reina. ¿Y tu mamá?", "Este jarrito es tuyo, pa' que nunca te falte."], "tender, motherly")),
 ("c12", 8, talk("Rafael", f"Close-up of @{{RAFAEL}} sitting at the wooden table {COC}, holding back tears.",
     ["Se nos murió en el invierno. Nomás somos ella y yo.", "No sé cómo voy a pagarle."], "quiet, broken")),
 # 3. Regalo y promesa
 ("c13", 10, talk("Don Chuy", f"Close-up of @{{CHUYJOVEN}} {COC}, serious at first, then a warm smile.",
     ["Me hace falta quien cuide la milpa. El trabajo es suyo.", "Y el cuartito es pa' los dos.", "Cuando a alguien le falte agua, usted se la da. Así me paga."], "warm, wise, slow")),
 ("c14", 8, f"Medium shot {COC}: @{{RAFAEL}} sits at the table with his arm around his daughter @{{LUPITA_NINA}}; @{{ROSAJOVEN}} smiles at them. The daughter, holding a small clay cup with a painted flower, says in native Mexican Spanish, sweet calm voice, clear lip sync: \"Se lo voy a cuidar siempre.\" Then a short pause. Then: \"Cuando sea grande le voy a regresar todo.\""),
 ("c15", 6, talk("Don Chuy", f"Close-up of @{{CHUYJOVEN}} {COC}, smiling with tears in his eyes.",
     ["Entonces estudia mucho, mija. Mucho."], "tender")),
 # 4. Salto de 15 años (despacho)
 ("c16", 8, talk("Beto", f"Medium shot of the assistant @{{BETO}} {DES}, holding a folder, then looking worried.",
     ["Licenciada, llegó un expediente de Los Altos.", "¿Está bien? Se puso pálida.", "¿Lo conoce, licenciada?"], "young, polite, nervous")),
 ("c17", 10, talk("Lupita", f"Close-up of the young lawyer @{{LUPITA_ABOGADA}} sitting at the glass desk {DES}, reading a folder; on the desk the old clay jarrito with a faded painted flower @{{LOC_JARRITO}}. Her eyes fill with tears.",
     ["Van a rematar el rancho de Don Chuy.", "Ese hombre nos dio agua cuando nadie más quiso."], "controlled, emotional, firm")),
 # 5. Nueva amenaza (porche)
 ("c18", 8, f"Wide shot {POR}: old @{{DON_CHUY_VIEJO}} and old @{{DONA_ROSA_VIEJA}} sit on a wooden bench next to the dry stone well. Don Chuy says in native Mexican Spanish, tired old voice, clear lip sync: \"El pozo ya no da, Rosa.\" Rosa answers, worried old woman voice: \"¿Y con qué le pagamos al banco, viejo?\""),
 ("c19", 8, f"Wide shot {POR}: a white pick-up truck stops in a cloud of dust; the rich rancher @{{EZEQUIEL_RICO}} steps out, adjusts his black hat and walks toward the old couple @{{DON_CHUY_VIEJO}} and @{{DONA_ROSA_VIEJA}}. No dialogue."),
 ("c20", 10, talk("Ezequiel", f"Close-up of @{{EZEQUIEL_RICO}} {POR}, arrogant smirk, gold chain shining.",
     ["Buenas tardes, Don Chuy. Vengo por lo que es mío.", "El viernes la remata el banco. Y yo la compro.", "Ni el agua de su pozo le va a quedar."], "arrogant, mocking, slow")),
 ("c21", 8, talk("Don Chuy", f"Close-up of old @{{DON_CHUY_VIEJO}} {POR}, then in profile, a single tear rolls down his cheek.",
     ["Mi tierra no está en venta, Ezequiel."], "old, dignified, trembling")),
 # 6. Cliffhanger
 ("c22", 8, f"Inside a black SUV driving on a country road, golden light through the window: @{{BETO}} asks in native Mexican Spanish, clear lip sync: \"¿Falta mucho, licenciada?\" Close-up of @{{LUPITA_ABOGADA}} looking out the window holding the clay jarrito @{{LOC_JARRITO}}, she answers softly: \"Ya llegamos. Aquí empezó todo.\""),
 ("c23", 10, f"{POR}: a black SUV arrives; the young lawyer @{{LUPITA_ABOGADA}} steps out and stares straight at the rich rancher @{{EZEQUIEL_RICO}}, who frowns, uneasy; old @{{DON_CHUY_VIEJO}} in the background. Slow push-in to her face, firm determined look into the camera. No dialogue."),
 # Reacciones mudas (ritmo) y CTA final
 ("r1", 4, f"Close-up of @{{RAFAEL}} {HAC}, listening in humiliated silence, jaw clenched, eyes wet. No dialogue."),
 ("r2", 4, f"Close-up of the foreman @{{CAPATAZ}} {HAC}, laughing cruelly in silence, arms crossed. No dialogue."),
 ("r3", 4, f"Close-up of @{{CHUYJOVEN}} {COC}, listening in silence, moved, nodding slowly. No dialogue."),
 ("r4", 4, f"Close-up of the young lawyer @{{LUPITA_ABOGADA}} {DES}, staring at the old clay jarrito @{{LOC_JARRITO}} in her hands in silence, remembering. No dialogue."),
 ("r5", 4, f"Close-up of the rich rancher @{{EZEQUIEL_RICO}} {POR}, smirking in silence, adjusting his gold chain. No dialogue."),
 ("c24", 8, talk("Lupita", f"Close-up of the young lawyer @{{LUPITA_ABOGADA}} {POR}, looking straight into the camera with a determined half smile, holding the clay jarrito @{{LOC_JARRITO}}.",
     ["¿Creen que Ezequiel se va a quedar con el rancho?", "Denle me gusta y compartan para ver la segunda parte."], "confident, warm, talking directly to the viewer")),
]

def main():
    want = set(sys.argv[1:])
    OUT.mkdir(exist_ok=True)
    for cid, dur, body in CLIPS:
        dst = OUT / f"{cid}.mp4"
        if dst.exists() or (want and cid not in want): continue
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(f"{STYLE}\n{body}")
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(OUT)],
                           cwd=MCP, capture_output=True, text=True, encoding="utf-8", errors="replace")
        files = [l for l in r.stdout.splitlines() if l.endswith(".mp4")]
        if files: os.replace(files[0], dst); print("OK", cid, flush=True)
        else: print("FALLO", cid, (r.stdout + r.stderr)[-300:], flush=True)
        time.sleep(240 if "inusual" in r.stdout + r.stderr else 75)  # Flow corta por "actividad inusual" si se pide muy seguido

if __name__ == "__main__":
    main()
