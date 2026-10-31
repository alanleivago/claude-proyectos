# Ronda 2: inserta los planos nuevos en shots.json (despues del plano indicado) y corrige anclas. python shots_r2.py
import json
S = json.load(open('shots.json', encoding='utf-8'))
ids = [s[0] for s in S]
NEW = {  # tras este plano -> lista de planos nuevos
 "10_lock": [
  ["10b_okayest", "hall", ["a5b", 0], "PASILLO LARGO del primer piso (fija al fondo, Ava pequena) probando puertas: 'two locked' (traqueteo de la manilla), 'closet'; corte a primer plano de la taza en un escritorio: WORLD'S OKAYEST COP en 'Okayest'."]],
 "36_smile": [
  ["36b_breakroom", "breakroom", ["fo1", 0], "Sala de descanso: FIJA alta a traves de la puerta (marco en primer termino), dos maquinas expendedoras iluminadas, Ava entra y cruza el cuadro."],
  ["36c_vending", "breakroom", ["fo2", 0], "Angulo bajo DESDE DENTRO de la maquina (espirales y chocolatinas en primer termino): toalla sobre el cristal, golpe de silla en 'chair', solo el cristal de la maquina cede."],
  ["36d_item_food", "screens", ["fo3", 0], "ITEM RE2: entra FOOD (CANDY BAR x20, CHIPS x9) en 'candy'; EXAMINE '250 cal each'; '= 2.5 DAYS' en 'half'."],
  ["36e_threes", "screens", ["fo4", "rule"], "Diagrama RULE OF THREES: icono gota '3 DAYS' en 'water' y chocolatina '3 WEEKS' en 'weeks'; la gota se marca primero (por eso el agua primero)."],
  ["36f_coffee", "breakroom", ["fo6", 0], "Cafetera APAGADA en primer termino (sobre-objeto), Ava detras mira a camara con cara triste/cute en 'hurts'."]],
 "40_tag": [
  ["40b_ball", "kennel", ["k5b", 0], "Ribbon con chaleco K-9 y pelota de tenis mordida (label en 'vest'/'ball'); en 'candy' levanta la cabeza y mueve la cola hacia Ava."]],
 "48_boots": [
  ["48b_cells_hall", "cells", ["c1", 0], "PASILLO LARGO de las celdas, camara fija al fondo y alta, Ava pequena con el haz de la linterna barriendo las rejas."],
  ["48c_cell3", "cells", ["c2", 0], "A traves de los barrotes en primer termino: la linterna descubre la celda 3 ocupada (placa '3')."],
  ["48d_prisoner", "cells", ["c3", 0], "Angulo bajo dramatico: preso convertido (mono naranja, piel gris) se lanza contra los barrotes; SOLO los barrotes vibran en cada golpe."],
  ["48e_steel", "screens", ["c4", "sound"], "Diagrama: barra AIR 343 m/s vs STEEL ~5,960 m/s (a escala) en 'steel', '>15x' en 'fifteen'; ondas recorriendo los barrotes en 'rings'."],
  ["48f_rule5", "cells", ["c5", 0], "FIJA alta de esquina del pasillo: RULE 5: NOBODY GOES DOWN THE BACK HALL en 'back'."],
  ["48g_clover_door", "cells", ["c7", 0], "Puerta al fondo del pasillo: primer plano de la cerradura con un TREBOL grabado en 'clover'; Ava prueba la manilla en 'open' (solo la puerta traquetea)."],
  ["48h_records", "records", ["v1", 0], "Pasillo: FIJA baja, luz bajo la puerta de RECORDS; Ava pasa y se para en 'whispers'."],
  ["48i_door_talk", "records", ["v2", 0], "Sobre el hombro de Ava ante la puerta de cristal esmerilado: silueta de Marla detras (sin cara); la silueta se mueve con su voz."],
  ["48j_trade", "records", ["v4", "trade"], "A ras de suelo: dos chocolatinas se deslizan bajo la puerta en 'candy'; en v5 'sheet' sale una hoja doblada. Pantalla de trueque RE abajo (CANDY BAR x2 -> NOTE)."],
  ["48k_radio_warn", "records", ["v6", 0], "Push-in lento al cristal esmerilado; la silueta se acerca en 'radio'."],
  ["48l_gone", "records", ["v8", 0], "FIJA alta de esquina: puerta abierta, sala de archivos vacia, nota en la mesa 'WENT FOR THE ROOF. — M.' en 'gone'."],
  ["48m_note", "screens", ["q1", 0], "FILE: nota del sargento a mano: 'Set the evidence locker to the broadcast. DAYS - RULES - DAYS. Sgt. M. Harlan'."],
  ["48n_puzzle", "screens", ["q3", 0], "Pantalla de puzle RE: taquilla de pruebas con 3 diales; ruedan a 7 en 'Seven', 3 en 'three', 7 en el ultimo 'seven'; CLICK en q4 'Click'."],
  ["48o_key", "screens", ["q4", "inside"], "EXAMINE RE2: llave de laton con forma de TREBOL girando ('CLOVER KEY'), entra en una casilla del ITEM."],
  ["48p_tired", "hall", ["z1", 0], "FIJA alta de esquina del vestibulo oscuro: Ava sentada contra el mostrador bostezando; label 20 HOURS AWAKE en 'twenty'."],
  ["48q_bac", "screens", ["z2", 0], "Diagrama: 24 H AWAKE en 'twenty-four' = BAC 0.10% en 'point' contra la linea LEGAL LIMIT 0.08 en 'legal'; fuente CDC."],
  ["48r_guard", "hall", ["z3", 0], "A traves del marco de la puerta (primer termino): Ribbon tumbada en el umbral con los ojos abiertos, Ava dormida detras; reloj de pared salta 2 horas en 'two hours'."]],
 "49_save_room": [
  ["49b_map", "screens", ["mp1", 0], "MAPA RE2 de la comisaria (plantas 1F/3F/ROOF): SAFE ROOM en verde en 'safe', FRONT DOORS X roja en 'front', BACK GATE cadena en 'chained', ROOF + escalera desde 3F parpadeando en 'roof'/'plan'."]],
 "58_twenty": [
  ["58b_fifty", "hall", ["x1", 0], "A traves del cristal: la horda llena la calle, contador del cristal 20 -> 50 en 'fifty'."],
  ["58c_inside", "hall", ["x2", 0], "Angulo bajo: Ribbon se gira del cristal hacia el pasillo OSCURO del interior y grune en 'growls'."],
  ["58d_cross", "hall", ["x3", 0], "FIJA alta de esquina del vestibulo a oscuras: Ava cruza el cuadro despacio, linterna apagada; corte a otro angulo fijo cuando llega al pasillo."],
  ["58e_breathing", "hall", ["x4", 0], "Pasillo largo totalmente oscuro, push-in lento; algo respira al fondo (sin ver que es)."],
  ["58f_faster", "hall", ["x5", 0], "Cristal: Vickers golpea mas rapido (solo el cristal tiembla), su cabeza sigue la posicion de Ava."]],
}
FIX = {  # anclas corregidas
 "24_armory": ["m2", "armory"],   # 23 (puerta) dura todo "Good news… you found"
}
out = []
for s in S:
    if s[0] in FIX: s[2] = FIX[s[0]]
    out.append(s); out += NEW.get(s[0], [])
missing = [k for k in NEW if k not in ids]; assert not missing, missing
json.dump(out, open('shots.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(S), '->', len(out))
