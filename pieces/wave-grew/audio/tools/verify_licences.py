# verify_licences.py: for every recording the film uses (work/mix/mix_report.json files_used), read the licence on the
# item's own record (Freesound API sound instance; Wikimedia Commons imageinfo extmetadata; the incompetech track page)
# and write the agent fields of assets/manifests/audit.json (licence_seen, licence_confirmed, agent_notes).
# Also mirrors "licence"/"licence_url" into the "license"/"license_url" keys audit.py reads.
import datetime, json, os, re, sys, time, urllib.parse, urllib.request
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = os.environ["FREESOUND_API_KEY"]
UA = {"User-Agent": "wave-grew-sound/1.0 (licence audit)"}
TODAY = datetime.date.today().isoformat()
MAN = os.path.join(A, "assets", "manifests")

def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()

used = set(json.load(open(os.path.join(A, "work", "mix", "mix_report.json")))["files_used"])
entries = {}
for fn in sorted(os.listdir(MAN)):
    if not fn.endswith(".json") or fn.startswith("audit"): continue
    man = json.load(open(os.path.join(MAN, fn)))
    for e in man:
        if "licence" in e: e["license"] = e["licence"]
        if "licence_url" in e: e["license_url"] = e["licence_url"]
        if e.get("license_url") is None and e.get("license", "").lower().startswith("public domain"):
            e["license_url"] = "https://creativecommons.org/publicdomain/mark/1.0/"
        if e.get("license_url") is None and e.get("license", "").upper().startswith("CC0"):
            e["license_url"] = "https://creativecommons.org/publicdomain/zero/1.0/"
        e["category"] = fn[:-5]
        entries[e["file"]] = e
    json.dump(man, open(os.path.join(MAN, fn), "w"), indent=1)

ap = os.path.join(MAN, "audit.json")
audit = json.load(open(ap)) if os.path.exists(ap) else []
by = {(r.get("id"), r.get("file")): r for r in (audit if isinstance(audit, list) else audit.get("records", []))}
out = []
for f in sorted(used):
    e = entries.get(f)
    if e is None: print("NO MANIFEST", f); continue
    rec = {"id": e["id"], "file": f}
    try:
        if e["source"] == "freesound":
            sid = e["id"].split("-")[1]
            d = json.loads(get(f"https://freesound.org/apiv2/sounds/{sid}/?fields=id,name,username,license,url,previews&token={KEY}"))
            lic = d["license"]; ok = ("publicdomain/zero" in lic) or bool(re.search(r"/licenses/by/\d\.\d/", lic))
            same = d["previews"]["preview-hq-ogg"] == e["download_url"] and d["username"] == e["author"]
            rec["licence_seen"] = (f"Freesound API sound {sid} ({d['url']}): license '{lic}', author '{d['username']}', title "
                                   f"'{d['name']}' (read {TODAY}); preview URL {'matches' if same else 'DIFFERS from'} download_url")
            rec["licence_confirmed"] = bool(ok and same)
            rec["agent_notes"] = [] if ok else ["licence not CC0 / CC BY"]
            time.sleep(1.0)
        elif e["source"] == "wikimedia-commons":
            title = "File:" + urllib.parse.unquote(e["download_url"].rsplit("/", 1)[1])
            q = urllib.parse.urlencode(dict(action="query", titles=title, prop="imageinfo", iiprop="extmetadata|url", format="json"))
            d = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))
            pg = list(d["query"]["pages"].values())[0]; md = pg["imageinfo"][0]["extmetadata"]
            lic = md.get("LicenseShortName", {}).get("value", "?"); art = re.sub("<[^>]+>", "", md.get("Artist", {}).get("value", ""))
            ok = any(k in lic.lower() for k in ("cc0", "public domain"))
            rec["licence_seen"] = f"Wikimedia Commons {title}: LicenseShortName '{lic}', artist '{art.strip()[:80]}' (read {TODAY})"
            rec["licence_confirmed"] = ok
            rec["agent_notes"] = [] if ok else ["licence not CC0 / public domain"]
            e["author"] = art.strip()[:80] or e.get("author")
            time.sleep(0.5)
        elif e["source"] == "incompetech":
            html = get(e["page_url"]).decode("utf-8", "replace")
            faq = get("https://incompetech.com/music/royalty-free/faq.html").decode("utf-8", "replace")
            hit = ("Attribution 4.0" in faq) or ("creativecommons.org/licenses/by/4.0" in faq)
            rec["licence_seen"] = (f"incompetech track page {e['page_url']} ({'title found' if 'Floating Cities' in html else 'title not in static html'}) "
                                   f"and FAQ https://incompetech.com/music/royalty-free/faq.html: "
                                   f"{'CC BY 4.0 stated' if hit else 'CC BY 4.0 text not found'} (read {TODAY})")
            rec["licence_confirmed"] = bool(hit)
            rec["agent_notes"] = ["credit line as incompetech asks: " + e["attribution"]]
    except Exception as ex:
        rec["licence_seen"] = f"ERROR reading the item record: {ex}"; rec["licence_confirmed"] = False; rec["agent_notes"] = []
    print(("OK " if rec["licence_confirmed"] else "!! ") + f + " | " + rec["licence_seen"][:150])
    out.append(rec)
# write back authors found on Commons
for fn in sorted(os.listdir(MAN)):
    if fn == "commons.json":
        man = json.load(open(os.path.join(MAN, fn)))
        for m in man:
            if m["file"] in entries: m["author"] = entries[m["file"]].get("author", m.get("author"))
        json.dump(man, open(os.path.join(MAN, fn), "w"), indent=1)
json.dump(out, open(ap, "w"), indent=1)
print(sum(r["licence_confirmed"] for r in out), "of", len(out), "confirmed")
