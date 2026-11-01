# adapt the Expedition 01 voice scripts to Digger 05 (guion body ends at "\n---", TTS spellings, gaps)
import os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts")
def edit(fn, pairs):
    p = os.path.join(D, fn); s = open(p, encoding="utf-8").read()
    for a, b in pairs:
        assert a in s, (fn, a[:70]); s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s)
SPLIT = ('.split("## YouTube chapters")[0]', '.split("\\n---")[0]')
edit("gen_exp.py", [SPLIT, ('TTS = [("\\u2026", "..."),', 'TTS = [("\\u2026", "..."), ("3 a.m.", "three A M"), ("1992", "nineteen ninety-two"), ("14 hours", "fourteen hours"), ("600 years", "six hundred years"),')])
edit("check_exp.py", [SPLIT, ('SUB = [("R-E-M", "REM"),', 'SUB = [("3 a.m.", "3 am"), ("R-E-M", "REM"),')])
edit("assemble.py", [SPLIT,
    ("GAP = {i: 0.42 for i in range(1, 51)}", "GAP = {i: 0.45 for i in range(1, 11)}   # digger 05: 10 paragraphs\nGAP.update({1: 0.55, 3: 0.5, 4: 0.5, 7: 0.5, 8: 0.5, 9: 0.7})\n_OLD_GAP = {i: 0.42 for i in range(1, 51)}"),
    ("GAP.update({1: 0.5, 3: 0.6,", "_OLD_GAP.update({1: 0.5, 3: 0.6,"),
    ("for _p in (7, 12, 16, 24, 32, 34, 37, 40): GAP[_p - 1] = 0.95", ""),
    ('NUM = {"1776":', 'NUM = {"1992": ["nineteen", "ninety", "two"], "14": ["fourteen"], "600": ["six", "hundred"], "1776":')])
print("ok")
