/* Tetris */
"use strict";
Arcade.register({
  id: "tetris", title: "Tetris", touch: true,
  SHAPES: [
    { m: [[1, 1, 1, 1]], col: "#00f0ff" },
    { m: [[1, 1], [1, 1]], col: "#ffd23d" },
    { m: [[0, 1, 0], [1, 1, 1]], col: "#b18cff" },
    { m: [[1, 0, 0], [1, 1, 1]], col: "#ff8c2e" },
    { m: [[0, 0, 1], [1, 1, 1]], col: "#3d9be8" },
    { m: [[1, 1, 0], [0, 1, 1]], col: "#a6ff3d" },
    { m: [[0, 1, 1], [1, 1, 0]], col: "#ff4d5e" }
  ],
  init(cv) { this.cv = cv; this.ctx = cv.getContext("2d"); },
  start() {
    this.C = 10, this.R = 20; this.cell = 24;
    this.ox = (640 - this.C * this.cell) / 2; this.oy = 20;
    this.board = Array.from({ length: this.R }, () => Array(this.C).fill(0));
    this.score = 0; this.lines = 0; this.level = 1; this.dropMs = 600; this.dead = false;
    this.next = this.pick(); this.spawnPiece();
    Arcade.setScoreUI(0);
    this.loop = setInterval(() => this.tick(), this.dropMs);
    this.draw();
  },
  stop() { clearInterval(this.loop); },
  pause() { clearInterval(this.loop); },
  resume() { this.loop = setInterval(() => this.tick(), this.dropMs); },
  restart() { this.stop(); this.start(); },
  pick() { const s = this.SHAPES[Math.floor(Math.random() * this.SHAPES.length)]; return { m: s.m.map(r => r.slice()), col: s.col }; },
  spawnPiece() {
    this.piece = this.next; this.next = this.pick();
    this.px = 3; this.py = 0;
    if (this.collides(this.piece.m, this.px, this.py)) { this.dead = true; Arcade.SFX.over(); Arcade.setScore("tetris", this.score); Arcade.showOverlay("GAME OVER", `Score ${this.score} · ${this.lines} lines`); }
  },
  collides(m, x, y) {
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const bx = x + c, by = y + r;
      if (bx < 0 || bx >= this.C || by >= this.R) return true;
      if (by >= 0 && this.board[by][bx]) return true;
    }
    return false;
  },
  lock() {
    for (let r = 0; r < this.piece.m.length; r++) for (let c = 0; c < this.piece.m[r].length; c++)
      if (this.piece.m[r][c] && this.py + r >= 0) this.board[this.py + r][this.px + c] = this.piece.col;
    let cleared = 0;
    for (let r = this.R - 1; r >= 0; r--) {
      if (this.board[r].every(v => v)) {
        this.board.splice(r, 1); this.board.unshift(Array(this.C).fill(0));
        cleared++; r++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800][cleared];
      this.score += pts * this.level; this.lines += cleared;
      Arcade.SFX.clear(); Arcade.setScoreUI(this.score);
      if (this.lines >= this.level * 10) { this.level++; this.dropMs = Math.max(120, 600 - (this.level - 1) * 50); clearInterval(this.loop); this.loop = setInterval(() => this.tick(), this.dropMs); }
    }
    this.spawnPiece();
    this.draw();
  },
  move(dx) {
    if (this.dead) return;
    if (!this.collides(this.piece.m, this.px + dx, this.py)) { this.px += dx; Arcade.SFX.move(); this.draw(); }
  },
  rot() {
    if (this.dead) return;
    const m = this.piece.m[0].map((_, i) => this.piece.m.map(row => row[i]).reverse());
    if (!this.collides(m, this.px, this.py)) { this.piece.m = m; Arcade.SFX.rotate(); this.draw(); }
  },
  hardDrop() {
    if (this.dead) return;
    while (!this.collides(this.piece.m, this.px, this.py + 1)) this.py++;
    Arcade.SFX.drop(); this.lock();
  },
  softDrop() {
    if (this.dead) return;
    if (!this.collides(this.piece.m, this.px, this.py + 1)) { this.py++; Arcade.setScoreUI(this.score + 1); }
    else this.lock();
    this.draw();
  },
  tick() { if (this.dead) return; if (!this.collides(this.piece.m, this.px, this.py + 1)) { this.py++; this.draw(); } else this.lock(); },
  touch(d) {
    if (d === "L") this.move(-1);
    else if (d === "R") this.move(1);
    else if (d === "U") this.rot();
    else if (d === "D") this.softDrop();
    else if (d === "FIRE") this.hardDrop();
  },
  draw() {
    const c = this.ctx;
    c.fillStyle = "#0e0e1c"; c.fillRect(0, 0, 640, 480);
    c.strokeStyle = "#26264a"; c.strokeRect(this.ox - 1, this.oy - 1, this.C * this.cell + 2, this.R * this.cell + 2);
    for (let r = 0; r < this.R; r++) for (let col = 0; col < this.C; col++) {
      if (!this.board[r][col]) continue;
      c.fillStyle = this.board[r][col]; c.shadowColor = this.board[r][col]; c.shadowBlur = 6;
      c.fillRect(this.ox + col * this.cell + 1, this.oy + r * this.cell + 1, this.cell - 2, this.cell - 2);
      c.shadowBlur = 0;
    }
    // ghost
    if (!this.dead) {
      let gy = this.py;
      while (!this.collides(this.piece.m, this.px, gy + 1)) gy++;
      this.piece.m.forEach((row, r) => row.forEach((v, col) => {
        if (!v) return;
        c.strokeStyle = this.piece.col; c.globalAlpha = 0.25;
        c.strokeRect(this.ox + (this.px + col) * this.cell + 1, this.oy + (gy + r) * this.cell + 1, this.cell - 2, this.cell - 2);
        c.globalAlpha = 1;
      }));
    }
    // piece
    this.piece.m.forEach((row, r) => row.forEach((v, col) => {
      if (!v || this.py + r < 0) return;
      c.fillStyle = this.piece.col; c.shadowColor = this.piece.col; c.shadowBlur = 8;
      c.fillRect(this.ox + (this.px + col) * this.cell + 1, this.oy + (this.py + r) * this.cell + 1, this.cell - 2, this.cell - 2);
      c.shadowBlur = 0;
    }));
    // next piece
    c.fillStyle = "#8b92b8"; c.font = "13px monospace"; c.fillText("NEXT", this.ox + this.C * this.cell + 16, this.oy + 20);
    this.next.m.forEach((row, r) => row.forEach((v, col) => {
      if (!v) return;
      c.fillStyle = this.next.col;
      c.fillRect(this.ox + this.C * this.cell + 16 + col * 16, this.oy + 34 + r * 16, 14, 14);
    }));
    c.fillStyle = "#8b92b8"; c.font = "13px monospace";
    c.fillText(`LV ${this.level}`, this.ox + this.C * this.cell + 16, this.oy + 90);
  }
});
