import json, os, re, sys

repo = r"C:\Users\Gray\Desktop\unblocked-games"
src = r"C:\Users\Gray\Desktop\mini-games-src\games"

raw = open(os.path.join(repo, "config.jsonc"), encoding="utf-8").read()
# strip // comments (jsonc)
raw = re.sub(r'^\s*//.*$', '', raw, flags=re.M)
cfg = json.loads(raw)
games = cfg["games"]
existing_paths = {v.get("path", "").lower() for v in games.values()}
existing_names = {k.lower() for k in games.keys()}
existing_slugs = {re.sub(r'[^a-z0-9]', '', k.lower()) for k in games.keys()}

def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

existing_norm = set()
for k, v in games.items():
    existing_norm.add(norm(k))
    existing_norm.add(norm(v.get("path", "")))

cands = []
for d in sorted(os.listdir(src)):
    p = os.path.join(src, d)
    if not os.path.isdir(p):
        continue
    if not os.path.exists(os.path.join(p, "index.html")):
        continue
    if norm(d) in existing_norm:
        continue
    # file inventory
    files = []
    for root, dirs, fs in os.walk(p):
        for f in fs:
            files.append(os.path.relpath(os.path.join(root, f), p).replace("\\", "/"))
    cands.append((d, len(files), files))

print("SOURCE DIRS WITH index.html NOT IN CONFIG:", len(cands))
for d, n, files in cands:
    print(f"- {d} ({n} files)")

print()
print("EXISTING PATHS:", len(existing_paths))
