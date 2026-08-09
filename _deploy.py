import os, re, shutil

SRC = "C:/Users/Gray/Desktop/unblocked-src"
DST = "C:/Users/Gray/Desktop/unblocked-games"

# copy excluding .git and helper
if os.path.exists(DST):
    shutil.rmtree(DST)
shutil.copytree(SRC, DST, ignore=shutil.ignore_patterns(".git", "_inspect.py"))
print("copied")

idx = os.path.join(DST, "index.html")
s = open(idx, encoding="utf-8", errors="ignore").read()

# rebrand title
s = re.sub(r"<title>[^<]*</title>", "<title>NEON UNBLOCKED — 116+ Free Games</title>", s)

# remove the original owner's Google Analytics (privacy + not our property)
s = re.sub(r'\s*<script[^>]*googletagmanager\.com/gtag[^>]*></script>\s*', "\n", s)
s = re.sub(r'\s*<script>\s*window\.dataLayer[^<]*?</script>\s*', "\n", s, flags=re.S)

# footer credit (WTFPL — attribution is good practice)
s = re.sub(r"</body>", '<footer style="text-align:center;padding:14px;font-family:monospace;font-size:12px;color:#888">NEON UNBLOCKED — games courtesy of <a href="https://github.com/MonkeyGG2/monkeygg2.github.io" style="color:#aaf">MonkeyGG2</a> (WTFPL)</footer>\n</body>', s)

open(idx, "w", encoding="utf-8").write(s)
print("title:", re.search(r"<title>[^<]*</title>", s).group(0))
print("GA remaining:", s.count("googletagmanager"))
print("files:", sum(len(fs) for _, _, fs in os.walk(DST)))
