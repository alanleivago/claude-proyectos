"""Writes audio/design/sfx.json and ambience.json for the coma film (kept as code so levels are easy to tune)."""
import json
S = 'audio/assets/sfx/'; A = 'audio/assets/ambience/'; M = 'audio/assets/music/'


def smp(f, s, e, pk=-6, eq=None, fi=0.003, fo=0.05, mono=True):
    d = {'file': f, 'start': s, 'end': e, 'norm_peak_db': pk, 'fade_in': fi, 'fade_out': fo, 'mono': mono}
    if eq:
        d['eq'] = eq
    return d


samples = {
    'fx.creak.a': smp(S + 'fs-506664_wood-creak-single-v9.ogg', 0.03, 0.40, eq={'hp': 80}),
    'fx.creak.b': smp(S + 'fs-191497_creaking-pier.ogg', 99.0, 100.1, eq={'hp': 80}, fo=0.15),
    'fx.creak.c': smp(S + 'fs-191497_creaking-pier.ogg', 54.1, 55.15, eq={'hp': 80}, fo=0.15),
    'fx.cheer.men': smp(S + 'fs-274510_3-men-cheering.ogg', 0.08, 2.05, eq={'hp': 150}, fo=0.3, mono=False),
    'fx.cheer.app': smp(S + 'fs-830415_cheer-applause.ogg', 1.9, 5.4, eq={'hp': 150}, fo=0.8, mono=False),
    'fx.cheer.woo': smp(S + 'fs-329331_crowd-woos.ogg', 2.75, 3.95, eq={'hp': 150}, fo=0.3, mono=False),
    'fx.whoosh.up': smp(S + 'fs-810736_fast-whoosh.ogg', 0.05, 0.6, eq={'hp': 120}, fo=0.1),
    'fx.whoosh.fall': smp(S + 'fs-648540_cinematic-woosh-sfx-006.ogg', 0.0, 2.2, eq={'hp': 100}, fo=0.05, fi=0.3),
    'fx.splash': smp(S + 'fs-352101_splash-jumping-a.ogg', 0.08, 2.4, pk=-3, fo=0.4, mono=False),
    'fx.plunge': smp(S + 'fs-637823_splash-body-dive-into-water-pool.ogg', 0.45, 3.0, pk=-4, eq={'lp': 3000}, fo=0.6),
    'fx.hit': smp(S + 'fs-653294_big-structure-collision-heard-from-insid.ogg', 0.0, 3.0, pk=-2, eq={'lp': 1800}, fo=0.8),
    'fx.hit.sub': smp(S + 'fs-856174_subterranean-deep-sub-bass-rumble-drop.ogg', 0.0, 3.6, pk=-3, eq={'hp': 28, 'lp': 300}, fo=0.8),
    'fx.bub.a': smp(S + 'fs-232862_bubbles.ogg', 0.0, 1.47, eq={'lp': 4000}, fo=0.2),
    'fx.bub.b': smp(S + 'fs-840042_bubbles.ogg', 0.0, 1.19, eq={'lp': 4000}, fo=0.2),
    'fx.bub.big': smp(S + 'fs-823209_underwaterhugebubble.ogg', 0.03, 2.78, eq={'lp': 3500}, fo=0.4),
    'fx.beep.a': smp(A + 'fs-790709_hospital-machine-beeping.ogg', 169.42, 169.78, eq={'hp': 400}, fo=0.08),
    'fx.beep.b': smp(A + 'fs-790709_hospital-machine-beeping.ogg', 175.42, 175.78, eq={'hp': 400}, fo=0.08),
    'fx.beep.c': smp(A + 'fs-790709_hospital-machine-beeping.ogg', 195.42, 195.78, eq={'hp': 400}, fo=0.08),
    'fx.penlight': smp(S + 'fs-410359_torch-click-1.ogg', 0.02, 0.38),
    'fx.sob.mom': smp(S + 'fs-272093_sobbing-young-lady.ogg', 4.4, 7.6, eq={'hp': 150, 'lp': 7000}, fi=0.2, fo=0.6),
    'fx.cry.mom': smp(S + 'fs-449439_woman-crying.ogg', 0.0, 3.2, eq={'hp': 150, 'lp': 7000}, fi=0.15, fo=0.5),
    'fx.alarm': smp(S + 'fs-459826_alarm-3.ogg', 4.35, 6.3, eq={'hp': 300}, fo=0.25),
    'fx.thunder.1': smp(S + 'fs-567945_200817-thunder-pretty-close-crack-4pm.ogg', 4.68, 9.5, pk=-1, fo=1.5, mono=False),
    'fx.thunder.2': smp(S + 'fs-576041_huge-thunderclap.ogg', 1.76, 6.5, pk=-1, fo=1.5, mono=False),
    'fx.thunder.3': smp(S + 'fs-505113_thunder-close.ogg', 4.33, 9.0, pk=-3, fo=1.5, mono=False),
    'fx.buzz.a': smp(S + 'fs-384485_cell-phone-vibrate-wood-table-loopable.ogg', 0.01, 0.24, fo=0.03),
    'fx.buzz.b': smp(S + 'fs-384485_cell-phone-vibrate-wood-table-loopable.ogg', 1.00, 1.23, fo=0.03),
    'fx.buzz.c': smp(S + 'fs-384485_cell-phone-vibrate-wood-table-loopable.ogg', 1.99, 2.22, fo=0.03),
    'fx.page': smp(S + 'fs-457916_turn-over-the-book-page-2.ogg', 0.9, 1.9, eq={'hp': 200}, fo=0.15),
    'fx.step.a': smp(S + 'fs-217947_shoeswalktilesstop02.ogg', 0.98, 1.36, eq={'hp': 90}),
    'fx.step.b': smp(S + 'fs-770066_footsteps-knight-castle-corridor-tiles.ogg', 31.57, 31.95, eq={'hp': 90}),
    'fx.step.c': smp(S + 'fs-770066_footsteps-knight-castle-corridor-tiles.ogg', 42.21, 42.7, eq={'hp': 90}, fo=0.08),
    'fx.intercom': smp(S + 'fs-264995_intercom-static-and-buttons.ogg', 34.14, 34.7, eq={'hp': 300}, fo=0.08),
    'fx.chime': smp(S + 'fs-454610_richcraft-chime-4-20181219.ogg', 0.04, 1.93, fo=0.4),
    'fx.bowl': smp(S + 'fs-415139_singing-bowl-single-strike-2.ogg', 0.0, 7.0, fo=2.5, mono=False),
    'fx.laugh': smp(S + 'fs-687349_woman-s-soft-laughter.ogg', 4.72, 6.0, eq={'hp': 150}, fo=0.25),
    'fx.breath.a': smp(S + 'fs-724232_relief-sigh.ogg', 2.2, 3.65, eq={'hp': 120}, fo=0.25),
    'fx.breath.b': smp(S + 'fs-242909_relieved-sigh.ogg', 0.06, 0.7, eq={'hp': 120}, fo=0.15),
}
pools = {k: [k] for k in samples}
pools['fx.creak'] = ['fx.creak.a', 'fx.creak.b', 'fx.creak.c']
pools['fx.bub'] = ['fx.bub.a', 'fx.bub.b']
pools['fx.beep'] = ['fx.beep.a', 'fx.beep.b', 'fx.beep.c']
pools['fx.buzz'] = ['fx.buzz.a', 'fx.buzz.b', 'fx.buzz.c']
pools['fx.step'] = ['fx.step.a', 'fx.step.b', 'fx.step.c']
pools['fx.cheer'] = ['fx.cheer.men', 'fx.cheer.app', 'fx.cheer.woo']


