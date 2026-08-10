/* NEON ARCADE — shared framework: audio synth, high scores, navigation, input */
"use strict";

const Arcade = (() => {
  // ── tiny WebAudio synth (no assets) ─────────────────────────
  let actx = null;
  function ac() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, dur = 0.08, type = "square", vol = 0.12, slide = 0) {
    const a = ac();
    if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur + 0.02);
  }
  const SFX = {
    move:    () => tone(220, 0.04, "square", 0.06),
    eat:     () => tone(520, 0.09, "square", 0.1, 300),
    rotate:  () => tone(330, 0.05, "triangle", 0.1),
    drop:    () => tone(140, 0.07, "sawtooth", 0.1, -60),
    clear:   () => { tone(660, 0.07, "square", 0.1); setTimeout(() => tone(880, 0.09, "square", 0.1), 70); },
    flip:    () => tone(600, 0.06, "sine", 0.12, 200),
    match:   () => { [520, 660, 780].forEach((f, i) => setTimeout(() => tone(f, 0.08, "sine", 0.1), i * 70)); },
    wall:    () => tone(120, 0.06, "sawtooth", 0.1, -30),
    score:   () => { [440, 660, 880].forEach((f, i) => setTimeout(() => tone(f, 0.07, "square", 0.09), i * 60)); },
    over:    () => { [330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.16, "sawtooth", 0.11), i * 140)); },
    start:   () => { [392, 523, 659].forEach((f, i) => setTimeout(() => tone(f, 0.09, "triangle", 0.1), i * 80)); }
  };

  // ── high scores (localStorage) ───────────────────────────────
  const KEY = "neon-arcade-scores-v1";
  let scores = {};
  try { scores = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { scores = {}; }
  function best(g) { return scores[g] || 0; }
  function setScore(g, v) {
    if (v > best(g)) { scores[g] = v; try { localStorage.setItem(KEY, JSON.stringify(scores)); } catch (e) {} }
    const el = document.getElementById("bestVal");
    if (el) el.textContent = best(g);
    updateGlobalBest();
  }
  function updateGlobalBest() {
    const gb = document.getElementById("globalBest");
    if (gb) gb.textContent = Math.max(0, ...Object.values(scores));
  }

  // ── navigation ───────────────────────────────────────────────
  const menu = document.getElementById("menu"), area = document.getElementById("gameArea");
  const canvas = document.getElementById("gameCanvas"), overlay = document.getElementById("overlay");
  const ovTitle = document.getElementById("overlayTitle"), ovMsg = document.getElementById("overlayMsg");
  let current = null, running = false, paused = false;
  const games = {}; // name -> {title, init(canvas), start(), stop(), pause(), resume(), restart(), touch(dir)}

  function register(g) { games[g.id] = g; }
  function show(id) {
    stopCurrent();
    menu.classList.add("hidden"); area.classList.remove("hidden");
    document.getElementById("gameTitle").textContent = games[id].title.toUpperCase();
    document.getElementById("scoreVal").textContent = "0";
    document.getElementById("bestVal").textContent = best(id);
    document.getElementById("touchbar").classList.toggle("hidden", !games[id].touch);
    current = id;
    games[id].init(canvas);
    running = true; paused = false;
    overlay.classList.add("hidden");
    games[id].start();
    SFX.start();
  }
  function back() {
    stopCurrent();
    area.classList.add("hidden"); menu.classList.remove("hidden");
    updateGlobalBest();
  }
  function stopCurrent() {
    if (current && games[current]) games[current].stop();
    current = null; running = false; paused = false;
  }
  function setPaused(p) {
    if (!current) return;
    paused = p;
    if (p) { games[current].pause(); overlay.classList.remove("hidden"); }
    else { games[current].resume(); overlay.classList.add("hidden"); }
  }
  function setScoreUI(v) { document.getElementById("scoreVal").textContent = v; }
  function showOverlay(t, m) { ovTitle.textContent = t; ovMsg.textContent = m; overlay.classList.remove("hidden"); }
  function hideOverlay() { overlay.classList.add("hidden"); }

  // ── global keyboard ──────────────────────────────────────────
  const dirs = { ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R" };
  document.addEventListener("keydown", (e) => {
    if (!current) return;
    if (e.key === "p" || e.key === "P") { setPaused(!paused); return; }
    if (e.key === "r" || e.key === "R") { if (current) { games[current].restart(); hideOverlay(); } return; }
    if (e.key === "Escape") { back(); return; }
    if (dirs[e.key]) {
      e.preventDefault();
      if (games[current].touch) games[current].touch(dirs[e.key]);
    } else if (e.key === " ") {
      e.preventDefault();
      if (games[current].touch) games[current].touch("FIRE");
    }
  });

  // touch buttons
  document.querySelectorAll(".tbtn").forEach(b => {
    b.addEventListener("touchstart", (e) => { e.preventDefault(); if (current && games[current].touch) games[current].touch(b.dataset.t); });
    b.addEventListener("mousedown", (e) => { if (current && games[current].touch) games[current].touch(b.dataset.t); });
  });
  // swipe on canvas
  let sx = 0, sy = 0;
  canvas.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  canvas.addEventListener("touchend", (e) => {
    if (!current || !games[current].touch) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    games[current].touch(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : (dy > 0 ? "D" : "U"));
  }, { passive: true });

  document.getElementById("backBtn").addEventListener("click", back);

  // canvas scaling: fit to container width, keep logical 640x480
  function fit() {
    const w = canvas.parentElement.clientWidth;
    canvas.style.width = w + "px";
    canvas.style.height = (w * 3 / 4) + "px";
  }
  window.addEventListener("resize", fit);

  return { register, show, back, setScore, setScoreUI, best, showOverlay, hideOverlay, SFX, fit,
           updateGlobalBest,
           get paused() { return paused; }, get running() { return running; },
           get currentGame() { return current ? games[current] : null; } };
})();
