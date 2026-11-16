# Lista maestra de tomas del LARGO 3 ("AVA: DAY 3 — The Way Out"). Una toma por trozo entre "…" (nunca se corta dentro de
# una toma). (id, capitulo, voz, texto, reuso|None, pausa_despues_s).
# voz: ava (narra, speed 0.88) | think ([PIENSA] whisper) | shake (*temblando*: whisper + low pitch) | marla (996b1578)
#      | pilot (voz nueva, radio seca) | breath ([RESPIRA], grabacion CC0)
# Pausa (···) = 1.8 s de silencio con ambiente: va en la pausa_despues de la toma anterior (PAUSE).
PAUSE = 1.8
CH = {"hook": None, "c1810": "6:10 PM", "c1900": "7:00 PM", "c2030": "8:30 PM", "c2115": "9:15 PM", "c2200": "10:00 PM",
      "c2240": "10:40 PM", "c2245": "10:45 PM", "c2330": "11:30 PM", "c0030": "12:30 AM", "c0140": "1:40 AM", "c0230": "2:30 AM",
      "c0300": "3:00 AM", "c0315": "3:15 AM", "c0400": "4:00 AM", "c0440": "4:40 AM", "c0530": "5:30 AM", "c0540": "5:40 AM",
      "c0542": "5:42 AM", "final": None}
# lugar de la tarjeta de capitulo (linea DAY 3 — ...)
PLACE = {"c1810": "POLICE STATION", "c1900": "1920 TUNNEL", "c2030": "POLICE STATION", "c2115": "1920 TUNNEL", "c2200": "SEWERS",
         "c2240": "SEWERS", "c2245": "SEWERS", "c2330": "SEWERS", "c0030": "SEWERS", "c0140": "FOREST", "c0230": "FOREST",
         "c0300": "FOREST", "c0315": "MANSION", "c0400": "MANSION", "c0440": "MANSION", "c0530": "MANSION", "c0540": "MANSION", "c0542": "MANSION"}
