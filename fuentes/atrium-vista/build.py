"""Atrium vs VISTA: meta.json + ranking.md + stats por tipo. Datos: Apify clockworks/tiktok-scraper, run STEXqxLEikFXagOSS, 2026-11-07."""
import json, statistics as st
from pathlib import Path

D = Path(__file__).parent
# id, cuenta, fecha, vistas, likes, coment, compart, guardados, dur, tipo, titulo, pieza
A, V = "@atriumstories_", "@vistastoriestv"
ROWS = [
 ("7705076412604091678",A,"2026-11-07",38800,1838,142,59,222,150,"familia","Llegó a casa y vio lo que su esposa le hacía a su hija | PARTE 1",""),
 ("7705095483311639839",A,"2026-11-06",42900,2205,23,8,200,74,"capos","El traidor estaba más cerca de lo que creía | Parte 2 (Aurelio, avioneta)",""),
 ("7704831377383951647",A,"2026-11-06",298400,11500,188,107,1159,171,"capos","Le dio 5 minutos… y no le creyó | Parte 1 (Aurelio, avioneta, comandante)",""),
 ("7704757412565224735",A,"2026-11-05",11100,499,9,29,32,98,"humilde-dignidad","El jardinero que no sabía leer le dio una lección a su patrona (final)",""),
 ("7704731039993711902",A,"2026-11-05",18400,779,48,14,65,185,"humilde-dignidad","La patrona le puso una trampa al jardinero… (P1)",""),
 ("7704499017811496222",A,"2026-11-05",28800,2468,33,8,105,126,"hacienda-herencia","Volvió por la presa… mi padre me dejó algo | Parte 2 Final",""),
 ("7704455244683480350",A,"2026-11-04",311700,24800,1332,329,1633,142,"hacienda-herencia","Me dejó la hacienda vacía y una deuda escondida | Parte 1",""),
 ("7704102781807775006",A,"2026-11-04",26700,1517,14,8,100,124,"capos","Lo vendió su propio hijo… y aun así lo salvó | Parte 2 Final (Aurelio)",""),
 ("7704056500502793502",A,"2026-11-03",274800,15300,450,154,1089,116,"capos","Veinte años a su lado… y lo vendieron | Parte 1 (Aurelio, federales, túnel)",""),
 ("7703724993007340831",A,"2026-11-02",8588,215,4,3,21,77,"infidelidad","Su esposa lo entregó… pero el traidor estaba a su lado | Parte 2",""),
 ("7703694112448318751",A,"2026-11-02",7472,229,9,6,22,169,"infidelidad","La encontró en los brazos de otra… | Parte 1",""),
 ("7702851598850018591",A,"2026-10-31",102000,8046,112,54,621,96,"capos","Parte 3 FINAL | 20 años esperando la verdad (Amparo, llave)",""),
 ("7702843334837947678",A,"2026-10-31",59500,4056,121,57,336,88,"capos","Parte 2 | El traidor estaba en su propia casa (Amparo, llave)",""),
 ("7702501478056971550",A,"2026-10-30",1500000,127200,5266,2239,11281,177,"capos","Parte 1 | Llegó buscando a la patrona… y trajo un secreto de 20 años",""),
 ("7702492746757541151",A,"2026-10-30",52300,2464,25,65,247,118,"capos","Don Aurelio le puso una condición a Bruno (P2 moteros/iglesia)",""),
 ("7702486655336320286",A,"2026-10-30",221300,12300,81,250,1119,171,"capos","Se burlaron del padre… sin saber a quién iba a llamar (P1)",""),
 ("7702121152491179294",A,"2026-10-29",53100,1370,17,9,139,144,"capos","En el desierto no hay perdón | Le falló al patrón y ahora su familia paga",""),
 ("7701874680927472926",A,"2026-10-29",334300,16800,107,214,1439,120,"capos","Le pidió 200 mil en el retén… (re-subida) Parte 1",""),
 ("7701749432621993246",A,"2026-10-28",1100000,66700,441,1120,5551,113,"capos","Le pidió 200 mil en el retén… y terminó rodeado | El Retén Parte 1",""),
 ("7701374896768634143",A,"2026-10-27",26500,385,15,8,40,145,"infidelidad","Su mejor amiga era la amante… | Parte 2",""),
 ("7701120683815832863",A,"2026-10-26",20300,406,11,6,38,164,"infidelidad","Escuchó a su esposo el día de su boda… | Parte 1",""),
 ("7701000058279349534",A,"2026-10-26",39700,1091,37,30,91,86,"bondad-recompensa","El jefe que lo corrió vino a pedirle ayuda | Parte 2 Final",""),
 ("7700994634381643039",A,"2026-10-26",268100,10600,591,473,1183,88,"bondad-recompensa","Lo corrieron por ayudar a un anciano… y la vida le regresó el favor | Parte 1",""),
 ("7700746527462968606",A,"2026-10-25",69200,1784,55,19,158,84,"humillacion-revancha","Lo humilló por vender empanadas… y hoy él es su jefe (P2 Final)",""),
 ("7700349674628074783",A,"2026-10-24",167400,10100,628,238,1083,136,"humillacion-revancha","Lo dejó por vender empanadas… sin saber que él heredaría todo",""),
 ("7700341529428118814",A,"2026-10-24",25000,642,29,9,49,68,"familia","Su verdadero padre regresó por él… (P2, Aurelio sale de prisión)",""),
 ("7700249392237776159",A,"2026-10-24",30400,1142,87,9,137,101,"familia","Llegó a su fiesta de cumpleaños y reveló que es su verdadero padre",""),
 ("7699999706285411614",A,"2026-10-23",59800,4582,107,37,237,79,"hacienda-herencia","Lo echó como a un perro… una carta del abuelo (Parte final)",""),
 ("7699884295564971295",A,"2026-10-23",10200,306,23,17,24,84,"bondad-recompensa","Le salvaron la vida hace 10 años… y ella volvió para pagarles",""),
 ("7699644756812385567",A,"2026-10-22",330200,19900,1690,155,1506,125,"hacienda-herencia","Lo corrió de la hacienda por no ser su sangre… era el dueño de todo",""),
 ("7699249118346104095",A,"2026-10-21",22800,953,55,24,80,104,"familia","Me pidió dos pesos en la calle… y resultó ser mi hermana perdida",""),
 ("7698890548119096607",A,"2026-10-20",16600,394,11,13,43,94,"bondad-recompensa","Le daba de comer a un muchacho sin hogar… volvió con un maletín",""),
 ("7698523778451524894",A,"2026-10-19",20000,636,24,40,51,126,"familia","Le sirvió poca comida a su papá y su esposo le dio una lección",""),
 ("7698054444662934815",A,"2026-10-18",126500,1652,11,32,151,84,"trabajo-negocio","Descubrió que su jefe les cobraba lo que era gratis… (P2)",""),
 ("7697405703966838046",A,"2026-10-16",116800,1158,14,14,114,101,"trabajo-negocio","Le cobraba el equipo de seguridad a los obreros… (P1)",""),
 ("7697331061650476319",A,"2026-10-16",284300,33200,906,720,1644,127,"humillacion-revancha","Le negó un vaso de leche… 18 años después compró su banco (P2)",""),
 ("7696749813706067213",A,"2026-10-15",1700000,109700,1990,724,6867,106,"humillacion-revancha","Le negaron un vaso de leche… años después volvió al mismo rancho (P1)",""),
 ("7696624309355269406",A,"2026-10-14",38900,1387,38,18,103,148,"trabajo-negocio","Vio lo que comían sus peones y descubrió la verdad",""),
 ("7696559532704582942",A,"2026-10-14",15200,483,8,5,32,132,"bondad-recompensa","Le llevaba café y pan a un señor de la calle…",""),
 # VISTA (solo novelas; los 17 posts previos son clips de The Odyssey y de Obama, otra temática)
 ("7705456503246900494",V,"2026-11-07",245,22,1,0,2,153,"familia","Regresó después de veinte años… pero no venía por amor | El Regreso P1","regreso-20"),
 ("7705209668917906719",V,"2026-11-06",1139,68,6,0,7,133,"familia","Le quitó la tele nueva a su suegra de 86 años… | La Tele Nueva P1","tele-nueva"),
 ("7705027297656507662",V,"2026-11-06",5647,261,19,4,17,148,"humillacion-revancha","Humilló a la señora de los chicles… | La Canasta P1","canasta"),
 ("7704826128988458253",V,"2026-11-05",8307,197,12,2,13,147,"humillacion-revancha","Le tiró al piso la taza de chocolate… | La Taza de Chocolate P1","chocolate-rancho"),
 ("7704767629831064863",V,"2026-11-05",45500,1569,44,119,116,169,"capos","Llegaron sus refuerzos… el reloj de su esposo | El Retén P2","reten-sierra-p2"),
 ("7704657987691941133",V,"2026-11-05",115600,3235,139,37,281,152,"capos","Llegó escondida en un camión de mezcal… | La media medalla P1","medalla-mezcal"),
 ("7704458751549492510",V,"2026-11-04",266600,9186,348,95,488,136,"capos","Le cobró medio millón en el retén… y no sabía quién era ella | El Retén P1","reten-sierra"),
 ("7704277998853213453",V,"2026-11-04",60600,4526,360,198,308,129,"humillacion-revancha","Les negó un jarro de agua en la hacienda… 15 años después ella volvió | P1","agua-hacienda"),
]
OTROS_VISTA = "17 posts no-novela (2026-05-31 a 2026-08-25): 5 clips 'The Odyssey' (2.3K-28.7K) y 12 de Obama (351-1.3K)."
K = ["id","cuenta","fecha","vistas_n","likes","comentarios","compartidos","guardados","duracion","tipo","titulo","pieza"]

