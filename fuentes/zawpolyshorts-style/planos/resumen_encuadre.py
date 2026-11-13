"""Totals of medir_encuadre.py: Zaw (all zaw_* tags) vs each of our tags -> encuadre_stats.json + a markdown table on stdout.
Usage: .venv/bin/python -I resumen_encuadre.py <meas_dir> [out.json]"""
import collections, json, math, sys
from pathlib import Path

import numpy as np

M = Path(sys.argv[1])
SIZES = ["ECU", "CU", "MCU", "MS", "MFS", "FS", "WS", "INSERT"]


def load(tag):
    p = M / tag / "measure.json"
    return json.loads(p.read_text()) if p.exists() else []


def h(b):
    return None if not b else max(0.0, min(1.0, b[3]) - max(0.0, b[1]))


def q(v):
    v = [x for x in v if x is not None and not (isinstance(x, float) and math.isnan(x))]
    if not v:
        return None
    a = np.array(v, float)
    return {"n": len(v), "mean": round(float(a.mean()), 3), "med": round(float(np.median(a)), 3),
            "p25": round(float(np.percentile(a, 25)), 3), "p75": round(float(np.percentile(a, 75)), 3)}


def pct(rows, key, order=None):
    c = collections.Counter(r.get(key) for r in rows); n = max(1, len(rows))
    ks = order or [k for k, _ in c.most_common()]
    return {str(k): round(100 * c.get(k, 0) / n, 1) for k in ks if c.get(k, 0)}


def moved(r):
    m = r.get("move_px")
    if not m or m["inliers"] < 15 or abs(math.log(max(m["zoom"], 1e-3))) > 0.6:
        return None
    return m


def stats(rows, nvid):
    st = {"videos": nvid, "shots": len(rows)}
    d = [r["dur"] for r in rows]
    st["shot_len"] = q(d); st["cuts_per_s"] = round(len(rows) / max(1e-6, sum(d)), 3)
    st["size_pct"] = pct(rows, "size", SIZES)
    st["main_pct"] = pct(rows, "main")
    an = [r for r in rows if r.get("animal_box")]
    hu = [r for r in rows if r.get("human_box")]
    st["animal_h"] = q([h(r["animal_box"]) for r in an])
    st["animal_h_by_size"] = {s: q([h(r["animal_box"]) for r in an if r["size"] == s]) for s in SIZES if any(r["size"] == s for r in an)}
    st["animal_cut_pct"] = pct(an, "animal_cut")
    st["animal_in_shots_pct"] = round(100 * len(an) / max(1, len(rows)), 1)
    st["human_h"] = q([h(r["human_box"]) for r in hu])
    st["human_head_y"] = q([r.get("human_head_y") for r in hu])
    st["human_cut_pct"] = pct(hu, "human_cut")
    st["human_in_shots_pct"] = round(100 * len(hu) / max(1, len(rows)), 1)
    st["cam_height_m"] = q([r.get("cam_height_m") for r in rows])
    st["cam_height_m_animal_main"] = q([r.get("cam_height_m") for r in rows if r.get("main") == "animal"])
    st["cam_height_m_human_main"] = q([r.get("cam_height_m") for r in rows if r.get("main") == "human"])
    st["cam_rel_pct"] = pct(rows, "cam_rel")
    st["pitch_deg"] = q([r.get("pitch_deg") for r in rows])
    st["low_angle_pct"] = round(100 * sum(1 for r in rows if (r.get("pitch_deg") or 0) >= 8) / max(1, len(rows)), 1)
    st["hfov_deg"] = q([r.get("hfov_deg") for r in rows])
    st["dist_m_animal_main"] = q([r.get("subject_dist_m") for r in rows if r.get("main") == "animal"])
    st["dist_m_human_main"] = q([r.get("subject_dist_m") for r in rows if r.get("main") == "human"])
    st["set_visible_pct"] = pct(rows, "set_visible", ["none", "patch", "corner", "one_wall", "most_room"])
    st["set_frac"] = q([r.get("set_frac") for r in rows])
    st["set_scale_vs_real"] = q([r.get("set_scale_vs_real") for r in rows])
    props = collections.defaultdict(list)
    for r in rows:
        for p in r.get("props") or []:
            try:
                nm, v = str(p[0]).lower(), float(p[1])
            except Exception:
                continue
            for key in ("door", "sofa", "couch", "table", "chair", "counter", "bed", "cabinet", "fridge", "window", "toilet", "bathtub", "shelf", "tv"):
                if key in nm:
                    props["sofa" if key == "couch" else key].append(v); break
    st["props_ratio_vs_animal"] = {k: q(v) for k, v in sorted(props.items()) if len(v) >= 2}
    fg = [r for r in rows if r.get("foreground")]
    st["foreground_pct"] = round(100 * len(fg) / max(1, len(rows)), 1)
    st["foreground_dist_m"] = q([r["foreground"].get("dist_m") for r in fg if isinstance(r["foreground"], dict)])
    st["move_pct"] = pct(rows, "move")
    mv = [moved(r) for r in rows]
    ok = [(m, r["dur"]) for m, r in zip(mv, rows) if m]
    st["px_zoom_per_s"] = q([math.log(m["zoom"]) / max(0.2, dd) for m, dd in ok])
    st["px_abs_zoom_per_s"] = q([abs(math.log(m["zoom"])) / max(0.2, dd) for m, dd in ok])
    st["px_pan_per_s"] = q([math.hypot(m["pan_x"], m["pan_y"]) / max(0.2, dd) for m, dd in ok])
    st["px_static_pct"] = round(100 * sum(1 for m, dd in ok if abs(math.log(m["zoom"])) < 0.02 and math.hypot(m["pan_x"], m["pan_y"]) < 0.02) / max(1, len(ok)), 1)
    st["flow_w_per_s"] = q([r.get("flow") for r in rows])
    return st


tags = sorted(p.name for p in M.iterdir() if p.is_dir() and (p / "measure.json").exists())
zaw = [r for t in tags if t.startswith("zaw_") for r in load(t)]
out = {"zaw": stats(zaw, sum(1 for t in tags if t.startswith("zaw_")))}
for t in tags:
    if not t.startswith("zaw_"):
        out[t] = stats(load(t), 1)
out["zaw_per_video"] = {t: {"shots": len(load(t)), "mean_len": round(sum(r["dur"] for r in load(t)) / max(1, len(load(t))), 2),
                            "animal_h_med": (q([h(r["animal_box"]) for r in load(t) if r.get("animal_box")]) or {}).get("med")}
                        for t in tags if t.startswith("zaw_")}
dst = Path(sys.argv[2]) if len(sys.argv) > 2 else M / "encuadre_stats.json"
dst.write_text(json.dumps(out, indent=1))
print(json.dumps(out, indent=1))
