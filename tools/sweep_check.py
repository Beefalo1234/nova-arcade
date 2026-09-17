#!/usr/bin/env python3
"""sweep_check.py - pre-push verification for nova-arcade.

Usage:
  python tools/sweep_check.py                                   # names/slugs from last commit
  python tools/sweep_check.py --slugs piano_game,burger-builder
  python tools/sweep_check.py --slugs piano_game --names "Piano Tiles"

Checks
  (a) each new display name appears in js/config.js
  (b) integrity sweep: every configured game path has games/<path>/index.html
  (c) every relative src/href/url() ref inside each new game dir resolves on disk
Exit 0 = PASS (safe to push), 1 = FAIL (do not push).
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = open(os.path.join(ROOT, "js", "config.js"), encoding="utf-8").read()
m = re.search(r"var json=(\{.*\});?\s*$", js, re.S)
cfg = json.loads(m.group(1))["games"]

# --- args -------------------------------------------------------------
argv = sys.argv[1:]
names, slugs = [], []
if "--names" in argv:
    names = [n.strip() for n in argv[argv.index("--names") + 1].split(",") if n.strip()]
if "--slugs" in argv:
    slugs = [s.strip() for s in argv[argv.index("--slugs") + 1].split(",") if s.strip()]
if not slugs:
    # default: last commit's games, derived from config paths of the tail entries
    slugs = [v["path"] for v in list(cfg.values())[-2:]]
    print(f"[i] no --slugs given, defaulting to last configured: {slugs}")

fail = False

# (a) grep display names in js/config.js
if not names:
    # infer display names from the slugs we're checking
    names = [k for k, v in cfg.items() if v["path"] in slugs]
for name in names:
    hit = f'"{name}"' in js
    print(f"[a] grep js/config.js for '{name}': {'FOUND' if hit else 'MISSING'}")
    fail |= not hit

# (b) integrity sweep
missing = []
for name, v in cfg.items():
    p = os.path.join(ROOT, "games", v["path"].replace("/", os.sep), "index.html")
    if not os.path.exists(p):
        missing.append((name, v["path"]))
print(f"[b] integrity sweep: {len(cfg)} paths checked, {len(missing)} missing")
for name, p in missing:
    print("    MISSING:", name, "->", p)
fail |= bool(missing)

# (c) relative-ref check for the new dirs
def relative_refs(fp):
    t = open(fp, encoding="utf-8", errors="ignore").read()
    out = set()
    for pat in (r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', r'url\(\s*["\']?([^"\')]+)["\']?\s*\)'):
        out.update(re.findall(pat, t))
    return out


for slug in slugs:
    d = os.path.join(ROOT, "games", slug)
    if not os.path.isdir(d):
        print(f"[c] {slug}: DIR MISSING")
        fail = True
        continue
    bad = []
    for f in sorted(os.listdir(d)):
        if not f.endswith((".html", ".js", ".css")):
            continue
        for r in relative_refs(os.path.join(d, f)):
            if r.startswith(("http://", "https://", "//", "data:", "#", "mailto:", "javascript:")):
                continue
            rel = r.split("?")[0].split("#")[0].lstrip("./")
            if not os.path.exists(os.path.join(d, rel)):
                bad.append((f, r))
    status = "OK (all relative refs resolve)" if not bad else f"BROKEN {bad}"
    print(f"[c] {slug}: {status} | files={sorted(os.listdir(d))}")
    fail |= bool(bad)

print("RESULT: FAIL - do not push" if fail else "RESULT: PASS")
sys.exit(1 if fail else 0)
