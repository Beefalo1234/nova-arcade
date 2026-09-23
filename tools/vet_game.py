import os, re, sys

src = r"C:\Users\Gray\Desktop\mini-games-src\games"
names = sys.argv[1:]
ref_re = re.compile(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', re.I)

for n in names:
    d = os.path.join(src, n)
    idx = os.path.join(d, "index.html")
    html = open(idx, encoding="utf-8", errors="replace").read()
    refs = ref_re.findall(html)
    local = [r for r in refs if not re.match(r'^(https?:)?//|^data:|^#|^mailto:', r)]
    missing = [r for r in local if not os.path.exists(os.path.join(d, r.split("?")[0].lstrip("/")))]
    ext = [r for r in refs if r not in local]
    print(f"== {n}: {len(refs)} refs | local={len(local)} missing={missing} | external={ext}")

    # scan js/css for local file references
    bad_js = []
    for f in ("script.js", "game.js", "style.css"):
        p = os.path.join(d, f)
        if not os.path.exists(p):
            continue
        txt = open(p, encoding="utf-8", errors="replace").read()
        for m in re.findall(r'["\']([A-Za-z0-9_\-./]+\.(?:png|jpg|jpeg|gif|svg|webp|mp3|wav|ogg|json|css|js))["\']', txt):
            if m.startswith(("http", "//", "data:")):
                continue
            if not os.path.exists(os.path.join(d, m)):
                bad_js.append((f, m))
    print(f"   js/css missing local assets: {bad_js}")
    print(f"   title: {re.search(r'<title>(.*?)</title>', html, re.S).group(1).strip() if re.search(r'<title>(.*?)</title>', html, re.S) else 'NONE'}")