P = PAUSE
T = [
 # ---------- gancho ----------
 ("h1", "hook", "ava", "Last night you had to choose,", None, 0.45),
 ("h1b", "hook", "ava", "let Dutch out of cell four,", None, 0.4),
 ("h1c", "hook", "ava", "or leave him in there. Most of you said no.", None, 1.2),
 ("h2", "hook", "ava", "So the cell stays locked.", None, 0.6),
 ("h3", "hook", "ava", "He shouts your name for an hour. Then he stops.", None, P),
 ("h4", "hook", "ava", "And the quiet is so much worse.", None, 0.7),
 ("h5", "hook", "think", "Don't go back there. Don't.", None, 1.0),
 # ---------- 6:10 PM luces ----------
 ("l1", "c1810", "ava", "First thing,", None, 0.35),
 ("l2", "c1810", "ava", "the lights. Every bulb in the station came on by itself, and you need to know why.", None, 0.5),
 ("l3", "c1810", "ava", "In the motor pool the generator is running again. Taped to the switch there's a little kitchen timer, set for six o'clock,", None, 0.4),
 ("l4", "c1810", "ava", "and on the tape, in handwriting you already know,", None, 0.4),
 ("l5", "c1810", "ava", "M.", None, 0.7),
 ("l6", "c1810", "think", "Marla. She set the timer before she left. Before she got bit.", None, 0.7),
 ("l7", "c1810", "ava", "You shut it down. And you leave that big door cracked open, because a generator puts out carbon monoxide,", None, 0.4),
 ("l8", "c1810", "ava", "you can't see it, you can't smell it, and in a closed room it kills you in your sleep.", None, 0.5),
 ("l9", "c1810", "ava", "The station goes dark again.", None, P),
 ("l10", "c1810", "ava", "Outside, the knocking doesn't come back. Officer Vickers is gone.", None, 1.0),
 # ---------- 7:00 PM Marla ----------
 ("m1", "c1900", "ava", "You take water and a blanket down the stone stairs, to the end of the tunnel. Marla's awake, but her skin is grey and she's burning up. Over a hundred and one. A fever like that after a bite,", None, 0.4),
 ("m2", "c1900", "ava", "means it's spreading.", None, 0.6),
 ("m3", "c1900", "marla", "You're still here. I told you to leave.", None, 0.5),
 ("m4", "c1900", "shake", "I'm not leaving you in a tunnel.", None, 0.5),
 ("m5", "c1900", "marla", "Then you'd better be fast.", None, 1.0),
 # ---------- 8:30 PM plan ----------
 ("p1", "c2030", "ava", "Here's the plan. The helicopter is at the bridge at dawn. The streets are full,", None, 0.4),
 ("p2", "c2030", "ava", "so you go under them.", None, 0.5),
 ("p3", "c2030", "ava", "The old tunnel runs to the courthouse, right next to the river. You've got Marla's map from nineteen twenty, but no idea how far you've walked down there. So you count.", None, 0.5),
 ("p4", "c2030", "ava", "Every two steps is one pace. About sixty-five paces,", None, 0.4),
 ("p5", "c2030", "ava", "is a hundred meters. Soldiers still navigate like this when they can't trust anything else.", None, 0.6),
 ("p6", "c2030", "ava", "You fill your bag. Water, the beans, the flashlight, fifteen bullets. Ribbon watches you the whole time.", None, 0.5),
 ("p7", "c2030", "think", "Okay. Okay. We can do this.", None, 0.6),
 ("p8", "c2030", "ava", "On the way past cell four,", None, 0.4),
 ("p9", "c2030", "ava", "Dutch doesn't say a word. He just watches you go.", None, 1.0),
 # ---------- 9:15 PM tunel ----------
 ("u1", "c2115", "ava", "Sixty-five,", None, 0.4),
 ("u2", "c2115", "ava", "a hundred and thirty,", None, 0.4),
 ("u3", "c2115", "ava", "two hundred.", None, 0.5),
 ("u4", "c2115", "ava", "Marla leans on your shoulder, Ribbon goes first. The lantern swings, and the old walls drip all around you.", None, P),
 ("u5", "c2115", "ava", "Four hundred paces in,", None, 0.4),
 ("u6", "c2115", "ava", "the tunnel ends. Not at a door. At a wall of fallen stone, and black water seeping through the cracks.", None, 0.5),
 ("u7", "c2115", "think", "No. No, no. This was the way out.", None, 0.6),
 ("u8", "c2115", "ava", "There's only one other way,", None, 0.4),
 ("u9", "c2115", "ava", "a rusted grate in the floor, and a ladder going down. Into the city sewers.", None, 1.0),
 # ---------- 10:00 PM agua ----------
 ("s1", "c2200", "ava", "The smell hits you first. Rotten eggs, so thick you can taste it.", None, 0.5),
 ("s2", "c2200", "breath", "*respira*", "breath:exhale", 0.6),
 ("s3", "c2200", "ava", "That smell is sewer gas. And here's the part that scares you,", None, 0.4),
 ("s4", "c2200", "ava", "if it ever suddenly goes away, it doesn't mean the air got better. It means there's so much of it your nose stopped working. That's when you climb out. Fast.", None, 0.6),
 ("s5", "c2200", "ava", "The water is moving. Ankle deep, and that's fine. But six inches of moving water can knock a grown adult off their feet,", None, 0.4),
 ("s6", "c2200", "ava", "so you stay on the ledge, one hand on the wall, and you don't step into the middle. Not once.", None, 1.0),
 # ---------- 10:40 PM detras ----------
 ("b1", "c2240", "ava", "Then Ribbon stops. Ears flat. Looking back the way you came.", None, P),
 ("b2", "c2240", "ava", "Splashing. Lots of it.", None, 0.6),
 ("b3", "c2240", "think", "They heard us. The lights,", None, 0.4),
 ("b4", "c2240", "think", "they all came to the station,", None, 0.4),
 ("b5", "c2240", "think", "and now they're coming down.", None, 0.6),
 ("b6", "c2240", "ava", "Eighty of them. Pouring down that ladder.", None, 1.0),
 # ---------- 10:45 PM Marla ----------
 ("g1", "c2245", "ava", "There's a gate here. Old iron, a lever on the wall, and a ladder to a maintenance platform just above it.", None, 0.5),
 ("g2", "c2245", "ava", "Marla lets go of your shoulder.", None, 0.5),
 ("g3", "c2245", "marla", "Get the dog through. I'll close it behind you.", None, 0.5),
 ("g4", "c2245", "shake", "We go together. Come on.", None, 0.5),
 ("g5", "c2245", "marla", "Look at my arm, honey. I'm not getting on that helicopter.", None, 1.2),
 ("g6", "c2245", "marla", "But you are.", None, 0.6),
 ("g7", "c2245", "ava", "She pulls the lever. The gate drops between you with a sound you'll never forget.", None, P),
 ("g8", "c2245", "ava", "Then she climbs to the platform, picks up a pipe,", None, 0.4),
 ("g9", "c2245", "ava", "and starts banging it on the railing. Loud. Louder. Calling every one of them to her,", None, 0.4),
 ("g10", "c2245", "ava", "and away from you.", None, 0.5),
 ("g11", "c2245", "marla", "Go! Don't you look back!", None, 0.5),
 ("g12", "c2245", "think", "Don't look back. Don't look back.", None, 0.6),
 ("g13", "c2245", "ava", "You look back.", None, 0.6),
 ("g14", "c2245", "breath", "*respira*", "breath:shaky", 0.6),
 ("g15", "c2245", "ava", "And then you run.", None, 1.0),
 # ---------- 11:30 PM perdida ----------
 ("o1", "c2330", "ava", "The banging fades. Then it stops.", None, P),
 ("o2", "c2330", "ava", "Now it's just you, Ribbon, and the dark. Every pipe looks the same. Your pace count is gone, the map ends at the courthouse, and you're nowhere near the courthouse.", None, 0.5),
 ("o3", "c2330", "ava", "When you're lost in a maze, there's one rule that always gets you out,", None, 0.4),
 ("o4", "c2330", "ava", "put one hand on a wall, and never let go. Follow it, every turn, and sooner or later you reach the exit.", None, 0.5),
 ("o5", "c2330", "ava", "Right hand on the wall. Turn. Turn. Turn.", None, 0.5),
 ("o6", "c2330", "think", "Keep walking. Just keep walking.", None, 1.0),
 # ---------- 12:30 AM guardado ----------
 ("v1", "c0030", "ava", "Behind a steel door there's a workers' room. A cot, a radio that doesn't work,", None, 0.4),
 ("v2", "c0030", "ava", "and a typewriter.", None, 0.5),
 ("v3", "c0030", "ava", "You sit down for the first time in hours. Ribbon puts her head on your knee.", None, 0.6),
 ("v4", "c0030", "think", "She did that for us. For a girl she met yesterday.", None, 0.7),
 ("v5", "c0030", "ava", "You save your game. Day three,", None, 0.4),
 ("v6", "c0030", "ava", "twelve thirty A.M. Sewers.", None, 1.0),
 # ---------- 1:40 AM bosque ----------
 ("f1", "c0140", "ava", "The wall leads you to a storm drain, and the storm drain spits you out into cold air and trees. No streets. No lights. No city.", None, 0.5),
 ("f2", "c0140", "ava", "You came out the wrong side of town. Into the woods.", None, 0.5),
 ("f3", "c0140", "ava", "You're soaked to the waist, and you're shaking. That's the real danger right now,", None, 0.4),
 ("f4", "c0140", "ava", "not them. Water steals heat from your body about twenty-five times faster than air. Wet clothes in a cold forest can take you down before morning.", None, 0.5),
 ("f5", "c0140", "think", "Keep moving. Moving makes heat.", None, 0.5),
 ("f6", "c0140", "ava", "So which way is the river? You look up. Find the Big Dipper. The two stars on the end of the cup point straight to the North Star. The river is north. So you walk north.", None, 1.0),
 # ---------- 2:30 AM arboles ----------
 ("w1", "c0230", "ava", "The forest is too quiet. No crickets, no birds. Just fog, and your boots on wet leaves.", None, 0.5),
 ("w2", "c0230", "ava", "Crows. Dozens of them, sitting in the branches,", None, 0.4),
 ("w3", "c0230", "ava", "watching you. Not making a sound.", None, P),
 ("w4", "c0230", "ava", "Ribbon growls. Something moves between the trees. Slow. Dragging one leg.", None, 0.5),
 ("w5", "c0230", "shake", "Ribbon… stay.", None, 0.5),
 ("w7", "c0230", "ava", "It doesn't see you. It shuffles past, close enough to touch. You don't breathe until it's gone.", None, 0.5),
 ("w8", "c0230", "breath", "*respira*", "breath:exhale", 0.6),
 ("w9", "c0230", "ava", "In the mud where it was standing, there's another set of tracks. Bare feet. Huge. Twice the size of your boots,", None, 0.4),
 ("w10", "c0230", "ava", "and fresh.", None, 0.5),
 ("w11", "c0230", "think", "What makes a footprint that big?", None, 1.0),
 # ---------- 3:00 AM mansion ----------
 ("x1", "c0300", "ava", "And then, through the fog, there's a house.", None, 0.5),
 ("x2", "c0300", "ava", "Not a house,", None, 0.4),
 ("x3", "c0300", "ava", "a mansion. Three floors of black windows, iron gates hanging open, ivy all over the walls. Out here, in the middle of nowhere.", None, 0.5),
 ("x4", "c0300", "think", "Nobody builds a house like that in the woods,", None, 0.4),
 ("x5", "c0300", "think", "unless they don't want anyone to find it.", None, 0.5),
 ("x6", "c0300", "ava", "But it has walls. And it has a door. And you're freezing.", None, P),
 ("x7", "c0300", "ava", "So you go in.", None, 1.0),
 # ---------- 3:15 AM vestibulo ----------
 ("y1", "c0315", "ava", "The door closes behind you with a boom that echoes up the whole staircase. Dust. Marble floors. A painting of a family nobody remembers.", None, 0.5),
 ("y2", "c0315", "ava", "And a fireplace,", None, 0.4),
 ("y3", "c0315", "ava", "with dry wood stacked next to it.", None, 0.5),
 ("y4", "c0315", "ava", "You get your wet clothes off, wrap yourself in a curtain, and light the fire. Ribbon lies down so close to it her fur almost burns.", None, 0.5),
 ("y5", "c0315", "think", "Warm. Finally warm.", None, 0.5),
 ("y6", "c0315", "ava", "That's the first rule of cold,", None, 0.4),
 ("y7", "c0315", "ava", "get dry first, then get warm. In that order.", None, 1.0),
 # ---------- 4:00 AM no esta vacia ----------
 ("z1", "c0400", "ava", "Something upstairs drops. One heavy step.", None, P),
 ("z2", "c0400", "ava", "Then another.", None, 0.5),
 ("z3", "c0400", "ava", "You grab the gun. Fifteen bullets. You climb the stairs, flashlight shaking.", None, 0.5),
 ("z4", "c0400", "ava", "A long hallway, doors on both sides. In the last room, a man in a dinner jacket sits in an armchair with his back to you,", None, 0.4),
 ("z5", "c0400", "ava", "perfectly still.", None, 0.5),
 ("z6", "c0400", "shake", "Hello?", None, 0.6),
 ("z7", "c0400", "ava", "His head turns. Slowly. All the way around.", None, 0.6),
 ("z8", "c0400", "breath", "*respira*", "breath:gasp", 0.6),
 ("z9", "c0400", "ava", "You close the door very, very quietly. And you lock it with the key that's still in it.", None, 1.0),
 # ---------- 4:40 AM radio ----------
 ("r1", "c0440", "ava", "The silver key opens the attic. Up there, under the roof, someone built a whole radio station,", None, 0.4),
 ("r2", "c0440", "ava", "old, dusty, but it still has a battery.", None, 0.5),
 ("r3", "c0440", "ava", "You know one frequency. The one every ham radio operator in the country knows,", None, 0.4),
 ("r4", "c0440", "ava", "one four six point five two. The calling channel.", None, 0.5),
 ("r5", "c0440", "ava", "You key the mic.", None, 0.5),
 ("r6", "c0440", "shake", "This is,", None, 0.4),
 ("r7", "c0440", "shake", "this is Ava. Is anybody out there? Please.", None, 0.6),
 ("r8", "c0440", "ava", "Static.", None, P + 2.2),   # v3: un solo "Static" + la pausa (···) antes de la tarjeta
 # ---------- 5:30 AM amanecer ----------
 ("d1", "c0530", "ava", "Through the attic window, the sky turns blue. And far away, over the river, you hear it,", None, 0.4),
 ("d2", "c0530", "ava", "the helicopter.", None, 0.5),
 ("d3", "c0530", "ava", "The radio crackles.", None, 0.4),
 ("d4", "c0530", "pilot", "Ava? This is Eagle One. We're at the bridge. We saw your mirror yesterday.", None, 0.5),
 ("d5", "c0530", "think", "They're here. They're actually here.", None, 0.5),
 ("d6", "c0530", "pilot", "Get to the river. We can wait one hour. Not one minute more.", None, 0.5),
 ("d7", "c0530", "think", "One hour. The river is right there. I can make it.", None, 0.5),
 ("d8", "c0530", "ava", "You grab your clothes, still warm from the fire. Ribbon is already at the stairs.", None, 1.0),
 # ---------- 5:40 AM te siguio ----------
 ("k1", "c0540", "ava", "Then the whole house shakes.", None, P),
 ("k2", "c0540", "ava", "Down in the great hall, the tall window by the door doesn't open,", None, 0.4),
 ("k3", "c0540", "ava", "it explodes. Something comes through it in one jump. Glass and wood all over the marble.", None, 0.5),
 ("k4", "c0540", "ava", "It hits the marble hard, and it stands up slowly. Taller than the door. A long black coat, soaked from the forest. Bare feet the size of shovels,", None, 0.4),
 ("k5", "c0540", "ava", "and empty hands, as big as your head, opening and closing.", None, 0.5),
 ("k6", "c0540", "breath", "*respira*", "breath:gasp", 0.6),
 ("k7", "c0540", "think", "The footprints in the forest. It was following us. The whole time.", None, 0.5),
 ("k8", "c0540", "ava", "It doesn't groan like the others. It roars,", None, 1.0),
 ("k8b", "c0540", "ava", "and then it tilts its head,", None, 0.4),
 ("k9", "c0540", "ava", "and looks straight up the stairs. At you.", None, 0.6),
 ("k10", "c0540", "ava", "The man in the dinner jacket was dead. This thing,", None, 0.4),
 ("k11", "c0540", "ava", "is hunting.", None, 0.5),
 ("k12", "c0540", "ava", "Ribbon is barking so hard her whole body shakes.", None, 1.0),
 # ---------- 5:42 AM eleccion ----------
 ("q1", "c0542", "ava", "You've got two seconds.", None, 0.5),
 ("q2", "c0542", "ava", "Behind you, the attic window. Two floors down, there's the ivy on the wall,", None, 0.4),
 ("q3", "c0542", "ava", "and the river is beyond the trees.", None, 0.5),
 ("q4", "c0542", "ava", "In your hand, a gun with fifteen bullets. And it's standing in front of a hallway full of old oil lamps.", None, 0.5),
 ("q5", "c0542", "shake", "Ribbon,", None, 0.4),
 ("q6", "c0542", "shake", "come here. Come here, girl.", None, 0.5),
 ("q7", "c0542", "ava", "It takes the first step up the stairs. The whole staircase groans.", None, 0.5),
 ("q8", "c0542", "think", "Run,", None, 0.4),
 ("q9", "c0542", "think", "or fight. Run or fight. Decide!", None, 1.0),
 # ---------- final ----------
 ("e1", "final", "ava", "So right now you've got a dog, fifteen bullets, a silver key, a helicopter waiting one hour at the river,", None, 0.4),
 ("e2", "final", "ava", "and a giant coming up the stairs,", None, 0.4),
 ("e3", "final", "ava", "slowly, like it knows you have nowhere to go.", None, 0.6),
 ("e4", "final", "ava", "Option one: jump out the window and run for the river. Option two: stand your ground and fight it with fifteen bullets and a hallway full of oil lamps.", None, 0.6),
 ("e5", "final", "ava", "Comment one or two,", None, 0.4),
 ("e6", "final", "ava", "most comments decide Day four. SUBSCRIBE!", None, 0.5),
]

VOICE = {"ava": "f2a102da", "think": "f2a102da", "shake": "f2a102da", "marla": "996b1578", "dutch": "644338f4", "pilot": "0e713b26"}
STYLE = {"ava": (0.88, None), "think": (0.76, "whisper"), "shake": (0.80, "whisper, low pitch"), "marla": (0.9, None), "dutch": (0.92, None), "pilot": (1.0, None)}
# por toma (speed, instruct): numeros sueltos y cuentas a velocidad normal (a 0.88 se estiran las silabas)
TSTYLE = {"u1": (1.0, None), "u2": (1.0, None), "u3": (1.0, None), "l5": (1.0, None), "r4": (0.95, None), "r8": (1.0, None), "q8": (0.85, "whisper"), "e6": (0.95, None)}
if __name__ == "__main__":
    new = [t for t in T if t[4] is None]
    print(len(T), "tomas;", len(new), "a generar;", sum(len(t[3].split()) for t in new), "palabras")
