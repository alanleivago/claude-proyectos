# zelda-oot "sonido pro": the cue list from the expanded plan (audio/plan.json) and voice.json. Real CC0 recordings only:
# this piece's Freesound picks (screened with earshot, ZO) + the vetted libraries of zelda-fairy (ZF) and the Odyssey parts.
# Beds per set (continuous over consecutive panels on the same set), a soft cloth swish on every slide, the scroll on every
# chapter card, and the story's events on their line/word times. -> cues.json (for sfxmix.py)
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE)); PS = os.path.dirname(PIECE)
LIB = lambda p: os.path.join(PS, p, 'audio', 'sfxlib', 'raw') + '/'
ZO, ZF, O1, O3, O4, O5, O6, CY = LIB('zelda-oot'), LIB('zelda-fairy'), LIB('odyssey-p1'), LIB('odyssey-p3'), LIB('odyssey-p4'), LIB('odyssey-p5'), LIB('odyssey-p6'), LIB('odyssey-cyclops')
F = {  # name -> (library, file, start-offset)
  'forest': (ZF, 'forest_amb/fs471891.mp3', 5), 'night': (ZF, 'night_forest/fs719558.mp3', 2), 'wind': (ZF, 'wind/fs567356.mp3', 3), 'sparkle': (ZF, 'sparkle/fs817466.mp3', 0),
  'curse': (ZF, 'curse/fs466658.mp3', 0), 'ocarina': (ZF, 'ocarina/fs697426.mp3', 1), 'sword_draw': (ZF, 'sword_draw/fs668607.mp3', 0), 'whoosh': (ZF, 'whoosh/fs742830.mp3', 0),
  'gasp': (ZF, 'gasp/fs736663.mp3', 0), 'bell': (ZF, 'castle_bell/fs57070.mp3', 0), 'tree_groan': (ZF, 'tree_groan/fs797994.mp3', 0), 'leaves': (ZF, 'leaves/fs593492.mp3', 0.5),
  'birds': (ZO, 'birds_forest/fs434024.mp3', 2), 'bubbles': (ZO, 'bubbles/fs409301.mp3', 0), 'cave': (ZO, 'cave/fs343742.mp3', 3), 'chain': (ZO, 'chain/fs345070.mp3', 0),
  'cheer': (ZO, 'cheer/fs764150.mp3', 0), 'swish': (ZO, 'cloth_swish/fs742905.mp3', 0), 'crumble': (ZO, 'crumble/fs829103.mp3', 0), 'drum': (ZO, 'drum/fs488460.mp3', 0),
  'explosion': (ZO, 'explosion/fs140727.mp3', 0), 'fountain': (ZO, 'fountain/fs738777.mp3', 2), 'gallop': (ZO, 'gallop/fs675421.mp3', 0), 'harp': (ZO, 'harp/fs610703.mp3', 0),
  'lava': (ZO, 'lava/fs474849.mp3', 1), 'magic': (ZO, 'magic/fs735062.mp3', 0), 'scroll': (ZO, 'scroll/fs185051.mp3', 0), 'chime2': (ZO, 'sparkle2/fs376749.mp3', 0),
  'wind_desert': (ZO, 'wind_desert/fs623604.mp3', 2),
  'thunder': (O1, 'thunder/fs534023.mp3', 0), 'storm': (O1, 'storm/fs344721.mp3', 2), 'crickets': (O1, 'crickets/fs254270.mp3', 1), 'big_fire': (O1, 'big_fire/fs483318.mp3', 1),
  'ghost_wind': (O1, 'ghost_wind/fs440962.mp3', 1), 'clash': (O1, 'sword_clash/fs326787.mp3', 0),
  'fire': (CY, 'fire_crackle/fs181563.mp3', 1), 'rumble': (CY, 'rumble/fs199803.mp3', 0), 'roar': (CY, 'roar/fs132874.mp3', 0), 'rock': (CY, 'rock_crack/fs157804.mp3', 0),
  'thud': (CY, 'thud/fs336489.mp3', 0), 'stone_door': (CY, 'stone_door/fs457529.mp3', 0), 'splash': (CY, 'splash/fs189504.mp3', 0),
  'waterfall': (O4, 'waterfall/fs352902.mp3', 2), 'rain': (O5, 'rain/fs592996.mp3', 2), 'stream': (O5, 'stream/fs468241.mp3', 2), 'arrow': (O6, 'arrow_whoosh/fs394180.mp3', 0),
  'metal': (O6, 'metal_ting/fs278169.mp3', 0), 'village': (O6, 'village/fs442481.mp3', 2), 'crowd': (O3, 'crowd_murmur/fs480725.mp3', 2), 'drip': (O3, 'drip/fs478691.mp3', 0), 'chime': (O3, 'chime/fs169281.mp3', 0),
}
P = json.load(open(os.path.join(PIECE, 'audio', 'plan.json'))); PAN = P['panels']; V = json.load(open(os.path.join(PIECE, 'voice.json'))); L = {l['id']: l for l in V['lines']}; END = V['duration']
LT = lambda n: L['l%03d' % n]['t0']; LE = lambda n: L['l%03d' % n]['t1']
def VW(n, w):
    for x in L['l%03d' % n]['words']:
        if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == w: return x['t0']
    return LT(n)