def R(name, match, pool, g, **k):
    return dict(name=name, match=match, pool=pool, gain_db=g, **k)


rules = [
    R('fx.cheer', {'kind': 'cheer'}, 'fx.cheer', -14, mode='cycle', pan_scale=1.0, align='peak'),
    R('fx.crouch', {'id': 'jump:crouch'}, 'fx.creak', -16, mode='fixed', pan=0),
    R('fx.takeoff.creak', {'id': 'jump:takeoff'}, 'fx.creak.b', -14, pan=0, no_cue=True),
    R('fx.takeoff', {'id': 'jump:takeoff'}, 'fx.whoosh.up', -18, align='peak', offset=0.12, pan=0),
    R('fx.fall', {'kind': 'whoosh'}, 'fx.whoosh.fall', -12, align='peak', pan=0),
    R('fx.splash', {'kind': 'splash'}, 'fx.splash', -6, pan=0),
    R('fx.plunge', {'kind': 'splash'}, 'fx.plunge', -12, offset=0.05, pan=0, no_cue=True),
    R('fx.hit', {'kind': 'impact'}, 'fx.hit', -5, pan=0),
    R('fx.hit.sub', {'kind': 'impact'}, 'fx.hit.sub', -9, pan=0, no_cue=True),
    R('fx.bub.big', {'id': 'hit:bubbles'}, 'fx.bub.big', -14, pan=0.1),
    R('fx.bub.sink', {'id': 'sink:bubbles'}, 'fx.bub', -18, pan=-0.1),
    R('fx.beep.room', {'kind': 'beep', 'from': 16, 'to': 24}, 'fx.beep', -20, mode='cycle', jitter_db=0.5, pan=-0.35),
    R('fx.beep.lake', {'kind': 'beep', 'from': 24, 'to': 36}, 'fx.beep', -30, mode='cycle', jitter_db=0.5, pan=-0.2),
    R('fx.beep.weeks', {'kind': 'beep', 'from': 36, 'to': 47}, 'fx.beep', -21, mode='cycle', jitter_db=0.5, pan=-0.35),
    R('fx.beep.slow', {'kind': 'beep', 'from': 64, 'to': 75}, 'fx.beep', -20, mode='cycle', jitter_db=0.5, pan=-0.35),
    R('fx.penlight', {'id': 'pupil:penlight'}, 'fx.penlight', -16, pan=0.1),
    R('fx.alarm', {'kind': 'alarm'}, 'fx.alarm', -14, align='start', pan=-0.2),
    R('fx.thunder1', {'id': 'storm:bolt:1'}, 'fx.thunder.1', -4, pan=0),
    R('fx.thunder2', {'id': 'storm:bolt:2'}, 'fx.thunder.2', -4, pan=0),
    R('fx.thunder3', {'id': 'storm:flash:3'}, 'fx.thunder.3', -10, pan=0),
    R('fx.buzz', {'kind': 'buzz'}, 'fx.buzz', -16, mode='cycle', jitter_db=0.8, pan=0.15),
    R('fx.page', {'kind': 'page'}, 'fx.page', -20, pan=0.05),
    R('fx.step.doctor', {'kind': 'step', 'variant': 'doctor'}, 'fx.step', -12, mode='cycle', jitter_db=1.0, pitch=[-1, 0], pan_scale=1.0),
    R('fx.step.house', {'kind': 'step', 'variant': 'tile'}, 'fx.step', -9, mode='cycle', jitter_db=1.0, pitch=[-2, -1], pan_scale=1.0),
    R('fx.cry.mom', {'id': 'wrong:mom:cry'}, 'fx.cry.mom', -15, align='start', pan=0.3),
    R('fx.intercom', {'id': 'voice:intercom'}, 'fx.intercom', -11, pan=0.0),
    R('fx.chime', {'id': 'lights:on'}, 'fx.chime', -17, pan=0),
    R('fx.bowl', {'id': 'lights:on'}, 'fx.bowl', -22, pan=0, no_cue=True),
    R('fx.detected', {'id': 'lights:detected'}, 'fx.chime', -26, pan=0.1),
    R('fx.laugh', {'id': 'know:laugh'}, 'fx.laugh', -9, align='start', pan=-0.15),
    R('fx.breath1', {'id': 'know:breath:1'}, 'fx.breath.a', -11, align='start', pan=0.2),
    R('fx.breath2', {'id': 'know:breath:2'}, 'fx.breath.b', -13, align='start', pan=-0.1),
]
place = [
    {'sample': 'fx.creak.a', 'at': 1.3, 'gain_db': -14, 'pan': 0.3, 'align': 'peak'},
    {'sample': 'fx.creak.c', 'at': 3.2, 'gain_db': -14, 'pan': -0.25, 'align': 'peak'},
    {'sample': 'fx.creak.a', 'at': 5.1, 'gain_db': -13, 'pan': 0.1, 'align': 'peak'},
    {'sample': 'fx.creak.b', 'at': 6.3, 'gain_db': -15, 'pan': -0.1, 'align': 'peak'},
    {'sample': 'fx.sob.mom', 'at': 21.15, 'gain_db': -15, 'pan': 0.3, 'align': 'start'},
    {'sample': 'fx.bub.a', 'at': 13.6, 'gain_db': -22, 'pan': 0.15, 'align': 'peak'},
    {'sample': 'fx.bub.b', 'at': 14.6, 'gain_db': -24, 'pan': -0.1, 'align': 'peak'},
]
json.dump({'_doc': 'SFX (real recordings only). Every visible thing sounded on the cue frames of out/cues.json (make_cues.py): pier creaks and the friends cheering on the dare, the jump whoosh, splash 9.9, the rock thud 10.0 heard from inside, bubbles; the monitor beep on the picture pulse (0.77 s) from a real hospital monitor recording, quieter and distant on the lake bed, alarm 29.2, thunder on the two bolts 28.5 / 29.95; penlight 19.1; phone pulses 39.0 + 0.385 n; page turn, doctor steps, mom crying; intercom 50.0; tile steps on the house gait; chime + bowl on 57.0, laugh and relieved breaths in the know shot.',
           'samples': samples, 'pools': pools, 'rules': rules, 'place': place}, open('audio/design/sfx.json', 'w'), indent=1)


