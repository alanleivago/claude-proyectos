"""Reintenta c14 con varias redacciones (política de menores de Flow) hasta que una pase."""
import sys; sys.path.insert(0, ".")
import clips
L = '"Se lo voy a cuidar siempre." Then a short pause. Then: "Cuando sea grande le voy a regresar todo."'
V = [
 f"Medium shot {clips.COC}: young Lupita @{{LUPITA_NINA}} stands next to @{{ROSAJOVEN}}, holding a small clay cup with a painted flower, smiling with gratitude. Lupita speaks in native Mexican Spanish, gentle voice, clear lip sync: {L}",
 f"Medium two-shot {clips.COC}: @{{ROSAJOVEN}} gives a small painted clay cup to Lupita @{{LUPITA_NINA}}, who receives it happily. Lupita answers in native Mexican Spanish, warm voice, clear lip sync: {L}",
 f"Wide warm family scene {clips.COC}: @{{RAFAEL}}, @{{CHUYJOVEN}}, @{{ROSAJOVEN}} and Lupita @{{LUPITA_NINA}} around the wooden table; Lupita holds a painted clay cup and promises, in native Mexican Spanish with clear lip sync: {L}",
 f"Medium shot {clips.COC}: Lupita @{{LUPITA_NINA}} looks at the kind old woman @{{ROSAJOVEN}} and says, in native Mexican Spanish, clear lip sync, with a bright smile: {L}",
]
for v in V:
    clips.CLIPS = [c for c in clips.CLIPS if c[0] != "c14"] + [("c14", 8, v)]
    clips.main_ids = None
    sys.argv = ["clips.py", "c14"]; clips.main()
    if (clips.OUT / "c14.mp4").exists(): print("PASO", V.index(v)); break