def fmt(n): return f"{n/1e6:.1f}M" if n >= 1e6 else f"{n/1e3:.0f}K" if n >= 1e4 else f"{n/1e3:.1f}K" if n >= 1e3 else str(n)

def main():
    rows = [dict(zip(K, r)) for r in ROWS]
    import re
    for r in rows: r["parte"] = "cont" if re.search(r"Parte [23]|P2|final", r["titulo"], re.I) else "P1"
    out = ["# Ranking Atrium vs VISTA", "", "Scrape Apify `clockworks/tiktok-scraper` (perfil, todos los posts) del 2026-11-07 16:03 UTC. Atrium: 38/38 posts (133.9K seguidores). VISTA: 25/25 posts (4.2K seguidores), 8 son novelas.",
           OTROS_VISTA, "**xMed** = vistas / mediana de la cuenta. **eng** = (likes+coment+compart+guardados)/vistas. ★ = analizado (`videos/<id>_analisis.md`; los de Atrium marcados A ya estaban en `fuentes/atriumstories/videos/`).", ""]
    stats = {}
    for c in (A, V):
        rs = sorted([r for r in rows if r["cuenta"] == c], key=lambda r: -r["vistas_n"])
        med = st.median(r["vistas_n"] for r in rs)
        for r in rs:
            r["xmed"] = round(r["vistas_n"] / med, 2); r["vistas"] = fmt(r["vistas_n"])
            r["eng"] = round((r["likes"] + r["comentarios"] + r["compartidos"] + r["guardados"]) / r["vistas_n"], 3)
            r["url"] = f"https://www.tiktok.com/{c}/video/{r['id']}"
        out += [f"## {c} (mediana {fmt(med)})", "", "| | vistas | xMed | likes | com | comp | guard | eng | dur | fecha | tipo | título | pieza |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for r in rs:
            out.append(f"| {r.get('star','')}{{S{r['id']}}} | {r['vistas']} | {r['xmed']} | {fmt(r['likes'])} | {r['comentarios']} | {r['compartidos']} | {r['guardados']} | {r['eng']} | {r['duracion']}s | {r['fecha']} | {r['tipo']} | [{r['titulo']}]({r['url']}) | {r['pieza']} |")
        out += ["", f"### Rendimiento por tipo ({c})", "", "| tipo | n | media | mediana | xMed mediana | máx | P1: n / mediana |", "|---|---|---|---|---|---|---|"]
        tipos = {}
        for r in rs: tipos.setdefault(r["tipo"], []).append(r)
        st_c = []
        for t, g in tipos.items():
            v = [r["vistas_n"] for r in g]; p1 = [r["vistas_n"] for r in g if r["parte"] == "P1"]
            st_c.append((t, len(g), st.mean(v), st.median(v), st.median(r["xmed"] for r in g), max(v), len(p1), st.median(p1) if p1 else 0))
        for t, n, mean, medi, xm, mx, n1, m1 in sorted(st_c, key=lambda x: -x[3]):
            out.append(f"| {t} | {n} | {fmt(mean)} | {fmt(medi)} | {xm:.2f} | {fmt(mx)} | {n1} / {fmt(m1)} |")
        stats[c] = st_c; out.append("")
    txt = "\n".join(out)
    stars = json.loads((D / "stars.json").read_text()) if (D / "stars.json").exists() else {}
    for r in rows: txt = txt.replace("{S" + r["id"] + "}", stars.get(r["id"], ""))
    txt = txt.replace("| |\n", "|\n").replace(" | |", " |") if False else txt
    (D / "ranking.md").write_text(txt, encoding="utf-8")
    (D / "meta.json").write_text(json.dumps({r["id"]: r for r in rows}, ensure_ascii=False, indent=1), encoding="utf-8")
    for c, s in stats.items():
        print(c); [print(f"  {t:22s} n={n:2d} media={fmt(m):>6s} mediana={fmt(md):>6s} xMed={x:.2f} max={fmt(mx)} P1 n={n1} med={fmt(m1)}") for t, n, m, md, x, mx, n1, m1 in sorted(s, key=lambda x: -x[3])]

main()