def B(name, f, s0, s1, at, until, g, eq=None, fi=1.0, fo=1.0, auto=None, **k):
    d = dict(name=name, file=f, src_start=s0, src_end=s1, at=at, until=until, gain_db=g, fade_in=fi, fade_out=fo, **k)
    if eq:
        d['eq'] = eq
    if auto:
        d['auto'] = auto
    return d


UNDER = [[9.95, 0], [12, -3], [15.4, -12]]
amb = [
    # party on the pier 0-9.95, then the same world heard from under the water until 15.5
    B('am.dj', M + 'mk-1077_sounds-good.mp3', 16.0, 60.0, 0.0, 9.95, -9, {'hp': 180, 'lp': 2600, 'peq': [[900, 0.8, 3]]}, fi=0.01, fo=0.04, width=0.6),
    B('am.party', A + 'fs-396683_party-background-chatter-real-2-snatches.ogg', 20.0, 110.0, 0.0, 9.95, -4, {'hp': 150}, fi=0.01, fo=0.04),
    B('am.pier', A + 'fs-91912_dock-wood-creak-water-laping.ogg', 40.0, 100.0, 0.0, 9.95, -1, {'hp': 90}, fi=0.01, fo=0.04),
    B('am.night', A + 'fs-399594_lake-night-summer-11pm-nl-short-170814-1.ogg', 5.0, 80.0, 0.0, 9.95, -8, {'hp': 200}, fi=0.01, fo=0.04),
    B('am.dj.under', M + 'mk-1077_sounds-good.mp3', 25.95, 40.0, 9.95, 15.45, -24, {'lp': 380}, fi=0.02, fo=1.5, auto=UNDER, width=0.2),
    B('am.party.under', A + 'fs-396683_party-background-chatter-real-2-snatches.ogg', 29.95, 60.0, 9.95, 15.45, -6, {'lp': 450}, fi=0.02, fo=1.5, auto=UNDER),
    B('am.under', A + 'fs-255597_underwater-ambience.ogg', 2.0, 40.0, 9.95, 15.5, 2, {'hp': 40, 'lp': 2500}, fi=0.02, fo=1.2, auto=[[9.95, 0], [13, 0], [15.3, -10]]),
    # hospital darkness 16-24
    B('am.room.n', A + 'fs-670070_room-tone-empty-hospital.ogg', 10.0, 100.0, 16.0, 24.05, 8, {'hp': 50}, fi=0.4, fo=0.05),
    B('am.vent.n', A + 'fs-703025_breathing-machine.ogg', 2.0, 34.0, 16.0, 24.05, -8, {'hp': 120}, fi=0.4, fo=0.05),
    B('am.icu.n', A + 'fs-678673_hospital-icu-atmo-ambient.ogg', 10.0, 100.0, 16.0, 24.05, 4, {'hp': 80, 'lp': 6000}, fi=0.4, fo=0.05),
    # dream 24-28: gentle lake, the far party, lanterns / crickets
    B('am.lake.d', A + 'fs-91912_dock-wood-creak-water-laping.ogg', 112.0, 160.0, 24.0, 28.6, 4, {'hp': 60}, fi=0.05, fo=0.7),
    B('am.night.d', A + 'fs-399594_lake-night-summer-11pm-nl-short-170814-1.ogg', 90.0, 160.0, 24.0, 29.0, -4, {'hp': 150}, fi=0.05, fo=1.0),
    B('am.party.d', A + 'fs-396683_party-background-chatter-real-2-snatches.ogg', 130.0, 200.0, 24.0, 28.4, -14, {'hp': 200, 'lp': 1800}, fi=0.05, fo=0.5),
    B('am.dj.d', M + 'mk-1077_sounds-good.mp3', 44.0, 60.0, 24.0, 28.4, -28, {'hp': 200, 'lp': 1500}, fi=0.05, fo=0.5, width=0.4),
    # storm 28-31
    B('am.rain', A + 'fs-768870_heavy-rain-outside.ogg', 1.0, 25.0, 28.0, 31.3, 0, {'hp': 100}, fi=0.7, fo=0.6),
    B('am.wind', A + 'fs-117773_roaring-wind.ogg', 36.0, 80.0, 28.0, 31.3, -2, {'hp': 50}, fi=0.8, fo=0.6),
    B('am.waves', A + 'fs-826442_ocean-pier-sloshing-water-salt-spray.ogg', 20.0, 60.0, 28.0, 31.3, 0, {'hp': 50}, fi=0.6, fo=0.6),
    # off 31-36: a still, eerie lake and the doctors' voices muffled
    B('am.lake.off', A + 'fs-412941_lake-at-night-2.ogg', 20.0, 90.0, 31.0, 36.05, 12, {'hp': 60}, fi=0.6, fo=0.05),
    B('am.voices.off', A + 'fs-762124_hospital-ambience-indoor-medical-clinic.ogg', 20.0, 80.0, 31.2, 36.05, 10, {'hp': 150, 'lp': 650}, fi=0.8, fo=0.05),
    # weeks 3-6 in the room 36-47
    B('am.room.d', A + 'fs-670070_room-tone-empty-hospital.ogg', 100.0, 170.0, 36.0, 47.05, 8, {'hp': 50}, fi=0.05, fo=0.05),
    B('am.icu.d', A + 'fs-678673_hospital-icu-atmo-ambient.ogg', 40.0, 110.0, 36.0, 47.05, 4, {'hp': 80}, fi=0.05, fo=0.05),
    B('am.vent.d', A + 'fs-703025_breathing-machine.ogg', 2.0, 34.0, 36.0, 47.05, -12, {'hp': 120}, fi=0.05, fo=0.05),
    B('am.pa', A + 'fs-640626_pediatric-hospital-waiting-room-speaker.ogg', 4.0, 30.0, 36.0, 47.05, -10, {'hp': 300, 'lp': 3500}, fi=0.3, fo=0.05),
    # MRI 47-50 (loud, under the music), then heard through the control-room glass 50-52
    B('am.mri', S + 'fs-442834_mri-tirm-turbo-inversion-recovery-magnit.ogg', 5.0, 30.0, 47.0, 52.05, -6, {'hp': 60}, fi=0.05, fo=0.05,
      auto=[[47.0, -8], [48.1, -8], [48.3, 0], [49.95, 0], [50.05, -9], [52.05, -9]]),
    B('am.mri.room', A + 'fs-670070_room-tone-empty-hospital.ogg', 20.0, 60.0, 47.0, 50.05, 6, {'hp': 50}, fi=0.05, fo=0.05),
    B('am.ctrl', A + 'fs-762124_hospital-ambience-indoor-medical-clinic.ogg', 85.0, 130.0, 50.0, 52.05, 4, {'hp': 80}, fi=0.05, fo=0.05),
    # house 52-56.6
    B('am.fridge', A + 'fs-637621_kitchen-restaurant-fridge-hum-room-tone.ogg', 5.0, 60.0, 52.0, 56.6, 4, {'hp': 50}, fi=0.3, fo=0.03),
    B('am.kitchen', A + 'fs-669154_230109-2302-fr-kitchenatmosphere.ogg', 10.0, 100.0, 52.0, 56.6, 8, {'hp': 60}, fi=0.3, fo=0.03),
    B('am.birds.h', A + 'fs-844906_suburban-street-birds-ditche-s-hertogenb.ogg', 10.0, 80.0, 52.0, 56.6, -14, {'hp': 1200, 'lp': 9000}, fi=0.3, fo=0.03),
    # control room 57-64
    B('am.ctrl2', A + 'fs-762124_hospital-ambience-indoor-medical-clinic.ogg', 30.0, 80.0, 57.0, 64.3, 2, {'hp': 80}, fi=0.4, fo=0.5),
    # still + card 64-75: soft evening room, distant birds
    B('am.evening', A + 'fs-720251_room-tone-summer-812am-220813-0497.ogg', 10.0, 80.0, 64.0, 75.0, 4, {'hp': 50}, fi=0.8, fo=2.5),
    B('am.birds.e', A + 'fs-844906_suburban-street-birds-ditche-s-hertogenb.ogg', 80.0, 118.0, 64.0, 75.0, -18, {'hp': 1800, 'lp': 8000}, fi=1.0, fo=2.5),
]
json.dump({'_doc': 'Beds (real recordings): party on the pier (DJ speakers = the funk track band-passed, crowd chatter, water lapping and creaks, night crickets) 0-9.95, the same world muffled under water to 15.5; hospital room tone + ventilator + ICU 16-24; dream lake + far party 24-28; rain/wind/waves storm 28-31; an eerie still lake + muffled doctors 31-36; the room in weeks 3-6 with a distant PA; MRI 47-52 (dulled at the control room 50); kitchen, fridge, birds 52-56.6; control room 57-64; evening room + far birds 64-75.',
           'ambience': amb}, open('audio/design/ambience.json', 'w'), indent=1)
print('ok')
