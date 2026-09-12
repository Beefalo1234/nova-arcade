import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = open(os.path.join(ROOT, "js", "config.js"), encoding="utf-8").read()
m = re.search(r"var json=(\{.*\});?\s*$", js, re.S)
cfg = json.loads(m.group(1))["games"]

print("configured games:", len(cfg))

# (a) grep for new display names
for name in ("Bottle Flip", "Gravity Golf"):
    hit = name in js
    print(f"[a] grep js/config.js for '{name}': {'FOUND' if hit else 'MISSING'}")
    assert hit, f"grep failed for {name}"

# (b) integrity sweep: every configured path has games/<path>/index.html
missing = []
for name, v in cfg.items():
    p = os.path.join(ROOT, "games", v["path"].replace("/", os.sep), "index.html")
    if not os.path.exists(p):
        missing.append((name, v["path"]))
print(f"[b] integrity sweep: {len(cfg)} paths checked, {len(missing)} missing")
for name, p in missing:
    print("    MISSING:", name, "->", p)

# (c) relative-ref check for the newly added dirs
def relative_refs(fp):
    t = open(fp, encoding="utf-8", errors="ignore").read()
    out = set()
    for pat in (r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', r'url\(\s*["\']?([^"\')]+)["\']?\s*\)'):
        out.update(re.findall(pat, t))
    return out

for slug in ("bottle-flip-challenge", "gravity-golf"):
    d = os.path.join(ROOT, "games", slug)
    bad = []
    for f in os.listdir(d):
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

if missing:
    print("RESULT: FAIL — do not push")
    sys.exit(1)
print("RESULT: PASS")
