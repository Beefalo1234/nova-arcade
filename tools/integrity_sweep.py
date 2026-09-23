"""Integrity sweep for nova-arcade: every configured path must have index.html,
and each game's index.html must reference only relative files that exist in its dir."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg_js = open(os.path.join(ROOT, "js", "config.js"), encoding="utf-8").read()

m = re.search(r'var json\s*=\s*(\{.*\})\s*;?\s*$', cfg_js, re.S)
if not m:
    print("FAIL: could not parse var json={...} out of js/config.js")
    sys.exit(2)
data = json.loads(m.group(1))
games = data["games"]
print(f"parsed js/config.js OK — {len(games)} configured games")

missing_index = []
ref_re = re.compile(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', re.I)
bad_refs = []
checked_refs = 0

for name, meta in games.items():
    path = meta.get("path", "")
    gdir = os.path.join(ROOT, "games", path.replace("/", os.sep))
    idx = os.path.join(gdir, "index.html")
    if not os.path.exists(idx):
        missing_index.append((name, path))
        continue
    html = open(idx, encoding="utf-8", errors="replace").read()
    for r in ref_re.findall(html):
        if re.match(r'^(https?:)?//|^data:|^#|^mailto:|^javascript:', r, re.I):
            continue
        checked_refs += 1
        target = r.split("?")[0].split("#")[0].lstrip("/")
        if not os.path.exists(os.path.join(gdir, target)):
            bad_refs.append((name, path, r))

print(f"index.html files present: {len(games) - len(missing_index)}/{len(games)}")
print(f"relative refs checked: {checked_refs}")
if missing_index:
    print("MISSING index.html:")
    for n, p in missing_index:
        print(f"   - {n} -> games/{p}/index.html")
if bad_refs:
    print("BROKEN relative refs (target absent inside game dir):")
    for n, p, r in bad_refs:
        print(f"   - {n} (games/{p}) -> {r}")
print("SWEEP RESULT:", "PASS" if not missing_index and not bad_refs else "FAIL")
sys.exit(0 if not missing_index and not bad_refs else 1)