C = []
def ev(t, k, g, pan=0, **kw): lib, f, ss = F[k]; C.append(dict(t=round(t, 3), file=lib + f, name=k, gain=g, pan=pan, ss=kw.pop('ss', 0), onset=True, **kw))
def bed(t0, t1, k, g, **kw): lib, f, ss = F[k]; C.append(dict(t=round(t0, 3), file=lib + f, name=k + ' bed', gain=g, ss=ss, dur=round(t1 - t0, 3), norm='int', fi=1.2, fo=1.2, **kw))
SET_BED = {  # set -> [(bed, gain dB, extra)]
  'roots': [('forest', -16)], 'desert': [('wind_desert', -12)], 'colossus': [('wind_desert', -13)], 'waste': [('wind_desert', -8), ('ghost_wind', -16)], 'hyrule': [('wind', -15), ('birds', -18)],
  'sky': [('wind', -16)], 'realm': [('wind', -18)], 'sages': [('wind', -17)], 'kokiri': [('forest', -12)], 'glade': [('forest', -12)], 'bridge': [('forest', -13), ('stream', -18)],
  'insidetree': [('cave', -14)], 'garden': [('fountain', -16), ('birds', -17)], 'throne': [('ghost_wind', -22)], 'mountain': [('wind_desert', -15)], 'rockcity': [('cave', -16), ('fire', -18)],
  'lavacave': [('lava', -12)], 'grotto': [('waterfall', -12)], 'belly': [('bubbles', -12)], 'gate': [('rain', -10), ('storm', -16)], 'hall': [('ghost_wind', -22)], 'swordroom': [('ghost_wind', -22)],
  'town': [('fire', -15), ('ghost_wind', -17)], 'ftemple': [('night', -13)], 'firetemple': [('lava', -13), ('fire', -16)], 'frozen': [('ghost_wind', -14)], 'wtemple': [('bubbles', -15), ('drip', -18)],
  'village': [('big_fire', -12), ('crickets', -18)], 'crypt': [('cave', -14)], 'organ': [('storm', -18)], 'ruins': [('ghost_wind', -14), ('rumble', -18)], 'market': [('crowd', -14), ('fountain', -19)],
  'kakariko': [('birds', -14), ('village', -18)], 'lake': [('stream', -13), ('birds', -19)], 'graveyard': [('crickets', -14), ('ghost_wind', -18)], 'barrier': [('fire', -15), ('ghost_wind', -20)],
  'stairs': [('rumble', -12), ('ghost_wind', -16)],
}
# beds: one span per run of panels on the same set (+ night crickets where the panel is night)
i = 0
while i < len(PAN):
    j = i
    while j + 1 < len(PAN) and PAN[j + 1]['set'] == PAN[i]['set']: j += 1
    t0, t1 = max(0, PAN[i]['t0'] - 0.5), min(END, PAN[j]['t1'] + 0.5)
    if PAN[i]['id'] == 'p084': t1 = END
    for b, g in SET_BED.get(PAN[i]['set'], []): bed(t0, t1, b, g)
    if any('night' in PAN[k]['fx'] for k in range(i, j + 1)) and PAN[i]['set'] not in ('village', 'graveyard'): bed(t0, t1, 'crickets', -17)
    i = j + 1
