"""venv: run final_post's stable-dither post on some shots only (QA before a full export).  python tools/post_subset.py 07b 12b ..."""
import os, sys
sys.argv = [sys.argv[0]] + sys.argv[1:]
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); sys.path.insert(0, H)
import final_post as FP  # noqa: E402
for n in sys.argv[1:]:
    FP.group([n]); print("post", n)
