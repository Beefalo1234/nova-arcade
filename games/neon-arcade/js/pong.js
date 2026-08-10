/* Pong — vs CPU */
"use strict";
Arcade.register({
  id: "pong", title: "Pong", touch: true,
  init(cv) { this.cv = cv; this.ctx = cv.getContext("2d"); },
  start() {
    this.W = 640, this.H = 480, this.PH = 84, this.PW = 10, this.SPEED = 5;
    this.py = this.H / 2 - this.PH / 2; this.cy = this.H / 2 - this.PH / 2;
    this.ball = { x: this.W / 2, y: this.H / 2, vx: 4.5 * (Math.random() < 0.5 ? -1 : 1), vy: (Math.random() - 0.5) * 4 };
    this.ps = 0; this.cs = 0; this.winScore = 7; this.paused = false;
    Arcade.setScoreUI("0 — 0");
    this.raf = requestAnimationFrame(() => this.loop());
  },
  stop() { cancelAnimationFrame(this.raf); },
  pause() { this.paused = true; },
  resume() { this.paused = false; },
  restart() { this.stop(); this.start(); },
  touch(d) {
    if (d === "U") this.py = Math.max(0, this.py - 28);
    if (d === "D") this.py = Math.min(this.H - this.PH, this.py + 28);
  },
  loop() {
    if (!this.paused) this.step();
    this.draw();
    this.raf = requestAnimationFrame(() => this.loop());
  },
  step() {
    // player key follow (keyboard arrows handled via touch())
    // ball
    this.ball.x += this.ball.vx; this.ball.y += this.ball.vy;
    if (this.ball.y < 4 || this.ball.y > this.H - 4) { this.ball.vy *= -1; Arcade.SFX.wall(); }
    // paddle collisions
    if (this.ball.vx < 0 && this.ball.x < 22 && this.ball.x > 12 && this.ball.y > this.py - 6 && this.ball.y < this.py + this.PH + 6) {
      this.ball.vx = Math.abs(this.ball.vx) * 1.06; this.ball.vy += (this.ball.y - (this.py + this.PH / 2)) / 18;
      Arcade.SFX.move();
    }
    if (this.ball.vx > 0 && this.ball.x > this.W - 22 && this.ball.x < this.W - 12 && this.ball.y > this.cy - 6 && this.ball.y < this.cy + this.PH + 6) {
      this.ball.vx = -Math.abs(this.ball.vx) * 1.06; this.ball.vy += (this.ball.y - (this.cy + this.PH / 2)) / 18;
      Arcade.SFX.move();
    }
    // CPU follows ball with slight lag
    const target = this.ball.y - this.PH / 2;
    if (Math.abs(target - this.cy) > 6) this.cy += Math.sign(target - this.cy) * 3.2;
    // scoring
    if (this.ball.x < -10) { this.cs++; Arcade.SFX.over(); this.serve(-1); }
    if (this.ball.x > this.W + 10) { this.ps++; Arcade.SFX.score(); this.serve(1); }
    Arcade.setScoreUI(`${this.ps} — ${this.cs}`);
    if (this.ps >= this.winScore || this.cs >= this.winScore) {
      const win = this.ps >= this.winScore;
      Arcade.SFX.score();
      Arcade.setScore("pong", this.ps * 100);
      Arcade.showOverlay(win ? "YOU WIN!" : "CPU WINS", `Final ${this.ps} — ${this.cs} · press R to rematch`);
      this.paused = true;
    }
  },
  serve(dir) {
    this.ball = { x: this.W / 2, y: this.H / 2, vx: 4.5 * dir, vy: (Math.random() - 0.5) * 3 };
  },
  draw() {
    const c = this.ctx;
    c.fillStyle = "#0e0e1c"; c.fillRect(0, 0, this.W, this.H);
    c.strokeStyle = "#26264a"; c.setLineDash([8, 10]);
    c.beginPath(); c.moveTo(this.W / 2, 10); c.lineTo(this.W / 2, this.H - 10); c.stroke(); c.setLineDash([]);
    c.fillStyle = "#00f0ff"; c.shadowColor = "#00f0ff"; c.shadowBlur = 10;
    c.fillRect(14, this.py, this.PW, this.PH);
    c.fillStyle = "#ff2ec4"; c.shadowColor = "#ff2ec4";
    c.fillRect(this.W - 24, this.cy, this.PW, this.PH);
    c.fillStyle = "#eef2ff"; c.shadowColor = "#eef2ff";
    c.beginPath(); c.arc(this.ball.x, this.ball.y, 6, 0, 7); c.fill();
    c.shadowBlur = 0;
  }
});