# slides and cards
for k, p in enumerate(PAN):
    if k: ev(p['t0'] - 0.42, 'swish', -15, pan=0.4)
    if p['card']:
        ev(p['t0'] + 0.32, 'scroll', -7); ev(LT(int(p['line'])) + 1.5, 'scroll', -11, ss=0.3)
# story events (base panels only; times from the lines/words)
done = set()
def once(key): 
    if key in done: return False
    done.add(key); return True
for p in PAN:
    b, fx, names = p['base'], p['fx'], [c['n'] for c in p['cast']]; bt0 = p['bt0']
    if p['k'] == 0:
        if 'triforce' in fx: ev(bt0 + 0.4, 'sparkle', -6); ev(bt0 + 0.9, 'chime', -10)
        if 'split' in fx: ev(bt0 + 2.2, 'magic', -6); ev(bt0 + 2.5, 'chime2', -10)
        if 'earth' in fx: ev(bt0 + 1.0, 'rumble', -9)
        if 'water' in fx: bed(bt0 + 0.8, p['t1'], 'stream', -14)
        if 'birds' in fx: ev(bt0 + 0.5, 'birds', -12, dur=6)
        if 'notes' in fx: ev(bt0 + 0.6, 'ocarina', -9)
        if 'curse' in fx: ev(bt0 + 0.8, 'curse', -6)
        if 'dream' in fx: ev(LT(33), 'gallop', -14, to=3.0); ev(LT(34), 'thunder', -12)
        if 'medallions' in fx: ev(bt0 + 1.0, 'chime', -8); ev(bt0 + 1.6, 'chime2', -11)
        if 'rainbow' in fx: ev(bt0 + 0.6, 'harp', -8)
        if 'rubble' in fx: ev(bt0 + 0.3, 'crumble', -6); bed(bt0, p['bt1'], 'rumble', -14)
        if 'firering' in fx: bed(bt0 + 0.5, p['bt1'], 'big_fire', -12)
        if 'sealrays' in fx: ev(LT(290), 'magic', -5); ev(LT(290) + 0.4, 'rumble', -6)
        if 'timesplit' in fx: ev(LT(319), 'harp', -9); ev(LT(320), 'chime', -12)
        if 'mother' in fx: ev(LT(192) - 0.2, 'chime2', -14)
        if 'rain' in fx and once('thunder' + b): ev(bt0 + 2.0, 'thunder', -11)
        if 'bomb' in fx: ev(LT(107) + 0.4, 'explosion', -4)
        if 'blast' in fx: ev(VW(135, 'knocked') - 0.1, 'magic', -4)
        if 'triforce_hand' in fx: ev(LT(154), 'magic', -8)
        if 'triforce_glow' in fx: ev(LT(250), 'sparkle', -7)
        if 'arrows' in fx: ev(LT(256), 'sparkle', -8) if b == 'p069' else [ev(LT(274) + j * 0.9, 'arrow', -6) for j in range(3)]
        if 'redglow' in fx: ev(LT(258), 'magic', -6)
        if 'triforce3' in fx: [ev(LT(n), 'chime', -10) for n in (266, 267, 268)]
        if 'darkballs' in fx: [ev(LT(273) + j * 1.4, 'whoosh', -10) for j in range(3)]
        if 'altar' in fx: ev(LT(142), 'chime', -9); ev(LT(143), 'stone_door', -5)
        if 'swordrays' in fx and b == 'p048': pass
        if 'sign' in fx: ev(P['sign'] + 0.1, 'bell', -10); ev(P['sign'] + 0.4, 'sparkle', -12)
    for c in p['cast']:
        n, o = c['n'], c['o']; key = b + n
        if o.get('navi') == 'arrive' and once('navi_a'): ev(LT(41) - 0.6, 'sparkle', -8)
        if o.get('navi') == 'leave' and once('navi_l'): ev(LT(310) + 1.0, 'sparkle', -9)
        if o.get('pose') and o['pose'][0] == 'link_sword' and once('sword'): ev(LT(o['pose'][1]) - 0.15, 'sword_draw', -4); ev(LT(o['pose'][1]) + 0.1, 'chime', -8)
        if o.get('sage') and once('sage' + n): ev(LT(o['from']) - 0.2, 'chime', -8); ev(LT(o['from']), 'sparkle', -12)
        if o.get('gallop') and once('gallop' + key): ev(LT(o['at']) - 0.4, 'gallop', -6, to=3.4)
        if o.get('leave') and once('leave' + key): ev(LT(o['leave']), 'gallop', -9, to=2.4)
        if o.get('thrown') and once('thrown'): ev(LT(o['thrown']) + 0.3, 'whoosh', -11); ev(LT(o['thrown']) + 0.9, 'thud', -6)
        if o.get('vanish') and once('vanish'): ev(LT(o['vanish']) + 0.6, 'sparkle', -6); ev(LT(o['vanish']) + 0.8, 'harp', -10)
        if o.get('sealed') and once('sealed'): pass
        if n == 'gohma' and once(key): ev(p['bt0'] + 1.0, 'roar', -9, semi=4)
        if n == 'giant-lizard' and once(key): ev(p['bt0'] + 0.8, 'roar', -6, semi=-2)
        if n == 'fire-dragon' and once(key): ev(p['bt0'] + 1.0, 'roar', -5, semi=-3); ev(LT(205), 'thud', -4); ev(LT(205) + 0.2, 'rock', -8)
        if n == 'water-creature' and once(key): ev(LT(214), 'splash', -6)
        if n == 'drumming-hands' and once(key): [ev(p['bt0'] + 0.8 + j * 0.55, 'drum', -8 - (j % 2) * 3) for j in range(8)]
        if n == 'jellyfish-parasite' and once(key): ev(p['bt0'] + 0.8, 'magic', -10)
        if n in ('fire-witch', 'ice-witch') and once(key): ev((LT(o['from']) if o.get('from') else p['bt0'] + 0.5) + (0.35 if n == 'ice-witch' else 0), 'whoosh', -14, pan=-0.5 if c['x'] < 960 else 0.5)
        if n == 'iron-knight' and once(key): ev(LT(240), 'clash', -6); ev(LT(241), 'metal', -6)
        if n == 'ganon-beast' and o.get('rise') and once(key): ev(p['bt0'] + 1.5, 'roar', -3, semi=-5); ev(p['bt0'] + 1.2, 'rumble', -6)
        if n == 'redead' and once(key): ev(p['bt0'] + 1.2, 'gasp', -14, semi=-4)
        if n == 'crystal' or (o.get('crystal') and once('crystal' + b)): ev(p['bt0'] + 0.6, 'chime2', -14)
        if n == 'darunia' and o.get('dance') and once(key): pass
        if n == 'deku' and o.get('dying') and once(key): ev(LT(51), 'tree_groan', -6); ev(LT(51) + 0.6, 'leaves', -10)
        if n == 'deku' and o.get('sick') and once(key): ev(p['bt0'] + 0.6, 'tree_groan', -10)
    if b == 'p038' and p['k'] == 0: ev(LT(108), 'cheer', -9)
    if b == 'p033' and p['k'] == 0: ev(LT(96) + 1.0, 'ocarina', -10)
    if b == 'p072' and p['k'] == 0: ev(p['bt0'] + 0.5, 'rumble', -12)
C.sort(key=lambda c: c['t'])
json.dump(C, open(os.path.join(HERE, 'cues.json'), 'w'), indent=0); print(len(C), 'cues')
